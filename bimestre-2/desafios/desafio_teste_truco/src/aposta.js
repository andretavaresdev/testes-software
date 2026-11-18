'use strict';

/** Valores possíveis de uma mão: 1 (simples), 3 (truco), 6, 9 e 12. */
const VALORES_MAO = [1, 3, 6, 9, 12];

const NOMES_AUMENTO = {
  3: 'truco',
  6: 'seis',
  9: 'nove',
  12: 'doze',
};

function nomeDoAumento(valor) {
  return NOMES_AUMENTO[valor] || null;
}

function proximoValor(valorAtual) {
  const indice = VALORES_MAO.indexOf(valorAtual);
  if (indice < 0) {
    throw new Error(`Valor de mão inválido: ${valorAtual}`);
  }
  if (indice === VALORES_MAO.length - 1) {
    throw new Error('A mão já vale 12 pontos; não é possível aumentar');
  }
  return VALORES_MAO[indice + 1];
}

/**
 * Pontos que a dupla que pediu o aumento leva se o adversário correr.
 * Correr do truco vale 1; do seis vale 3; do nove vale 6; do doze vale 9.
 */
function valorSeCorrer(valorProposto) {
  const indice = VALORES_MAO.indexOf(valorProposto);
  if (indice <= 0) {
    throw new Error(`Aumento proposto inválido: ${valorProposto}`);
  }
  return VALORES_MAO[indice - 1];
}

function podeAumentar(valorAtual) {
  return VALORES_MAO.indexOf(valorAtual) >= 0 && valorAtual < 12;
}

module.exports = {
  VALORES_MAO,
  NOMES_AUMENTO,
  nomeDoAumento,
  proximoValor,
  valorSeCorrer,
  podeAumentar,
};
