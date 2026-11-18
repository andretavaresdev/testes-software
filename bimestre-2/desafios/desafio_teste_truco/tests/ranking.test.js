'use strict';

const { C } = require('./helpers');
const {
  valorSeguinte,
  manilhasDaVira,
  ehManilha,
  nomeManilha,
  forcaCarta,
  compararCartas,
} = require('../src/ranking');

describe('Ranking e manilhas variáveis (vira)', () => {
  test('CT-RANK-01 — a sequência de valores sobe 4,5,6,7,Q,J,K,A,2,3 e volta de 3 para 4', () => {
    expect(valorSeguinte('4')).toBe('5');
    expect(valorSeguinte('7')).toBe('Q');
    expect(valorSeguinte('Q')).toBe('J');
    expect(valorSeguinte('J')).toBe('K');
    expect(valorSeguinte('K')).toBe('A');
    expect(valorSeguinte('A')).toBe('2');
    expect(valorSeguinte('2')).toBe('3');
    expect(valorSeguinte('3')).toBe('4');
  });

  test('CT-RANK-02 — vira 4 define as manilhas como os 5, com zap no 5 de paus', () => {
    const manilhas = manilhasDaVira(C('4', 'espadas'));
    expect(manilhas.valor).toBe('5');
    expect(manilhas.zap).toEqual(C('5', 'paus'));
    expect(manilhas.copeta).toEqual(C('5', 'copas'));
    expect(manilhas.espadilha).toEqual(C('5', 'espadas'));
    expect(manilhas.picaFumo).toEqual(C('5', 'ouros'));
  });

  test('CT-RANK-03 — vira 7 define as damas como manilhas; vira 3 define os 4', () => {
    expect(manilhasDaVira(C('7', 'copas')).valor).toBe('Q');
    expect(manilhasDaVira(C('3', 'paus')).valor).toBe('4');
    expect(manilhasDaVira(C('J', 'copas')).zap).toEqual(C('K', 'paus'));
  });

  test('CT-RANK-04 — o naipe da vira não altera a força das cartas comuns nem a ordem das manilhas', () => {
    const a = forcaCarta(C('3', 'paus'), C('7', 'ouros'));
    const b = forcaCarta(C('3', 'copas'), C('7', 'paus'));
    expect(a).toBe(b);
    expect(compararCartas(C('Q', 'paus'), C('Q', 'copas'), C('7', 'espadas'))).toBe(1);
    expect(compararCartas(C('Q', 'paus'), C('Q', 'copas'), C('7', 'paus'))).toBe(1);
  });

  test('CT-RANK-05 — entre manilhas a ordem é paus (zap) > copas (copeta) > espadas (espadilha) > ouros (pica-fumo)', () => {
    const vira = C('4', 'ouros');
    expect(compararCartas(C('5', 'paus'), C('5', 'copas'), vira)).toBe(1);
    expect(compararCartas(C('5', 'copas'), C('5', 'espadas'), vira)).toBe(1);
    expect(compararCartas(C('5', 'espadas'), C('5', 'ouros'), vira)).toBe(1);
    expect(nomeManilha(C('5', 'paus'), vira)).toBe('zap');
    expect(nomeManilha(C('5', 'ouros'), vira)).toBe('pica-fumo');
  });

  test('CT-RANK-06 — qualquer manilha é mais forte do que o 3, a carta comum mais alta', () => {
    const vira = C('7', 'ouros');
    expect(ehManilha(C('Q', 'ouros'), vira)).toBe(true);
    expect(compararCartas(C('Q', 'ouros'), C('3', 'paus'), vira)).toBe(1);
    expect(compararCartas(C('3', 'paus'), C('2', 'paus'), vira)).toBe(1);
  });

  test('CT-RANK-07 — cartas comuns seguem 3 > 2 > A > K > J > Q > 7 > 6 > 5 > 4 quando não são manilha', () => {
    const vira = C('K', 'ouros'); // manilhas são os Áses
    const ordem = ['3', '2', 'K', 'J', 'Q', '7', '6', '5', '4'];
    for (let i = 0; i < ordem.length - 1; i += 1) {
      expect(compararCartas(C(ordem[i], 'paus'), C(ordem[i + 1], 'copas'), vira)).toBe(1);
    }
    expect(compararCartas(C('A', 'paus'), C('3', 'copas'), vira)).toBe(1);
  });

  test('CT-RANK-08 — duas cartas comuns de mesmo valor empatam, independentemente do naipe', () => {
    const vira = C('7', 'ouros');
    expect(compararCartas(C('3', 'paus'), C('3', 'copas'), vira)).toBe(0);
    expect(compararCartas(C('4', 'espadas'), C('4', 'ouros'), vira)).toBe(0);
  });

  test('CT-RANK-09 — carta coberta vale menos do que qualquer carta aberta, inclusive o 4', () => {
    const vira = C('7', 'ouros');
    expect(forcaCarta(C('3', 'paus'), vira, true)).toBe(-1);
    expect(compararCartas(C('4', 'ouros'), C('3', 'paus'), vira, { cobertaB: true })).toBe(1);
    expect(compararCartas(C('K', 'copas'), C('A', 'paus'), vira, { cobertaA: true, cobertaB: true })).toBe(0);
  });

  test('CT-RANK-10 — a própria vira não é manilha; manilha é a carta imediatamente acima', () => {
    const vira = C('A', 'copas');
    expect(ehManilha(C('A', 'paus'), vira)).toBe(false);
    expect(ehManilha(C('2', 'ouros'), vira)).toBe(true);
    expect(nomeManilha(C('A', 'copas'), vira)).toBeNull();
  });

  test('CT-RANK-11 — valor seguinte recusa valor inexistente', () => {
    expect(() => valorSeguinte('8')).toThrow(/Valor de carta inválido/);
  });
});
