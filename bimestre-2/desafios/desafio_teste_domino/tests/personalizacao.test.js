/** Versão: André Tavares | RA: 24066498-2
 * Cenário adicional: Conservação de peças na distribuição.
 */

const { criarBaralho, distribuir } = require('../src/baralho');
test('mãos e monte recompõem o conjunto sem repetições', () => {
  const original = criarBaralho(); const { maos, monte } = distribuir(original);
  const ids = [...maos.flat(), ...monte].map(p => p.id);
  expect(new Set(ids).size).toBe(28);
  expect(ids.slice().sort()).toEqual(original.map(p => p.id).sort());
  expect(maos.map(m => m.length)).toEqual([7, 7]);
  expect(monte).toHaveLength(14);
});
