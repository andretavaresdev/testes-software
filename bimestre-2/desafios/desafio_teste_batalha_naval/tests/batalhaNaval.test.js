const {
  TAMANHO_TABULEIRO,
  TIPOS_NAVIO,
  ORIENTACAO,
  RESULTADO_TIRO,
  CODIGOS_ERRO,
  ErroBatalhaNaval,
  Tabuleiro,
  criarTabuleiro,
  parsearCoordenada,
} = require("../src/batalhaNaval");

/**
 * Frota padrão, sem sobreposição:
 *   Porta-aviões  (5) — A1-A5  horizontal  (0,0)-(0,4)
 *   Encouraçado   (4) — C1-F1  vertical    (2,0)-(5,0)
 *   Submarino     (3) — J8-J10 horizontal  (9,7)-(9,9)
 *   Destroier     (2) — H5-H6  horizontal  (7,4)-(7,5)
 */
function posicionarFrotaPadrao(tabuleiro, navioDeDois = TIPOS_NAVIO.DESTROIER) {
  tabuleiro.posicionarNavio(TIPOS_NAVIO.PORTA_AVIOES, 0, 0, ORIENTACAO.HORIZONTAL);
  tabuleiro.posicionarNavio(TIPOS_NAVIO.ENCOURACADO, 2, 0, ORIENTACAO.VERTICAL);
  tabuleiro.posicionarNavio(TIPOS_NAVIO.SUBMARINO, 9, 7, ORIENTACAO.HORIZONTAL);
  tabuleiro.posicionarNavio(navioDeDois, 7, 4, ORIENTACAO.HORIZONTAL);
  return tabuleiro;
}

function casasDo(tabuleiro, tipo) {
  return tabuleiro.navios.find((navio) => navio.tipo === tipo).casas;
}

function expectErro(fn, codigo) {
  let erro;
  try {
    fn();
  } catch (capturado) {
    erro = capturado;
  }
  expect(erro).toBeInstanceOf(ErroBatalhaNaval);
  expect(erro.codigo).toBe(codigo);
}

describe("Batalha Naval — tabuleiro 10x10", () => {
  describe("CT-01 a CT-03 — criação e consulta do tabuleiro", () => {
    test("CT-01: cria tabuleiro 10x10 vazio, sem navios e com todas as células livres", () => {
      const tabuleiro = criarTabuleiro();

      expect(tabuleiro).toBeInstanceOf(Tabuleiro);
      expect(tabuleiro.tamanho).toBe(TAMANHO_TABULEIRO);
      expect(tabuleiro.navios).toHaveLength(0);
      expect(tabuleiro.frotaCompleta()).toBe(false);

      for (let linha = 0; linha < 10; linha += 1) {
        for (let coluna = 0; coluna < 10; coluna += 1) {
          const celula = tabuleiro.obterCelula(linha, coluna);
          expect(celula.ocupada).toBe(false);
          expect(celula.atingida).toBe(false);
          expect(celula.navio).toBeNull();
        }
      }
    });

    test("CT-02: rejeita consulta de célula com linha inválida (-1)", () => {
      const tabuleiro = criarTabuleiro();
      expectErro(() => tabuleiro.obterCelula(-1, 0), CODIGOS_ERRO.FORA_DO_TABULEIRO);
    });

    test("CT-03: rejeita consulta de célula com coluna inválida (10)", () => {
      const tabuleiro = criarTabuleiro();
      expectErro(() => tabuleiro.obterCelula(0, 10), CODIGOS_ERRO.FORA_DO_TABULEIRO);
    });
  });

  describe("CT-04 a CT-13 — posicionamento válido", () => {
    test("CT-04: posiciona Porta-aviões (5 casas) na horizontal a partir de (0,0)", () => {
      const tabuleiro = criarTabuleiro();
      const navio = tabuleiro.posicionarNavio(
        TIPOS_NAVIO.PORTA_AVIOES,
        0,
        0,
        ORIENTACAO.HORIZONTAL
      );

      expect(navio.nome).toBe("Porta-aviões");
      expect(navio.tamanho).toBe(5);
      expect(navio.casas).toEqual([
        { linha: 0, coluna: 0 },
        { linha: 0, coluna: 1 },
        { linha: 0, coluna: 2 },
        { linha: 0, coluna: 3 },
        { linha: 0, coluna: 4 },
      ]);
      expect(tabuleiro.obterCelula(0, 4).ocupada).toBe(true);
      expect(tabuleiro.obterCelula(0, 5).ocupada).toBe(false);
    });

    test("CT-05: posiciona Encouraçado (4 casas) na vertical a partir de (0,0)", () => {
      const tabuleiro = criarTabuleiro();
      const navio = tabuleiro.posicionarNavio(
        TIPOS_NAVIO.ENCOURACADO,
        0,
        0,
        ORIENTACAO.VERTICAL
      );

      expect(navio.nome).toBe("Encouraçado");
      expect(navio.tamanho).toBe(4);
      expect(navio.casas).toEqual([
        { linha: 0, coluna: 0 },
        { linha: 1, coluna: 0 },
        { linha: 2, coluna: 0 },
        { linha: 3, coluna: 0 },
      ]);
    });

    test("CT-06: posiciona Submarino (3 casas) na horizontal", () => {
      const tabuleiro = criarTabuleiro();
      const navio = tabuleiro.posicionarNavio(
        TIPOS_NAVIO.SUBMARINO,
        5,
        5,
        ORIENTACAO.HORIZONTAL
      );

      expect(navio.nome).toBe("Submarino");
      expect(navio.tamanho).toBe(3);
      expect(navio.casas).toHaveLength(3);
    });

    test("CT-07: posiciona Destroier (2 casas) na horizontal", () => {
      const tabuleiro = criarTabuleiro();
      const navio = tabuleiro.posicionarNavio(
        TIPOS_NAVIO.DESTROIER,
        9,
        0,
        ORIENTACAO.HORIZONTAL
      );

      expect(navio.nome).toBe("Destroier");
      expect(navio.tamanho).toBe(2);
      expect(navio.casas).toEqual([
        { linha: 9, coluna: 0 },
        { linha: 9, coluna: 1 },
      ]);
    });

    test("CT-08: posiciona Hidroavião (2 casas) no lugar do Destroier", () => {
      const tabuleiro = criarTabuleiro();
      const navio = tabuleiro.posicionarNavio(
        TIPOS_NAVIO.HIDROAVIAO,
        4,
        8,
        ORIENTACAO.VERTICAL
      );

      expect(navio.nome).toBe("Hidroavião");
      expect(navio.tamanho).toBe(2);
      expect(navio.casas).toEqual([
        { linha: 4, coluna: 8 },
        { linha: 5, coluna: 8 },
      ]);
    });

    test("CT-09: posiciona os 4 navios da frota e marca a frota como completa", () => {
      const tabuleiro = criarTabuleiro();
      expect(tabuleiro.frotaCompleta()).toBe(false);

      posicionarFrotaPadrao(tabuleiro);

      expect(tabuleiro.navios).toHaveLength(4);
      expect(tabuleiro.frotaCompleta()).toBe(true);
      expect(tabuleiro.naviosRestantes()).toBe(4);
    });

    test("CT-10: permite navios adjacentes, desde que não haja sobreposição", () => {
      const tabuleiro = criarTabuleiro();
      tabuleiro.posicionarNavio(TIPOS_NAVIO.PORTA_AVIOES, 0, 0, ORIENTACAO.HORIZONTAL);
      // Encouraçado imediatamente abaixo do Porta-aviões (linha 1, mesmas colunas parciais)
      const encouracado = tabuleiro.posicionarNavio(
        TIPOS_NAVIO.ENCOURACADO,
        1,
        0,
        ORIENTACAO.HORIZONTAL
      );

      expect(encouracado.casas[0]).toEqual({ linha: 1, coluna: 0 });
      expect(tabuleiro.obterCelula(0, 0).ocupada).toBe(true);
      expect(tabuleiro.obterCelula(1, 0).ocupada).toBe(true);
    });

    test("CT-11: Porta-aviões cabe exatamente no limite direito (0,5) horizontal", () => {
      const tabuleiro = criarTabuleiro();
      const navio = tabuleiro.posicionarNavio(
        TIPOS_NAVIO.PORTA_AVIOES,
        0,
        5,
        ORIENTACAO.HORIZONTAL
      );

      expect(navio.casas[4]).toEqual({ linha: 0, coluna: 9 });
      expect(tabuleiro.obterCelula(0, 9).ocupada).toBe(true);
    });

    test("CT-12: Encouraçado cabe exatamente no limite inferior (6,0) vertical", () => {
      const tabuleiro = criarTabuleiro();
      const navio = tabuleiro.posicionarNavio(
        TIPOS_NAVIO.ENCOURACADO,
        6,
        0,
        ORIENTACAO.VERTICAL
      );

      expect(navio.casas[3]).toEqual({ linha: 9, coluna: 0 });
    });

    test("CT-13: Destroier cabe no canto inferior direito (9,8) horizontal", () => {
      const tabuleiro = criarTabuleiro();
      const navio = tabuleiro.posicionarNavio(
        TIPOS_NAVIO.DESTROIER,
        9,
        8,
        ORIENTACAO.HORIZONTAL
      );

      expect(navio.casas).toEqual([
        { linha: 9, coluna: 8 },
        { linha: 9, coluna: 9 },
      ]);
    });
  });

  describe("CT-14 a CT-19 — limites inválidos no posicionamento", () => {
    test("CT-14: rejeita Porta-aviões horizontal em (0,6), que ultrapassa a coluna 9", () => {
      const tabuleiro = criarTabuleiro();
      expectErro(
        () => tabuleiro.posicionarNavio(TIPOS_NAVIO.PORTA_AVIOES, 0, 6, ORIENTACAO.HORIZONTAL),
        CODIGOS_ERRO.FORA_DO_TABULEIRO
      );
      expect(tabuleiro.navios).toHaveLength(0);
    });

    test("CT-15: rejeita Submarino vertical em (8,0), que ultrapassa a linha 9", () => {
      const tabuleiro = criarTabuleiro();
      expectErro(
        () => tabuleiro.posicionarNavio(TIPOS_NAVIO.SUBMARINO, 8, 0, ORIENTACAO.VERTICAL),
        CODIGOS_ERRO.FORA_DO_TABULEIRO
      );
    });

    test("CT-16: rejeita linha inicial negativa", () => {
      const tabuleiro = criarTabuleiro();
      expectErro(
        () => tabuleiro.posicionarNavio(TIPOS_NAVIO.DESTROIER, -1, 0, ORIENTACAO.HORIZONTAL),
        CODIGOS_ERRO.FORA_DO_TABULEIRO
      );
    });

    test("CT-17: rejeita coluna inicial negativa", () => {
      const tabuleiro = criarTabuleiro();
      expectErro(
        () => tabuleiro.posicionarNavio(TIPOS_NAVIO.DESTROIER, 0, -1, ORIENTACAO.HORIZONTAL),
        CODIGOS_ERRO.FORA_DO_TABULEIRO
      );
    });

    test("CT-18: rejeita linha inicial 10 (fora do tabuleiro)", () => {
      const tabuleiro = criarTabuleiro();
      expectErro(
        () => tabuleiro.posicionarNavio(TIPOS_NAVIO.DESTROIER, 10, 0, ORIENTACAO.HORIZONTAL),
        CODIGOS_ERRO.FORA_DO_TABULEIRO
      );
    });

    test("CT-19: rejeita coluna inicial 10 (fora do tabuleiro)", () => {
      const tabuleiro = criarTabuleiro();
      expectErro(
        () => tabuleiro.posicionarNavio(TIPOS_NAVIO.DESTROIER, 0, 10, ORIENTACAO.VERTICAL),
        CODIGOS_ERRO.FORA_DO_TABULEIRO
      );
    });
  });

  describe("CT-20 a CT-26 — sobreposição e regras da frota", () => {
    test("CT-20: rejeita sobreposição parcial de dois navios", () => {
      const tabuleiro = criarTabuleiro();
      tabuleiro.posicionarNavio(TIPOS_NAVIO.PORTA_AVIOES, 0, 0, ORIENTACAO.HORIZONTAL);

      // Encouraçado vertical atravessa a casa (0,2) já ocupada pelo Porta-aviões
      expectErro(
        () => tabuleiro.posicionarNavio(TIPOS_NAVIO.ENCOURACADO, 0, 2, ORIENTACAO.VERTICAL),
        CODIGOS_ERRO.SOBREPOSICAO
      );
      expect(tabuleiro.navios).toHaveLength(1);
    });

    test("CT-21: rejeita sobreposição total (mesmo ponto de origem e direção)", () => {
      const tabuleiro = criarTabuleiro();
      tabuleiro.posicionarNavio(TIPOS_NAVIO.SUBMARINO, 3, 3, ORIENTACAO.HORIZONTAL);

      expectErro(
        () => tabuleiro.posicionarNavio(TIPOS_NAVIO.DESTROIER, 3, 3, ORIENTACAO.HORIZONTAL),
        CODIGOS_ERRO.SOBREPOSICAO
      );
    });

    test("CT-22: rejeita um segundo Porta-aviões (só pode haver um)", () => {
      const tabuleiro = criarTabuleiro();
      tabuleiro.posicionarNavio(TIPOS_NAVIO.PORTA_AVIOES, 0, 0, ORIENTACAO.HORIZONTAL);

      expectErro(
        () => tabuleiro.posicionarNavio(TIPOS_NAVIO.PORTA_AVIOES, 5, 0, ORIENTACAO.HORIZONTAL),
        CODIGOS_ERRO.TIPO_DUPLICADO
      );
    });

    test("CT-23: rejeita Destroier e Hidroavião juntos (apenas um navio de 2 casas)", () => {
      const tabuleiro = criarTabuleiro();
      tabuleiro.posicionarNavio(TIPOS_NAVIO.DESTROIER, 0, 0, ORIENTACAO.HORIZONTAL);

      expectErro(
        () => tabuleiro.posicionarNavio(TIPOS_NAVIO.HIDROAVIAO, 5, 5, ORIENTACAO.HORIZONTAL),
        CODIGOS_ERRO.TIPO_DUPLICADO
      );
    });

    test("CT-24: rejeita tipo de navio desconhecido", () => {
      const tabuleiro = criarTabuleiro();

      expectErro(
        () => tabuleiro.posicionarNavio("cruzador", 0, 0, ORIENTACAO.HORIZONTAL),
        CODIGOS_ERRO.TIPO_INVALIDO
      );
    });

    test("CT-25: rejeita orientação inválida (diagonal ou texto desconhecido)", () => {
      const tabuleiro = criarTabuleiro();

      expectErro(
        () => tabuleiro.posicionarNavio(TIPOS_NAVIO.SUBMARINO, 0, 0, "diagonal"),
        CODIGOS_ERRO.ORIENTACAO_INVALIDA
      );
    });

    test("CT-26: frotaCompleta() permanece falsa com menos de 4 navios", () => {
      const tabuleiro = criarTabuleiro();
      tabuleiro.posicionarNavio(TIPOS_NAVIO.PORTA_AVIOES, 0, 0, ORIENTACAO.HORIZONTAL);
      tabuleiro.posicionarNavio(TIPOS_NAVIO.ENCOURACADO, 2, 0, ORIENTACAO.VERTICAL);
      tabuleiro.posicionarNavio(TIPOS_NAVIO.SUBMARINO, 9, 7, ORIENTACAO.HORIZONTAL);

      expect(tabuleiro.navios).toHaveLength(3);
      expect(tabuleiro.frotaCompleta()).toBe(false);
    });
  });

  describe("CT-27 a CT-33 — tiros válidos (água, acerto, afundado e fim de jogo)", () => {
    test("CT-27: tiro em célula vazia retorna água e não encerra o jogo", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());
      const tiro = tabuleiro.atirar(0, 9);

      expect(tiro.resultado).toBe(RESULTADO_TIRO.AGUA);
      expect(tiro.navio).toBeNull();
      expect(tiro.fimDeJogo).toBe(false);
      expect(tiro.naviosRestantes).toBe(4);
      expect(tabuleiro.obterCelula(0, 9).atingida).toBe(true);
    });

    test("CT-28: tiro em navio que ainda tem casas intactas retorna acerto", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());
      const tiro = tabuleiro.atirar(0, 0);

      expect(tiro.resultado).toBe(RESULTADO_TIRO.ACERTO);
      expect(tiro.navio.tipo).toBe(TIPOS_NAVIO.PORTA_AVIOES);
      expect(tiro.navio.nome).toBe("Porta-aviões");
      expect(tiro.fimDeJogo).toBe(false);
      expect(tiro.naviosRestantes).toBe(4);
    });

    test("CT-29: último tiro em um navio retorna afundado e identifica o navio", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());
      const casas = casasDo(tabuleiro, TIPOS_NAVIO.DESTROIER);

      const primeiro = tabuleiro.atirar(casas[0].linha, casas[0].coluna);
      expect(primeiro.resultado).toBe(RESULTADO_TIRO.ACERTO);

      const segundo = tabuleiro.atirar(casas[1].linha, casas[1].coluna);
      expect(segundo.resultado).toBe(RESULTADO_TIRO.AFUNDADO);
      expect(segundo.navio.nome).toBe("Destroier");
      expect(segundo.fimDeJogo).toBe(false);
      expect(segundo.naviosRestantes).toBe(3);
    });

    test("CT-30: afundar um navio não encerra o jogo enquanto houver outros flutuando", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());

      for (const casa of casasDo(tabuleiro, TIPOS_NAVIO.SUBMARINO)) {
        tabuleiro.atirar(casa.linha, casa.coluna);
      }

      expect(tabuleiro.finalizado).toBe(false);
      expect(tabuleiro.todosAfundados()).toBe(false);
      expect(tabuleiro.naviosRestantes()).toBe(3);
    });

    test("CT-31: afundar todos os navios encerra o jogo (fimDeJogo verdadeiro)", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());
      const todasAsCasas = tabuleiro.navios.flatMap((navio) => navio.casas);
      const ultima = todasAsCasas[todasAsCasas.length - 1];
      const anteriores = todasAsCasas.slice(0, -1);

      for (const casa of anteriores) {
        const tiro = tabuleiro.atirar(casa.linha, casa.coluna);
        expect(tiro.fimDeJogo).toBe(false);
      }

      const tiroFinal = tabuleiro.atirar(ultima.linha, ultima.coluna);
      expect(tiroFinal.resultado).toBe(RESULTADO_TIRO.AFUNDADO);
      expect(tiroFinal.fimDeJogo).toBe(true);
      expect(tiroFinal.naviosRestantes).toBe(0);
      expect(tabuleiro.finalizado).toBe(true);
      expect(tabuleiro.todosAfundados()).toBe(true);
    });

    test("CT-32: aceita tiro no canto superior esquerdo (0,0)", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());
      const tiro = tabuleiro.atirar(0, 0);

      expect(tiro.coordenada).toEqual({ linha: 0, coluna: 0 });
      expect(tiro.resultado).toBe(RESULTADO_TIRO.ACERTO);
    });

    test("CT-33: aceita tiro no canto inferior direito (9,9)", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());
      const tiro = tabuleiro.atirar(9, 9);

      expect(tiro.coordenada).toEqual({ linha: 9, coluna: 9 });
      expect(tiro.resultado).toBe(RESULTADO_TIRO.ACERTO);
      expect(tiro.navio.tipo).toBe(TIPOS_NAVIO.SUBMARINO);
    });
  });

  describe("CT-34 a CT-40 — tiros inválidos e regras de estado", () => {
    test("CT-34: rejeita tiro com linha -1 (fora do tabuleiro)", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());

      expectErro(() => tabuleiro.atirar(-1, 0), CODIGOS_ERRO.FORA_DO_TABULEIRO);
    });

    test("CT-35: rejeita tiro com coluna 10 (fora do tabuleiro)", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());

      expectErro(() => tabuleiro.atirar(0, 10), CODIGOS_ERRO.FORA_DO_TABULEIRO);
    });

    test("CT-36: rejeita tiro repetido na mesma célula que já foi água", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());
      tabuleiro.atirar(1, 9);

      expectErro(() => tabuleiro.atirar(1, 9), CODIGOS_ERRO.TIRO_REPETIDO);
    });

    test("CT-37: rejeita tiro repetido na mesma célula que já foi acerto", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());
      tabuleiro.atirar(0, 0);

      expectErro(() => tabuleiro.atirar(0, 0), CODIGOS_ERRO.TIRO_REPETIDO);
    });

    test("CT-38: rejeita tiro antes da frota estar completa", () => {
      const tabuleiro = criarTabuleiro();
      tabuleiro.posicionarNavio(TIPOS_NAVIO.PORTA_AVIOES, 0, 0, ORIENTACAO.HORIZONTAL);

      expectErro(() => tabuleiro.atirar(0, 0), CODIGOS_ERRO.FROTA_INCOMPLETA);
    });

    test("CT-39: rejeita posicionar navio depois que os tiros começaram", () => {
      const tabuleiro = criarTabuleiro();
      tabuleiro.posicionarNavio(TIPOS_NAVIO.PORTA_AVIOES, 0, 0, ORIENTACAO.HORIZONTAL);
      tabuleiro.posicionarNavio(TIPOS_NAVIO.ENCOURACADO, 2, 0, ORIENTACAO.VERTICAL);
      tabuleiro.posicionarNavio(TIPOS_NAVIO.SUBMARINO, 9, 7, ORIENTACAO.HORIZONTAL);
      tabuleiro.posicionarNavio(TIPOS_NAVIO.DESTROIER, 7, 4, ORIENTACAO.HORIZONTAL);
      tabuleiro.atirar(5, 5);

      // tentativa inválida: a frota já está completa e o jogo já começou
      expectErro(
        () => tabuleiro.posicionarNavio(TIPOS_NAVIO.SUBMARINO, 4, 4, ORIENTACAO.HORIZONTAL),
        CODIGOS_ERRO.POSICIONAMENTO_ENCERRADO
      );
    });

    test("CT-40: rejeita novos tiros depois que o jogo terminou", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());
      for (const casa of tabuleiro.navios.flatMap((navio) => navio.casas)) {
        tabuleiro.atirar(casa.linha, casa.coluna);
      }
      expect(tabuleiro.finalizado).toBe(true);

      expectErro(() => tabuleiro.atirar(1, 1), CODIGOS_ERRO.JOGO_FINALIZADO);
    });
  });

  describe("CT-41 a CT-45 — partida completa, contagem e notação algébrica", () => {
    test("CT-41: sequência completa — água, acertos, um navio afundado e depois fim de jogo", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());

      const agua = tabuleiro.atirar("B10");
      expect(agua.resultado).toBe(RESULTADO_TIRO.AGUA);

      const acerto = tabuleiro.atirar("A1");
      expect(acerto.resultado).toBe(RESULTADO_TIRO.ACERTO);
      expect(acerto.navio.nome).toBe("Porta-aviões");

      const destroier = casasDo(tabuleiro, TIPOS_NAVIO.DESTROIER);
      tabuleiro.atirar(destroier[0].linha, destroier[0].coluna);
      const afundado = tabuleiro.atirar(destroier[1].linha, destroier[1].coluna);
      expect(afundado.resultado).toBe(RESULTADO_TIRO.AFUNDADO);
      expect(afundado.fimDeJogo).toBe(false);
      expect(afundado.naviosRestantes).toBe(3);

      const restantes = tabuleiro.navios
        .filter((navio) => navio.tipo !== TIPOS_NAVIO.DESTROIER)
        .flatMap((navio) => navio.casas)
        .filter((casa) => !(casa.linha === 0 && casa.coluna === 0));

      const ultimo = restantes[restantes.length - 1];
      for (const casa of restantes.slice(0, -1)) {
        tabuleiro.atirar(casa.linha, casa.coluna);
      }

      const final = tabuleiro.atirar(ultimo.linha, ultimo.coluna);
      expect(final.resultado).toBe(RESULTADO_TIRO.AFUNDADO);
      expect(final.fimDeJogo).toBe(true);
      expect(final.naviosRestantes).toBe(0);
    });

    test("CT-42: a contagem de navios restantes só diminui ao afundar, não no acerto parcial", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());
      expect(tabuleiro.naviosRestantes()).toBe(4);

      tabuleiro.atirar(0, 0);
      tabuleiro.atirar(0, 1);
      expect(tabuleiro.naviosRestantes()).toBe(4);

      for (const casa of casasDo(tabuleiro, TIPOS_NAVIO.DESTROIER)) {
        tabuleiro.atirar(casa.linha, casa.coluna);
      }
      expect(tabuleiro.naviosRestantes()).toBe(3);
    });

    test("CT-43: célula atingida fica marcada; células não atingidas não revelam tiro", () => {
      const tabuleiro = posicionarFrotaPadrao(criarTabuleiro());
      tabuleiro.atirar(0, 0);

      expect(tabuleiro.obterCelula(0, 0).atingida).toBe(true);
      expect(tabuleiro.obterCelula(0, 1).atingida).toBe(false);
      expect(tabuleiro.obterCelula(0, 1).ocupada).toBe(true);
    });

    test("CT-44: aceita coordenadas algébricas de A1 até J10 no posicionamento e no tiro", () => {
      expect(parsearCoordenada("A1")).toEqual({ linha: 0, coluna: 0 });
      expect(parsearCoordenada("J10")).toEqual({ linha: 9, coluna: 9 });
      expect(parsearCoordenada("c3")).toEqual({ linha: 2, coluna: 2 });

      const tabuleiro = criarTabuleiro();
      const navio = tabuleiro.posicionarNavio(
        TIPOS_NAVIO.PORTA_AVIOES,
        "A1",
        ORIENTACAO.HORIZONTAL
      );
      expect(navio.casas[0]).toEqual({ linha: 0, coluna: 0 });

      tabuleiro.posicionarNavio(TIPOS_NAVIO.ENCOURACADO, "C1", ORIENTACAO.VERTICAL);
      tabuleiro.posicionarNavio(TIPOS_NAVIO.SUBMARINO, "J8", ORIENTACAO.HORIZONTAL);
      tabuleiro.posicionarNavio(TIPOS_NAVIO.HIDROAVIAO, "H5", ORIENTACAO.HORIZONTAL);

      const tiro = tabuleiro.atirar("J10");
      expect(tiro.resultado).toBe(RESULTADO_TIRO.ACERTO);
      expect(tiro.navio.tipo).toBe(TIPOS_NAVIO.SUBMARINO);
    });

    test("CT-45: rejeita coordenada algébrica inválida (K1, A0, A11 ou texto vazio)", () => {
      const invalidas = ["K1", "A0", "A11", "", "AA1", "1A"];
      for (const coordenada of invalidas) {
        expectErro(() => parsearCoordenada(coordenada), CODIGOS_ERRO.COORDENADA_INVALIDA);
      }
    });
  });

  describe("CT-46 a CT-48 — coordenadas no formato objeto { linha, coluna }", () => {
    test("CT-46: posiciona navios usando objeto { linha, coluna } como origem", () => {
      const tabuleiro = criarTabuleiro();
      const portaAvioes = tabuleiro.posicionarNavio(
        TIPOS_NAVIO.PORTA_AVIOES,
        { linha: 0, coluna: 0 },
        ORIENTACAO.HORIZONTAL
      );
      const encouracado = tabuleiro.posicionarNavio(
        TIPOS_NAVIO.ENCOURACADO,
        { linha: 2, coluna: 0 },
        ORIENTACAO.VERTICAL
      );

      expect(portaAvioes.casas).toEqual([
        { linha: 0, coluna: 0 },
        { linha: 0, coluna: 1 },
        { linha: 0, coluna: 2 },
        { linha: 0, coluna: 3 },
        { linha: 0, coluna: 4 },
      ]);
      expect(encouracado.casas).toEqual([
        { linha: 2, coluna: 0 },
        { linha: 3, coluna: 0 },
        { linha: 4, coluna: 0 },
        { linha: 5, coluna: 0 },
      ]);
      expect(tabuleiro.obterCelula({ linha: 0, coluna: 4 }).ocupada).toBe(true);
      expect(tabuleiro.obterCelula({ linha: 5, coluna: 0 }).navio.nome).toBe("Encouraçado");
    });

    test("CT-47: atira usando objeto { linha, coluna } e distingue água de acerto", () => {
      const tabuleiro = criarTabuleiro();
      tabuleiro.posicionarNavio(TIPOS_NAVIO.PORTA_AVIOES, { linha: 0, coluna: 0 }, ORIENTACAO.HORIZONTAL);
      tabuleiro.posicionarNavio(TIPOS_NAVIO.ENCOURACADO, { linha: 2, coluna: 0 }, ORIENTACAO.VERTICAL);
      tabuleiro.posicionarNavio(TIPOS_NAVIO.SUBMARINO, { linha: 9, coluna: 7 }, ORIENTACAO.HORIZONTAL);
      tabuleiro.posicionarNavio(TIPOS_NAVIO.DESTROIER, { linha: 7, coluna: 4 }, ORIENTACAO.HORIZONTAL);

      const agua = tabuleiro.atirar({ linha: 0, coluna: 9 });
      expect(agua.resultado).toBe(RESULTADO_TIRO.AGUA);
      expect(agua.navio).toBeNull();
      expect(agua.coordenada).toEqual({ linha: 0, coluna: 9 });
      expect(tabuleiro.obterCelula({ linha: 0, coluna: 9 }).atingida).toBe(true);

      const acerto = tabuleiro.atirar({ linha: 0, coluna: 0 });
      expect(acerto.resultado).toBe(RESULTADO_TIRO.ACERTO);
      expect(acerto.navio.nome).toBe("Porta-aviões");
      expect(acerto.coordenada).toEqual({ linha: 0, coluna: 0 });
      expect(acerto.fimDeJogo).toBe(false);
    });

    test("CT-48: rejeita objeto { linha, coluna } fora do tabuleiro no parse, na consulta, no posicionamento e no tiro", () => {
      const tabuleiro = criarTabuleiro();

      expect(parsearCoordenada({ linha: 0, coluna: 0 })).toEqual({ linha: 0, coluna: 0 });
      expect(parsearCoordenada({ linha: 9, coluna: 9 })).toEqual({ linha: 9, coluna: 9 });

      expectErro(
        () => parsearCoordenada({ linha: -1, coluna: 0 }),
        CODIGOS_ERRO.FORA_DO_TABULEIRO
      );
      expectErro(
        () => tabuleiro.obterCelula({ linha: 0, coluna: 10 }),
        CODIGOS_ERRO.FORA_DO_TABULEIRO
      );
      expectErro(
        () => tabuleiro.posicionarNavio(TIPOS_NAVIO.DESTROIER, { linha: 10, coluna: 0 }, ORIENTACAO.HORIZONTAL),
        CODIGOS_ERRO.FORA_DO_TABULEIRO
      );

      posicionarFrotaPadrao(tabuleiro);
      expectErro(
        () => tabuleiro.atirar({ linha: 0, coluna: -1 }),
        CODIGOS_ERRO.FORA_DO_TABULEIRO
      );
    });
  });
});
