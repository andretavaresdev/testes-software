'use strict';

const { BOMBAS, criarJogo, completarBombas } = require('../src');

describe('Jogo — bandeiras e contador de bombas restantes', () => {
  test('CT-BAN-01 deve marcar e desmarcar bandeira em célula fechada', () => {
    const jogo = criarJogo({ posicoesBombas: completarBombas() });

    const marcada = jogo.alternarBandeira(3, 3);
    expect(marcada.ok).toBe(true);
    expect(marcada.bandeira).toBe(true);
    expect(jogo.inspecionar(3, 3).bandeira).toBe(true);

    const desmarcada = jogo.alternarBandeira(3, 3);
    expect(desmarcada.ok).toBe(true);
    expect(desmarcada.bandeira).toBe(false);
    expect(jogo.inspecionar(3, 3).bandeira).toBe(false);
  });

  test('CT-BAN-02 deve atualizar o contador de bombas restantes a cada bandeira', () => {
    const jogo = criarJogo({ posicoesBombas: completarBombas() });
    expect(jogo.bombasRestantes).toBe(BOMBAS);

    jogo.alternarBandeira(0, 0);
    jogo.alternarBandeira(0, 1);
    expect(jogo.bombasRestantes).toBe(BOMBAS - 2);
    expect(jogo.totalBandeiras).toBe(2);

    jogo.alternarBandeira(0, 0);
    expect(jogo.bombasRestantes).toBe(BOMBAS - 1);
  });

  test('CT-BAN-03 deve permitir mais bandeiras do que bombas, com contador negativo', () => {
    const jogo = criarJogo({ posicoesBombas: completarBombas([[17, 13]]) });

    for (let coluna = 0; coluna < 14; coluna += 1) {
      for (let linha = 0; linha < 3; linha += 1) {
        jogo.alternarBandeira(linha, coluna);
      }
    }
    // 3 linhas x 14 colunas = 42 bandeiras (> 40).
    expect(jogo.totalBandeiras).toBe(42);
    expect(jogo.bombasRestantes).toBe(-2);
  });

  test('CT-BAN-04 não deve marcar bandeira em célula já revelada', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[0, 1]], [[0, 0]]),
    });
    jogo.revelar(0, 0);
    expect(jogo.inspecionar(0, 0).revelada).toBe(true);
    expect(jogo.inspecionar(0, 0).adjacentes).toBe(1);

    const resultado = jogo.alternarBandeira(0, 0);
    expect(resultado.ok).toBe(false);
    expect(resultado.motivo).toBe('celula_ja_revelada');
    expect(jogo.inspecionar(0, 0).bandeira).toBe(false);
  });

  test('CT-BAN-05 deve impedir revelar célula com bandeira e permitir depois de desmarcar', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[8, 8]], [[0, 0]]),
    });

    jogo.alternarBandeira(0, 0);
    expect(jogo.revelar(0, 0).motivo).toBe('celula_com_bandeira');

    jogo.alternarBandeira(0, 0);
    const revelada = jogo.revelar(0, 0);
    expect(revelada.ok).toBe(true);
    expect(jogo.inspecionar(0, 0).revelada).toBe(true);
  });

  test('CT-BAN-06 deve permitir colocar bandeira antes do primeiro clique', () => {
    const jogo = criarJogo({ posicoesBombas: completarBombas([[1, 1]]) });
    const resultado = jogo.alternarBandeira(1, 1);

    expect(resultado.ok).toBe(true);
    expect(jogo.inspecionar(1, 1).bandeira).toBe(true);
    expect(jogo.totalReveladas).toBe(0);
  });
});
