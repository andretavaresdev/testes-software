/**
 * Peça de dominó no conjunto duplo-seis.
 * Disciplina: Projeto, Implementação e Teste de Software (2026)
 */

class ErroPeca extends Error {
  constructor(codigo, mensagem) {
    super(mensagem);
    this.name = "ErroPeca";
    this.codigo = codigo;
  }
}

const VALOR_MINIMO = 0;
const VALOR_MAXIMO = 6;

function validarValor(valor, rotulo) {
  if (!Number.isInteger(valor) || valor < VALOR_MINIMO || valor > VALOR_MAXIMO) {
    throw new ErroPeca(
      "VALOR_INVALIDO",
      `Valor inválido para ${rotulo}: ${String(valor)}. Use inteiros de ${VALOR_MINIMO} a ${VALOR_MAXIMO}.`
    );
  }
  return valor;
}

class Peca {
  /**
   * @param {number} a lado A (0-6)
   * @param {number} b lado B (0-6)
   */
  constructor(a, b) {
    validarValor(a, "o lado A");
    validarValor(b, "o lado B");
    this._menor = Math.min(a, b);
    this._maior = Math.max(a, b);
  }

  get menor() {
    return this._menor;
  }

  get maior() {
    return this._maior;
  }

  get a() {
    return this._menor;
  }

  get b() {
    return this._maior;
  }

  get pontos() {
    return this._menor + this._maior;
  }

  get duplo() {
    return this._menor === this._maior;
  }

  get id() {
    return `${this._menor}-${this._maior}`;
  }

  combinaCom(valor) {
    return this._menor === valor || this._maior === valor;
  }

  outroLado(valor) {
    if (this._menor === valor) {
      return this._maior;
    }
    if (this._maior === valor) {
      return this._menor;
    }
    throw new ErroPeca(
      "LADO_INCOMPATIVEL",
      `A peça ${this.toString()} não possui o lado ${valor}.`
    );
  }

  equals(outra) {
    const peca = outra instanceof Peca ? outra : parsePeca(outra);
    return this._menor === peca._menor && this._maior === peca._maior;
  }

  /**
   * Compara prioridade de abertura: duplo vence não-duplo;
   * entre iguais, maior lado alto e, em seguida, maior lado baixo.
   * @returns {number} positivo se esta peça abre antes da outra
   */
  compararParaAbertura(outra) {
    if (this.duplo && !outra.duplo) {
      return 1;
    }
    if (!this.duplo && outra.duplo) {
      return -1;
    }
    if (this._maior !== outra._maior) {
      return this._maior - outra._maior;
    }
    return this._menor - outra._menor;
  }

  toJSON() {
    return {
      a: this._menor,
      b: this._maior,
      id: this.id,
      duplo: this.duplo,
      pontos: this.pontos,
    };
  }

  toString() {
    return `[${this._menor}|${this._maior}]`;
  }
}

function parsePeca(ref) {
  if (ref instanceof Peca) {
    return ref;
  }
  if (Array.isArray(ref) && ref.length === 2) {
    return new Peca(ref[0], ref[1]);
  }
  if (ref && typeof ref === "object" && ref.a != null && ref.b != null) {
    return new Peca(ref.a, ref.b);
  }
  if (typeof ref === "string") {
    const m = ref.trim().match(/^\[?(\d)\s*[|\-,/]\s*(\d)\]?$/);
    if (m) {
      return new Peca(Number(m[1]), Number(m[2]));
    }
  }
  throw new ErroPeca(
    "PECA_INVALIDA",
    `Não foi possível interpretar a peça: ${String(ref)}.`
  );
}

function criarPeca(a, b) {
  if (b === undefined) {
    return parsePeca(a);
  }
  return new Peca(a, b);
}

module.exports = {
  Peca,
  ErroPeca,
  criarPeca,
  parsePeca,
  VALOR_MINIMO,
  VALOR_MAXIMO,
};
