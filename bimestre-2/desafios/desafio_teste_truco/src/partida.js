'use strict';

const { criarCarta, cartaIgual, parseCarta } = require('./carta');
const { criarBaralho, criarRng, embaralhar, distribuir, validarDistribuicao } = require('./baralho');
const { manilhasDaVira, resolverRodada, avaliarMao } = require('./ranking');
const { proximoValor, valorSeCorrer, nomeDoAumento, podeAumentar } = require('./aposta');

function duplaDe(jogador) {
  return jogador % 2;
}

function parceiroDe(jogador) {
  return (jogador + 2) % 4;
}

function proximoJogador(jogador) {
  return (jogador + 1) % 4;
}

function normalizarPlacarInicial(placarInicial) {
  if (placarInicial == null) {
    return [0, 0];
  }
  if (!Array.isArray(placarInicial) || placarInicial.length !== 2) {
    throw new Error('O placar inicial deve ter dois valores, um para cada dupla');
  }
  return placarInicial.map((pontos, indice) => {
    if (!Number.isInteger(pontos) || pontos < 0 || pontos > 11) {
      throw new Error(`Placar inicial inválido para a dupla ${indice}: ${pontos}`);
    }
    return pontos;
  });
}

class Partida {
  constructor(opcoes = {}) {
    this.placar = normalizarPlacarInicial(opcoes.placarInicial);
    this.carteador = opcoes.carteadorInicial ?? 3;
    this.rng = typeof opcoes.rng === 'function'
      ? opcoes.rng
      : (opcoes.semente != null ? criarRng(opcoes.semente) : Math.random);
    this.estado = 'aguardando_inicio';
    this.historicoMaos = [];
    this._limparMao();
  }

  _limparMao() {
    this.maos = [[], [], [], []];
    this.vira = null;
    this.resto = [];
    this.jogadorMao = null;
    this.vez = null;
    this.valorMao = 1;
    this.modo = 'normal';
    this.rodadas = [];
    this.jogadasAtuais = [];
    this.aumentoPendente = null;
    this.duplaQueAceitouUltimoAumento = null;
    this.viraVisivel = true;
    this.cartasVisiveis = true;
    this.vencedorMao = null;
    this.motivoEncerramentoMao = null;
    this.pontosDaMao = 0;
  }

  get vencedorPartida() {
    if (this.estado !== 'encerrada') return null;
    if (this.placar[0] >= 12) return 0;
    if (this.placar[1] >= 12) return 1;
    return null;
  }

  get manilhas() {
    if (!this.vira || !this.viraVisivel) return null;
    return manilhasDaVira(this.vira);
  }

  get rodadaAtual() {
    return this.rodadas.length + 1;
  }

  _garantirEmAndamento() {
    if (this.estado === 'encerrada') {
      throw new Error('A partida já foi encerrada');
    }
  }

  _modoPeloPlacar() {
    const [a, b] = this.placar;
    if (a === 11 && b === 11) return 'mao_de_ferro';
    if (a === 11 || b === 11) return 'mao_de_onze';
    return 'normal';
  }

  _duplaEmOnze() {
    if (this.placar[0] === 11 && this.placar[1] < 11) return 0;
    if (this.placar[1] === 11 && this.placar[0] < 11) return 1;
    return null;
  }

  iniciarMao(distribuicao) {
    this._garantirEmAndamento();
    if (this.estado !== 'aguardando_inicio') {
      throw new Error('Já existe uma mão em andamento');
    }

    this._limparMao();
    this.modo = this._modoPeloPlacar();

    let resultado;
    if (distribuicao) {
      resultado = validarDistribuicao(distribuicao);
      resultado.resto = [];
    } else {
      const baralho = embaralhar(criarBaralho(), this.rng);
      resultado = distribuir(baralho, this.carteador);
    }

    this.maos = resultado.maos.map((mao) => mao.map((c) => criarCarta(c.valor, c.naipe)));
    this.vira = criarCarta(resultado.vira.valor, resultado.vira.naipe);
    this.resto = resultado.resto || [];
    this.jogadorMao = proximoJogador(this.carteador);
    this.vez = this.jogadorMao;
    this.valorMao = this.modo === 'normal' ? 1 : 3;

    if (this.modo === 'mao_de_ferro') {
      this.viraVisivel = false;
      this.cartasVisiveis = false;
      this.estado = 'em_jogo';
    } else if (this.modo === 'mao_de_onze') {
      this.viraVisivel = true;
      this.cartasVisiveis = true;
      this.estado = 'decisao_mao_de_onze';
    } else {
      this.viraVisivel = true;
      this.cartasVisiveis = true;
      this.estado = 'em_jogo';
    }

    return this.snapshot();
  }

  verCartas(jogador) {
    this._validarJogador(jogador);
    if (!this.cartasVisiveis) {
      throw new Error('Na mão de ferro as cartas permanecem cobertas');
    }
    return this.maos[jogador].slice();
  }

  verCartasParceiro(jogador) {
    this._validarJogador(jogador);
    if (this.modo !== 'mao_de_onze') {
      throw new Error('Só é permitido ver as cartas do parceiro na mão de onze');
    }
    const duplaOnze = this._duplaEmOnze();
    if (duplaDe(jogador) !== duplaOnze) {
      throw new Error('Apenas a dupla que está com 11 pontos pode ver as cartas do parceiro');
    }
    return this.maos[parceiroDe(jogador)].slice();
  }

  verVira() {
    if (!this.vira) {
      throw new Error('A mão ainda não foi iniciada');
    }
    if (!this.viraVisivel) {
      throw new Error('A vira permanece coberta até o fim da primeira rodada da mão de ferro');
    }
    return this.vira;
  }

  decidirMaoDeOnze(jogador, decisao) {
    this._validarJogador(jogador);
    if (this.estado !== 'decisao_mao_de_onze') {
      throw new Error('Não há decisão de mão de onze pendente');
    }
    const duplaOnze = this._duplaEmOnze();
    if (duplaDe(jogador) !== duplaOnze) {
      throw new Error('Somente a dupla que está com 11 pontos pode aceitar ou correr da mão de onze');
    }
    if (decisao !== 'aceitar' && decisao !== 'correr') {
      throw new Error(`Decisão inválida: ${decisao}`);
    }
    if (decisao === 'aceitar') {
      this.valorMao = 3;
      this.estado = 'em_jogo';
      return this.snapshot();
    }
    const adversaria = 1 - duplaOnze;
    this._encerrarMao({
      vencedorDupla: adversaria,
      motivo: 'correr_mao_de_onze',
      pontos: 1,
    });
    return this.snapshot();
  }

  pedirAumento(jogador) {
    this._validarJogador(jogador);
    this._exigirVez(jogador);
    if (this.estado !== 'em_jogo') {
      throw new Error('Não é possível pedir aumento no estado atual');
    }
    if (this.modo === 'mao_de_onze' || this.modo === 'mao_de_ferro') {
      throw new Error('Não é permitido pedir truco, seis, nove ou doze na mão de onze ou na mão de ferro');
    }
    if (!podeAumentar(this.valorMao)) {
      throw new Error('A mão já vale 12 pontos; não é possível aumentar');
    }
    if (this.duplaQueAceitouUltimoAumento != null
        && duplaDe(jogador) !== this.duplaQueAceitouUltimoAumento) {
      throw new Error('Somente a dupla que aceitou o último aumento pode pedir o próximo');
    }
    const proposto = proximoValor(this.valorMao);
    this.aumentoPendente = {
      de: jogador,
      dupla: duplaDe(jogador),
      proposto,
      nome: nomeDoAumento(proposto),
    };
    this.estado = 'aguardando_resposta';
    return this.snapshot();
  }

  responderAumento(jogador, resposta) {
    this._validarJogador(jogador);
    if (this.estado !== 'aguardando_resposta' || !this.aumentoPendente) {
      throw new Error('Não há aumento pendente para responder');
    }
    if (duplaDe(jogador) === this.aumentoPendente.dupla) {
      throw new Error('A dupla que pediu o aumento não pode respondê-lo');
    }
    if (!['aceitar', 'correr', 'aumentar'].includes(resposta)) {
      throw new Error(`Resposta inválida: ${resposta}`);
    }

    if (resposta === 'aceitar') {
      this.valorMao = this.aumentoPendente.proposto;
      this.duplaQueAceitouUltimoAumento = duplaDe(jogador);
      this.aumentoPendente = null;
      this.estado = 'em_jogo';
      return this.snapshot();
    }

    if (resposta === 'correr') {
      const pontos = valorSeCorrer(this.aumentoPendente.proposto);
      const vencedora = this.aumentoPendente.dupla;
      this._encerrarMao({
        vencedorDupla: vencedora,
        motivo: `correr_${this.aumentoPendente.nome}`,
        pontos,
      });
      return this.snapshot();
    }

    if (!podeAumentar(this.aumentoPendente.proposto)) {
      throw new Error('Não é possível aumentar além de 12 pontos');
    }
    const proposto = proximoValor(this.aumentoPendente.proposto);
    this.aumentoPendente = {
      de: jogador,
      dupla: duplaDe(jogador),
      proposto,
      nome: nomeDoAumento(proposto),
    };
    return this.snapshot();
  }

  jogarCarta(jogador, cartaInformada, opcoes = {}) {
    this._validarJogador(jogador);
    this._exigirVez(jogador);
    if (this.estado === 'decisao_mao_de_onze') {
      throw new Error('A dupla com 11 pontos precisa aceitar ou correr antes de jogar');
    }
    if (this.estado === 'aguardando_resposta') {
      throw new Error('É preciso responder ao aumento antes de jogar a carta');
    }
    if (this.estado !== 'em_jogo') {
      throw new Error('Não é possível jogar no estado atual');
    }

    const coberta = Boolean(opcoes.coberta);
    if (coberta && this.modo === 'mao_de_ferro') {
      throw new Error('Na mão de ferro as cartas são jogadas no escuro, mas conservam o valor real');
    }
    if (coberta && !this._podeEsconder()) {
      throw new Error('Não é permitido esconder a carta nesta rodada');
    }

    const carta = this._retirarCarta(jogador, cartaInformada, opcoes.indice);
    this.jogadasAtuais.push({
      jogador,
      carta,
      coberta,
    });

    if (this.jogadasAtuais.length < 4) {
      this.vez = proximoJogador(jogador);
      return this.snapshot();
    }

    return this._fecharRodada();
  }

  _podeEsconder() {
    return this.rodadas.length >= 1 && this.modo !== 'mao_de_ferro';
  }

  _retirarCarta(jogador, cartaInformada, indice) {
    const mao = this.maos[jogador];
    if (mao.length === 0) {
      throw new Error(`O jogador ${jogador} não tem mais cartas`);
    }

    const escolhido = typeof indice === 'number' ? indice : cartaInformada;
    if (typeof escolhido === 'number') {
      if (escolhido < 0 || escolhido >= mao.length) {
        throw new Error('Índice de carta inválido');
      }
      return mao.splice(escolhido, 1)[0];
    }

    const alvo = parseCarta(cartaInformada);
    const posicao = mao.findIndex((c) => cartaIgual(c, alvo));
    if (posicao < 0) {
      throw new Error('O jogador não possui essa carta');
    }
    return mao.splice(posicao, 1)[0];
  }

  _fecharRodada() {
    if (this.modo === 'mao_de_ferro' && !this.viraVisivel) {
      this.viraVisivel = true;
    }

    const resolucao = resolverRodada(this.jogadasAtuais, this.vira);
    this.rodadas.push({
      resultado: resolucao.resultado,
      jogador: resolucao.jogador,
      dupla: resolucao.dupla,
      quemCangou: resolucao.quemCangou,
      jogadas: this.jogadasAtuais.slice(),
    });
    this.jogadasAtuais = [];

    const avaliacao = avaliarMao(this.rodadas);
    if (avaliacao.encerrada) {
      if (avaliacao.vencedorDupla == null) {
        this._encerrarMao({
          vencedorDupla: null,
          motivo: 'tres_empates',
          pontos: 0,
        });
      } else {
        const pontos = this.modo === 'mao_de_ferro' ? this._pontosParaVencer(avaliacao.vencedorDupla) : this.valorMao;
        this._encerrarMao({
          vencedorDupla: avaliacao.vencedorDupla,
          motivo: avaliacao.motivo,
          pontos,
        });
      }
      return this.snapshot();
    }

    if (resolucao.resultado === 'vencedor') {
      this.vez = resolucao.jogador;
    } else {
      this.vez = resolucao.quemCangou;
    }
    return this.snapshot();
  }

  _pontosParaVencer(dupla) {
    return Math.max(1, 12 - this.placar[dupla]);
  }

  _encerrarMao({ vencedorDupla, motivo, pontos }) {
    if (vencedorDupla != null && pontos > 0) {
      this.placar[vencedorDupla] += pontos;
    }
    this.vencedorMao = vencedorDupla;
    this.motivoEncerramentoMao = motivo;
    this.pontosDaMao = pontos;
    this.aumentoPendente = null;
    this.vez = null;
    this.historicoMaos.push({
      modo: this.modo,
      vencedorDupla,
      motivo,
      pontos,
      valorMao: this.valorMao,
      rodadas: this.rodadas.slice(),
      carteador: this.carteador,
    });
    this.carteador = proximoJogador(this.carteador);

    if (this.placar[0] >= 12 || this.placar[1] >= 12) {
      this.estado = 'encerrada';
      if (this.placar[0] >= 12) this.placar[0] = 12;
      if (this.placar[1] >= 12) this.placar[1] = 12;
    } else {
      this.estado = 'aguardando_inicio';
    }
  }

  _validarJogador(jogador) {
    if (!Number.isInteger(jogador) || jogador < 0 || jogador > 3) {
      throw new Error(`Jogador inválido: ${jogador}`);
    }
  }

  _exigirVez(jogador) {
    if (this.vez !== jogador) {
      throw new Error(`Não é a vez do jogador ${jogador}`);
    }
  }

  snapshot() {
    return {
      estado: this.estado,
      placar: this.placar.slice(),
      carteador: this.carteador,
      modo: this.modo,
      valorMao: this.valorMao,
      vez: this.vez,
      jogadorMao: this.jogadorMao,
      vira: this.viraVisivel ? this.vira : null,
      viraVisivel: this.viraVisivel,
      cartasVisiveis: this.cartasVisiveis,
      manilhas: this.manilhas,
      rodadaAtual: this.estado === 'aguardando_inicio' || this.estado === 'encerrada'
        ? this.rodadas.length
        : this.rodadas.length + 1,
      rodadas: this.rodadas.map((r) => ({
        resultado: r.resultado,
        jogador: r.jogador,
        dupla: r.dupla,
        quemCangou: r.quemCangou,
      })),
      jogadasAtuais: this.jogadasAtuais.map((j) => ({
        jogador: j.jogador,
        carta: j.coberta ? null : j.carta,
        coberta: j.coberta,
      })),
      aumentoPendente: this.aumentoPendente,
      duplaQueAceitouUltimoAumento: this.duplaQueAceitouUltimoAumento,
      vencedorMao: this.vencedorMao,
      motivoEncerramentoMao: this.motivoEncerramentoMao,
      pontosDaMao: this.pontosDaMao,
      vencedorPartida: this.vencedorPartida,
    };
  }
}

module.exports = {
  Partida,
  duplaDe,
  parceiroDe,
  proximoJogador,
};
