'use strict';

const { ESTADO, criarJogo, completarBombas } = require('../src');

function muroNaLinhaDois() {
  const muro = [];
  for (let coluna = 0; coluna < 14; coluna += 1) {
    muro.push([2, coluna]);
  }
  return completarBombas(muro, [
    [0, 0], [0, 5], [1, 0], [1, 1],
  ]);
}

describe('Jogo — revelar células e abertura (flood fill)', () => {
  test('CT-REV-01 deve revelar célula com número sem expandir os vizinhos', () => {
    const jogo = criarJogo({ posicoesBombas: muroNaLinhaDois() });
    const resultado = jogo.revelar(1, 0);

    expect(resultado.ok).toBe(true);
    expect(resultado.reveladas).toHaveLength(1);
    expect(resultado.reveladas[0]).toMatchObject({ linha: 1, coluna: 0, bomba: false });
    expect(resultado.reveladas[0].adjacentes).toBeGreaterThan(0);
    expect(jogo.inspecionar(1, 0).revelada).toBe(true);
    expect(jogo.inspecionar(1, 1).revelada).toBe(false);
    expect(jogo.inspecionar(0, 0).revelada).toBe(false);
    expect(jogo.estado).toBe(ESTADO.EM_ANDAMENTO);
  });

  test('CT-REV-02 deve expandir a abertura quando a célula tem zero adjacentes', () => {
    const jogo = criarJogo({ posicoesBombas: muroNaLinhaDois() });
    const resultado = jogo.revelar(0, 0);

    expect(resultado.ok).toBe(true);
    expect(jogo.estado).toBe(ESTADO.EM_ANDAMENTO);
    // Linha 0 (zeros) + linha 1 (números na borda da abertura) = 28 células.
    expect(resultado.reveladas).toHaveLength(28);
    expect(jogo.totalReveladas).toBe(28);

    for (let coluna = 0; coluna < 14; coluna += 1) {
      expect(jogo.inspecionar(0, coluna).revelada).toBe(true);
      expect(jogo.inspecionar(0, coluna).adjacentes).toBe(0);
      expect(jogo.inspecionar(1, coluna).revelada).toBe(true);
      expect(jogo.inspecionar(1, coluna).adjacentes).toBeGreaterThan(0);
      expect(jogo.inspecionar(2, coluna).revelada).toBe(false);
    }
  });

  test('CT-REV-03 não deve atravessar bombas na abertura', () => {
    const jogo = criarJogo({ posicoesBombas: muroNaLinhaDois() });
    jogo.revelar(0, 0);

    for (let coluna = 0; coluna < 14; coluna += 1) {
      expect(jogo.inspecionar(2, coluna).bomba).toBe(true);
      expect(jogo.inspecionar(2, coluna).revelada).toBe(false);
    }
    expect(jogo.inspecionar(3, 0).revelada).toBe(false);
  });

  test('CT-REV-04 não deve revelar célula com bandeira durante a abertura', () => {
    const jogo = criarJogo({ posicoesBombas: muroNaLinhaDois() });
    jogo.alternarBandeira(0, 5);
    const resultado = jogo.revelar(0, 0);

    expect(jogo.inspecionar(0, 5).revelada).toBe(false);
    expect(jogo.inspecionar(0, 5).bandeira).toBe(true);
    expect(resultado.reveladas.find((c) => c.linha === 0 && c.coluna === 5)).toBeUndefined();
    // A abertura não atravessa a bandeira. Como a linha 1 é borda numérica
    // e não expande, o lado direito da linha 0 também permanece fechado.
    expect(jogo.inspecionar(0, 4).revelada).toBe(true);
    expect(jogo.inspecionar(0, 6).revelada).toBe(false);
  });

  test('CT-REV-05 deve ignorar o segundo clique em célula já revelada', () => {
    const jogo = criarJogo({ posicoesBombas: muroNaLinhaDois() });
    jogo.revelar(1, 0);
    const segunda = jogo.revelar(1, 0);

    expect(segunda.ok).toBe(false);
    expect(segunda.motivo).toBe('celula_ja_revelada');
    expect(segunda.reveladas).toEqual([]);
    expect(jogo.totalReveladas).toBe(1);
    expect(jogo.estado).toBe(ESTADO.EM_ANDAMENTO);
  });

  test('CT-REV-06 deve recusar revelar célula com bandeira', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[5, 5]]),
    });
    jogo.alternarBandeira(0, 0);
    const resultado = jogo.revelar(0, 0);

    expect(resultado.ok).toBe(false);
    expect(resultado.motivo).toBe('celula_com_bandeira');
    expect(jogo.inspecionar(0, 0).revelada).toBe(false);
  });

  test('CT-REV-07 deve perder ao revelar bomba quando não há proteção', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[4, 4]]),
      protegerPrimeiroClique: false,
    });

    const resultado = jogo.revelar(4, 4);
    expect(resultado.ok).toBe(true);
    expect(resultado.estado).toBe(ESTADO.DERROTA);
    expect(resultado.explodiu).toEqual({ linha: 4, coluna: 4 });
    expect(jogo.inspecionar(4, 4).revelada).toBe(true);
  });

  test('CT-REV-08 deve mover a bomba do primeiro clique quando a proteção está ativa', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[0, 0]]),
      protegerPrimeiroClique: true,
      geradorAleatorio: () => 0,
    });

    const resultado = jogo.revelar(0, 0);
    expect(resultado.estado).not.toBe(ESTADO.DERROTA);
    expect(jogo.inspecionar(0, 0).bomba).toBe(false);
    expect(jogo.inspecionar(0, 0).revelada).toBe(true);
    expect(jogo.obterPosicoesBombas()).toHaveLength(40);
    expect(jogo.obterPosicoesBombas().find((p) => p.linha === 0 && p.coluna === 0)).toBeUndefined();
  });

  test('CT-REV-09 não deve mover bomba em cliques seguintes', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[0, 1]], [[0, 0]]),
      protegerPrimeiroClique: true,
    });

    jogo.revelar(0, 0);
    expect(jogo.estado).toBe(ESTADO.EM_ANDAMENTO);
    expect(jogo.inspecionar(0, 1).bomba).toBe(true);

    const segundo = jogo.revelar(0, 1);
    expect(segundo.estado).toBe(ESTADO.DERROTA);
    expect(jogo.inspecionar(0, 1).bomba).toBe(true);
  });

  test('CT-REV-10 deve revelar apenas a borda numérica da abertura', () => {
    const jogo = criarJogo({ posicoesBombas: muroNaLinhaDois() });
    const reveladas = jogo.revelar(0, 0).reveladas;

    const zeros = reveladas.filter((c) => c.adjacentes === 0);
    const numeros = reveladas.filter((c) => c.adjacentes > 0);

    expect(zeros).toHaveLength(14);
    expect(numeros).toHaveLength(14);
    expect(zeros.every((c) => c.linha === 0)).toBe(true);
    expect(numeros.every((c) => c.linha === 1)).toBe(true);
  });

  test('CT-REV-11 a abertura não deve sair do tabuleiro ao partir de um canto', () => {
    const jogo = criarJogo({ posicoesBombas: muroNaLinhaDois() });
    expect(() => jogo.revelar(0, 0)).not.toThrow();
    expect(jogo.totalReveladas).toBe(28);
    expect(jogo.celula(0, 0).revelada).toBe(true);
    expect(jogo.celula(0, 13).revelada).toBe(true);
  });

  test('CT-REV-12 não deve consumir a proteção do primeiro clique ao tentar revelar célula com bandeira', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[0, 0]]),
      protegerPrimeiroClique: true,
      // Se a proteção fosse aplicada neste clique inválido, a bomba
      // sairia de (0,0) para a primeira casa livre (índice 0).
      geradorAleatorio: () => 0,
    });

    jogo.alternarBandeira(0, 0);
    const recusado = jogo.revelar(0, 0);

    expect(recusado.ok).toBe(false);
    expect(recusado.motivo).toBe('celula_com_bandeira');
    expect(jogo.inspecionar(0, 0).bomba).toBe(true);
    expect(jogo.inspecionar(0, 0).revelada).toBe(false);
    expect(jogo.inspecionar(0, 0).bandeira).toBe(true);

    jogo.alternarBandeira(0, 0);
    const primeiroCliqueReal = jogo.revelar(0, 0);

    expect(primeiroCliqueReal.estado).not.toBe(ESTADO.DERROTA);
    expect(jogo.inspecionar(0, 0).bomba).toBe(false);
    expect(jogo.inspecionar(0, 0).revelada).toBe(true);
    expect(jogo.obterPosicoesBombas()).toHaveLength(40);
    expect(jogo.obterPosicoesBombas().find((p) => p.linha === 0 && p.coluna === 0)).toBeUndefined();
  });
});
