'use strict';

const { novaPartida, jogar } = require('./helpers');

describe('Aumentos na mesa — pedir, aceitar, correr e retrucar', () => {
  test('CT-AUMENTO-01 — o jogador da vez pode pedir truco e a mão passa a valer 3 se o adversário aceitar', () => {
    const partida = novaPartida();
    partida.pedirAumento(0);
    expect(partida.estado).toBe('aguardando_resposta');
    expect(partida.aumentoPendente.nome).toBe('truco');
    expect(partida.aumentoPendente.proposto).toBe(3);
    partida.responderAumento(1, 'aceitar');
    expect(partida.valorMao).toBe(3);
    expect(partida.estado).toBe('em_jogo');
    expect(partida.vez).toBe(0);
  });

  test('CT-AUMENTO-02 — se o adversário correr do truco, a dupla que pediu soma 1 ponto e a mão acaba', () => {
    const partida = novaPartida();
    partida.pedirAumento(0);
    partida.responderAumento(1, 'correr');
    expect(partida.vencedorMao).toBe(0);
    expect(partida.pontosDaMao).toBe(1);
    expect(partida.placar).toEqual([1, 0]);
    expect(partida.motivoEncerramentoMao).toBe('correr_truco');
  });

  test('CT-AUMENTO-03 — o adversário pode retrucar para seis; se a primeira dupla correr, quem pediu seis leva 3', () => {
    const partida = novaPartida();
    partida.pedirAumento(0);
    partida.responderAumento(1, 'aumentar');
    expect(partida.aumentoPendente.nome).toBe('seis');
    expect(partida.aumentoPendente.dupla).toBe(1);
    partida.responderAumento(0, 'correr');
    expect(partida.vencedorMao).toBe(1);
    expect(partida.pontosDaMao).toBe(3);
    expect(partida.placar).toEqual([0, 3]);
    expect(partida.motivoEncerramentoMao).toBe('correr_seis');
  });

  test('CT-AUMENTO-04 — a cadeia truco → seis → nove → doze, se aceita, faz a mão valer 12', () => {
    const partida = novaPartida();
    partida.pedirAumento(0);
    partida.responderAumento(1, 'aumentar');
    partida.responderAumento(0, 'aumentar');
    expect(partida.aumentoPendente.nome).toBe('nove');
    partida.responderAumento(1, 'aumentar');
    expect(partida.aumentoPendente.nome).toBe('doze');
    partida.responderAumento(0, 'aceitar');
    expect(partida.valorMao).toBe(12);
  });

  test('CT-AUMENTO-05 — correr do doze concede 9 pontos a quem pediu', () => {
    const partida = novaPartida();
    partida.pedirAumento(0);
    partida.responderAumento(1, 'aumentar');
    partida.responderAumento(0, 'aumentar');
    partida.responderAumento(1, 'aumentar');
    partida.responderAumento(0, 'correr');
    expect(partida.pontosDaMao).toBe(9);
    expect(partida.vencedorMao).toBe(1);
    expect(partida.motivoEncerramentoMao).toBe('correr_doze');
  });

  test('CT-AUMENTO-06 — depois de aceitar o truco, na sua vez a dupla que aceitou pode pedir seis', () => {
    const partida = novaPartida();
    partida.pedirAumento(0);
    partida.responderAumento(1, 'aceitar');
    jogar(partida, 0, 'Q', 'paus');
    partida.pedirAumento(1);
    expect(partida.aumentoPendente.nome).toBe('seis');
    partida.responderAumento(2, 'aceitar');
    expect(partida.valorMao).toBe(6);
  });

  test('CT-AUMENTO-07 — não se aumenta além de 12 e não se responde aumento inexistente', () => {
    const partida = novaPartida();
    partida.pedirAumento(0);
    partida.responderAumento(1, 'aumentar');
    partida.responderAumento(0, 'aumentar');
    partida.responderAumento(1, 'aumentar');
    expect(() => partida.responderAumento(0, 'aumentar')).toThrow(/além de 12/);
    partida.responderAumento(0, 'aceitar');
    expect(() => partida.pedirAumento(0)).toThrow(/já vale 12/);
    expect(() => partida.responderAumento(1, 'aceitar')).toThrow(/Não há aumento pendente/);
  });

  test('CT-AUMENTO-08 — a mão vencida após truco aceito vale 3 pontos', () => {
    const partida = novaPartida();
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
    expect(partida.placar).toEqual([3, 0]);
  });

  test('CT-AUMENTO-09 — a dupla que pediu o truco não pode pedir o seis depois que o adversário aceita', () => {
    const partida = novaPartida();
    partida.pedirAumento(0);
    partida.responderAumento(1, 'aceitar');
    expect(partida.snapshot().duplaQueAceitouUltimoAumento).toBe(1);
    expect(partida.vez).toBe(0);
    expect(() => partida.pedirAumento(0))
      .toThrow(/Somente a dupla que aceitou o último aumento pode pedir o próximo/);
    jogar(partida, 0, 'Q', 'paus');
    partida.pedirAumento(1);
    partida.responderAumento(2, 'aceitar');
    expect(partida.valorMao).toBe(6);
    expect(partida.snapshot().duplaQueAceitouUltimoAumento).toBe(0);
    expect(() => partida.pedirAumento(1))
      .toThrow(/Somente a dupla que aceitou o último aumento pode pedir o próximo/);
  });

  test('CT-AUMENTO-10 — o parceiro de quem aceitou também pode pedir o próximo aumento na sua vez', () => {
    const partida = novaPartida();
    partida.pedirAumento(0);
    partida.responderAumento(1, 'aceitar');
    jogar(partida, 0, 'Q', 'paus');
    jogar(partida, 1, '3', 'ouros');
    jogar(partida, 2, '2', 'paus');
    expect(partida.vez).toBe(3);
    partida.pedirAumento(3);
    expect(partida.aumentoPendente.nome).toBe('seis');
    expect(partida.aumentoPendente.dupla).toBe(1);
  });
});
