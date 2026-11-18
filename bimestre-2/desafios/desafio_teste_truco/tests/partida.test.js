'use strict';

const { C, novaPartida, jogar, distribuicaoPadrao } = require('./helpers');
const { Partida } = require('../src/partida');

describe('Partida — início, ordem de jogo e pontuação simples', () => {
  test('CT-PARTIDA-01 — a partida começa 0 a 0, aguardando a primeira mão', () => {
    const partida = new Partida({ carteadorInicial: 3 });
    expect(partida.estado).toBe('aguardando_inicio');
    expect(partida.placar).toEqual([0, 0]);
    expect(partida.vencedorPartida).toBeNull();
  });

  test('CT-PARTIDA-02 — com carteador 3, o jogador 0 (à direita) é mão e começa a primeira rodada', () => {
    const partida = novaPartida();
    const snap = partida.snapshot();
    expect(snap.jogadorMao).toBe(0);
    expect(snap.vez).toBe(0);
    expect(snap.modo).toBe('normal');
    expect(snap.valorMao).toBe(1);
    expect(snap.vira).toEqual(C('7', 'ouros'));
    expect(snap.manilhas.zap).toEqual(C('Q', 'paus'));
  });

  test('CT-PARTIDA-03 — cada jogador recebe 3 cartas e só vê as próprias', () => {
    const partida = novaPartida();
    expect(partida.verCartas(0)).toHaveLength(3);
    expect(partida.verCartas(0)[0]).toEqual(C('Q', 'paus'));
    expect(() => partida.verCartasParceiro(0)).toThrow(/mão de onze/);
  });

  test('CT-PARTIDA-04 — a dupla 0 vence as duas primeiras rodadas e soma 1 ponto', () => {
    const partida = novaPartida();
    jogar(partida, 0, 'Q', 'paus');
    jogar(partida, 1, '3', 'ouros');
    jogar(partida, 2, '2', 'paus');
    jogar(partida, 3, 'K', 'paus');
    expect(partida.rodadas[0].dupla).toBe(0);
    expect(partida.vez).toBe(0);

    jogar(partida, 0, '3', 'copas');
    jogar(partida, 1, '2', 'copas');
    jogar(partida, 2, 'A', 'copas');
    jogar(partida, 3, 'J', 'copas');

    expect(partida.estado).toBe('aguardando_inicio');
    expect(partida.vencedorMao).toBe(0);
    expect(partida.pontosDaMao).toBe(1);
    expect(partida.placar).toEqual([1, 0]);
    expect(partida.motivoEncerramentoMao).toBe('duas_rodadas');
  });

  test('CT-PARTIDA-05 — quem venceu a rodada começa a próxima, no sentido anti-horário', () => {
    const partida = novaPartida();
    jogar(partida, 0, '4', 'ouros');
    jogar(partida, 1, '3', 'ouros');
    jogar(partida, 2, '5', 'ouros');
    jogar(partida, 3, 'K', 'paus');
    expect(partida.rodadas[0].jogador).toBe(1);
    expect(partida.vez).toBe(1);
  });

  test('CT-PARTIDA-06 — o carteador rotaciona à direita após cada mão', () => {
    const partida = novaPartida();
    expect(partida.carteador).toBe(3);
    jogar(partida, 0, 'Q', 'paus');
    jogar(partida, 1, '3', 'ouros');
    jogar(partida, 2, '2', 'paus');
    jogar(partida, 3, 'K', 'paus');
    jogar(partida, 0, '3', 'copas');
    jogar(partida, 1, '2', 'copas');
    jogar(partida, 2, 'A', 'copas');
    jogar(partida, 3, 'J', 'copas');
    expect(partida.carteador).toBe(0);
  });

  test('CT-PARTIDA-07 — empate nas três rodadas não altera o placar e a partida continua', () => {
    const partida = novaPartida({
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
    expect(partida.vencedorMao).toBeNull();
    expect(partida.placar).toEqual([0, 0]);
    expect(partida.estado).toBe('aguardando_inicio');
  });

  test('CT-PARTIDA-08 — a dupla que primeiro alcança 12 pontos vence a partida', () => {
    const partida = novaPartida({ placarInicial: [11, 9] });
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
    expect(partida.placar).toEqual([12, 9]);
    expect(partida.vencedorPartida).toBe(0);
  });

  test('CT-PARTIDA-09 — o placar é limitado a 12 mesmo quando a mão valeria mais pontos', () => {
    const partida = novaPartida({ placarInicial: [10, 0] });
    partida.pedirAumento(0);
    partida.responderAumento(1, 'aceitar');
    jogar(partida, 0, 'Q', 'paus');
    jogar(partida, 1, '3', 'ouros');
    jogar(partida, 2, '2', 'paus');
    jogar(partida, 3, 'K', 'paus');
    jogar(partida, 0, '3', 'copas');
    jogar(partida, 1, '2', 'copas');
    jogar(partida, 2, 'A', 'copas');
    jogar(partida, 3, 'J', 'copas');
    expect(partida.pontosDaMao).toBe(3);
    expect(partida.placar).toEqual([12, 0]);
    expect(partida.estado).toBe('encerrada');
  });

  test('CT-PARTIDA-10 — após uma mão, é preciso iniciar outra; não se inicia mão com a partida encerrada', () => {
    const partida = novaPartida({ placarInicial: [11, 0] });
    partida.decidirMaoDeOnze(0, 'aceitar');
    jogar(partida, 0, 'Q', 'paus');
    jogar(partida, 1, '3', 'ouros');
    jogar(partida, 2, '2', 'paus');
    jogar(partida, 3, 'K', 'paus');
    jogar(partida, 0, '3', 'copas');
    jogar(partida, 1, '2', 'copas');
    jogar(partida, 2, 'A', 'copas');
    jogar(partida, 3, 'J', 'copas');
    expect(() => partida.iniciarMao(distribuicaoPadrao())).toThrow(/já foi encerrada/);
  });

  test('CT-PARTIDA-11 — distribuição aleatória com semente é determinística e válida', () => {
    const a = new Partida({ semente: 42, carteadorInicial: 3 });
    const b = new Partida({ semente: 42, carteadorInicial: 3 });
    a.iniciarMao();
    b.iniciarMao();
    expect(a.verCartas(0)).toEqual(b.verCartas(0));
    expect(a.verVira()).toEqual(b.verVira());
    expect(a.verCartas(0)).toHaveLength(3);
  });

  test('CT-PARTIDA-12 — o construtor aceita placarInicial e inicia a mão no modo correspondente', () => {
    const normal = new Partida();
    expect(normal.placar).toEqual([0, 0]);

    const onze = new Partida({ placarInicial: [11, 5] });
    expect(onze.placar).toEqual([11, 5]);
    onze.iniciarMao(distribuicaoPadrao());
    expect(onze.modo).toBe('mao_de_onze');
    expect(onze.estado).toBe('decisao_mao_de_onze');

    const ferro = new Partida({ placarInicial: [11, 11] });
    ferro.iniciarMao(distribuicaoPadrao());
    expect(ferro.modo).toBe('mao_de_ferro');
    expect(ferro.estado).toBe('em_jogo');
  });

  test('CT-PARTIDA-13 — recusa placarInicial inválido', () => {
    expect(() => new Partida({ placarInicial: [10] }))
      .toThrow(/dois valores, um para cada dupla/);
    expect(() => new Partida({ placarInicial: [12, 0] }))
      .toThrow(/Placar inicial inválido para a dupla 0/);
    expect(() => new Partida({ placarInicial: [-1, 3] }))
      .toThrow(/Placar inicial inválido para a dupla 0/);
    expect(() => new Partida({ placarInicial: [1.5, 2] }))
      .toThrow(/Placar inicial inválido para a dupla 0/);
    expect(() => new Partida({ placarInicial: [0, 12] }))
      .toThrow(/Placar inicial inválido para a dupla 1/);
  });
});
