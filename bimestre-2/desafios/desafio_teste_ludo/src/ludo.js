/**
 * Ludo para 2 jogadores, com regras testáveis e dado injetável.
 *
 * Regras assumidas (o enunciado da disciplina não detalha o regulamento):
 * - Tabuleiro padrão de 52 casas no percurso e reta final de 6 casas
 *   (5 casas coloridas + chegada), por jogador.
 * - Cada jogador tem 4 peões. O jogador 0 sai na casa 0; o jogador 1,
 *   no lado oposto, sai na casa 26.
 * - Só se sai da base com um 6. O peão é colocado na casa de saída
 *   (o 6 não caminha no percurso). Tirar 6 concede nova jogada.
 * - Três 6 consecutivos no mesmo turno cancelam o terceiro lance
 *   (sem movimento) e passam a vez. Os dois lances anteriores valem.
 * - Captura: cair exatamente na casa de um peão adversário isolado,
 *   fora de casa segura, manda esse peão de volta à base e concede
 *   nova jogada.
 * - Casas seguras: as 4 saídas do tabuleiro padrão (0, 13, 26, 39)
 *   e as 4 casas-estrela (8, 21, 34, 47). Também é seguro um bloco
 *   de 2 ou mais peões do mesmo jogador; nesse caso o adversário
 *   não pode estacionar ali.
 * - Após 51 passos a partir da casa de saída, o peão entra na reta
 *   final. A chegada exige valor exato (não recua e não ultrapassa).
 * - Chegar com um peão concede nova jogada.
 * - Vence quem colocar os 4 peões na chegada.
 * - Se não houver movimento válido, a vez passa — exceto no 6, que
 *   ainda permite rolar de novo (salvo o terceiro 6 consecutivo).
 */

const { Dado } = require('./dado');

const CASAS_PERCURSO = 52;
const CASAS_RETA_FINAL = 6;
const PASSOS_ATE_RETA = 51;
const PASSOS_PARA_CHEGAR = PASSOS_ATE_RETA + CASAS_RETA_FINAL; // 57
const PEOES_POR_JOGADOR = 4;
const JOGADORES = 2;
const CASAS_SAIDA = Object.freeze([0, 26]);
const CASAS_SEGURAS = Object.freeze([0, 8, 13, 21, 26, 34, 39, 47]);
const SET_CASAS_SEGURAS = new Set(CASAS_SEGURAS);

function criarPeao(id) {
  return {
    id,
    estado: 'base', // 'base' | 'tabuleiro' | 'reta' | 'chegada'
    casa: null,
    passos: 0,
  };
}

function criarJogador(id) {
  return {
    id,
    casaSaida: CASAS_SAIDA[id],
    peoes: Array.from({ length: PEOES_POR_JOGADOR }, (_, i) => criarPeao(i)),
  };
}

class Ludo {
  /**
   * @param {object} [opcoes]
   * @param {{ rolar: function(): number }} [opcoes.dado] dado injetável
   * @param {number[]} [opcoes.sequenciaDado] atalho para `new Dado(sequencia)`
   */
  constructor(opcoes = {}) {
    if (opcoes === null || typeof opcoes !== 'object') {
      throw new Error('As opções do jogo devem ser um objeto.');
    }
    const { dado, sequenciaDado } = opcoes;
    if (dado && sequenciaDado) {
      throw new Error('Informe apenas dado ou sequenciaDado, não ambos.');
    }
    if (sequenciaDado) {
      this.dado = new Dado(sequenciaDado);
    } else if (dado) {
      if (typeof dado.rolar !== 'function') {
        throw new Error('O dado deve expor o método rolar().');
      }
      this.dado = dado;
    } else {
      this.dado = new Dado();
    }

    this.jogadores = [criarJogador(0), criarJogador(1)];
    this.jogadorAtual = 0;
    this.valorDado = null;
    this.aguardandoMovimento = false;
    this.seisConsecutivos = 0;
    this.vencedor = null;
  }

  partidaEncerrada() {
    return this.vencedor !== null;
  }

  /**
   * Cópia defensiva do peão para inspeção nos testes.
   */
  obterPeao(jogadorId, peaoId) {
    this._validarJogador(jogadorId);
    this._validarPeao(peaoId);
    return { ...this.jogadores[jogadorId].peoes[peaoId] };
  }

  peoesDoJogador(jogadorId) {
    this._validarJogador(jogadorId);
    return this.jogadores[jogadorId].peoes.map((p) => ({ ...p }));
  }

  ehCasaSegura(casa) {
    return SET_CASAS_SEGURAS.has(casa);
  }

  /**
   * Posiciona um peão pelo número de passos desde a casa de saída.
   * Destinado à montagem de cenários de teste (não altera o turno).
   * - null / 'base': volta à base
   * - 0..51: percurso
   * - 52..56: reta final (1 a 5)
   * - 57: chegada
   */
  definirPosicao(jogadorId, peaoId, passos) {
    this._validarJogador(jogadorId);
    this._validarPeao(peaoId);
    if (this.aguardandoMovimento) {
      throw new Error('Não é possível reposicionar um peão no meio de uma jogada.');
    }

    const peao = this.jogadores[jogadorId].peoes[peaoId];
    if (passos === null || passos === undefined || passos === 'base') {
      peao.estado = 'base';
      peao.casa = null;
      peao.passos = 0;
      return this.obterPeao(jogadorId, peaoId);
    }
    if (!Number.isInteger(passos) || passos < 0 || passos > PASSOS_PARA_CHEGAR) {
      throw new Error(`Passos inválidos: ${passos}. Use null (base) ou um inteiro de 0 a ${PASSOS_PARA_CHEGAR}.`);
    }

    peao.passos = passos;
    if (passos <= PASSOS_ATE_RETA) {
      peao.estado = 'tabuleiro';
      peao.casa = this._casaAbsoluta(jogadorId, passos);
    } else if (passos < PASSOS_PARA_CHEGAR) {
      peao.estado = 'reta';
      peao.casa = passos - PASSOS_ATE_RETA;
    } else {
      peao.estado = 'chegada';
      peao.casa = CASAS_RETA_FINAL;
    }
    return this.obterPeao(jogadorId, peaoId);
  }

  /**
   * Rola o dado do jogador da vez.
   * @returns {{ valor: number, movimentoPossivel: boolean, tresSeis: boolean, jogarNovamente?: boolean, peoesMoviveis?: number[] }}
   */
  rolar() {
    if (this.partidaEncerrada()) {
      throw new Error('A partida já foi encerrada.');
    }
    if (this.aguardandoMovimento) {
      throw new Error('É necessário mover um peão antes de rolar novamente.');
    }

    const valor = this.dado.rolar();
    this.valorDado = valor;

    if (valor === 6) {
      this.seisConsecutivos += 1;
    } else {
      this.seisConsecutivos = 0;
    }

    if (this.seisConsecutivos >= 3) {
      const jogador = this.jogadorAtual;
      this.seisConsecutivos = 0;
      this.aguardandoMovimento = false;
      this.valorDado = null;
      this._passarVez();
      return {
        valor,
        movimentoPossivel: false,
        tresSeis: true,
        jogarNovamente: false,
        jogador,
      };
    }

    const moviveis = this.peoesMoviveis();
    if (moviveis.length === 0) {
      const jogarNovamente = valor === 6;
      this.aguardandoMovimento = false;
      this.valorDado = null;
      if (!jogarNovamente) {
        this._passarVez();
      }
      return {
        valor,
        movimentoPossivel: false,
        tresSeis: false,
        jogarNovamente,
      };
    }

    this.aguardandoMovimento = true;
    return {
      valor,
      movimentoPossivel: true,
      tresSeis: false,
      peoesMoviveis: moviveis,
    };
  }

  /**
   * Índices (0 a 3) dos peões do jogador atual que podem usar o valor rolado.
   */
  peoesMoviveis() {
    if (this.valorDado === null) {
      return [];
    }
    const valor = this.valorDado;
    const jogador = this.jogadores[this.jogadorAtual];
    return jogador.peoes
      .filter((peao) => this._movimentoValido(jogador, peao, valor))
      .map((peao) => peao.id);
  }

  /**
   * Move o peão informado do jogador da vez.
   * @param {number} indicePeao 0 a 3
   */
  mover(indicePeao) {
    if (this.partidaEncerrada()) {
      throw new Error('A partida já foi encerrada.');
    }
    if (!this.aguardandoMovimento) {
      throw new Error('É necessário rolar o dado antes de mover.');
    }
    this._validarPeao(indicePeao);

    const moviveis = this.peoesMoviveis();
    if (!moviveis.includes(indicePeao)) {
      throw new Error(`O peão ${indicePeao} não pode ser movido com o valor ${this.valorDado}.`);
    }

    const jogador = this.jogadores[this.jogadorAtual];
    const peao = jogador.peoes[indicePeao];
    const valor = this.valorDado;
    let capturou = false;
    let chegou = false;
    let saiuDaBase = false;

    if (peao.estado === 'base') {
      peao.estado = 'tabuleiro';
      peao.passos = 0;
      peao.casa = jogador.casaSaida;
      saiuDaBase = true;
    } else {
      const novosPassos = peao.passos + valor;
      peao.passos = novosPassos;
      if (novosPassos <= PASSOS_ATE_RETA) {
        peao.estado = 'tabuleiro';
        peao.casa = this._casaAbsoluta(jogador.id, novosPassos);
        capturou = this._resolverCaptura(jogador.id, peao.casa);
      } else if (novosPassos < PASSOS_PARA_CHEGAR) {
        peao.estado = 'reta';
        peao.casa = novosPassos - PASSOS_ATE_RETA;
      } else {
        peao.estado = 'chegada';
        peao.casa = CASAS_RETA_FINAL;
        chegou = true;
      }
    }

    if (jogador.peoes.every((p) => p.estado === 'chegada')) {
      this.vencedor = jogador.id;
      this.aguardandoMovimento = false;
      this.valorDado = null;
      return {
        peao: indicePeao,
        capturou,
        chegou,
        saiuDaBase,
        venceu: true,
        jogarNovamente: false,
      };
    }

    const jogarNovamente = valor === 6 || capturou || chegou;
    this.aguardandoMovimento = false;
    this.valorDado = null;
    if (valor !== 6) {
      this.seisConsecutivos = 0;
    }
    if (!jogarNovamente) {
      this._passarVez();
    }

    return {
      peao: indicePeao,
      capturou,
      chegou,
      saiuDaBase,
      venceu: false,
      jogarNovamente,
    };
  }

  _casaAbsoluta(jogadorId, passos) {
    return (CASAS_SAIDA[jogadorId] + passos) % CASAS_PERCURSO;
  }

  _movimentoValido(jogador, peao, valor) {
    if (peao.estado === 'chegada' || peao.estado === 'base') {
      return peao.estado === 'base' && valor === 6;
    }
    const novosPassos = peao.passos + valor;
    if (novosPassos > PASSOS_PARA_CHEGAR) {
      return false;
    }
    if (novosPassos <= PASSOS_ATE_RETA) {
      const casa = this._casaAbsoluta(jogador.id, novosPassos);
      if (this._ehPilhaAdversaria(jogador.id, casa)) {
        return false;
      }
    }
    return true;
  }

  _ehPilhaAdversaria(jogadorId, casa) {
    const outro = this.jogadores[1 - jogadorId];
    const ocupantes = outro.peoes.filter(
      (p) => p.estado === 'tabuleiro' && p.casa === casa,
    );
    return ocupantes.length >= 2;
  }

  _resolverCaptura(jogadorId, casa) {
    if (SET_CASAS_SEGURAS.has(casa)) {
      return false;
    }
    const outro = this.jogadores[1 - jogadorId];
    const ocupantes = outro.peoes.filter(
      (p) => p.estado === 'tabuleiro' && p.casa === casa,
    );
    if (ocupantes.length === 1) {
      const alvo = ocupantes[0];
      alvo.estado = 'base';
      alvo.casa = null;
      alvo.passos = 0;
      return true;
    }
    return false;
  }

  _passarVez() {
    this.jogadorAtual = 1 - this.jogadorAtual;
    this.seisConsecutivos = 0;
  }

  _validarJogador(jogadorId) {
    if (!Number.isInteger(jogadorId) || jogadorId < 0 || jogadorId >= JOGADORES) {
      throw new Error('Jogador inválido. Use 0 ou 1.');
    }
  }

  _validarPeao(peaoId) {
    if (!Number.isInteger(peaoId) || peaoId < 0 || peaoId >= PEOES_POR_JOGADOR) {
      throw new Error('Índice de peão inválido. Use 0, 1, 2 ou 3.');
    }
  }
}

const CONSTANTES = Object.freeze({
  CASAS_PERCURSO,
  CASAS_RETA_FINAL,
  PASSOS_ATE_RETA,
  PASSOS_PARA_CHEGAR,
  PEOES_POR_JOGADOR,
  JOGADORES,
  CASAS_SAIDA,
  CASAS_SEGURAS,
});

module.exports = { Ludo, Dado, CONSTANTES };
