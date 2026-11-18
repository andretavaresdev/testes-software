'use strict';

const {
  LINHAS,
  COLUNAS,
  BOMBAS,
  TOTAL_CELULAS,
  estaDentro,
  validarCoordenada,
  vizinhos,
  criarCelulas,
  todasAsPosicoes,
  gerarPosicoesAleatorias,
  colocarBombas,
  obterPosicoesBombas,
  relocacionarBomba,
} = require('../src');
const { completarBombas, geradorComSemente } = require('../src');

describe('Tabuleiro — dimensões, vizinhança e posicionamento de bombas', () => {
  test('CT-TAB-01 deve considerar coordenadas internas válidas, inclusive os cantos', () => {
    expect(estaDentro(0, 0)).toBe(true);
    expect(estaDentro(0, COLUNAS - 1)).toBe(true);
    expect(estaDentro(LINHAS - 1, 0)).toBe(true);
    expect(estaDentro(LINHAS - 1, COLUNAS - 1)).toBe(true);
    expect(estaDentro(9, 7)).toBe(true);
  });

  test('CT-TAB-02 não deve aceitar coordenadas fora do tabuleiro 18x14', () => {
    const invalidas = [
      [-1, 0],
      [0, -1],
      [LINHAS, 0],
      [0, COLUNAS],
      [LINHAS, COLUNAS],
      [17, 14],
      [18, 13],
    ];

    for (const [linha, coluna] of invalidas) {
      expect(estaDentro(linha, coluna)).toBe(false);
      expect(() => validarCoordenada(linha, coluna)).toThrow(/Coordenada inválida/);
    }
  });

  test('CT-TAB-03 não deve aceitar coordenadas não inteiras ou ausentes', () => {
    const invalidas = [
      [1.5, 0],
      [0, 2.2],
      [null, 0],
      [0, undefined],
      ['0', 0],
      [0, '1'],
      [NaN, 0],
    ];

    for (const [linha, coluna] of invalidas) {
      expect(estaDentro(linha, coluna)).toBe(false);
      expect(() => validarCoordenada(linha, coluna)).toThrow(/Coordenada inválida/);
    }
  });

  test('CT-TAB-04 deve retornar 3 vizinhos em cada canto', () => {
    expect(vizinhos(0, 0)).toHaveLength(3);
    expect(vizinhos(0, COLUNAS - 1)).toHaveLength(3);
    expect(vizinhos(LINHAS - 1, 0)).toHaveLength(3);
    expect(vizinhos(LINHAS - 1, COLUNAS - 1)).toHaveLength(3);
    expect(vizinhos(0, 0)).toEqual(
      expect.arrayContaining([
        { linha: 0, coluna: 1 },
        { linha: 1, coluna: 0 },
        { linha: 1, coluna: 1 },
      ]),
    );
  });

  test('CT-TAB-05 deve retornar 5 vizinhos nas bordas (não cantos)', () => {
    expect(vizinhos(0, 7)).toHaveLength(5);
    expect(vizinhos(LINHAS - 1, 7)).toHaveLength(5);
    expect(vizinhos(9, 0)).toHaveLength(5);
    expect(vizinhos(9, COLUNAS - 1)).toHaveLength(5);
  });

  test('CT-TAB-06 deve retornar 8 vizinhos no centro', () => {
    expect(vizinhos(9, 7)).toHaveLength(8);
    expect(vizinhos(1, 1)).toHaveLength(8);
  });

  test('CT-TAB-07 deve criar um tabuleiro 18x14 sem bombas nem células reveladas', () => {
    const celulas = criarCelulas();
    expect(celulas).toHaveLength(LINHAS);
    expect(celulas.every((fileira) => fileira.length === COLUNAS)).toBe(true);
    expect(todasAsPosicoes()).toHaveLength(TOTAL_CELULAS);

    for (const fileira of celulas) {
      for (const celula of fileira) {
        expect(celula.bomba).toBe(false);
        expect(celula.revelada).toBe(false);
        expect(celula.bandeira).toBe(false);
        expect(celula.adjacentes).toBe(0);
      }
    }
  });

  test('CT-TAB-08 deve colocar exatamente 40 bombas nas posições informadas', () => {
    const celulas = criarCelulas();
    const posicoes = completarBombas([[0, 0], [1, 2], [17, 13]]);
    colocarBombas(celulas, posicoes);

    const colocadas = obterPosicoesBombas(celulas);
    expect(colocadas).toHaveLength(BOMBAS);
    expect(colocadas).toEqual(expect.arrayContaining([
      { linha: 0, coluna: 0 },
      { linha: 1, coluna: 2 },
      { linha: 17, coluna: 13 },
    ]));
  });

  test('CT-TAB-09 deve calcular o número de bombas adjacentes no canto, na borda e no centro', () => {
    const celulas = criarCelulas();
    // Bomba isolada em (1,1); as demais vão para o canto oposto.
    const posicoes = completarBombas([[1, 1]], [{ linha: 0, coluna: 0 }, { linha: 9, coluna: 7 }]);
    colocarBombas(celulas, posicoes);

    expect(celulas[0][0].adjacentes).toBe(1);
    expect(celulas[0][1].adjacentes).toBe(1);
    expect(celulas[0][2].adjacentes).toBe(1);
    expect(celulas[1][0].adjacentes).toBe(1);
    expect(celulas[1][2].adjacentes).toBe(1);
    expect(celulas[2][0].adjacentes).toBe(1);
    expect(celulas[2][1].adjacentes).toBe(1);
    expect(celulas[2][2].adjacentes).toBe(1);
    expect(celulas[1][1].bomba).toBe(true);
    expect(celulas[1][1].adjacentes).toBe(0);
    expect(celulas[9][7].adjacentes).toBe(0);
  });

  test('CT-TAB-10 não deve permitir quantidade diferente de 40 bombas', () => {
    const celulas = criarCelulas();
    expect(() => colocarBombas(celulas, [[0, 0]])).toThrow(/exatamente 40 bombas/);
    expect(() => colocarBombas(celulas, completarBombas().concat([[3, 3]]))).toThrow(/exatamente 40 bombas/);
    expect(() => colocarBombas(celulas, 'bombas')).toThrow(/devem ser uma lista/);
  });

  test('CT-TAB-11 não deve permitir bombas duplicadas', () => {
    const celulas = criarCelulas();
    const posicoes = completarBombas([[0, 0]]);
    posicoes[posicoes.length - 1] = { linha: 0, coluna: 0 };
    expect(() => colocarBombas(celulas, posicoes)).toThrow(/duplicada/);
  });

  test('CT-TAB-12 não deve permitir bomba fora do tabuleiro', () => {
    const celulas = criarCelulas();
    const posicoes = completarBombas();
    posicoes[0] = { linha: 18, coluna: 0 };
    expect(() => colocarBombas(celulas, posicoes)).toThrow(/Coordenada inválida/);
    expect(() => colocarBombas(celulas, [{ foo: 1 }, ...completarBombas().slice(1)])).toThrow(/Posição de bomba inválida/);
  });

  test('CT-TAB-13 deve gerar 40 posições distintas com gerador injetado', () => {
    const gerador = geradorComSemente(2026);
    const posicoes = gerarPosicoesAleatorias(gerador, BOMBAS);
    const chaves = new Set(posicoes.map((p) => `${p.linha},${p.coluna}`));

    expect(posicoes).toHaveLength(BOMBAS);
    expect(chaves.size).toBe(BOMBAS);
    posicoes.forEach((p) => expect(estaDentro(p.linha, p.coluna)).toBe(true));

    const repetido = gerarPosicoesAleatorias(geradorComSemente(2026), BOMBAS);
    expect(repetido).toEqual(posicoes);

    const outro = gerarPosicoesAleatorias(geradorComSemente(99), BOMBAS);
    expect(outro).not.toEqual(posicoes);
  });

  test('CT-TAB-14 deve rejeitar gerador aleatório inválido', () => {
    expect(() => gerarPosicoesAleatorias(null)).toThrow(/gerador aleatório/);
    expect(() => gerarPosicoesAleatorias(() => 1)).toThrow(/\[0, 1\)/);
    expect(() => gerarPosicoesAleatorias(() => -0.1)).toThrow(/\[0, 1\)/);
    expect(() => gerarPosicoesAleatorias(() => '0.5')).toThrow(/\[0, 1\)/);
  });

  test('CT-TAB-15 deve relocacionar a bomba para uma célula livre', () => {
    const celulas = criarCelulas();
    // (0,0) fica com bomba; o preenchimento completa as 39 restantes
    // a partir do fim do tabuleiro, então (0,1) é a primeira casa livre
    // em ordem linha-coluna.
    colocarBombas(celulas, completarBombas([[0, 0]]));
    expect(celulas[0][0].bomba).toBe(true);
    expect(celulas[0][1].bomba).toBe(false);

    // gerador 0 escolhe o índice 0 da lista de casas livres, que é
    // percorrida em ordem linha-coluna: a bomba vai para (0,1).
    const destino = relocacionarBomba(celulas, { linha: 0, coluna: 0 }, () => 0);
    expect(destino).toEqual({ linha: 0, coluna: 1 });
    expect(celulas[0][0].bomba).toBe(false);
    expect(celulas[0][1].bomba).toBe(true);
    expect(celulas[destino.linha][destino.coluna].bomba).toBe(true);
    expect(obterPosicoesBombas(celulas)).toHaveLength(BOMBAS);
    expect(celulas[0][0].adjacentes).toBeGreaterThan(0);
  });

  test('CT-TAB-16 não deve relocacionar quando não há bomba na origem', () => {
    const celulas = criarCelulas();
    colocarBombas(celulas, completarBombas([[17, 13]]));
    expect(() => relocacionarBomba(celulas, { linha: 0, coluna: 0 }, () => 0))
      .toThrow(/Não há bomba/);
  });
});
