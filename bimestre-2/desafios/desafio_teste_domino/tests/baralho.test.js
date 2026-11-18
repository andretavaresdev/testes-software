const {
  criarBaralho,
  criarRngSeeded,
  embaralhar,
  distribuir,
  validarBaralhoCompleto,
  ErroBaralho,
  TOTAL_PECAS,
  PECAS_POR_JOGADOR,
} = require("../src/baralho");
const { esperarErro } = require("./helpers");

describe("Baralho e distribuição", () => {
  test("CT-BARALHO-01: o baralho tem 28 peças únicas", () => {
    const baralho = criarBaralho();
    expect(baralho).toHaveLength(TOTAL_PECAS);
    const ids = new Set(baralho.map((p) => p.id));
    expect(ids.size).toBe(28);
  });

  test("CT-BARALHO-02: contém todos os pares de 0-0 até 6-6", () => {
    const ids = new Set(criarBaralho().map((p) => p.id));
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        expect(ids.has(`${i}-${j}`)).toBe(true);
      }
    }
  });

  test("CT-BARALHO-03: embaralhar com o mesmo RNG injetado é determinístico", () => {
    const original = criarBaralho();
    const a = embaralhar(original, criarRngSeeded(17));
    const b = embaralhar(original, criarRngSeeded(17));
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
    expect(original[0].id).toBe("0-0");
  });

  test("CT-BARALHO-04: dois geradores diferentes produzem ordens diferentes", () => {
    const original = criarBaralho();
    const a = embaralhar(original, () => 0);
    const b = embaralhar(original, () => 0.99);
    expect(a.map((p) => p.id)).not.toEqual(b.map((p) => p.id));
  });

  test("CT-BARALHO-05: a distribuição entrega 7 peças a cada jogador e 14 no monte", () => {
    const { maos, monte } = distribuir(criarBaralho());
    expect(maos).toHaveLength(2);
    expect(maos[0]).toHaveLength(PECAS_POR_JOGADOR);
    expect(maos[1]).toHaveLength(PECAS_POR_JOGADOR);
    expect(monte).toHaveLength(14);
  });

  test("CT-BARALHO-06: a distribuição não repete peças entre mãos e monte", () => {
    const { maos, monte } = distribuir(criarBaralho());
    const ids = [...maos[0], ...maos[1], ...monte].map((p) => p.id);
    expect(new Set(ids).size).toBe(28);
  });

  test("CT-BARALHO-07: a semente numérica reproduz o mesmo embaralhamento", () => {
    const ordem = (seed) =>
      embaralhar(criarBaralho(), criarRngSeeded(seed)).map((p) => p.id);
    expect(ordem(2026)).toEqual(ordem(2026));
    expect(ordem(2026)).not.toEqual(ordem(2027));
  });

  test("CT-BARALHO-08: rejeita entradas inválidas com os códigos de erro correspondentes", () => {
    esperarErro(
      () => validarBaralhoCompleto(criarBaralho().slice(0, 27)),
      "BARALHO_INCOMPLETO",
      /28 peças/,
      ErroBaralho
    );
    const duplicado = criarBaralho();
    duplicado[27] = duplicado[0];
    esperarErro(
      () => validarBaralhoCompleto(duplicado),
      "PECA_DUPLICADA",
      /duplicada/,
      ErroBaralho
    );
    esperarErro(() => criarRngSeeded("abc"), "SEED_INVALIDA", /semente/, ErroBaralho);
    esperarErro(
      () => embaralhar("nao-arranjo"),
      "BARALHO_INVALIDO",
      /arranjo de peças/,
      ErroBaralho
    );
    esperarErro(
      () => embaralhar(criarBaralho(), "nao-funcao"),
      "RNG_INVALIDO",
      /gerador aleatório/,
      ErroBaralho
    );
    esperarErro(
      () => embaralhar(criarBaralho(), () => 1),
      "RNG_INVALIDO",
      /\[0, 1\)/,
      ErroBaralho
    );
    esperarErro(
      () => distribuir(criarBaralho(), { jogadores: 3 }),
      "JOGADORES_INVALIDOS",
      /exatamente 2 jogadores/,
      ErroBaralho
    );
    esperarErro(
      () => distribuir(criarBaralho(), { pecasPorJogador: 9 }),
      "DISTRIBUICAO_INVALIDA",
      /7 peças/,
      ErroBaralho
    );
  });
});
