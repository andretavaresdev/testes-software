'use strict';

const { LINHAS, COLUNAS, BOMBAS } = require('./constantes');
const { estaDentro, normalizarPosicao } = require('./tabuleiro');

/**
 * Gerador determinístico (LCG) que devolve valores em [0, 1).
 * Útil para repetir o mesmo tabuleiro aleatório nos testes.
 */
function geradorComSemente(semente) {
  let estado = semente >>> 0;
  return function gerador() {
    estado = (Math.imul(1664525, estado) + 1013904223) >>> 0;
    return estado / 0x100000000;
  };
}

function chavePosicao(posicao) {
  const { linha, coluna } = normalizarPosicao(posicao);
  return `${linha},${coluna}`;
}

/**
 * Monta exatamente 40 posições de bomba.
 * As posições prioritárias entram primeiro; o restante é preenchido
 * a partir do fim do tabuleiro, evitando as células indicadas.
 */
function completarBombas(posicoesPrioritarias = [], evitar = []) {
  const usadas = new Set();
  const resultado = [];

  const tentarAdicionar = (linha, coluna) => {
    if (!estaDentro(linha, coluna)) {
      throw new Error(`Posição fora do tabuleiro ao completar bombas: (${linha}, ${coluna}).`);
    }
    const chave = `${linha},${coluna}`;
    if (usadas.has(chave)) return;
    usadas.add(chave);
    resultado.push({ linha, coluna });
  };

  for (const posicao of posicoesPrioritarias) {
    const normalizada = normalizarPosicao(posicao);
    tentarAdicionar(normalizada.linha, normalizada.coluna);
  }

  const bloqueadas = new Set(evitar.map(chavePosicao));

  for (let linha = LINHAS - 1; linha >= 0 && resultado.length < BOMBAS; linha -= 1) {
    for (let coluna = COLUNAS - 1; coluna >= 0 && resultado.length < BOMBAS; coluna -= 1) {
      const chave = `${linha},${coluna}`;
      if (!usadas.has(chave) && !bloqueadas.has(chave)) {
        tentarAdicionar(linha, coluna);
      }
    }
  }

  if (resultado.length !== BOMBAS) {
    throw new Error(
      `Não foi possível completar ${BOMBAS} bombas `
      + `(obtido: ${resultado.length}). Há células demais em "evitar"?`,
    );
  }

  return resultado;
}

module.exports = {
  geradorComSemente,
  completarBombas,
};
