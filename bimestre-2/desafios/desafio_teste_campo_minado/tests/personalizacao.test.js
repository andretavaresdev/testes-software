/** Versão: André Tavares | RA: 24066498-2
 * Cenário adicional: Ausência de vizinhos repetidos e da própria célula.
 */

const { todasAsPosicoes, vizinhos } = require('../src/tabuleiro');
test('cada célula possui apenas vizinhos distintos e externos a ela', () => {
  for (const p of todasAsPosicoes()) {
    const lista = vizinhos(p.linha, p.coluna);
    expect(new Set(lista.map(q => `${q.linha},${q.coluna}`)).size).toBe(lista.length);
    expect(lista).not.toContainEqual(p);
    expect(lista.length).toBeGreaterThanOrEqual(3);
    expect(lista.length).toBeLessThanOrEqual(8);
  }
});
