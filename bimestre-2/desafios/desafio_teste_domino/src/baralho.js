/**
 * Baralho duplo-seis, embaralhamento injetável e distribuição para 2 jogadores.
 * Disciplina: Projeto, Implementação e Teste de Software (2026)
 * Colaborador: Rodrigo A. Del Padre Filho
 */

const { Peca, parsePeca, VALOR_MINIMO, VALOR_MAXIMO } = require("./peca");

class ErroBaralho extends Error {
  constructor(codigo, mensagem) {
    super(mensagem);
    this.name = "ErroBaralho";
    this.codigo = codigo;
  }
}

const TOTAL_PECAS = 28;
const PECAS_POR_JOGADOR = 7;
const NUM_JOGADORES = 2;

function criarBaralho() {
  const resultado = [];
  let a = VALOR_MINIMO;
  while (a <= VALOR_MAXIMO) {
    let b = a;
    while (b <= VALOR_MAXIMO) { resultado.push(new Peca(a, b)); b++; }
    a++;
  }
  return resultado;
}

/**
 * Gerador determinístico no intervalo [0, 1), baseado em Mulberry32.
 * @param {number} seed inteiro
 */
function criarRngSeeded(seed) {
  if (!Number.isInteger(seed)) {
    throw new ErroBaralho(
      "SEED_INVALIDA",
      `A semente deve ser um inteiro. Recebido: ${String(seed)}.`
    );
  }
  let t = seed >>> 0;
  return function rng() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function embaralhar(baralho, rng = Math.random) {
  if (!Array.isArray(baralho)) {
    throw new ErroBaralho("BARALHO_INVALIDO", "O baralho deve ser um arranjo de peças.");
  }
  if (typeof rng !== "function") {
    throw new ErroBaralho(
      "RNG_INVALIDO",
      "O gerador aleatório deve ser uma função que retorna um número em [0, 1)."
    );
  }
  const copia = baralho.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const u = rng();
    if (typeof u !== "number" || Number.isNaN(u) || u < 0 || u >= 1) {
      throw new ErroBaralho(
        "RNG_INVALIDO",
        `O gerador aleatório deve retornar um número em [0, 1). Recebido: ${String(u)}.`
      );
    }
    const j = Math.floor(u * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function validarBaralhoCompleto(pecas) {
  if (!Array.isArray(pecas) || pecas.length !== TOTAL_PECAS) {
    throw new ErroBaralho(
      "BARALHO_INCOMPLETO",
      `O baralho deve conter exatamente ${TOTAL_PECAS} peças. Recebido: ${pecas && pecas.length}.`
    );
  }
  const ids = new Set();
  const normalizadas = [];
  for (const p of pecas) {
    const peca = p instanceof Peca ? p : parsePeca(p);
    if (ids.has(peca.id)) {
      throw new ErroBaralho(
        "PECA_DUPLICADA",
        `Peça duplicada no baralho: ${peca.toString()}.`
      );
    }
    ids.add(peca.id);
    normalizadas.push(peca);
  }
  const esperado = new Set(criarBaralho().map((p) => p.id));
  for (const id of esperado) {
    if (!ids.has(id)) {
      throw new ErroBaralho("BARALHO_INCOMPLETO", `Falta a peça ${id} no baralho.`);
    }
  }
  return normalizadas;
}

function distribuir(baralho, { pecasPorJogador = PECAS_POR_JOGADOR, jogadores = NUM_JOGADORES } = {}) {
  const validas = validarBaralhoCompleto(baralho);
  if (jogadores !== NUM_JOGADORES) {
    throw new ErroBaralho(
      "JOGADORES_INVALIDOS",
      `Este desafio cobre exatamente ${NUM_JOGADORES} jogadores.`
    );
  }
  if (pecasPorJogador !== PECAS_POR_JOGADOR) {
    throw new ErroBaralho(
      "DISTRIBUICAO_INVALIDA",
      `Cada jogador deve receber exatamente ${PECAS_POR_JOGADOR} peças.`
    );
  }
  const maos = [];
  let indice = 0;
  for (let j = 0; j < jogadores; j++) {
    maos.push(validas.slice(indice, indice + pecasPorJogador));
    indice += pecasPorJogador;
  }
  return { maos, monte: validas.slice(indice) };
}

module.exports = {
  ErroBaralho,
  TOTAL_PECAS,
  PECAS_POR_JOGADOR,
  NUM_JOGADORES,
  criarBaralho,
  criarRngSeeded,
  embaralhar,
  validarBaralhoCompleto,
  distribuir,
};
