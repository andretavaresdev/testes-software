const { criarTabuleiro, TIPOS_NAVIO: T, ORIENTACAO: O } = require('../src/batalhaNaval');
test.each([['horizontal', 9, 8], ['vertical', 8, 9]])('destroier encosta no canto inferior direito: %s', (sentido, l, c) => {
  const t = criarTabuleiro();
  const n = t.posicionarNavio(T.DESTROIER, l, c, sentido === 'horizontal' ? O.HORIZONTAL : O.VERTICAL);
  expect(n.casas).toHaveLength(2);
  expect(t.obterCelula(9, 9).ocupada).toBe(true);
  expect(t.navios).toHaveLength(1);
});
