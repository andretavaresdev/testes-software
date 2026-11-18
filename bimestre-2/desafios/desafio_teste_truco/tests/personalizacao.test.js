const { criarBaralho, distribuir } = require('../src/baralho');
test.each([0, 1, 2, 3])('carteador %i preserva mãos, vira e resto sem duplicatas', carteador => {
  const b = criarBaralho(); const { maos, vira, resto } = distribuir(b, carteador);
  expect(maos.map(m => m.length)).toEqual([3, 3, 3, 3]);
  expect(resto).toHaveLength(27);
  expect(maos[(carteador + 1) % 4][0].id).toBe(b[0].id);
  expect(new Set([...maos.flat(), vira, ...resto].map(c => c.id)).size).toBe(40);
});
