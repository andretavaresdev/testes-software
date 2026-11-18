/** Versão: André Tavares | RA: 24066498-2
 * Cenário adicional: Proteção contra alterações na sequência fornecida.
 */

const { Dado } = require('../src/dado');
test('o dado mantém uma cópia independente da sequência', () => {
  const entrada = [6, 2, 4]; const d = new Dado(entrada);
  entrada[0] = 1; entrada.push(3);
  expect([d.rolar(), d.rolar(), d.rolar()]).toEqual([6, 2, 4]);
  expect(() => d.rolar()).toThrow();
});
