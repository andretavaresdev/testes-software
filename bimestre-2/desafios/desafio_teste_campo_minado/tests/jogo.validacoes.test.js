'use strict';

const { criarJogo, completarBombas } = require('../src');

describe('Jogo — validações de coordenada e limites do tabuleiro', () => {
  const iniciar = () => criarJogo({ posicoesBombas: completarBombas() });

  test('CT-VAL-01 deve rejeitar revelar fora do tabuleiro', () => {
    const jogo = iniciar();
    expect(() => jogo.revelar(-1, 0)).toThrow(/Coordenada inválida/);
    expect(() => jogo.revelar(18, 0)).toThrow(/Coordenada inválida/);
    expect(() => jogo.revelar(0, 14)).toThrow(/Coordenada inválida/);
  });

  test('CT-VAL-02 deve rejeitar bandeira fora do tabuleiro', () => {
    const jogo = iniciar();
    expect(() => jogo.alternarBandeira(0, -1)).toThrow(/Coordenada inválida/);
    expect(() => jogo.alternarBandeira(17, 14)).toThrow(/Coordenada inválida/);
  });

  test('CT-VAL-03 deve rejeitar abrir adjacentes fora do tabuleiro', () => {
    const jogo = iniciar();
    expect(() => jogo.abrirAdjacentes(18, 13)).toThrow(/Coordenada inválida/);
    expect(() => jogo.abrirAdjacentes(9, 14)).toThrow(/Coordenada inválida/);
  });

  test('CT-VAL-04 deve rejeitar inspecionar fora do tabuleiro', () => {
    const jogo = iniciar();
    expect(() => jogo.inspecionar(1.5, 0)).toThrow(/Coordenada inválida/);
    expect(() => jogo.inspecionar(null, 0)).toThrow(/Coordenada inválida/);
  });

  test('CT-VAL-05 deve rejeitar consulta de célula fora do tabuleiro', () => {
    const jogo = iniciar();
    expect(() => jogo.celula(18, 14)).toThrow(/Coordenada inválida/);
    expect(() => jogo.celula('0', 0)).toThrow(/Coordenada inválida/);
  });

  test('CT-VAL-06 deve aceitar operações nos quatro cantos do tabuleiro', () => {
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[8, 8]], [
        [0, 0], [0, 13], [17, 0], [17, 13],
      ]),
    });

    expect(jogo.alternarBandeira(0, 13).ok).toBe(true);
    expect(jogo.alternarBandeira(17, 0).ok).toBe(true);
    expect(jogo.revelar(0, 0).ok).toBe(true);
    expect(jogo.celula(17, 13).revelada).toBe(false);
    expect(() => jogo.inspecionar(17, 13)).not.toThrow();
  });
});
