const { Peca, ErroPeca, criarPeca, parsePeca } = require("../src/peca");
const { esperarErro } = require("./helpers");

describe("Peças do duplo-seis", () => {
  test("CT-PECA-01: cria peça válida 3-5, com 8 pontos, e não é duplo", () => {
    const peca = criarPeca(3, 5);
    expect(peca.id).toBe("3-5");
    expect(peca.pontos).toBe(8);
    expect(peca.duplo).toBe(false);
    expect(peca.menor).toBe(3);
    expect(peca.maior).toBe(5);
  });

  test("CT-PECA-02: cria duplo 4-4, com 8 pontos", () => {
    const peca = new Peca(4, 4);
    expect(peca.duplo).toBe(true);
    expect(peca.pontos).toBe(8);
    expect(peca.id).toBe("4-4");
  });

  test("CT-PECA-03: a branca 0-0 é válida e vale 0 pontos", () => {
    const peca = criarPeca(0, 0);
    expect(peca.duplo).toBe(true);
    expect(peca.pontos).toBe(0);
    expect(peca.toString()).toBe("[0|0]");
  });

  test("CT-PECA-04: o dezena 6-6 é válido e vale 12 pontos", () => {
    const peca = criarPeca("6-6");
    expect(peca.duplo).toBe(true);
    expect(peca.pontos).toBe(12);
  });

  test("CT-PECA-05: 3-5 e 5-3 representam a mesma peça", () => {
    const a = criarPeca(3, 5);
    const b = criarPeca(5, 3);
    const c = parsePeca("[5|3]");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(true);
    expect(a.equals("5-3")).toBe(true);
    expect(a.id).toBe(b.id);
  });

  test("CT-PECA-06: rejeita valor negativo com código VALOR_INVALIDO", () => {
    esperarErro(() => criarPeca(-1, 3), "VALOR_INVALIDO", /Valor inválido/, ErroPeca);
  });

  test("CT-PECA-07: rejeita valor 7 (fora do duplo-seis) com código VALOR_INVALIDO", () => {
    esperarErro(() => new Peca(7, 1), "VALOR_INVALIDO", /0 a 6/, ErroPeca);
  });

  test("CT-PECA-08: rejeita valor não inteiro e referência inválida com os códigos correspondentes", () => {
    esperarErro(() => criarPeca(2.5, 1), "VALOR_INVALIDO", /Valor inválido/, ErroPeca);
    esperarErro(() => parsePeca("peca-boa"), "PECA_INVALIDA", /Não foi possível interpretar/, ErroPeca);
    esperarErro(() => parsePeca(null), "PECA_INVALIDA", /Não foi possível interpretar/, ErroPeca);
  });

  test("CT-PECA-09: combinaCom é verdadeiro quando um dos lados casa", () => {
    const peca = criarPeca(2, 5);
    expect(peca.combinaCom(2)).toBe(true);
    expect(peca.combinaCom(5)).toBe(true);
    expect(peca.outroLado(2)).toBe(5);
    expect(peca.outroLado(5)).toBe(2);
  });

  test("CT-PECA-10: combinaCom é falso quando nenhum lado casa, e outroLado falha com LADO_INCOMPATIVEL", () => {
    const peca = criarPeca(2, 5);
    expect(peca.combinaCom(6)).toBe(false);
    esperarErro(() => peca.outroLado(6), "LADO_INCOMPATIVEL", /não possui o lado 6/, ErroPeca);
  });

  test("CT-PECA-11: prioridade de abertura privilegia duplo e, depois, a maior peça", () => {
    expect(criarPeca(0, 0).compararParaAbertura(criarPeca(6, 5))).toBeGreaterThan(0);
    expect(criarPeca(6, 6).compararParaAbertura(criarPeca(0, 0))).toBeGreaterThan(0);
    expect(criarPeca(6, 5).compararParaAbertura(criarPeca(6, 4))).toBeGreaterThan(0);
    expect(criarPeca(6, 4).compararParaAbertura(criarPeca(5, 4))).toBeGreaterThan(0);
  });
});
