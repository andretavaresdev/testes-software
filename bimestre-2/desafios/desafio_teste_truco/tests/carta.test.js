'use strict';

const { VALORES, NAIPES, criarCarta, cartaIgual, descreverCarta, parseCarta } = require('../src/carta');

describe('Carta — construção e identificação', () => {
  test('CT-CARTA-01 — cria carta válida com valor e naipe', () => {
    const carta = criarCarta('3', 'paus');
    expect(carta.valor).toBe('3');
    expect(carta.naipe).toBe('paus');
    expect(carta.id).toBe('3-paus');
  });

  test('CT-CARTA-02 — recusa valor inexistente no baralho limpo (8, 9, 10 ou curingas)', () => {
    expect(() => criarCarta('8', 'paus')).toThrow(/Valor de carta inválido/);
    expect(() => criarCarta('9', 'copas')).toThrow(/Valor de carta inválido/);
    expect(() => criarCarta('10', 'espadas')).toThrow(/Valor de carta inválido/);
    expect(() => criarCarta('Curinga', 'ouros')).toThrow(/Valor de carta inválido/);
  });

  test('CT-CARTA-03 — recusa naipe inválido', () => {
    expect(() => criarCarta('3', 'ouros-vermelhos')).toThrow(/Naipe inválido/);
    expect(() => criarCarta('A', 'espada')).toThrow(/Naipe inválido/);
  });

  test('CT-CARTA-04 — o baralho limpo tem exatamente os 10 valores e 4 naipes', () => {
    expect(VALORES).toEqual(['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3']);
    expect(NAIPES).toEqual(['ouros', 'espadas', 'copas', 'paus']);
  });

  test('CT-CARTA-05 — duas cartas com mesmo valor e naipe são iguais', () => {
    expect(cartaIgual(criarCarta('A', 'copas'), criarCarta('A', 'copas'))).toBe(true);
    expect(cartaIgual(criarCarta('A', 'copas'), criarCarta('A', 'paus'))).toBe(false);
    expect(cartaIgual(criarCarta('A', 'copas'), null)).toBe(false);
  });

  test('CT-CARTA-06 — descreve a carta em português', () => {
    expect(descreverCarta(criarCarta('K', 'espadas'))).toBe('K de espadas');
  });

  test('CT-CARTA-07 — interpreta identificador "valor-naipe" e objeto carta', () => {
    expect(parseCarta('2-copas')).toEqual(criarCarta('2', 'copas'));
    expect(parseCarta(criarCarta('7', 'ouros'))).toEqual(criarCarta('7', 'ouros'));
  });

  test('CT-CARTA-08 — recusa identificador malformado ou tipo inválido', () => {
    expect(() => parseCarta('invalido')).toThrow(/Identificador de carta inválido/);
    expect(() => parseCarta(null)).toThrow(/Carta inválida/);
    expect(() => parseCarta(10)).toThrow(/Carta inválida/);
  });
});
