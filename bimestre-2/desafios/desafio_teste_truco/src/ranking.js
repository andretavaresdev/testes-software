'use strict';

const { VALORES, NAIPES, NOMES_MANILHA, criarCarta } = require('./carta');

/** Valor imediatamente acima da vira, voltando de 3 para 4. */
function valorSeguinte(valor) {
  const indice = VALORES.indexOf(valor);
  if (indice < 0) {
    throw new Error(`Valor de carta inválido: ${valor}`);
  }
  return VALORES[(indice + 1) % VALORES.length];
}

function manilhasDaVira(vira) {
  const cartaVira = criarCarta(vira.valor, vira.naipe);
  const valorManilha = valorSeguinte(cartaVira.valor);
  const porNaipe = {};
  NAIPES.forEach((naipe) => {
    porNaipe[naipe] = criarCarta(valorManilha, naipe);
  });
  return {
    valor: valorManilha,
    porNaipe,
    zap: porNaipe.paus,
    copeta: porNaipe.copas,
    espadilha: porNaipe.espadas,
    picaFumo: porNaipe.ouros,
  };
}

function ehManilha(carta, vira) {
  const manilhas = manilhasDaVira(vira);
  return carta.valor === manilhas.valor;
}

function nomeManilha(carta, vira) {
  if (!ehManilha(carta, vira)) return null;
  return NOMES_MANILHA[carta.naipe];
}

/**
 * Força numérica da carta. Carta coberta vale -1 (perde para qualquer carta aberta).
 * Manilhas: 10 + índice do naipe (ouros=10 ... paus=13).
 * Cartas comuns: 0 a 9, conforme VALORES.
 */
function forcaCarta(carta, vira, coberta = false) {
  if (coberta) return -1;
  const normalizada = criarCarta(carta.valor, carta.naipe);
  if (ehManilha(normalizada, vira)) {
    return 10 + NAIPES.indexOf(normalizada.naipe);
  }
  return VALORES.indexOf(normalizada.valor);
}

function compararCartas(a, b, vira, opcoes = {}) {
  const forcaA = forcaCarta(a, vira, Boolean(opcoes.cobertaA));
  const forcaB = forcaCarta(b, vira, Boolean(opcoes.cobertaB));
  if (forcaA === forcaB) return 0;
  return forcaA > forcaB ? 1 : -1;
}

/**
 * Resolve uma rodada (vaza) com as 4 jogadas.
 * Empate (cango) ocorre só quando as duas duplas exibem a maior força.
 */
function resolverRodada(jogadas, vira) {
  if (!Array.isArray(jogadas) || jogadas.length !== 4) {
    throw new Error('A rodada deve ter 4 jogadas');
  }
  const detalhe = jogadas.map((jogada) => ({
    jogador: jogada.jogador,
    dupla: jogada.jogador % 2,
    carta: jogada.carta,
    coberta: Boolean(jogada.coberta),
    forca: forcaCarta(jogada.carta, vira, Boolean(jogada.coberta)),
  }));

  const maiorForca = Math.max(...detalhe.map((j) => j.forca));
  const comMaior = detalhe.filter((j) => j.forca === maiorForca);
  const duplasComMaior = [...new Set(comMaior.map((j) => j.dupla))];

  if (duplasComMaior.length > 1) {
    const quemCangou = comMaior[comMaior.length - 1].jogador;
    return {
      resultado: 'empate',
      jogador: null,
      dupla: null,
      quemCangou,
      detalhe,
    };
  }

  const vencedor = comMaior[0];
  return {
    resultado: 'vencedor',
    jogador: vencedor.jogador,
    dupla: vencedor.dupla,
    quemCangou: null,
    detalhe,
  };
}

/**
 * Avalia se a mão já tem vencedor, segundo o Art. 5º §2º do regulamento
 * da Federação Paulista / VI JUFFS.
 */
function avaliarMao(rodadas) {
  if (!Array.isArray(rodadas) || rodadas.length === 0) {
    return { encerrada: false, vencedorDupla: null, motivo: null };
  }
  if (rodadas.length > 3) {
    throw new Error('Uma mão tem no máximo 3 rodadas');
  }

  if (rodadas.length === 1) {
    return { encerrada: false, vencedorDupla: null, motivo: null };
  }

  const [r1, r2, r3] = rodadas;

  if (rodadas.length === 2) {
    if (r1.resultado === 'empate' && r2.resultado === 'vencedor') {
      return { encerrada: true, vencedorDupla: r2.dupla, motivo: 'desempate_segunda' };
    }
    if (r1.resultado === 'vencedor' && r2.resultado === 'empate') {
      return { encerrada: true, vencedorDupla: r1.dupla, motivo: 'empate_segunda' };
    }
    if (r1.resultado === 'empate' && r2.resultado === 'empate') {
      return { encerrada: false, vencedorDupla: null, motivo: null };
    }
    if (r1.resultado === 'vencedor' && r2.resultado === 'vencedor' && r1.dupla === r2.dupla) {
      return { encerrada: true, vencedorDupla: r1.dupla, motivo: 'duas_rodadas' };
    }
    return { encerrada: false, vencedorDupla: null, motivo: null };
  }

  if (r1.resultado === 'empate' && r2.resultado === 'empate' && r3.resultado === 'empate') {
    return { encerrada: true, vencedorDupla: null, motivo: 'tres_empates' };
  }
  if (r3.resultado === 'empate') {
    return { encerrada: true, vencedorDupla: r1.dupla, motivo: 'empate_terceira' };
  }
  return { encerrada: true, vencedorDupla: r3.dupla, motivo: 'terceira_rodada' };
}

module.exports = {
  valorSeguinte,
  manilhasDaVira,
  ehManilha,
  nomeManilha,
  forcaCarta,
  compararCartas,
  resolverRodada,
  avaliarMao,
};
