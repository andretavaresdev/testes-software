'use strict';

const { VALORES, NAIPES, criarCarta, cartaIgual } = require('./carta');

function criarBaralho() {
  const baralho = [];
  let indice = 0;
  while (indice < NAIPES.length * VALORES.length) {
    const naipe = NAIPES[Math.floor(indice / VALORES.length)];
    const valor = VALORES[indice % VALORES.length];
    baralho.push(criarCarta(valor, naipe));
    indice++;
  }
  return baralho;
}

function criarRng(semente) {
  let estado = (semente >>> 0) || 1;
  return function rng() {
    estado += 0x6d2b79f5;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function embaralhar(cartas, rng = Math.random) {
  const copia = cartas.slice();
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copia[i];
    copia[i] = copia[j];
    copia[j] = tmp;
  }
  return copia;
}

/**
 * Distribui 3 cartas para cada um dos 4 jogadores e vira a carta seguinte.
 * A ordem de distribuição é anti-horária, começando à direita do carteador.
 */
function distribuir(cartas, carteador = 3) {
  if (!Array.isArray(cartas) || cartas.length !== 40) {
    throw new Error('O baralho deve ter 40 cartas');
  }
  const ids = new Set(cartas.map((c) => c.id));
  if (ids.size !== 40) {
    throw new Error('O baralho contém cartas repetidas');
  }

  const maos = [[], [], [], []];
  let indice = 0;
  const primeiro = (carteador + 1) % 4;
  for (let rodada = 0; rodada < 3; rodada += 1) {
    for (let i = 0; i < 4; i += 1) {
      const jogador = (primeiro + i) % 4;
      maos[jogador].push(cartas[indice]);
      indice += 1;
    }
  }
  const vira = cartas[indice];
  indice += 1;
  const resto = cartas.slice(indice);

  return { maos, vira, resto };
}

function validarDistribuicao({ maos, vira }) {
  if (!vira) {
    throw new Error('A vira é obrigatória');
  }
  criarCarta(vira.valor, vira.naipe);
  if (!Array.isArray(maos) || maos.length !== 4) {
    throw new Error('A distribuição deve ter 4 mãos');
  }
  const usadas = [vira.id];
  maos.forEach((mao, jogador) => {
    if (!Array.isArray(mao) || mao.length !== 3) {
      throw new Error(`O jogador ${jogador} deve receber exatamente 3 cartas`);
    }
    mao.forEach((carta) => {
      const normalizada = criarCarta(carta.valor, carta.naipe);
      if (usadas.includes(normalizada.id)) {
        throw new Error(`Carta repetida na distribuição: ${normalizada.id}`);
      }
      usadas.push(normalizada.id);
    });
  });
  return {
    maos: maos.map((mao) => mao.map((c) => criarCarta(c.valor, c.naipe))),
    vira: criarCarta(vira.valor, vira.naipe),
  };
}

function cartaEstaNoBaralho(carta, baralho = criarBaralho()) {
  return baralho.some((c) => cartaIgual(c, carta));
}

module.exports = {
  criarBaralho,
  criarRng,
  embaralhar,
  distribuir,
  validarDistribuicao,
  cartaEstaNoBaralho,
};
