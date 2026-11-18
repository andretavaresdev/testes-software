/**
 * Partida de dominó para 2 jogadores (variante clássica com compra).
 * Disciplina: Projeto, Implementação e Teste de Software (2026)
 */

const { Peca, parsePeca } = require("./peca");
const {
  NUM_JOGADORES,
  criarBaralho,
  criarRngSeeded,
  embaralhar,
  validarBaralhoCompleto,
  distribuir,
} = require("./baralho");

class ErroPartida extends Error {
  constructor(codigo, mensagem) {
    super(mensagem);
    this.name = "ErroPartida";
    this.codigo = codigo;
  }
}

const STATUS = Object.freeze({
  NAO_INICIADA: "nao_iniciada",
  AGUARDANDO_PRIMEIRA: "aguardando_primeira",
  EM_ANDAMENTO: "em_andamento",
  BATIDA: "batida",
  TRANCADO: "trancado",
  EMPATE: "empate",
});

const PONTA = Object.freeze({
  ESQUERDA: "esquerda",
  DIREITA: "direita",
});

function oponente(jogador) {
  return jogador === 0 ? 1 : 0;
}

function escolherAbertura(maos) {
  let melhor = null;
  for (let jogador = 0; jogador < maos.length; jogador++) {
    for (const peca of maos[jogador]) {
      if (!melhor || peca.compararParaAbertura(melhor.peca) > 0) {
        melhor = { jogador, peca };
      }
    }
  }
  if (!melhor) {
    throw new ErroPartida(
      "MAOS_VAZIAS",
      "Não há peças nas mãos para definir a abertura."
    );
  }
  return melhor;
}

class Partida {
  /**
   * @param {object} [opcoes]
   * @param {function} [opcoes.rng] gerador em [0, 1)
   * @param {number} [opcoes.seed] semente inteira (alternativa ao rng)
   * @param {Array} [opcoes.baralho] baralho completo na ordem desejada
   * @param {boolean} [opcoes.embaralharBaralho] se deve embaralhar o baralho injetado
   */
  constructor({ rng, seed, baralho, embaralharBaralho } = {}) {
    if (seed != null && rng) {
      throw new ErroPartida(
        "ALEATORIEDADE_AMBIGUA",
        "Informe apenas seed ou rng, não os dois."
      );
    }
    if (seed != null) {
      this._rng = criarRngSeeded(seed);
    } else {
      this._rng = rng || Math.random;
    }
    this._baralhoFornecido = baralho ? baralho.slice() : null;
    this._deveEmbaralhar =
      embaralharBaralho != null ? Boolean(embaralharBaralho) : baralho == null;
    this._resetarEstado();
  }

  _resetarEstado() {
    this._status = STATUS.NAO_INICIADA;
    this._maos = [[], []];
    this._monte = [];
    this._mesa = [];
    this._jogadorAtual = null;
    this._pecaInicial = null;
    this._vencedor = null;
    this._pontuacao = { 0: 0, 1: 0 };
    this._passesConsecutivos = 0;
    this._historico = [];
  }

  /**
   * Monta uma partida em estado controlado, para testes de meio e fim de jogo.
   * Não exige as 28 peças, mas todas as peças presentes devem ser únicas e válidas.
   */
  static criarParaTeste({ maos, monte = [], mesa = [], jogadorAtual = 0 } = {}) {
    const partida = new Partida({ rng: () => 0 });
    if (!Array.isArray(maos) || maos.length !== NUM_JOGADORES) {
      throw new ErroPartida(
        "ESTADO_INVALIDO",
        "criarParaTeste exige exatamente 2 mãos."
      );
    }
    partida._maos = maos.map((mao) => mao.map((p) => parsePeca(p)));
    partida._monte = (monte || []).map((p) => parsePeca(p));
    partida._validarPecasUnicasNasMaosEMonte();
    partida._mesa = partida._montarMesa(mesa || []);
    partida._assertJogador(jogadorAtual);
    partida._jogadorAtual = jogadorAtual;

    if (partida._mesa.length === 0) {
      const abertura = escolherAbertura(partida._maos);
      partida._jogadorAtual = abertura.jogador;
      partida._pecaInicial = abertura.peca;
      partida._status = STATUS.AGUARDANDO_PRIMEIRA;
    } else {
      partida._pecaInicial = partida._mesa[0].peca;
      partida._status = STATUS.EM_ANDAMENTO;
    }
    return partida;
  }

  _validarPecasUnicasNasMaosEMonte() {
    const ids = new Set();
    const registrar = (peca, origem) => {
      if (ids.has(peca.id)) {
        throw new ErroPartida(
          "PECA_DUPLICADA",
          `Peça repetida no estado (${origem}): ${peca.toString()}.`
        );
      }
      ids.add(peca.id);
    };
    this._maos.forEach((mao, j) =>
      mao.forEach((p) => registrar(p, `mão do jogador ${j}`))
    );
    this._monte.forEach((p) => registrar(p, "monte"));
    return ids;
  }

  _montarMesa(itens) {
    if (!itens.length) {
      return [];
    }
    const mesa = [];
    for (const item of itens) {
      if (item && item.esquerda != null && item.direita != null) {
        const peca = item.peca
          ? parsePeca(item.peca)
          : new Peca(item.esquerda, item.direita);
        this._validarOrientacao(peca, item.esquerda, item.direita);
        if (mesa.length > 0 && item.esquerda !== mesa[mesa.length - 1].direita) {
          throw new ErroPartida(
            "MESA_INVALIDA",
            `A cadeia da mesa não casa: ponta ${mesa[mesa.length - 1].direita} seguida de ${item.esquerda}.`
          );
        }
        mesa.push({ peca, esquerda: item.esquerda, direita: item.direita });
      } else if (item && (item.esquerda != null || item.direita != null)) {
        throw new ErroPartida(
          "MESA_INVALIDA",
          "Cada posição da mesa deve ter esquerda e direita."
        );
      } else {
        const peca = parsePeca(item);
        if (mesa.length === 0) {
          mesa.push({ peca, esquerda: peca.menor, direita: peca.maior });
        } else {
          const ponta = mesa[mesa.length - 1].direita;
          if (!peca.combinaCom(ponta)) {
            throw new ErroPartida(
              "MESA_INVALIDA",
              `A peça ${peca.toString()} não casa com a ponta direita ${ponta} ao montar a mesa.`
            );
          }
          mesa.push({
            peca,
            esquerda: ponta,
            direita: peca.outroLado(ponta),
          });
        }
      }
    }

    const ids = new Set();
    this._maos.forEach((mao) => mao.forEach((p) => ids.add(p.id)));
    this._monte.forEach((p) => ids.add(p.id));
    for (const pos of mesa) {
      if (ids.has(pos.peca.id)) {
        throw new ErroPartida(
          "PECA_DUPLICADA",
          `Peça repetida no estado (mesa): ${pos.peca.toString()}.`
        );
      }
      ids.add(pos.peca.id);
    }
    return mesa;
  }

  _validarOrientacao(peca, esquerda, direita) {
    if (peca.duplo) {
      if (esquerda !== peca.menor || direita !== peca.maior) {
        throw new ErroPartida(
          "MESA_INVALIDA",
          `Duplo ${peca.toString()} deve ser orientado com os dois lados iguais.`
        );
      }
      return;
    }
    const direta = esquerda === peca.menor && direita === peca.maior;
    const invertida = esquerda === peca.maior && direita === peca.menor;
    if (!direta && !invertida) {
      throw new ErroPartida(
        "MESA_INVALIDA",
        `Orientação inválida para ${peca.toString()}: ${esquerda}|${direita}.`
      );
    }
  }

  iniciar() {
    if (this._status !== STATUS.NAO_INICIADA) {
      throw new ErroPartida("JA_INICIADA", "A partida já foi iniciada.");
    }
    let baralho;
    if (this._baralhoFornecido) {
      baralho = validarBaralhoCompleto(this._baralhoFornecido);
      if (this._deveEmbaralhar) {
        baralho = embaralhar(baralho, this._rng);
      }
    } else {
      baralho = embaralhar(criarBaralho(), this._rng);
    }
    const { maos, monte } = distribuir(baralho);
    this._maos = maos;
    this._monte = monte;
    this._mesa = [];
    const abertura = escolherAbertura(this._maos);
    this._jogadorAtual = abertura.jogador;
    this._pecaInicial = abertura.peca;
    this._status = STATUS.AGUARDANDO_PRIMEIRA;
    this._historico.push({
      tipo: "inicio",
      jogadorInicial: this._jogadorAtual,
      pecaInicial: this._pecaInicial.id,
    });
    return this.estado();
  }

  get status() {
    return this._status;
  }

  get jogadorAtual() {
    return this._jogadorAtual;
  }

  get vencedor() {
    return this._vencedor;
  }

  get pontuacao() {
    return { 0: this._pontuacao[0], 1: this._pontuacao[1] };
  }

  get passesConsecutivos() {
    return this._passesConsecutivos;
  }

  get pecaInicialObrigatoria() {
    return this._pecaInicial ? this._pecaInicial : null;
  }

  get encerrada() {
    return (
      this._status === STATUS.BATIDA ||
      this._status === STATUS.TRANCADO ||
      this._status === STATUS.EMPATE
    );
  }

  pontas() {
    if (this._mesa.length === 0) {
      return null;
    }
    return {
      esquerda: this._mesa[0].esquerda,
      direita: this._mesa[this._mesa.length - 1].direita,
    };
  }

  maoDo(jogador) {
    this._assertJogador(jogador);
    return this._maos[jogador].slice();
  }

  mesa() {
    return this._mesa.map((pos) => ({
      peca: pos.peca,
      esquerda: pos.esquerda,
      direita: pos.direita,
    }));
  }

  monte() {
    return this._monte.slice();
  }

  pecasJogaveis(jogador = this._jogadorAtual) {
    this._assertIniciada();
    this._assertJogador(jogador);
    if (this.encerrada) {
      return [];
    }
    if (this._status === STATUS.AGUARDANDO_PRIMEIRA) {
      if (jogador !== this._jogadorAtual) {
        return [];
      }
      return [this._pecaInicial];
    }
    const pontas = this.pontas();
    return this._maos[jogador].filter(
      (p) => p.combinaCom(pontas.esquerda) || p.combinaCom(pontas.direita)
    );
  }

  podeJogar(jogador = this._jogadorAtual) {
    if (this._status === STATUS.NAO_INICIADA || this.encerrada) {
      return false;
    }
    return this.pecasJogaveis(jogador).length > 0;
  }

  podeComprar(jogador = this._jogadorAtual) {
    if (this._status !== STATUS.EM_ANDAMENTO) {
      return false;
    }
    if (jogador !== this._jogadorAtual) {
      return false;
    }
    return !this.podeJogar(jogador) && this._monte.length > 0;
  }

  podePassar(jogador = this._jogadorAtual) {
    if (this._status !== STATUS.EM_ANDAMENTO) {
      return false;
    }
    if (jogador !== this._jogadorAtual) {
      return false;
    }
    return !this.podeJogar(jogador) && this._monte.length === 0;
  }

  jogar(jogador, pecaRef, ponta) {
    this._assertEmJogo();
    this._assertJogador(jogador);
    this._assertVez(jogador);
    const peca = parsePeca(pecaRef);
    const indice = this._maos[jogador].findIndex((p) => p.equals(peca));
    if (indice === -1) {
      throw new ErroPartida(
        "PECA_FORA_DA_MAO",
        `A peça ${peca.toString()} não está na mão do jogador ${jogador}.`
      );
    }
    const pecaMao = this._maos[jogador][indice];

    if (this._status === STATUS.AGUARDANDO_PRIMEIRA) {
      if (!pecaMao.equals(this._pecaInicial)) {
        throw new ErroPartida(
          "ABERTURA_OBRIGATORIA",
          `A primeira jogada deve ser a peça ${this._pecaInicial.toString()}.`
        );
      }
      this._mesa.push({
        peca: pecaMao,
        esquerda: pecaMao.menor,
        direita: pecaMao.maior,
      });
      this._maos[jogador].splice(indice, 1);
      this._status = STATUS.EM_ANDAMENTO;
      this._passesConsecutivos = 0;
      this._historico.push({ tipo: "abertura", jogador, peca: pecaMao.id });
      if (this._maos[jogador].length === 0) {
        this._encerrarPorBatida(jogador);
        return this.estado();
      }
      this._jogadorAtual = oponente(jogador);
      return this.estado();
    }

    const pontas = this.pontas();
    const pontaNorm = this._normalizarPonta(ponta, pecaMao, pontas);
    const valorPonta =
      pontaNorm === PONTA.ESQUERDA ? pontas.esquerda : pontas.direita;
    if (!pecaMao.combinaCom(valorPonta)) {
      throw new ErroPartida(
        "JOGADA_INVALIDA",
        `A peça ${pecaMao.toString()} não combina com a ponta ${pontaNorm} (${valorPonta}).`
      );
    }
    const outro = pecaMao.outroLado(valorPonta);
    if (pontaNorm === PONTA.ESQUERDA) {
      this._mesa.unshift({ peca: pecaMao, esquerda: outro, direita: valorPonta });
    } else {
      this._mesa.push({ peca: pecaMao, esquerda: valorPonta, direita: outro });
    }
    this._maos[jogador].splice(indice, 1);
    this._passesConsecutivos = 0;
    this._historico.push({
      tipo: "jogada",
      jogador,
      peca: pecaMao.id,
      ponta: pontaNorm,
    });
    if (this._maos[jogador].length === 0) {
      this._encerrarPorBatida(jogador);
      return this.estado();
    }
    this._jogadorAtual = oponente(jogador);
    return this.estado();
  }

  _normalizarPonta(ponta, peca, pontas) {
    if (ponta == null || ponta === "") {
      const casaEsq = peca.combinaCom(pontas.esquerda);
      const casaDir = peca.combinaCom(pontas.direita);
      if (casaEsq && !casaDir) {
        return PONTA.ESQUERDA;
      }
      if (casaDir && !casaEsq) {
        return PONTA.DIREITA;
      }
      if (casaEsq && casaDir) {
        throw new ErroPartida(
          "PONTA_OBRIGATORIA",
          `A peça ${peca.toString()} casa com as duas pontas (${pontas.esquerda} e ${pontas.direita}). Informe "esquerda" ou "direita".`
        );
      }
      throw new ErroPartida(
        "JOGADA_INVALIDA",
        `A peça ${peca.toString()} não combina com nenhuma ponta (${pontas.esquerda} e ${pontas.direita}).`
      );
    }
    if (ponta !== PONTA.ESQUERDA && ponta !== PONTA.DIREITA) {
      throw new ErroPartida(
        "PONTA_INVALIDA",
        `Ponta inválida: ${String(ponta)}. Use "esquerda" ou "direita".`
      );
    }
    return ponta;
  }

  comprar(jogador) {
    this._assertEmJogo();
    this._assertJogador(jogador);
    this._assertVez(jogador);
    if (this._status === STATUS.AGUARDANDO_PRIMEIRA) {
      throw new ErroPartida(
        "COMPRA_INVALIDA",
        "Na abertura é obrigatório jogar a peça inicial; não é permitido comprar."
      );
    }
    if (this.podeJogar(jogador)) {
      throw new ErroPartida(
        "COMPRA_INVALIDA",
        "Não é permitido comprar enquanto houver peça jogável."
      );
    }
    if (this._monte.length === 0) {
      throw new ErroPartida(
        "MONTE_VAZIO",
        "Não é permitido comprar: o monte está vazio. O jogador deve passar."
      );
    }
    const comprada = this._monte.shift();
    this._maos[jogador].push(comprada);
    this._historico.push({ tipo: "compra", jogador, peca: comprada.id });
    return comprada;
  }

  passar(jogador) {
    this._assertEmJogo();
    this._assertJogador(jogador);
    this._assertVez(jogador);
    if (this._status === STATUS.AGUARDANDO_PRIMEIRA) {
      throw new ErroPartida(
        "PASSE_INVALIDO",
        "Na abertura é obrigatório jogar a peça inicial; não é permitido passar."
      );
    }
    if (this.podeJogar(jogador)) {
      throw new ErroPartida(
        "PASSE_INVALIDO",
        "Não é permitido passar enquanto houver peça jogável."
      );
    }
    if (this._monte.length > 0) {
      throw new ErroPartida(
        "PASSE_INVALIDO",
        "Não é permitido passar enquanto o monte tiver peças. O jogador deve comprar."
      );
    }
    this._passesConsecutivos += 1;
    this._historico.push({ tipo: "passe", jogador });
    if (this._passesConsecutivos >= NUM_JOGADORES) {
      this._encerrarPorTrancado();
      return this.estado();
    }
    this._jogadorAtual = oponente(jogador);
    return this.estado();
  }

  _encerrarPorBatida(jogador) {
    const rival = oponente(jogador);
    const pontos = this._somaMao(rival);
    this._status = STATUS.BATIDA;
    this._vencedor = jogador;
    this._pontuacao = { 0: 0, 1: 0 };
    this._pontuacao[jogador] = pontos;
    this._jogadorAtual = null;
    this._historico.push({ tipo: "batida", jogador, pontos });
  }

  _encerrarPorTrancado() {
    const soma0 = this._somaMao(0);
    const soma1 = this._somaMao(1);
    this._jogadorAtual = null;
    if (soma0 === soma1) {
      this._status = STATUS.EMPATE;
      this._vencedor = null;
      this._pontuacao = { 0: 0, 1: 0 };
      this._historico.push({ tipo: "empate", somas: { 0: soma0, 1: soma1 } });
      return;
    }
    const vencedor = soma0 < soma1 ? 0 : 1;
    const pontos = vencedor === 0 ? soma1 : soma0;
    this._status = STATUS.TRANCADO;
    this._vencedor = vencedor;
    this._pontuacao = { 0: 0, 1: 0 };
    this._pontuacao[vencedor] = pontos;
    this._historico.push({
      tipo: "trancado",
      vencedor,
      somas: { 0: soma0, 1: soma1 },
      pontos,
    });
  }

  _somaMao(jogador) {
    return this._maos[jogador].reduce((acc, p) => acc + p.pontos, 0);
  }

  somaMao(jogador) {
    this._assertJogador(jogador);
    return this._somaMao(jogador);
  }

  historico() {
    return this._historico.map((evento) => ({ ...evento }));
  }

  estado() {
    return {
      status: this._status,
      jogadorAtual: this._jogadorAtual,
      maos: this._maos.map((mao) => mao.map((p) => p.id)),
      monte: this._monte.map((p) => p.id),
      mesa: this._mesa.map((pos) => ({
        peca: pos.peca.id,
        esquerda: pos.esquerda,
        direita: pos.direita,
      })),
      pontas: this.pontas(),
      vencedor: this._vencedor,
      pontuacao: this.pontuacao,
      passesConsecutivos: this._passesConsecutivos,
      pecaInicialObrigatoria: this._pecaInicial ? this._pecaInicial.id : null,
      encerrada: this.encerrada,
    };
  }

  _assertJogador(jogador) {
    if (!Number.isInteger(jogador) || jogador < 0 || jogador >= NUM_JOGADORES) {
      throw new ErroPartida(
        "JOGADOR_INVALIDO",
        `Jogador inválido: ${String(jogador)}. Use 0 ou 1.`
      );
    }
  }

  _assertIniciada() {
    if (this._status === STATUS.NAO_INICIADA) {
      throw new ErroPartida(
        "NAO_INICIADA",
        "A partida ainda não foi iniciada."
      );
    }
  }

  _assertEmJogo() {
    this._assertIniciada();
    if (this.encerrada) {
      throw new ErroPartida(
        "PARTIDA_ENCERRADA",
        `A partida já foi encerrada (${this._status}).`
      );
    }
  }

  _assertVez(jogador) {
    if (jogador !== this._jogadorAtual) {
      throw new ErroPartida(
        "FORA_DA_VEZ",
        `Não é a vez do jogador ${jogador}. Jogador atual: ${this._jogadorAtual}.`
      );
    }
  }
}

module.exports = {
  Partida,
  ErroPartida,
  STATUS,
  PONTA,
  oponente,
  escolherAbertura,
};
