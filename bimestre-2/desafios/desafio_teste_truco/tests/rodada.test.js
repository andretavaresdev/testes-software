'use strict';

const { C } = require('./helpers');
const { resolverRodada } = require('../src/ranking');

const vira = C('7', 'ouros'); // manilhas: damas

function jogadas(cartas) {
  return cartas.map((item, i) => ({
    jogador: item.jogador != null ? item.jogador : i,
    carta: item.carta || item,
    coberta: Boolean(item.coberta),
  }));
}

describe('Rodada (vaza) — vencedor e cango', () => {
  test('CT-RODADA-01 — a carta mais forte vence a rodada', () => {
    const r = resolverRodada(jogadas([
      C('3', 'copas'),
      C('2', 'paus'),
      C('A', 'espadas'),
      C('K', 'ouros'),
    ]), vira);
    expect(r.resultado).toBe('vencedor');
    expect(r.jogador).toBe(0);
    expect(r.dupla).toBe(0);
  });

  test('CT-RODADA-02 — o zap vence qualquer outra carta, inclusive as demais manilhas', () => {
    const r = resolverRodada(jogadas([
      C('Q', 'ouros'),
      C('Q', 'espadas'),
      C('Q', 'paus'),
      C('3', 'paus'),
    ]), vira);
    expect(r.jogador).toBe(2);
    expect(r.dupla).toBe(0);
  });

  test('CT-RODADA-03 — se as duas duplas exibem a maior força, a rodada empata (cango)', () => {
    const r = resolverRodada(jogadas([
      C('3', 'paus'),
      C('3', 'copas'),
      C('2', 'paus'),
      C('K', 'ouros'),
    ]), vira);
    expect(r.resultado).toBe('empate');
    expect(r.dupla).toBeNull();
    expect(r.quemCangou).toBe(1);
  });

  test('CT-RODADA-04 — dois parceiros com a maior carta não empatam: a dupla vence', () => {
    const r = resolverRodada(jogadas([
      C('3', 'paus'),
      C('2', 'copas'),
      C('3', 'espadas'),
      C('A', 'ouros'),
    ]), vira);
    expect(r.resultado).toBe('vencedor');
    expect(r.dupla).toBe(0);
    expect(r.jogador).toBe(0);
  });

  test('CT-RODADA-05 — carta coberta perde para qualquer carta aberta e, se todas estiverem cobertas, empata', () => {
    const aberta = resolverRodada(jogadas([
      { carta: C('4', 'ouros') },
      { carta: C('3', 'paus'), coberta: true },
      { carta: C('2', 'copas'), coberta: true },
      { carta: C('A', 'espadas'), coberta: true },
    ]), vira);
    expect(aberta.resultado).toBe('vencedor');
    expect(aberta.jogador).toBe(0);

    const todas = resolverRodada(jogadas([
      { carta: C('3', 'paus'), coberta: true },
      { carta: C('Q', 'paus'), coberta: true },
      { carta: C('2', 'copas'), coberta: true },
      { carta: C('A', 'espadas'), coberta: true },
    ]), vira);
    expect(todas.resultado).toBe('empate');
  });

  test('CT-RODADA-06 — quem jogou a carta que cangou é registrado para abrir a próxima rodada', () => {
    const r = resolverRodada([
      { jogador: 2, carta: C('2', 'paus') },
      { jogador: 3, carta: C('2', 'copas') },
      { jogador: 0, carta: C('K', 'copas') },
      { jogador: 1, carta: C('A', 'ouros') },
    ], vira);
    expect(r.resultado).toBe('empate');
    expect(r.quemCangou).toBe(3);
  });

  test('CT-RODADA-07 — recusa rodada com número diferente de 4 jogadas', () => {
    expect(() => resolverRodada(jogadas([C('3', 'paus')]), vira)).toThrow(/4 jogadas/);
  });
});
