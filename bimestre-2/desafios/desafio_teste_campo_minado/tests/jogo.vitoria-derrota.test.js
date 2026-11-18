'use strict';

const {
  ESTADO,
  CELULAS_SEGURAS,
  criarJogo,
  completarBombas,
} = require('../src');

describe('Jogo — vitória, derrota e bloqueio após o fim', () => {
  test('CT-FIM-01 deve vencer ao revelar todas as células seguras', () => {
    // Bombas no fim do tabuleiro: o clique em (0,0) abre o campo inteiro
    // e também as duas células seguras que restam na linha 15.
    const jogo = criarJogo({ posicoesBombas: completarBombas() });
    const resultado = jogo.revelar(0, 0);

    expect(resultado.estado).toBe(ESTADO.VITORIA);
    expect(jogo.totalReveladas).toBe(CELULAS_SEGURAS);
    expect(jogo.obterPosicoesBombas().every((p) => !jogo.inspecionar(p.linha, p.coluna).revelada)).toBe(true);
  });

  test('CT-FIM-02 não deve exigir bandeiras para vencer', () => {
    const jogo = criarJogo({ posicoesBombas: completarBombas() });
    expect(jogo.totalBandeiras).toBe(0);
    expect(jogo.revelar(0, 0).estado).toBe(ESTADO.VITORIA);
    expect(jogo.totalBandeiras).toBe(0);
  });

  test('CT-FIM-03 deve perder ao clicar em bomba', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[10, 10]]),
      protegerPrimeiroClique: false,
    });

    expect(jogo.revelar(10, 10).estado).toBe(ESTADO.DERROTA);
    expect(jogo.estado).toBe(ESTADO.DERROTA);
  });

  test('CT-FIM-04 deve marcar a célula explodida na derrota', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[7, 3]]),
      protegerPrimeiroClique: false,
    });

    jogo.revelar(7, 3);
    expect(jogo.celula(7, 3).explodida).toBe(true);
    expect(jogo.celula(7, 3).bomba).toBe(true);

    const outraBomba = jogo.obterPosicoesBombas().find((p) => !(p.linha === 7 && p.coluna === 3));
    expect(jogo.celula(outraBomba.linha, outraBomba.coluna).explodida).toBe(false);
    expect(jogo.celula(outraBomba.linha, outraBomba.coluna).bomba).toBe(true);
  });

  test('CT-FIM-05 não deve permitir revelar após a derrota', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[0, 0]], [[1, 1]]),
      protegerPrimeiroClique: false,
    });
    jogo.revelar(0, 0);

    expect(() => jogo.revelar(1, 1)).toThrow(/já terminou com derrota/);
  });

  test('CT-FIM-06 não deve permitir bandeira após a vitória', () => {
    const jogo = criarJogo({ posicoesBombas: completarBombas() });
    jogo.revelar(0, 0);
    expect(jogo.estado).toBe(ESTADO.VITORIA);

    const bomba = jogo.obterPosicoesBombas()[0];
    expect(() => jogo.alternarBandeira(bomba.linha, bomba.coluna))
      .toThrow(/já terminou com vitoria/);
  });

  test('CT-FIM-07 não deve permitir abrir adjacentes após a derrota', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[0, 0]]),
      protegerPrimeiroClique: false,
    });
    jogo.revelar(0, 0);

    expect(() => jogo.abrirAdjacentes(1, 1)).toThrow(/já terminou com derrota/);
  });

  test('CT-FIM-08 deve mostrar todas as bombas na visão do jogador após a derrota', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[0, 0]]),
      protegerPrimeiroClique: false,
    });
    jogo.revelar(0, 0);

    for (const posicao of jogo.obterPosicoesBombas()) {
      expect(jogo.celula(posicao.linha, posicao.coluna).bomba).toBe(true);
    }
  });
});
