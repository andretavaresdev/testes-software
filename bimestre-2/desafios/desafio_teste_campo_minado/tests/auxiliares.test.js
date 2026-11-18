'use strict';

const {
  LINHAS,
  COLUNAS,
  BOMBAS,
  estaDentro,
  todasAsPosicoes,
  completarBombas,
  geradorComSemente,
} = require('../src');

function chave({ linha, coluna }) {
  return `${linha},${coluna}`;
}

describe('Auxiliares — completarBombas e geradorComSemente', () => {
  test('CT-AUX-01 completarBombas deve devolver exatamente 40 posições únicas e válidas', () => {
    const posicoes = completarBombas();
    const chaves = new Set(posicoes.map(chave));

    expect(posicoes).toHaveLength(BOMBAS);
    expect(chaves.size).toBe(BOMBAS);
    posicoes.forEach((posicao) => {
      expect(posicao).toEqual(expect.objectContaining({
        linha: expect.any(Number),
        coluna: expect.any(Number),
      }));
      expect(estaDentro(posicao.linha, posicao.coluna)).toBe(true);
    });
  });

  test('CT-AUX-02 completarBombas deve incluir todas as posições prioritárias', () => {
    const prioritarias = [[0, 0], { linha: 5, coluna: 7 }, [17, 13]];
    const posicoes = completarBombas(prioritarias);
    const chaves = new Set(posicoes.map(chave));

    expect(posicoes).toHaveLength(BOMBAS);
    expect(chaves.size).toBe(BOMBAS);
    expect(chaves.has('0,0')).toBe(true);
    expect(chaves.has('5,7')).toBe(true);
    expect(chaves.has('17,13')).toBe(true);
  });

  test('CT-AUX-03 completarBombas nunca deve usar as células de evitar', () => {
    // Sem "evitar", o preenchimento começa no fim do tabuleiro: (17,13), (17,12)...
    const evitar = [[17, 13], [17, 12], [16, 0], [8, 8]];
    const posicoes = completarBombas([[0, 0]], evitar);
    const chaves = new Set(posicoes.map(chave));

    expect(posicoes).toHaveLength(BOMBAS);
    expect(chaves.size).toBe(BOMBAS);
    expect(chaves.has('0,0')).toBe(true);
    for (const [linha, coluna] of evitar) {
      expect(chaves.has(`${linha},${coluna}`)).toBe(false);
    }
  });

  test('CT-AUX-04 completarBombas deve lançar erro quando for impossível completar 40 bombas', () => {
    // 252 casas no total; ao evitar 213, sobram só 39 casas livres.
    const evitar = todasAsPosicoes().slice(BOMBAS - 1);
    expect(evitar).toHaveLength(LINHAS * COLUNAS - (BOMBAS - 1));
    expect(() => completarBombas([], evitar)).toThrow(/Não foi possível completar 40 bombas/);
  });

  test('CT-AUX-05 geradorComSemente deve ser determinístico e devolver valores em [0, 1)', () => {
    const a = geradorComSemente(2026);
    const b = geradorComSemente(2026);
    const sequencia = [];

    for (let i = 0; i < 100; i += 1) {
      const valor = a();
      expect(typeof valor).toBe('number');
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThan(1);
      expect(valor).toBe(b());
      sequencia.push(valor);
    }

    expect(new Set(sequencia).size).toBeGreaterThan(1);
  });

  test('CT-AUX-06 geradorComSemente deve produzir sequências diferentes para sementes diferentes', () => {
    const a = geradorComSemente(1);
    const b = geradorComSemente(2);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });
});
