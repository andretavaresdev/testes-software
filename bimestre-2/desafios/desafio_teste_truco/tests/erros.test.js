'use strict';

const { C, novaPartida, jogar, distribuicaoPadrao } = require('./helpers');
const { Partida, duplaDe, parceiroDe, proximoJogador } = require('../src/partida');

describe('Regras de erro e limites da partida', () => {
  test('CT-ERRO-01 — não se joga fora da vez nem carta que não está na mão', () => {
    const partida = novaPartida();
    expect(() => jogar(partida, 1, '3', 'ouros')).toThrow(/Não é a vez do jogador 1/);
    expect(() => jogar(partida, 0, 'K', 'paus')).toThrow(/não possui essa carta/);
  });

  test('CT-ERRO-02 — não é permitido esconder a carta na primeira rodada', () => {
    const partida = novaPartida();
    expect(() => jogar(partida, 0, '4', 'ouros', { coberta: true }))
      .toThrow(/Não é permitido esconder a carta nesta rodada/);
  });

  test('CT-ERRO-03 — a partir da segunda rodada a carta pode ser escondida e passa a não valer nada', () => {
    const partida = novaPartida();
    jogar(partida, 0, 'Q', 'paus');
    jogar(partida, 1, '3', 'ouros');
    jogar(partida, 2, '2', 'paus');
    jogar(partida, 3, 'K', 'paus');
    expect(partida.rodadas[0].dupla).toBe(0);
    expect(partida.vez).toBe(0);
    jogar(partida, 0, '3', 'copas', { coberta: true });
    jogar(partida, 1, '2', 'copas');
    jogar(partida, 2, '5', 'ouros');
    jogar(partida, 3, 'J', 'copas');
    expect(partida.rodadas[1].jogador).toBe(1);
    expect(partida.rodadas[1].dupla).toBe(1);
    expect(partida.estado).toBe('em_jogo');
  });

  test('CT-ERRO-04 — não se pede truco fora da vez, nem enquanto há aumento pendente, nem no estado errado', () => {
    const partida = novaPartida();
    expect(() => partida.pedirAumento(1)).toThrow(/Não é a vez do jogador 1/);
    partida.pedirAumento(0);
    expect(() => partida.pedirAumento(0)).toThrow(/Não é possível pedir aumento no estado atual/);
    expect(() => jogar(partida, 0, 'Q', 'paus')).toThrow(/responder ao aumento antes de jogar/);
    expect(() => partida.responderAumento(1, 'talvez')).toThrow(/Resposta inválida/);
    expect(() => partida.responderAumento(0, 'aceitar')).toThrow(/não pode respondê-lo/);
    partida.responderAumento(3, 'aceitar');
    expect(partida.valorMao).toBe(3);
  });

  test('CT-ERRO-05 — jogador inválido, decisão inválida e índice inválido são recusados', () => {
    const partida = novaPartida({ placarInicial: [11, 0] });
    expect(() => partida.verCartas(5)).toThrow(/Jogador inválido/);
    expect(() => partida.decidirMaoDeOnze(0, 'talvez')).toThrow(/Decisão inválida/);
    partida.decidirMaoDeOnze(0, 'aceitar');
    expect(() => partida.jogarCarta(0, 9)).toThrow(/Índice de carta inválido/);
  });

  test('CT-ERRO-06 — não se inicia uma nova mão enquanto outra está em andamento', () => {
    const partida = novaPartida();
    expect(() => partida.iniciarMao(distribuicaoPadrao())).toThrow(/mão em andamento/);
  });

  test('CT-ERRO-07 — ver a vira ou decidir mão de onze fora de hora gera erro', () => {
    const partida = new Partida();
    expect(() => partida.verVira()).toThrow(/ainda não foi iniciada/);
    expect(() => partida.decidirMaoDeOnze(0, 'aceitar')).toThrow(/Não há decisão de mão de onze pendente/);
  });

  test('CT-ERRO-08 — dupla, parceiro e próximo jogador respeitam a mesa de 4 lugares', () => {
    expect(duplaDe(0)).toBe(0);
    expect(duplaDe(1)).toBe(1);
    expect(duplaDe(2)).toBe(0);
    expect(duplaDe(3)).toBe(1);
    expect(parceiroDe(0)).toBe(2);
    expect(parceiroDe(1)).toBe(3);
    expect(proximoJogador(3)).toBe(0);
  });

  test('CT-ERRO-09 — após empate na primeira, quem cangou abre a segunda e a dupla vencedora leva a mão', () => {
    const partida = novaPartida({
      distribuicao: {
        maos: [
          [C('3', 'paus'), C('Q', 'paus'), C('4', 'ouros')],
          [C('3', 'copas'), C('2', 'copas'), C('4', 'espadas')],
          [C('5', 'ouros'), C('A', 'copas'), C('6', 'paus')],
          [C('K', 'paus'), C('J', 'copas'), C('6', 'ouros')],
        ],
        vira: C('7', 'ouros'),
      },
    });
    jogar(partida, 0, '3', 'paus');
    jogar(partida, 1, '3', 'copas');
    jogar(partida, 2, '5', 'ouros');
    jogar(partida, 3, 'K', 'paus');
    expect(partida.rodadas[0].resultado).toBe('empate');
    expect(partida.vez).toBe(1);
    jogar(partida, 1, '2', 'copas');
    jogar(partida, 2, 'A', 'copas');
    jogar(partida, 3, 'J', 'copas');
    jogar(partida, 0, 'Q', 'paus');
    expect(partida.vencedorMao).toBe(0);
    expect(partida.motivoEncerramentoMao).toBe('desempate_segunda');
    expect(partida.placar).toEqual([1, 0]);
  });
});
