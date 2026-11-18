'use strict';

/** Valores do baralho limpo, do mais fraco ao mais forte (sem manilha). */
const VALORES = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];

/** Naipes, do mais fraco ao mais forte nas manilhas: Ouros, Espadas, Copas, Paus. */
const NAIPES = ['ouros', 'espadas', 'copas', 'paus'];

const NOMES_MANILHA = {
  paus: 'zap',
  copas: 'copeta',
  espadas: 'espadilha',
  ouros: 'pica-fumo',
};

function criarCarta(valor, naipe) {
  if (!VALORES.includes(valor)) {
    throw new Error(`Valor de carta inválido: ${valor}`);
  }
  if (!NAIPES.includes(naipe)) {
    throw new Error(`Naipe inválido: ${naipe}`);
  }
  return Object.freeze({
    valor,
    naipe,
    id: `${valor}-${naipe}`,
  });
}

function cartaIgual(a, b) {
  if (!a || !b) return false;
  return a.valor === b.valor && a.naipe === b.naipe;
}

function descreverCarta(carta) {
  if (!carta) return '';
  return `${carta.valor} de ${carta.naipe}`;
}

function parseCarta(idOuCarta) {
  if (idOuCarta && typeof idOuCarta === 'object') {
    return criarCarta(idOuCarta.valor, idOuCarta.naipe);
  }
  if (typeof idOuCarta !== 'string') {
    throw new Error('Carta inválida');
  }
  const partes = idOuCarta.split('-');
  if (partes.length < 2) {
    throw new Error(`Identificador de carta inválido: ${idOuCarta}`);
  }
  const naipe = partes.slice(1).join('-');
  return criarCarta(partes[0], naipe);
}

module.exports = {
  VALORES,
  NAIPES,
  NOMES_MANILHA,
  criarCarta,
  cartaIgual,
  descreverCarta,
  parseCarta,
};
