const { Partida, ErroPartida, STATUS, escolherAbertura } = require("../src/partida");
const { parsePeca, ErroPeca } = require("../src/peca");
const { criarBaralho, ErroBaralho } = require("../src/baralho");
const {
  baralhoComMaos,
  partidaComBaralho,
  partidaEmAndamento,
  esperarErro,
} = require("./helpers");

describe("Início da partida e quem começa", () => {
  test("CT-INICIO-01: ao iniciar, cada jogador tem 7 peças, o monte tem 14 e a mesa está vazia", () => {
    const partida = new Partida({ seed: 11 });
    const estado = partida.iniciar();
    expect(estado.status).toBe(STATUS.AGUARDANDO_PRIMEIRA);
    expect(estado.maos[0]).toHaveLength(7);
    expect(estado.maos[1]).toHaveLength(7);
    expect(estado.monte).toHaveLength(14);
    expect(estado.mesa).toHaveLength(0);
    expect(estado.pontas).toBeNull();
  });

  test("CT-INICIO-02: quem tem [6-6] começa e a peça inicial obrigatória é [6-6]", () => {
    const partida = partidaComBaralho(
      ["6-6", "0-1", "0-2", "0-3", "0-4", "0-5", "1-2"],
      ["5-5", "1-3", "1-4", "1-5", "2-3", "2-4", "2-5"]
    );
    expect(partida.jogadorAtual).toBe(0);
    expect(partida.pecaInicialObrigatoria.id).toBe("6-6");
  });

  test("CT-INICIO-03: se o [6-6] está no monte, começa quem tem o maior duplo das mãos", () => {
    const partida = partidaComBaralho(
      ["0-1", "0-2", "0-3", "0-4", "0-5", "0-6", "1-2"],
      ["5-5", "1-3", "1-4", "1-5", "2-3", "2-4", "2-5"]
    );
    expect(partida.jogadorAtual).toBe(1);
    expect(partida.pecaInicialObrigatoria.id).toBe("5-5");
    expect(partida.monte().some((p) => p.id === "6-6")).toBe(true);
  });

  test("CT-INICIO-04: se não há duplos nas mãos, começa quem tem a maior peça", () => {
    const partida = partidaComBaralho(
      ["6-5", "0-1", "0-2", "0-3", "0-4", "1-2", "1-3"],
      ["6-4", "1-4", "1-5", "2-3", "2-4", "2-5", "3-4"]
    );
    expect(partida.jogadorAtual).toBe(0);
    expect(partida.pecaInicialObrigatoria.id).toBe("5-6");
  });

  test("CT-INICIO-05: a primeira jogada deve ser a peça obrigatória", () => {
    const partida = partidaComBaralho(
      ["6-6", "0-1", "0-2", "0-3", "0-4", "0-5", "1-2"],
      ["5-5", "1-3", "1-4", "1-5", "2-3", "2-4", "2-5"]
    );
    esperarErro(() => partida.jogar(0, "0-1"), "ABERTURA_OBRIGATORIA", /primeira jogada deve ser/, ErroPartida);
    const estado = partida.jogar(0, "6-6");
    expect(estado.mesa).toHaveLength(1);
    expect(estado.mesa[0].peca).toBe("6-6");
  });

  test("CT-INICIO-06: após a abertura, a mesa tem 1 peça e a vez passa ao oponente", () => {
    const partida = partidaComBaralho(
      ["6-6", "0-1", "0-2", "0-3", "0-4", "0-5", "1-2"],
      ["5-5", "1-3", "1-4", "1-5", "2-3", "2-4", "2-5"]
    );
    const estado = partida.jogar(0, "[6|6]");
    expect(estado.status).toBe(STATUS.EM_ANDAMENTO);
    expect(estado.maos[0]).toHaveLength(6);
    expect(estado.jogadorAtual).toBe(1);
    expect(partida.podeJogar(0)).toBe(false);
  });

  test("CT-INICIO-07: as pontas de um duplo inicial são iguais", () => {
    const partida = partidaComBaralho(
      ["6-6", "0-1", "0-2", "0-3", "0-4", "0-5", "1-2"],
      ["5-5", "1-3", "1-4", "1-5", "2-3", "2-4", "2-5"]
    );
    partida.jogar(0, "6-6");
    expect(partida.pontas()).toEqual({ esquerda: 6, direita: 6 });
  });

  test("CT-INICIO-08: as pontas de uma peça não-dupla inicial são os dois valores (menor à esquerda)", () => {
    const partida = partidaComBaralho(
      ["6-5", "0-1", "0-2", "0-3", "0-4", "1-2", "1-3"],
      ["6-4", "1-4", "1-5", "2-3", "2-4", "2-5", "3-4"]
    );
    partida.jogar(0, "6-5");
    expect(partida.pontas()).toEqual({ esquerda: 5, direita: 6 });
  });

  test("CT-INICIO-09: a mesma seed produz a mesma partida", () => {
    const a = new Partida({ seed: 99 });
    const b = new Partida({ seed: 99 });
    expect(a.iniciar()).toEqual(b.iniciar());
  });

  test("CT-INICIO-10: não permite iniciar duas vezes", () => {
    const partida = new Partida({ seed: 1 });
    partida.iniciar();
    esperarErro(() => partida.iniciar(), "JA_INICIADA", /já foi iniciada/, ErroPartida);
  });

  test("CT-INICIO-11: baralho injetado incompleto ou duplicado é rejeitado na inicialização", () => {
    esperarErro(
      () => new Partida({ baralho: criarBaralho().slice(0, 20) }).iniciar(),
      "BARALHO_INCOMPLETO",
      /28 peças/,
      ErroBaralho
    );
    const duplicado = criarBaralho();
    duplicado[10] = duplicado[0];
    esperarErro(
      () => new Partida({ baralho: duplicado }).iniciar(),
      "PECA_DUPLICADA",
      /duplicada/,
      ErroBaralho
    );
  });

  test("CT-INICIO-12: um duplo baixo abre na frente de uma peça alta não-dupla", () => {
    const abertura = escolherAbertura([
      ["0-0", "1-2", "1-3"].map((p) => parsePeca(p)),
      ["6-5", "6-4", "6-3"].map((p) => parsePeca(p)),
    ]);
    expect(abertura.jogador).toBe(0);
    expect(abertura.peca.id).toBe("0-0");
  });
});

describe("Jogadas válidas nas pontas", () => {
  test("CT-JOGADA-01: joga na ponta direita quando um lado casa", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6", "6-3"],
      maos: [["3-1"], ["0-0"]],
      jogadorAtual: 0,
    });
    expect(partida.pontas()).toEqual({ esquerda: 6, direita: 3 });
    const estado = partida.jogar(0, "3-1", "direita");
    expect(estado.pontas).toEqual({ esquerda: 6, direita: 1 });
    expect(estado.mesa.map((p) => `${p.esquerda}|${p.direita}`)).toEqual([
      "6|6",
      "6|3",
      "3|1",
    ]);
  });

  test("CT-JOGADA-02: joga na ponta esquerda quando um lado casa", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6", "6-3"],
      maos: [["4-6"], ["0-0"]],
      jogadorAtual: 0,
    });
    partida.jogar(0, "4-6", "esquerda");
    expect(partida.pontas()).toEqual({ esquerda: 4, direita: 3 });
    expect(partida.mesa()[0]).toMatchObject({ esquerda: 4, direita: 6 });
  });

  test("CT-JOGADA-03: a peça é virada automaticamente para casar com a ponta", () => {
    const partida = partidaEmAndamento({
      mesa: [{ esquerda: 5, direita: 6 }],
      maos: [["2-5"], ["0-1"]],
      jogadorAtual: 0,
    });
    partida.jogar(0, "2-5", "esquerda");
    expect(partida.mesa()[0]).toMatchObject({ esquerda: 2, direita: 5 });
    expect(partida.pontas()).toEqual({ esquerda: 2, direita: 6 });
  });

  test("CT-JOGADA-04: um duplo encaixado mantém o valor daquela ponta", () => {
    const partida = partidaEmAndamento({
      mesa: ["5-6"],
      maos: [["6-6"], ["0-0"]],
      jogadorAtual: 0,
    });
    partida.jogar(0, "6-6", "direita");
    expect(partida.pontas()).toEqual({ esquerda: 5, direita: 6 });
    expect(partida.mesa().at(-1)).toMatchObject({ esquerda: 6, direita: 6 });
  });

  test("CT-JOGADA-05: peça que casa nas duas pontas pode ser jogada na ponta escolhida", () => {
    const partida = partidaEmAndamento({
      mesa: ["3-4", "4-5"],
      maos: [["3-5"], ["0-0"]],
      jogadorAtual: 0,
    });
    expect(partida.pontas()).toEqual({ esquerda: 3, direita: 5 });
    partida.jogar(0, "3-5", "esquerda");
    expect(partida.pontas()).toEqual({ esquerda: 5, direita: 5 });

    const outra = partidaEmAndamento({
      mesa: ["3-4", "4-5"],
      maos: [["3-5"], ["0-0"]],
      jogadorAtual: 0,
    });
    outra.jogar(0, "3-5", "direita");
    expect(outra.pontas()).toEqual({ esquerda: 3, direita: 3 });
  });

  test("CT-JOGADA-06: após jogar, a peça sai da mão e a vez alterna", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [
        ["6-1", "0-2"],
        ["6-2"],
      ],
      jogadorAtual: 0,
    });
    const estado = partida.jogar(0, "6-1", "direita");
    expect(estado.maos[0]).toEqual(["0-2"]);
    expect(estado.jogadorAtual).toBe(1);
    expect(partida.maoDo(0).map((p) => p.id)).toEqual(["0-2"]);
  });

  test("CT-JOGADA-07: pecasJogaveis lista apenas as que casam com alguma ponta", () => {
    const partida = partidaEmAndamento({
      mesa: ["4-4"],
      maos: [
        ["4-1", "2-3", "4-0", "5-6"],
        ["1-1"],
      ],
      jogadorAtual: 0,
    });
    expect(partida.pecasJogaveis(0).map((p) => p.id).sort()).toEqual(["0-4", "1-4"]);
    expect(partida.pecasJogaveis(1)).toEqual([]);
  });

  test("CT-JOGADA-08: o jogador pode escolher entre duas peças jogáveis", () => {
    const partida = partidaEmAndamento({
      mesa: ["2-5"],
      maos: [
        ["2-2", "5-6"],
        ["0-0"],
      ],
      jogadorAtual: 0,
    });
    expect(partida.pecasJogaveis(0).map((p) => p.id).sort()).toEqual(["2-2", "5-6"]);
    partida.jogar(0, "2-2", "esquerda");
    expect(partida.pontas()).toEqual({ esquerda: 2, direita: 5 });
  });

  test("CT-JOGADA-09: se a peça casa com uma única ponta, a ponta pode ser omitida", () => {
    const partida = partidaEmAndamento({
      mesa: [{ esquerda: 1, direita: 6 }],
      maos: [["3-6"], ["0-0"]],
      jogadorAtual: 0,
    });
    partida.jogar(0, "3-6");
    expect(partida.pontas()).toEqual({ esquerda: 1, direita: 3 });
  });
});

describe("Jogadas inválidas e erros", () => {
  test("CT-ERRO-01: recusa peça que não está na mão", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["6-1"], ["0-0"]],
      jogadorAtual: 0,
    });
    esperarErro(() => partida.jogar(0, "6-2", "direita"), "PECA_FORA_DA_MAO", /não está na mão/, ErroPartida);
  });

  test("CT-ERRO-02: recusa peça que não casa com a ponta escolhida", () => {
    const partida = partidaEmAndamento({
      mesa: [{ esquerda: 1, direita: 6 }],
      maos: [["6-3"], ["0-0"]],
      jogadorAtual: 0,
    });
    esperarErro(
      () => partida.jogar(0, "6-3", "esquerda"),
      "JOGADA_INVALIDA",
      /não combina com a ponta esquerda/,
      ErroPartida
    );
  });

  test("CT-ERRO-03: recusa ponta inválida", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["6-1"], ["0-0"]],
      jogadorAtual: 0,
    });
    esperarErro(() => partida.jogar(0, "6-1", "meio"), "PONTA_INVALIDA", /Ponta inválida/, ErroPartida);
  });

  test("CT-ERRO-04: recusa jogada fora da vez", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["6-1"], ["6-2"]],
      jogadorAtual: 0,
    });
    esperarErro(() => partida.jogar(1, "6-2", "direita"), "FORA_DA_VEZ", /Não é a vez do jogador 1/, ErroPartida);
  });

  test("CT-ERRO-05: recusa jogar, comprar ou passar com a partida encerrada", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["6-1"], ["0-2", "3-4"]],
      jogadorAtual: 0,
    });
    partida.jogar(0, "6-1", "direita");
    expect(partida.status).toBe(STATUS.BATIDA);
    esperarErro(() => partida.jogar(1, "0-2", "esquerda"), "PARTIDA_ENCERRADA", /já foi encerrada/, ErroPartida);
    esperarErro(() => partida.comprar(1), "PARTIDA_ENCERRADA", /já foi encerrada/, ErroPartida);
    esperarErro(() => partida.passar(1), "PARTIDA_ENCERRADA", /já foi encerrada/, ErroPartida);
  });

  test("CT-ERRO-06: recusa outra peça na abertura", () => {
    const partida = partidaComBaralho(
      ["6-6", "0-1", "0-2", "0-3", "0-4", "0-5", "1-2"],
      ["5-5", "1-3", "1-4", "1-5", "2-3", "2-4", "2-5"]
    );
    esperarErro(
      () => partida.jogar(0, "1-2"),
      "ABERTURA_OBRIGATORIA",
      /primeira jogada deve ser a peça \[6\|6\]/,
      ErroPartida
    );
  });

  test("CT-ERRO-07: recusa jogar, comprar ou passar antes de iniciar", () => {
    const partida = new Partida({ seed: 2 });
    esperarErro(() => partida.jogar(0, "6-6"), "NAO_INICIADA", /ainda não foi iniciada/, ErroPartida);
    esperarErro(() => partida.comprar(0), "NAO_INICIADA", /ainda não foi iniciada/, ErroPartida);
    esperarErro(() => partida.passar(0), "NAO_INICIADA", /ainda não foi iniciada/, ErroPartida);
    esperarErro(() => partida.pecasJogaveis(0), "NAO_INICIADA", /ainda não foi iniciada/, ErroPartida);
  });

  test("CT-ERRO-08: recusa argumentos nulos ou jogador inválido", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["6-1"], ["0-0"]],
      jogadorAtual: 0,
    });
    esperarErro(() => partida.jogar(0, null, "direita"), "PECA_INVALIDA", /interpretar a peça/, ErroPeca);
    esperarErro(() => partida.jogar(2, "6-1", "direita"), "JOGADOR_INVALIDO", /Jogador inválido/, ErroPartida);
    esperarErro(() => partida.maoDo(-1), "JOGADOR_INVALIDO", /Jogador inválido/, ErroPartida);
  });

  test("CT-ERRO-09: exige informar a ponta quando a peça casa nos dois lados", () => {
    const partida = partidaEmAndamento({
      mesa: ["2-3", "3-4"],
      maos: [["2-4"], ["0-0"]],
      jogadorAtual: 0,
    });
    expect(partida.pontas()).toEqual({ esquerda: 2, direita: 4 });
    esperarErro(() => partida.jogar(0, "2-4"), "PONTA_OBRIGATORIA", /casa com as duas pontas/, ErroPartida);
  });

  test("CT-ERRO-10: informar seed e rng ao mesmo tempo é rejeitado", () => {
    esperarErro(
      () => new Partida({ seed: 1, rng: () => 0.1 }),
      "ALEATORIEDADE_AMBIGUA",
      /apenas seed ou rng/,
      ErroPartida
    );
  });
});

describe("Compra e passe", () => {
  test("CT-COMPRA-01: se não pode jogar e o monte tem peças, compra 1 e ela vai para a mão", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-2"], ["0-0"]],
      monte: ["3-4", "6-1"],
      jogadorAtual: 0,
    });
    const comprada = partida.comprar(0);
    expect(comprada.id).toBe("3-4");
    expect(partida.maoDo(0).map((p) => p.id)).toEqual(["1-2", "3-4"]);
    expect(partida.monte().map((p) => p.id)).toEqual(["1-6"]);
  });

  test("CT-COMPRA-02: recusa compra quando há peça jogável", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["6-1"], ["0-0"]],
      monte: ["1-2"],
      jogadorAtual: 0,
    });
    expect(partida.podeComprar(0)).toBe(false);
    esperarErro(() => partida.comprar(0), "COMPRA_INVALIDA", /enquanto houver peça jogável/, ErroPartida);
  });

  test("CT-COMPRA-03: recusa compra com o monte vazio", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-2"], ["0-0"]],
      monte: [],
      jogadorAtual: 0,
    });
    esperarErro(() => partida.comprar(0), "MONTE_VAZIO", /monte está vazio/, ErroPartida);
  });

  test("CT-COMPRA-04: após comprar, a vez permanece com o mesmo jogador", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-2"], ["0-0"]],
      monte: ["6-3"],
      jogadorAtual: 0,
    });
    partida.comprar(0);
    expect(partida.jogadorAtual).toBe(0);
    expect(partida.podeJogar(0)).toBe(true);
  });

  test("CT-COMPRA-05: pode comprar várias vezes seguidas até poder jogar", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["0-1"], ["2-3"]],
      monte: ["2-4", "3-5", "0-6"],
      jogadorAtual: 0,
    });
    expect(partida.comprar(0).id).toBe("2-4");
    expect(partida.podeJogar(0)).toBe(false);
    expect(partida.comprar(0).id).toBe("3-5");
    expect(partida.podeJogar(0)).toBe(false);
    expect(partida.comprar(0).id).toBe("0-6");
    expect(partida.podeJogar(0)).toBe(true);
    partida.jogar(0, "0-6", "direita");
    expect(partida.pontas()).toEqual({ esquerda: 6, direita: 0 });
    expect(partida.jogadorAtual).toBe(1);
  });

  test("CT-COMPRA-06: compra a última peça do monte e, se ainda não puder jogar, deve passar", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-2"], ["0-0"]],
      monte: ["3-4"],
      jogadorAtual: 0,
    });
    partida.comprar(0);
    expect(partida.monte()).toHaveLength(0);
    expect(partida.podeJogar(0)).toBe(false);
    expect(partida.podeComprar(0)).toBe(false);
    expect(partida.podePassar(0)).toBe(true);
  });

  test("CT-COMPRA-07: recusa compra na abertura", () => {
    const partida = partidaComBaralho(
      ["6-6", "0-1", "0-2", "0-3", "0-4", "0-5", "1-2"],
      ["5-5", "1-3", "1-4", "1-5", "2-3", "2-4", "2-5"]
    );
    expect(partida.podeComprar(0)).toBe(false);
    esperarErro(() => partida.comprar(0), "COMPRA_INVALIDA", /abertura é obrigatório jogar/, ErroPartida);
  });

  test("CT-PASSE-01: permite passar só se não pode jogar e o monte está vazio", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-2"], ["3-4"]],
      monte: [],
      jogadorAtual: 0,
    });
    expect(partida.podePassar(0)).toBe(true);
    const estado = partida.passar(0);
    expect(estado.jogadorAtual).toBe(1);
    expect(estado.passesConsecutivos).toBe(1);
    expect(estado.status).toBe(STATUS.EM_ANDAMENTO);
  });

  test("CT-PASSE-02: recusa passe quando há peça jogável", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["6-1"], ["0-0"]],
      monte: [],
      jogadorAtual: 0,
    });
    esperarErro(() => partida.passar(0), "PASSE_INVALIDO", /enquanto houver peça jogável/, ErroPartida);
  });

  test("CT-PASSE-03: recusa passe quando o monte ainda tem peças", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-2"], ["0-0"]],
      monte: ["3-3"],
      jogadorAtual: 0,
    });
    expect(partida.podePassar(0)).toBe(false);
    esperarErro(() => partida.passar(0), "PASSE_INVALIDO", /enquanto o monte tiver peças/, ErroPartida);
  });

  test("CT-PASSE-04: após um passe, a vez vai ao oponente", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-2"], ["6-3"]],
      monte: [],
      jogadorAtual: 0,
    });
    partida.passar(0);
    expect(partida.jogadorAtual).toBe(1);
    expect(partida.podeJogar(1)).toBe(true);
  });

  test("CT-PASSE-05: dois passes consecutivos encerram a partida como trancada", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-2"], ["3-4"]],
      monte: [],
      jogadorAtual: 0,
    });
    partida.passar(0);
    const estado = partida.passar(1);
    expect(estado.status).toBe(STATUS.TRANCADO);
    expect(estado.encerrada).toBe(true);
  });

  test("CT-PASSE-06: uma jogada válida zera a sequência de passes", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-2"], ["6-3", "0-4"]],
      monte: [],
      jogadorAtual: 0,
    });
    partida.passar(0);
    expect(partida.passesConsecutivos).toBe(1);
    partida.jogar(1, "6-3", "direita");
    expect(partida.passesConsecutivos).toBe(0);
    expect(partida.status).toBe(STATUS.EM_ANDAMENTO);
  });

  test("CT-PASSE-07: recusa passe na abertura", () => {
    const partida = partidaComBaralho(
      ["6-6", "0-1", "0-2", "0-3", "0-4", "0-5", "1-2"],
      ["5-5", "1-3", "1-4", "1-5", "2-3", "2-4", "2-5"]
    );
    esperarErro(() => partida.passar(0), "PASSE_INVALIDO", /abertura é obrigatório jogar/, ErroPartida);
  });
});

describe("Batida, jogo trancado e pontuação", () => {
  test("CT-BATIDA-01: jogar a última peça vence por batida", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["6-2"], ["1-1", "3-4"]],
      jogadorAtual: 0,
    });
    const estado = partida.jogar(0, "6-2", "direita");
    expect(estado.status).toBe(STATUS.BATIDA);
    expect(estado.vencedor).toBe(0);
    expect(estado.jogadorAtual).toBeNull();
    expect(estado.maos[0]).toHaveLength(0);
  });

  test("CT-BATIDA-02: a pontuação da batida é a soma dos pips da mão do adversário", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["6-1"], ["1-2", "3-3"]],
      jogadorAtual: 0,
    });
    partida.jogar(0, "6-1", "direita");
    // 1+2 + 3+3 = 9
    expect(partida.pontuacao).toEqual({ 0: 9, 1: 0 });
    expect(partida.somaMao(1)).toBe(9);
  });

  test("CT-BATIDA-03: duplos do adversário entram na soma (6-6 vale 12)", () => {
    const partida = partidaEmAndamento({
      mesa: [{ esquerda: 1, direita: 2 }],
      maos: [["2-0"], ["6-6", "5-5"]],
      jogadorAtual: 0,
    });
    partida.jogar(0, "2-0", "direita");
    expect(partida.pontuacao).toEqual({ 0: 22, 1: 0 });
  });

  test("CT-BATIDA-04: batida contra apenas a branca [0-0] vence com 0 pontos", () => {
    const partida = partidaEmAndamento({
      mesa: ["1-1"],
      maos: [["1-3"], ["0-0"]],
      jogadorAtual: 0,
    });
    partida.jogar(0, "1-3", "direita");
    expect(partida.status).toBe(STATUS.BATIDA);
    expect(partida.vencedor).toBe(0);
    expect(partida.pontuacao).toEqual({ 0: 0, 1: 0 });
  });

  test("CT-BATIDA-05: também há batida se a abertura esgota a mão (cenário de teste reduzido)", () => {
    const partida = Partida.criarParaTeste({
      maos: [["6-6"], ["1-2", "3-4"]],
    });
    expect(partida.jogadorAtual).toBe(0);
    const estado = partida.jogar(0, "6-6");
    expect(estado.status).toBe(STATUS.BATIDA);
    expect(estado.vencedor).toBe(0);
    expect(estado.pontuacao).toEqual({ 0: 10, 1: 0 });
  });

  test("CT-TRANCA-01: no jogo trancado, vence quem tem a menor soma na mão", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-2"], ["3-4"]],
      monte: [],
      jogadorAtual: 0,
    });
    partida.passar(0);
    partida.passar(1);
    expect(partida.status).toBe(STATUS.TRANCADO);
    expect(partida.vencedor).toBe(0);
    expect(partida.somaMao(0)).toBe(3);
    expect(partida.somaMao(1)).toBe(7);
  });

  test("CT-TRANCA-02: o vencedor do trancado recebe os pontos da mão do adversário", () => {
    const partida = partidaEmAndamento({
      mesa: ["4-4"],
      maos: [["0-1"], ["5-6"]],
      monte: [],
      jogadorAtual: 0,
    });
    partida.passar(0);
    partida.passar(1);
    expect(partida.pontuacao).toEqual({ 0: 11, 1: 0 });
  });

  test("CT-TRANCA-03: somas iguais resultam em empate, sem vencedor e sem pontos", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-1"], ["0-2"]],
      monte: [],
      jogadorAtual: 0,
    });
    partida.passar(0);
    partida.passar(1);
    expect(partida.status).toBe(STATUS.EMPATE);
    expect(partida.vencedor).toBeNull();
    expect(partida.pontuacao).toEqual({ 0: 0, 1: 0 });
    expect(partida.encerrada).toBe(true);
  });

  test("CT-TRANCA-04: duplos entram corretamente na comparação do trancado", () => {
    const partida = partidaEmAndamento({
      mesa: ["4-4"],
      maos: [["6-6"], ["5-5", "0-1"]],
      monte: [],
      jogadorAtual: 0,
    });
    // 12 vs 11; jogador 1 tem menos pontos
    partida.passar(0);
    partida.passar(1);
    expect(partida.vencedor).toBe(1);
    expect(partida.pontuacao).toEqual({ 0: 0, 1: 12 });
  });

  test("CT-TRANCA-05: 0-0 vence de 0-1 no trancado (0 < 1)", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["0-0"], ["0-1"]],
      monte: [],
      jogadorAtual: 0,
    });
    partida.passar(0);
    partida.passar(1);
    expect(partida.vencedor).toBe(0);
    expect(partida.pontuacao).toEqual({ 0: 1, 1: 0 });
  });
});

describe("Limites, isolamento e partida completa", () => {
  test("CT-LIMITE-01: a mesa cresce nos dois extremos e as pontas permanecem corretas", () => {
    const partida = partidaEmAndamento({
      mesa: ["3-4"],
      maos: [
        ["3-1", "4-6", "0-0"],
        ["1-0", "6-6"],
      ],
      jogadorAtual: 0,
    });
    partida.jogar(0, "3-1", "esquerda");
    partida.jogar(1, "1-0", "esquerda");
    partida.jogar(0, "4-6", "direita");
    partida.jogar(1, "6-6", "direita");
    expect(partida.pontas()).toEqual({ esquerda: 0, direita: 6 });
    expect(partida.mesa()).toHaveLength(5);
  });

  test("CT-LIMITE-02: criarParaTeste monta um cenário controlado de meio de jogo", () => {
    const partida = Partida.criarParaTeste({
      mesa: [
        { esquerda: 2, direita: 5 },
        { esquerda: 5, direita: 5 },
      ],
      maos: [["2-3"], ["5-0"]],
      monte: ["1-1"],
      jogadorAtual: 1,
    });
    expect(partida.status).toBe(STATUS.EM_ANDAMENTO);
    expect(partida.jogadorAtual).toBe(1);
    expect(partida.pontas()).toEqual({ esquerda: 2, direita: 5 });
    expect(partida.monte()[0].id).toBe("1-1");
  });

  test("CT-LIMITE-03: criarParaTeste rejeita peça repetida no estado com código PECA_DUPLICADA", () => {
    esperarErro(
      () =>
        Partida.criarParaTeste({
          mesa: ["6-6"],
          maos: [["6-6"], ["0-1"]],
        }),
      "PECA_DUPLICADA",
      /Peça repetida/,
      ErroPartida
    );
    esperarErro(
      () =>
        Partida.criarParaTeste({
          mesa: ["1-2"],
          maos: [["3-4"], ["0-1"]],
          monte: ["3-4"],
        }),
      "PECA_DUPLICADA",
      /Peça repetida/,
      ErroPartida
    );
    expect(() =>
      Partida.criarParaTeste({
        maos: [["1-1"], ["2-2", "3-3"]],
      })
    ).not.toThrow();
  });

  test("CT-LIMITE-04: consultas de estado devolvem cópias (sem efeito colateral externo)", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["6-1", "0-2"], ["3-3"]],
      monte: ["4-4"],
      jogadorAtual: 0,
    });
    const mao = partida.maoDo(0);
    const monte = partida.monte();
    const mesa = partida.mesa();
    const hist = partida.historico();
    const pontuacao = partida.pontuacao;
    mao.pop();
    monte.pop();
    mesa.pop();
    hist.push({ tipo: "fake" });
    pontuacao[0] = 99;
    expect(partida.maoDo(0)).toHaveLength(2);
    expect(partida.monte()).toHaveLength(1);
    expect(partida.mesa()).toHaveLength(1);
    expect(partida.historico()).toEqual([]);
    expect(partida.pontuacao).toEqual({ 0: 0, 1: 0 });
  });

  test("CT-LIMITE-05: criarParaTeste rejeita mesa desconexa, orientação inválida e número de mãos errado", () => {
    esperarErro(
      () =>
        Partida.criarParaTeste({
          mesa: ["6-6", "1-2"],
          maos: [[], ["0-0"]],
        }),
      "MESA_INVALIDA",
      /não casa com a ponta/,
      ErroPartida
    );
    esperarErro(
      () =>
        Partida.criarParaTeste({
          mesa: [{ esquerda: 6, direita: 5, peca: "4-4" }],
          maos: [[], []],
        }),
      "MESA_INVALIDA",
      /Orientação|Duplo/,
      ErroPartida
    );
    esperarErro(
      () => Partida.criarParaTeste({ maos: [["1-1"]] }),
      "ESTADO_INVALIDO",
      /exatamente 2 mãos/,
      ErroPartida
    );
    esperarErro(
      () => Partida.criarParaTeste({ maos: [[], []], mesa: [] }),
      "MAOS_VAZIAS",
      /Não há peças nas mãos para definir a abertura/,
      ErroPartida
    );
  });

  test("CT-LIMITE-06: partida completa do início à batida, com baralho injetado", () => {
    const partida = partidaComBaralho(
      ["6-6", "5-4", "3-2", "1-0", "0-2", "2-4", "4-6"],
      ["6-5", "4-3", "2-1", "0-3", "3-5", "5-1", "1-3"]
    );
    expect(partida.jogadorAtual).toBe(0);
    partida.jogar(0, "6-6");
    partida.jogar(1, "6-5", "direita");
    partida.jogar(0, "5-4", "direita");
    partida.jogar(1, "4-3", "direita");
    partida.jogar(0, "3-2", "direita");
    partida.jogar(1, "2-1", "direita");
    partida.jogar(0, "1-0", "direita");
    partida.jogar(1, "0-3", "direita");
    partida.jogar(0, "4-6", "esquerda");
    partida.jogar(1, "3-5", "direita");
    partida.jogar(0, "2-4", "esquerda");
    partida.jogar(1, "5-1", "direita");
    const estado = partida.jogar(0, "0-2", "esquerda");
    expect(estado.status).toBe(STATUS.BATIDA);
    expect(estado.vencedor).toBe(0);
    expect(estado.maos[0]).toHaveLength(0);
    expect(estado.maos[1]).toEqual(["1-3"]);
    expect(estado.pontuacao).toEqual({ 0: 4, 1: 0 });
    expect(estado.pontas).toEqual({ esquerda: 0, direita: 1 });
  });

  test("CT-LIMITE-07: o baralho original injetado não é alterado", () => {
    const baralho = baralhoComMaos(
      ["6-6", "0-1", "0-2", "0-3", "0-4", "0-5", "1-2"],
      ["5-5", "1-3", "1-4", "1-5", "2-3", "2-4", "2-5"]
    );
    const idsAntes = baralho.map((p) => p.id);
    const partida = new Partida({ baralho });
    partida.iniciar();
    partida.jogar(0, "6-6");
    expect(baralho.map((p) => p.id)).toEqual(idsAntes);
    expect(baralho).toHaveLength(28);
  });

  test("CT-LIMITE-08: baralho injetado sem embaralhar preserva a ordem; com embaralharBaralho e seed, a ordem muda", () => {
    const mao0 = ["6-6", "0-1", "0-2", "0-3", "0-4", "0-5", "1-2"];
    const mao1 = ["5-5", "1-3", "1-4", "1-5", "2-3", "2-4", "2-5"];
    const baralho = baralhoComMaos(mao0, mao1);
    const fixa = new Partida({ baralho });
    fixa.iniciar();
    expect(fixa.maoDo(0).map((p) => p.id)).toEqual([
      "6-6", "0-1", "0-2", "0-3", "0-4", "0-5", "1-2",
    ]);

    const misturada = new Partida({ baralho, embaralharBaralho: true, seed: 7 });
    misturada.iniciar();
    expect(misturada.maoDo(0).map((p) => p.id)).not.toEqual([
      "6-6", "0-1", "0-2", "0-3", "0-4", "0-5", "1-2",
    ]);
  });
});

describe("Contratos de erro, API e regras confirmadas", () => {
  test("CT-ERRO-11: recusa comprar ou passar fora da vez com código FORA_DA_VEZ", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-2"], ["0-0"]],
      monte: ["3-4"],
      jogadorAtual: 0,
    });
    esperarErro(() => partida.comprar(1), "FORA_DA_VEZ", /Não é a vez do jogador 1/, ErroPartida);
    esperarErro(() => partida.passar(1), "FORA_DA_VEZ", /Não é a vez do jogador 1/, ErroPartida);
  });

  test("CT-ERRO-12: recusa jogar, comprar ou passar após trancado e após empate com código PARTIDA_ENCERRADA", () => {
    const trancada = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-2"], ["3-4"]],
      monte: [],
      jogadorAtual: 0,
    });
    trancada.passar(0);
    trancada.passar(1);
    expect(trancada.status).toBe("trancado");
    esperarErro(() => trancada.jogar(0, "1-2"), "PARTIDA_ENCERRADA", /já foi encerrada \(trancado\)/, ErroPartida);
    esperarErro(() => trancada.comprar(0), "PARTIDA_ENCERRADA", /já foi encerrada/, ErroPartida);
    esperarErro(() => trancada.passar(0), "PARTIDA_ENCERRADA", /já foi encerrada/, ErroPartida);

    const empate = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-1"], ["0-2"]],
      monte: [],
      jogadorAtual: 0,
    });
    empate.passar(0);
    empate.passar(1);
    expect(empate.status).toBe("empate");
    esperarErro(() => empate.jogar(0, "1-1"), "PARTIDA_ENCERRADA", /já foi encerrada \(empate\)/, ErroPartida);
  });

  test("CT-ERRO-13: recusa peça que não casa com nenhuma ponta, com ou sem ponta informada, com código JOGADA_INVALIDA", () => {
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-2"], ["0-0"]],
      jogadorAtual: 0,
    });
    esperarErro(
      () => partida.jogar(0, "1-2"),
      "JOGADA_INVALIDA",
      /não combina com nenhuma ponta/,
      ErroPartida
    );
    esperarErro(
      () => partida.jogar(0, "1-2", "direita"),
      "JOGADA_INVALIDA",
      /não combina com a ponta direita/,
      ErroPartida
    );
  });

  test("CT-COMPRA-08: todas as 14 peças do monte podem ser compradas; não há dorme", () => {
    const monte = [
      "0-0", "0-1", "0-2", "0-3", "0-4", "0-5", "1-2",
      "1-3", "1-4", "1-5", "2-3", "2-4", "2-5", "3-3",
    ];
    expect(monte).toHaveLength(14);
    const partida = partidaEmAndamento({
      mesa: ["6-6"],
      maos: [["1-1"], ["2-2"]],
      monte,
      jogadorAtual: 0,
    });
    for (let i = 0; i < 14; i++) {
      expect(partida.podeComprar(0)).toBe(true);
      partida.comprar(0);
    }
    expect(partida.monte()).toHaveLength(0);
    expect(partida.maoDo(0)).toHaveLength(15);
    expect(partida.podeComprar(0)).toBe(false);
    expect(partida.podePassar(0)).toBe(true);
    expect(partida.jogadorAtual).toBe(0);
  });

  test("CT-API-01: literais de status e pontas e exportações públicas ficam fixos", () => {
    const api = require("../src");
    expect(api.STATUS).toEqual({
      NAO_INICIADA: "nao_iniciada",
      AGUARDANDO_PRIMEIRA: "aguardando_primeira",
      EM_ANDAMENTO: "em_andamento",
      BATIDA: "batida",
      TRANCADO: "trancado",
      EMPATE: "empate",
    });
    expect(api.PONTA).toEqual({
      ESQUERDA: "esquerda",
      DIREITA: "direita",
    });
    expect(api.Peca).toBe(require("../src/peca").Peca);
    expect(api.Partida).toBe(Partida);
    expect(api.ErroPeca).toBe(ErroPeca);
    expect(api.ErroBaralho).toBe(ErroBaralho);
    expect(api.ErroPartida).toBe(ErroPartida);

    const partida = new api.Partida({ seed: 3 });
    expect(partida.status).toBe("nao_iniciada");
    partida.iniciar();
    expect(partida.status).toBe("aguardando_primeira");
    partida.jogar(partida.jogadorAtual, partida.pecaInicialObrigatoria);
    expect(partida.status).toBe("em_andamento");
    expect(Object.keys(partida.pontas()).sort()).toEqual(["direita", "esquerda"]);
  });

});
