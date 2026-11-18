'use strict';

const { avaliarMao } = require('../src/ranking');

function R(resultado, dupla) {
  return { resultado, dupla: resultado === 'empate' ? null : dupla };
}

describe('Mão — melhor de três e regras de empate (Art. 5º §2º)', () => {
  test('CT-MAO-01 — uma única rodada nunca encerra a mão', () => {
    expect(avaliarMao([R('vencedor', 0)])).toEqual({
      encerrada: false, vencedorDupla: null, motivo: null,
    });
  });

  test('CT-MAO-02 — a dupla que vence as duas primeiras rodadas ganha a mão', () => {
    const r = avaliarMao([R('vencedor', 1), R('vencedor', 1)]);
    expect(r).toEqual({ encerrada: true, vencedorDupla: 1, motivo: 'duas_rodadas' });
  });

  test('CT-MAO-03 — se a primeira empata, quem ganha a segunda vence a mão e não se joga a terceira', () => {
    const r = avaliarMao([R('empate'), R('vencedor', 0)]);
    expect(r).toEqual({ encerrada: true, vencedorDupla: 0, motivo: 'desempate_segunda' });
  });

  test('CT-MAO-04 — se a segunda empata, vence quem ganhou a primeira e não se joga a terceira', () => {
    const r = avaliarMao([R('vencedor', 1), R('empate')]);
    expect(r).toEqual({ encerrada: true, vencedorDupla: 1, motivo: 'empate_segunda' });
  });

  test('CT-MAO-05 — se cada dupla ganhou uma rodada, a mão continua para a terceira', () => {
    const r = avaliarMao([R('vencedor', 0), R('vencedor', 1)]);
    expect(r.encerrada).toBe(false);
  });

  test('CT-MAO-06 — se a primeira e a segunda empatam, vence quem fizer a terceira', () => {
    const r = avaliarMao([R('empate'), R('empate'), R('vencedor', 1)]);
    expect(r).toEqual({ encerrada: true, vencedorDupla: 1, motivo: 'terceira_rodada' });
  });

  test('CT-MAO-07 — se a terceira empata no 1 a 1, vence quem ganhou a primeira', () => {
    const r = avaliarMao([R('vencedor', 0), R('vencedor', 1), R('empate')]);
    expect(r).toEqual({ encerrada: true, vencedorDupla: 0, motivo: 'empate_terceira' });
  });

  test('CT-MAO-08 — se as três rodadas empatam, ninguém pontua', () => {
    const r = avaliarMao([R('empate'), R('empate'), R('empate')]);
    expect(r).toEqual({ encerrada: true, vencedorDupla: null, motivo: 'tres_empates' });
  });

  test('CT-MAO-09 — 1 a 1 decidido na terceira: vence a dupla da terceira rodada', () => {
    const r = avaliarMao([R('vencedor', 0), R('vencedor', 1), R('vencedor', 1)]);
    expect(r).toEqual({ encerrada: true, vencedorDupla: 1, motivo: 'terceira_rodada' });
  });

  test('CT-MAO-10 — lista vazia não encerra; mais de 3 rodadas é erro', () => {
    expect(avaliarMao([])).toEqual({ encerrada: false, vencedorDupla: null, motivo: null });
    expect(() => avaliarMao([R('empate'), R('empate'), R('empate'), R('empate')]))
      .toThrow(/no máximo 3 rodadas/);
  });
});
