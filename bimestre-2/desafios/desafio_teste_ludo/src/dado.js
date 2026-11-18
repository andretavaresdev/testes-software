/** Dado de seis faces com sequência opcional para execução determinística. */
class Dado {
  constructor(sequencia) {
    if (sequencia !== undefined) {
      if (!Array.isArray(sequencia) || sequencia.length === 0) {
        throw new Error('A sequência do dado deve ser um array não vazio.');
      }
      for (const valor of sequencia) {
        if (!Number.isInteger(valor) || valor < 1 || valor > 6) {
          throw new Error(`Valor inválido de dado: ${valor}. Use inteiros de 1 a 6.`);
        }
      }
    }
    this.valores = sequencia === undefined ? null : sequencia.slice();
    this.proximo = 0;
  }

  rolar() {
    if (this.valores === null) return 1 + Math.floor(6 * Math.random());
    if (this.proximo === this.valores.length) throw new Error('A sequência do dado acabou.');
    return this.valores[this.proximo++];
  }
}

module.exports = { Dado };
