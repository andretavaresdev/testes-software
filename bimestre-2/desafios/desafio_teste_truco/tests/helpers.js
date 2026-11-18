'use strict';

const { criarCarta } = require('../src/carta');
const { Partida } = require('../src/partida');

function C(valor, naipe) {
  return criarCarta(valor, naipe);
}

function distribuicao(maos, vira) {
  return { maos, vira };
}

/**
 * Baralho de exemplo: vira 7 de ouros, manilhas são as damas
 * (zap = Q paus, copeta = Q copas, espadilha = Q espadas, pica-fumo = Q ouros).
 */
function distribuicaoPadrao(sobrescrever = {}) {
  const base = {
    maos: [
      [C('Q', 'paus'), C('3', 'copas'), C('4', 'ouros')],
      [C('3', 'ouros'), C('2', 'copas'), C('4', 'espadas')],
      [C('2', 'paus'), C('A', 'copas'), C('5', 'ouros')],
      [C('K', 'paus'), C('J', 'copas'), C('6', 'ouros')],
    ],
    vira: C('7', 'ouros'),
  };
  return {
    maos: sobrescrever.maos || base.maos,
    vira: sobrescrever.vira || base.vira,
  };
}

function novaPartida(opcoes = {}) {
  const partida = new Partida({
    carteadorInicial: opcoes.carteadorInicial ?? 3,
    semente: opcoes.semente,
    rng: opcoes.rng,
    placarInicial: opcoes.placarInicial,
  });
  if (opcoes.iniciar !== false) {
    partida.iniciarMao(opcoes.distribuicao || distribuicaoPadrao(opcoes.sobrescrever || {}));
  }
  return partida;
}

function jogar(partida, jogador, valor, naipe, opcoes) {
  return partida.jogarCarta(jogador, C(valor, naipe), opcoes);
}

/**
 * Joga uma rodada completa na ordem da vez, a partir das cartas informadas
 * no sentido anti-horário. `cartas` é um vetor de 4 itens { jogador, carta, coberta? }.
 */
function jogarRodada(partida, cartas) {
  cartas.forEach((item) => {
    const carta = item.carta || item;
    const jogador = item.jogador != null ? item.jogador : partida.vez;
    partida.jogarCarta(jogador, carta, { coberta: item.coberta, indice: item.indice });
  });
  return partida.snapshot();
}

module.exports = {
  C,
  distribuicao,
  distribuicaoPadrao,
  novaPartida,
  jogar,
  jogarRodada,
};
