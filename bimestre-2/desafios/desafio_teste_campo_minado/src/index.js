'use strict';

const constantes = require('./constantes');
const tabuleiro = require('./tabuleiro');
const auxiliares = require('./auxiliares');
const { JogoCampoMinado, criarJogo } = require('./jogo');

module.exports = {
  ...constantes,
  ...tabuleiro,
  ...auxiliares,
  JogoCampoMinado,
  criarJogo,
};
