'use strict';

const {
  LINHAS,
  COLUNAS,
  BOMBAS,
  ESTADO,
  criarJogo,
  completarBombas,
  geradorComSemente,
} = require('../src');

describe('Jogo — criação, visão do jogador e proteção do primeiro clique', () => {
  test('CT-CRI-01 deve criar um jogo com as dimensões oficiais 18x14 e 40 bombas', () => {
    const jogo = criarJogo({ geradorAleatorio: geradorComSemente(1) });

    expect(jogo.linhas).toBe(LINHAS);
    expect(jogo.colunas).toBe(COLUNAS);
    expect(jogo.totalBombas).toBe(BOMBAS);
    expect(jogo.estado).toBe(ESTADO.EM_ANDAMENTO);
    expect(jogo.bombasRestantes).toBe(BOMBAS);
    expect(jogo.totalReveladas).toBe(0);
    expect(jogo.obterPosicoesBombas()).toHaveLength(BOMBAS);
  });

  test('CT-CRI-02 deve usar as posições de bomba injetadas', () => {
    const posicoes = completarBombas([[3, 4], [5, 6]]);
    const jogo = criarJogo({ posicoesBombas: posicoes });

    expect(jogo.inspecionar(3, 4).bomba).toBe(true);
    expect(jogo.inspecionar(5, 6).bomba).toBe(true);
    expect(jogo.obterPosicoesBombas()).toHaveLength(BOMBAS);
  });

  test('CT-CRI-03 deve usar o gerador com semente de forma determinística', () => {
    const a = criarJogo({ geradorAleatorio: geradorComSemente(42) });
    const b = criarJogo({ geradorAleatorio: geradorComSemente(42) });
    const c = criarJogo({ geradorAleatorio: geradorComSemente(7) });

    expect(a.obterPosicoesBombas()).toEqual(b.obterPosicoesBombas());
    expect(c.obterPosicoesBombas()).not.toEqual(a.obterPosicoesBombas());
  });

  test('CT-CRI-04 deve ocultar bombas na visão do jogador enquanto a partida rola', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[0, 0]]),
      protegerPrimeiroClique: false,
    });

    const visao = jogo.celula(0, 0);
    expect(visao.revelada).toBe(false);
    expect(visao.bomba).toBeNull();
    expect(visao.adjacentes).toBeNull();
    expect(jogo.inspecionar(0, 0).bomba).toBe(true);
  });

  test('CT-CRI-05 deve expor as bombas na visão do jogador após o fim da partida', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[0, 0]]),
      protegerPrimeiroClique: false,
    });

    jogo.revelar(0, 0);
    expect(jogo.estado).toBe(ESTADO.DERROTA);
    expect(jogo.celula(0, 0).bomba).toBe(true);
    expect(jogo.celula(0, 0).explodida).toBe(true);
  });

  test('CT-CRI-06 deve proteger o primeiro clique por padrão em jogo aleatório', () => {
    const jogo = criarJogo({ geradorAleatorio: geradorComSemente(123) });
    expect(jogo.protegerPrimeiroClique).toBe(true);

    const resultado = jogo.revelar(0, 0);
    expect(resultado.estado).not.toBe(ESTADO.DERROTA);
    expect(jogo.inspecionar(0, 0).bomba).toBe(false);
    expect(jogo.obterPosicoesBombas()).toHaveLength(BOMBAS);
  });

  test('CT-CRI-07 não deve proteger o primeiro clique quando as bombas são injetadas', () => {
    const jogo = criarJogo({ posicoesBombas: completarBombas([[0, 0]]) });
    expect(jogo.protegerPrimeiroClique).toBe(false);
    expect(jogo.revelar(0, 0).estado).toBe(ESTADO.DERROTA);
  });

  test('CT-CRI-08 deve permitir ativar a proteção mesmo com bombas injetadas', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[0, 0]]),
      protegerPrimeiroClique: true,
      geradorAleatorio: () => 0,
    });

    const resultado = jogo.revelar(0, 0);
    expect(resultado.estado).not.toBe(ESTADO.DERROTA);
    expect(jogo.inspecionar(0, 0).bomba).toBe(false);
    expect(jogo.obterPosicoesBombas()).toHaveLength(BOMBAS);
  });

  test('CT-CRI-09 deve rejeitar criação com lista de bombas inválida', () => {
    expect(() => criarJogo({ posicoesBombas: [] })).toThrow(/exatamente 40 bombas/);
    const duplicadas = completarBombas([[0, 0]]);
    duplicadas[1] = { linha: 0, coluna: 0 };
    expect(() => criarJogo({ posicoesBombas: duplicadas })).toThrow(/duplicada/);
  });
});
