'use strict';

const { VALORES_MAO, nomeDoAumento, proximoValor, valorSeCorrer, podeAumentar } = require('../src/aposta');

describe('Aposta — truco, seis, nove e doze', () => {
  test('CT-APOSTA-01 — a mão começa valendo 1 e sobe para 3, 6, 9 e 12', () => {
    expect(VALORES_MAO).toEqual([1, 3, 6, 9, 12]);
    expect(proximoValor(1)).toBe(3);
    expect(proximoValor(3)).toBe(6);
    expect(proximoValor(6)).toBe(9);
    expect(proximoValor(9)).toBe(12);
  });

  test('CT-APOSTA-02 — os aumentos se chamam truco, seis, nove e doze', () => {
    expect(nomeDoAumento(3)).toBe('truco');
    expect(nomeDoAumento(6)).toBe('seis');
    expect(nomeDoAumento(9)).toBe('nove');
    expect(nomeDoAumento(12)).toBe('doze');
    expect(nomeDoAumento(1)).toBeNull();
  });

  test('CT-APOSTA-03 — se o adversário correr, a dupla que pediu leva o valor anterior (1, 3, 6 ou 9)', () => {
    expect(valorSeCorrer(3)).toBe(1);
    expect(valorSeCorrer(6)).toBe(3);
    expect(valorSeCorrer(9)).toBe(6);
    expect(valorSeCorrer(12)).toBe(9);
  });

  test('CT-APOSTA-04 — não é possível aumentar além de 12 pontos', () => {
    expect(podeAumentar(9)).toBe(true);
    expect(podeAumentar(12)).toBe(false);
    expect(() => proximoValor(12)).toThrow(/já vale 12/);
  });

  test('CT-APOSTA-05 — recusa valor de mão ou aumento inválido', () => {
    expect(() => proximoValor(2)).toThrow(/Valor de mão inválido/);
    expect(() => valorSeCorrer(1)).toThrow(/Aumento proposto inválido/);
    expect(() => valorSeCorrer(4)).toThrow(/Aumento proposto inválido/);
  });
});
