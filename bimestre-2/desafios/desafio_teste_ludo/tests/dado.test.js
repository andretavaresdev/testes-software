const { Dado } = require('../src/dado');

describe('Dado', () => {
  test('CT-DADO-01: deve sortear um valor inteiro entre 1 e 6', () => {
    const dado = new Dado();
    for (let i = 0; i < 40; i += 1) {
      const valor = dado.rolar();
      expect(Number.isInteger(valor)).toBe(true);
      expect(valor).toBeGreaterThanOrEqual(1);
      expect(valor).toBeLessThanOrEqual(6);
    }
  });

  test('CT-DADO-02: deve respeitar a sequência injetada na ordem', () => {
    const dado = new Dado([6, 1, 4, 2]);
    expect(dado.rolar()).toBe(6);
    expect(dado.rolar()).toBe(1);
    expect(dado.rolar()).toBe(4);
    expect(dado.rolar()).toBe(2);
  });

  test('CT-DADO-03: deve rejeitar sequência vazia', () => {
    expect(() => new Dado([])).toThrow('A sequência do dado deve ser um array não vazio.');
  });

  test('CT-DADO-04: deve rejeitar valor fora do intervalo 1 a 6', () => {
    expect(() => new Dado([0])).toThrow('Valor inválido de dado');
    expect(() => new Dado([7])).toThrow('Valor inválido de dado');
    expect(() => new Dado([-1, 3])).toThrow('Valor inválido de dado');
  });

  test('CT-DADO-05: deve rejeitar sequência que não é um array', () => {
    expect(() => new Dado(6)).toThrow('A sequência do dado deve ser um array não vazio.');
    expect(() => new Dado('123')).toThrow('A sequência do dado deve ser um array não vazio.');
  });

  test('CT-DADO-06: deve lançar erro quando a sequência acaba', () => {
    const dado = new Dado([3]);
    expect(dado.rolar()).toBe(3);
    expect(() => dado.rolar()).toThrow('A sequência do dado acabou.');
  });

  test('CT-DADO-07: deve rejeitar valores não inteiros', () => {
    expect(() => new Dado([1.5])).toThrow('Valor inválido de dado');
    expect(() => new Dado(['6'])).toThrow('Valor inválido de dado');
  });
});
