/**
 * Batalha Naval — regras do tabuleiro 10x10.
 *
 * Frota (exatamente um de cada):
 *   - Porta-aviões: 5 casas
 *   - Encouraçado: 4 casas
 *   - Submarino: 3 casas
 *   - Destroier ou Hidroavião: 2 casas (apenas um dos dois)
 *
 * Premissas documentadas no README (a especificação do desafio é breve):
 *   - Coordenadas numéricas: linha e coluna de 0 a 9.
 *   - Coordenadas algébricas: "A1" (canto superior esquerdo) até "J10".
 *   - Navios apenas na horizontal ou na vertical (sem diagonal).
 *   - Navios não podem sair do tabuleiro nem se sobrepor.
 *   - Navios adjacentes (lado a lado, sem sobreposição) são permitidos.
 *   - Tiros só são aceitos depois que a frota estiver completa.
 *   - Resultado do tiro: "agua", "acerto" ou "afundado".
 *   - O jogo termina quando todos os navios forem afundados.
 */

const TAMANHO_TABULEIRO = 10;

const TIPOS_NAVIO = Object.freeze({
  PORTA_AVIOES: "porta-avioes",
  ENCOURACADO: "encouracado",
  SUBMARINO: "submarino",
  DESTROIER: "destroier",
  HIDROAVIAO: "hidroaviao",
});

const NAVIOS = Object.freeze({
  [TIPOS_NAVIO.PORTA_AVIOES]: Object.freeze({
    tipo: TIPOS_NAVIO.PORTA_AVIOES,
    nome: "Porta-aviões",
    tamanho: 5,
    grupo: "porta-avioes",
  }),
  [TIPOS_NAVIO.ENCOURACADO]: Object.freeze({
    tipo: TIPOS_NAVIO.ENCOURACADO,
    nome: "Encouraçado",
    tamanho: 4,
    grupo: "encouracado",
  }),
  [TIPOS_NAVIO.SUBMARINO]: Object.freeze({
    tipo: TIPOS_NAVIO.SUBMARINO,
    nome: "Submarino",
    tamanho: 3,
    grupo: "submarino",
  }),
  [TIPOS_NAVIO.DESTROIER]: Object.freeze({
    tipo: TIPOS_NAVIO.DESTROIER,
    nome: "Destroier",
    tamanho: 2,
    grupo: "dois-casas",
  }),
  [TIPOS_NAVIO.HIDROAVIAO]: Object.freeze({
    tipo: TIPOS_NAVIO.HIDROAVIAO,
    nome: "Hidroavião",
    tamanho: 2,
    grupo: "dois-casas",
  }),
});

const GRUPOS_OBRIGATORIOS = Object.freeze([
  "porta-avioes",
  "encouracado",
  "submarino",
  "dois-casas",
]);

const ORIENTACAO = Object.freeze({
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
});

const RESULTADO_TIRO = Object.freeze({
  AGUA: "agua",
  ACERTO: "acerto",
  AFUNDADO: "afundado",
});

const CODIGOS_ERRO = Object.freeze({
  FORA_DO_TABULEIRO: "FORA_DO_TABULEIRO",
  SOBREPOSICAO: "SOBREPOSICAO",
  TIPO_DUPLICADO: "TIPO_DUPLICADO",
  TIPO_INVALIDO: "TIPO_INVALIDO",
  ORIENTACAO_INVALIDA: "ORIENTACAO_INVALIDA",
  FROTA_INCOMPLETA: "FROTA_INCOMPLETA",
  TIRO_REPETIDO: "TIRO_REPETIDO",
  JOGO_FINALIZADO: "JOGO_FINALIZADO",
  POSICIONAMENTO_ENCERRADO: "POSICIONAMENTO_ENCERRADO",
  COORDENADA_INVALIDA: "COORDENADA_INVALIDA",
});

class ErroBatalhaNaval extends Error {
  constructor(mensagem, codigo) {
    super(mensagem);
    this.name = "ErroBatalhaNaval";
    this.codigo = codigo;
  }
}

function ehInteiro(valor) {
  return Number.isInteger(valor);
}

function dentroDoTabuleiro(linha, coluna) {
  return (
    ehInteiro(linha) &&
    ehInteiro(coluna) &&
    linha >= 0 &&
    linha < TAMANHO_TABULEIRO &&
    coluna >= 0 &&
    coluna < TAMANHO_TABULEIRO
  );
}

/**
 * Converte "A1"..."J10" em { linha, coluna }.
 * A=linha 0, J=linha 9; 1=coluna 0, 10=coluna 9.
 */
function parsearCoordenada(entrada) {
  if (entrada && typeof entrada === "object" && !Array.isArray(entrada)) {
    if (!dentroDoTabuleiro(entrada.linha, entrada.coluna)) {
      throw new ErroBatalhaNaval(
        "Coordenada fora do tabuleiro 10x10 (linha e coluna devem estar entre 0 e 9).",
        CODIGOS_ERRO.FORA_DO_TABULEIRO
      );
    }
    return { linha: entrada.linha, coluna: entrada.coluna };
  }

  if (typeof entrada !== "string") {
    throw new ErroBatalhaNaval(
      "Coordenada inválida. Use { linha, coluna } com valores de 0 a 9, ou notação 'A1' a 'J10'.",
      CODIGOS_ERRO.COORDENADA_INVALIDA
    );
  }

  const texto = entrada.trim().toUpperCase();
  const match = texto.match(/^([A-J])([1-9]|10)$/);
  if (!match) {
    throw new ErroBatalhaNaval(
      `Coordenada algébrica inválida: "${entrada}". Use letras A-J e números 1-10 (ex.: A1, J10).`,
      CODIGOS_ERRO.COORDENADA_INVALIDA
    );
  }

  const linha = match[1].charCodeAt(0) - "A".charCodeAt(0);
  const coluna = Number(match[2]) - 1;
  return { linha, coluna };
}

function resolverOrigem(linhaOuCoordenada, colunaTalvez) {
  if (typeof linhaOuCoordenada === "string" || (linhaOuCoordenada && typeof linhaOuCoordenada === "object" && colunaTalvez === undefined)) {
    return parsearCoordenada(linhaOuCoordenada);
  }

  if (!dentroDoTabuleiro(linhaOuCoordenada, colunaTalvez)) {
    throw new ErroBatalhaNaval(
      "Coordenada fora do tabuleiro 10x10 (linha e coluna devem estar entre 0 e 9).",
      CODIGOS_ERRO.FORA_DO_TABULEIRO
    );
  }

  return { linha: linhaOuCoordenada, coluna: colunaTalvez };
}

function obterDefinicaoNavio(tipo) {
  const definicao = NAVIOS[tipo];
  if (!definicao) {
    throw new ErroBatalhaNaval(
      `Tipo de navio inválido: "${tipo}". Use porta-avioes, encouracado, submarino, destroier ou hidroaviao.`,
      CODIGOS_ERRO.TIPO_INVALIDO
    );
  }
  return definicao;
}

function calcularCasas(linha, coluna, orientacao, tamanho) {
  if (orientacao !== ORIENTACAO.HORIZONTAL && orientacao !== ORIENTACAO.VERTICAL) {
    throw new ErroBatalhaNaval(
      `Orientação inválida: "${orientacao}". Use "horizontal" ou "vertical".`,
      CODIGOS_ERRO.ORIENTACAO_INVALIDA
    );
  }

  const casas = [];
  for (let i = 0; i < tamanho; i += 1) {
    const l = orientacao === ORIENTACAO.HORIZONTAL ? linha : linha + i;
    const c = orientacao === ORIENTACAO.HORIZONTAL ? coluna + i : coluna;
    if (!dentroDoTabuleiro(l, c)) {
      throw new ErroBatalhaNaval(
        "O navio ultrapassa os limites do tabuleiro 10x10.",
        CODIGOS_ERRO.FORA_DO_TABULEIRO
      );
    }
    casas.push({ linha: l, coluna: c });
  }
  return casas;
}

class Tabuleiro {
  constructor() {
    this.tamanho = TAMANHO_TABULEIRO;
    this.celulas = Array.from({ length: TAMANHO_TABULEIRO }, () =>
      Array.from({ length: TAMANHO_TABULEIRO }, () => ({
        navioId: null,
        atingida: false,
      }))
    );
    this.navios = [];
    this.tirosRealizados = 0;
    this.finalizado = false;
  }

  frotaCompleta() {
    const presentes = this.navios.reduce((grupos, navio) => {
      grupos[navio.grupo] = true;
      return grupos;
    }, Object.create(null));
    return GRUPOS_OBRIGATORIOS.every(grupo => presentes[grupo] === true);
  }

  naviosRestantes() {
    return this.navios.reduce((total, navio) => total + (navio.afundado ? 0 : 1), 0);
  }

  todosAfundados() {
    return this.frotaCompleta() && this.naviosRestantes() === 0;
  }

  obterCelula(linhaOuCoordenada, colunaTalvez) {
    const { linha, coluna } = resolverOrigem(linhaOuCoordenada, colunaTalvez);
    const celula = this.celulas[linha][coluna];
    const navio = celula.navioId != null ? this._encontrarNavio(celula.navioId) : null;
    return {
      linha,
      coluna,
      atingida: celula.atingida,
      ocupada: celula.navioId != null,
      navio: navio ? { tipo: navio.tipo, nome: navio.nome, tamanho: navio.tamanho } : null,
    };
  }

  /**
   * posicionarNavio(tipo, linha, coluna, orientacao)
   * posicionarNavio(tipo, "A1", orientacao)
   * posicionarNavio(tipo, { linha, coluna }, orientacao)
   */
  posicionarNavio(tipo, linhaOuCoordenada, colunaOuOrientacao, orientacaoTalvez) {
    if (this.tirosRealizados > 0) {
      throw new ErroBatalhaNaval(
        "Não é permitido posicionar navios depois que os tiros começaram.",
        CODIGOS_ERRO.POSICIONAMENTO_ENCERRADO
      );
    }

    const definicao = obterDefinicaoNavio(tipo);
    const jaTemGrupo = this.navios.some((navio) => navio.grupo === definicao.grupo);
    if (jaTemGrupo) {
      const detalhe =
        definicao.grupo === "dois-casas"
          ? "A frota admite apenas um navio de 2 casas (Destroier ou Hidroavião)."
          : `Já existe um ${definicao.nome} no tabuleiro.`;
      throw new ErroBatalhaNaval(detalhe, CODIGOS_ERRO.TIPO_DUPLICADO);
    }

    let origem;
    let orientacao;
    if (typeof linhaOuCoordenada === "string" || (linhaOuCoordenada && typeof linhaOuCoordenada === "object" && linhaOuCoordenada.linha !== undefined)) {
      origem = resolverOrigem(linhaOuCoordenada);
      orientacao = colunaOuOrientacao;
    } else {
      origem = resolverOrigem(linhaOuCoordenada, colunaOuOrientacao);
      orientacao = orientacaoTalvez;
    }

    const casas = calcularCasas(origem.linha, origem.coluna, orientacao, definicao.tamanho);

    for (const casa of casas) {
      if (this.celulas[casa.linha][casa.coluna].navioId != null) {
        throw new ErroBatalhaNaval(
          "Não é permitido sobrepor navios no tabuleiro.",
          CODIGOS_ERRO.SOBREPOSICAO
        );
      }
    }

    const navio = {
      id: this.navios.length + 1,
      tipo: definicao.tipo,
      nome: definicao.nome,
      tamanho: definicao.tamanho,
      grupo: definicao.grupo,
      orientacao,
      casas,
      acertos: 0,
      afundado: false,
    };

    this.navios.push(navio);
    for (const casa of casas) {
      this.celulas[casa.linha][casa.coluna].navioId = navio.id;
    }

    return {
      tipo: navio.tipo,
      nome: navio.nome,
      tamanho: navio.tamanho,
      orientacao: navio.orientacao,
      casas: navio.casas.map((casa) => ({ ...casa })),
    };
  }

  atirar(linhaOuCoordenada, colunaTalvez) {
    if (this.finalizado) {
      throw new ErroBatalhaNaval(
        "O jogo já terminou: todos os navios foram afundados.",
        CODIGOS_ERRO.JOGO_FINALIZADO
      );
    }

    if (!this.frotaCompleta()) {
      throw new ErroBatalhaNaval(
        "Não é possível atirar antes de posicionar a frota completa (4 navios).",
        CODIGOS_ERRO.FROTA_INCOMPLETA
      );
    }

    const { linha, coluna } = resolverOrigem(linhaOuCoordenada, colunaTalvez);
    const celula = this.celulas[linha][coluna];

    if (celula.atingida) {
      throw new ErroBatalhaNaval(
        "Essa célula já foi alvo de um tiro.",
        CODIGOS_ERRO.TIRO_REPETIDO
      );
    }

    celula.atingida = true;
    this.tirosRealizados += 1;

    if (celula.navioId == null) {
      return {
        resultado: RESULTADO_TIRO.AGUA,
        navio: null,
        fimDeJogo: false,
        naviosRestantes: this.naviosRestantes(),
        coordenada: { linha, coluna },
      };
    }

    const navio = this._encontrarNavio(celula.navioId);
    navio.acertos += 1;

    let resultado = RESULTADO_TIRO.ACERTO;
    if (navio.acertos === navio.tamanho) {
      navio.afundado = true;
      resultado = RESULTADO_TIRO.AFUNDADO;
    }

    if (this.todosAfundados()) {
      this.finalizado = true;
    }

    return {
      resultado,
      navio: { tipo: navio.tipo, nome: navio.nome, tamanho: navio.tamanho },
      fimDeJogo: this.finalizado,
      naviosRestantes: this.naviosRestantes(),
      coordenada: { linha, coluna },
    };
  }

  _encontrarNavio(id) {
    return this.navios.find((navio) => navio.id === id) || null;
  }
}

function criarTabuleiro() {
  return new Tabuleiro();
}

module.exports = {
  TAMANHO_TABULEIRO,
  TIPOS_NAVIO,
  NAVIOS,
  ORIENTACAO,
  RESULTADO_TIRO,
  CODIGOS_ERRO,
  ErroBatalhaNaval,
  Tabuleiro,
  criarTabuleiro,
  parsearCoordenada,
};
