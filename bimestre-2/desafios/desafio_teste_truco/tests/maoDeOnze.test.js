'use strict';

const { C, novaPartida, jogar, distribuicaoPadrao } = require('./helpers');

describe('Mão de onze e mão de ferro', () => {
  test('CT-ONZE-01 — quando só uma dupla tem 11, a mão começa em decisão e já vale 3 se aceita', () => {
    const partida = novaPartida({ placarInicial: [11, 5] });
    expect(partida.modo).toBe('mao_de_onze');
    expect(partida.estado).toBe('decisao_mao_de_onze');
    expect(partida.valorMao).toBe(3);
    const parceiro = partida.verCartasParceiro(0);
    expect(parceiro).toEqual(partida.verCartas(2));
    partida.decidirMaoDeOnze(2, 'aceitar');
    expect(partida.estado).toBe('em_jogo');
    expect(partida.valorMao).toBe(3);
  });

  test('CT-ONZE-02 — se a dupla com 11 correr, a adversária soma apenas 1 ponto', () => {
    const partida = novaPartida({ placarInicial: [11, 8] });
    partida.decidirMaoDeOnze(0, 'correr');
    expect(partida.vencedorMao).toBe(1);
    expect(partida.pontosDaMao).toBe(1);
    expect(partida.placar).toEqual([11, 9]);
    expect(partida.motivoEncerramentoMao).toBe('correr_mao_de_onze');
    expect(partida.estado).toBe('aguardando_inicio');
  });

  test('CT-ONZE-03 — aceitar a mão de onze e vencer encerra a partida em 12', () => {
    const partida = novaPartida({ placarInicial: [11, 4] });
    partida.decidirMaoDeOnze(0, 'aceitar');
    jogar(partida, 0, 'Q', 'paus');
    jogar(partida, 1, '3', 'ouros');
    jogar(partida, 2, '2', 'paus');
    jogar(partida, 3, 'K', 'paus');
    jogar(partida, 0, '3', 'copas');
    jogar(partida, 1, '2', 'copas');
    jogar(partida, 2, 'A', 'copas');
    jogar(partida, 3, 'J', 'copas');
    expect(partida.estado).toBe('encerrada');
    expect(partida.placar).toEqual([12, 4]);
    expect(partida.vencedorPartida).toBe(0);
  });

  test('CT-ONZE-04 — na mão de onze não se pede truco, seis, nove ou doze', () => {
    const partida = novaPartida({ placarInicial: [11, 2] });
    partida.decidirMaoDeOnze(0, 'aceitar');
    expect(() => partida.pedirAumento(0)).toThrow(/mão de onze ou na mão de ferro/);
  });

  test('CT-ONZE-05 — a dupla que não está com 11 não vê as cartas do parceiro nem decide a mão', () => {
    const partida = novaPartida({ placarInicial: [11, 7] });
    expect(() => partida.verCartasParceiro(1)).toThrow(/Apenas a dupla que está com 11/);
    expect(() => partida.decidirMaoDeOnze(1, 'aceitar')).toThrow(/Somente a dupla que está com 11/);
  });

  test('CT-ONZE-06 — não se joga carta antes da decisão da mão de onze', () => {
    const partida = novaPartida({ placarInicial: [11, 7] });
    expect(() => jogar(partida, 0, 'Q', 'paus')).toThrow(/aceitar ou correr antes de jogar/);
  });

  test('CT-FERRO-01 — no 11 a 11 a mão é de ferro: cartas e vira cobertas, e quem vence ganha a partida', () => {
    const partida = novaPartida({ placarInicial: [11, 11] });
    expect(partida.modo).toBe('mao_de_ferro');
    expect(partida.estado).toBe('em_jogo');
    expect(partida.valorMao).toBe(3);
    expect(() => partida.verCartas(0)).toThrow(/cartas permanecem cobertas/);
    expect(() => partida.verVira()).toThrow(/vira permanece coberta/);
    expect(() => partida.pedirAumento(0)).toThrow(/mão de onze ou na mão de ferro/);

    jogar(partida, 0, 'Q', 'paus');
    jogar(partida, 1, '3', 'ouros');
    jogar(partida, 2, '2', 'paus');
    expect(partida.viraVisivel).toBe(false);
    jogar(partida, 3, 'K', 'paus');
    expect(partida.viraVisivel).toBe(true);
    expect(partida.verVira()).toEqual(require('./helpers').C('7', 'ouros'));
    expect(partida.rodadas[0].dupla).toBe(0);

    jogar(partida, 0, '3', 'copas');
    jogar(partida, 1, '2', 'copas');
    jogar(partida, 2, 'A', 'copas');
    jogar(partida, 3, 'J', 'copas');
    expect(partida.estado).toBe('encerrada');
    expect(partida.placar).toEqual([12, 11]);
    expect(partida.vencedorPartida).toBe(0);
  });

  test('CT-FERRO-02 — na mão de ferro é permitido jogar pelo índice da carta coberta', () => {
    const partida = novaPartida({ placarInicial: [11, 11] });
    partida.jogarCarta(0, 0);
    expect(partida.jogadasAtuais).toHaveLength(1);
    expect(partida.vez).toBe(1);
  });

  test('CT-FERRO-03 — não se esconde carta (valor nulo) na mão de ferro: o valor real é conservado', () => {
    const partida = novaPartida({ placarInicial: [11, 11] });
    expect(() => jogar(partida, 0, '4', 'ouros', { coberta: true }))
      .toThrow(/conservam o valor real/);
  });

  test('CT-FERRO-04 — três empates na mão de ferro não encerram a partida; joga-se nova mão de ferro', () => {
    const partida = novaPartida({
      placarInicial: [11, 11],
      distribuicao: {
        maos: [
          [C('3', 'paus'), C('2', 'paus'), C('A', 'paus')],
          [C('3', 'copas'), C('2', 'copas'), C('A', 'copas')],
          [C('4', 'paus'), C('5', 'paus'), C('6', 'paus')],
          [C('4', 'copas'), C('5', 'copas'), C('6', 'copas')],
        ],
        vira: C('7', 'ouros'),
      },
    });
    const sequencia = [
      [0, '3', 'paus'], [1, '3', 'copas'], [2, '4', 'paus'], [3, '4', 'copas'],
      [1, '2', 'copas'], [2, '5', 'paus'], [3, '5', 'copas'], [0, '2', 'paus'],
      [0, 'A', 'paus'], [1, 'A', 'copas'], [2, '6', 'paus'], [3, '6', 'copas'],
    ];
    sequencia.forEach(([j, v, n]) => jogar(partida, j, v, n));
    expect(partida.motivoEncerramentoMao).toBe('tres_empates');
    expect(partida.placar).toEqual([11, 11]);
    expect(partida.estado).toBe('aguardando_inicio');
    partida.iniciarMao(distribuicaoPadrao());
    expect(partida.modo).toBe('mao_de_ferro');
  });
});
