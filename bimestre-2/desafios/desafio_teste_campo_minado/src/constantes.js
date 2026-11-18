'use strict';

/** Tabuleiro oficial do desafio: 18 linhas x 14 colunas, com 40 bombas. */
const LINHAS = 18;
const COLUNAS = 14;
const BOMBAS = 40;
const TOTAL_CELULAS = LINHAS * COLUNAS;
const CELULAS_SEGURAS = TOTAL_CELULAS - BOMBAS;

const ESTADO = Object.freeze({
  EM_ANDAMENTO: 'em_andamento',
  VITORIA: 'vitoria',
  DERROTA: 'derrota',
});

module.exports = {
  LINHAS,
  COLUNAS,
  BOMBAS,
  TOTAL_CELULAS,
  CELULAS_SEGURAS,
  ESTADO,
};
