/**
 * Utilitários dos casos de teste. Este arquivo faz parte da especificação
 * do desafio: descreve como montar partidas controladas e como um erro
 * deve ser conferido (classe, propriedade `codigo` e mensagem).
 */
const { parsePeca, ErroPeca } = require("../src/peca");
const { criarBaralho, ErroBaralho } = require("../src/baralho");
const { Partida, ErroPartida } = require("../src/partida");

function ids(pecas) {
  return pecas.map((p) => parsePeca(p).id);
}

function baralhoComMaos(mao0, mao1) {
  if (mao0.length !== 7 || mao1.length !== 7) {
    throw new Error("baralhoComMaos exige 7 peças em cada mão.");
  }
  const usadas = new Set([...mao0, ...mao1].map((p) => parsePeca(p).id));
  const resto = criarBaralho().filter((p) => !usadas.has(p.id));
  return [...mao0.map(parsePeca), ...mao1.map(parsePeca), ...resto];
}

function partidaComBaralho(mao0, mao1) {
  const partida = new Partida({ baralho: baralhoComMaos(mao0, mao1) });
  partida.iniciar();
  return partida;
}

function partidaEmAndamento({ maos, monte = [], mesa, jogadorAtual }) {
  return Partida.criarParaTeste({ maos, monte, mesa, jogadorAtual });
}

/**
 * Confere um erro de domínio: instância, `name`, propriedade `codigo`
 * (não `code`) e mensagem.
 */
function esperarErro(fn, codigo, mensagem, tipo) {
  let erro;
  try {
    fn();
  } catch (capturado) {
    erro = capturado;
  }
  expect(erro).toBeDefined();
  expect(erro).toBeInstanceOf(Error);
  if (tipo) {
    expect(erro).toBeInstanceOf(tipo);
    expect(erro.name).toBe(tipo.name);
  }
  expect(erro.codigo).toBe(codigo);
  if (mensagem !== undefined) {
    expect(erro.message).toMatch(mensagem);
  }
  return erro;
}

module.exports = {
  ids,
  baralhoComMaos,
  partidaComBaralho,
  partidaEmAndamento,
  esperarErro,
  ErroPeca,
  ErroBaralho,
  ErroPartida,
};
