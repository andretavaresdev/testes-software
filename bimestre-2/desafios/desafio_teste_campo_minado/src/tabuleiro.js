'use strict';

const { LINHAS, COLUNAS, BOMBAS } = require('./constantes');

function estaDentro(linha, coluna) {
  return Number.isInteger(linha)
    && Number.isInteger(coluna)
    && linha >= 0
    && linha < LINHAS
    && coluna >= 0
    && coluna < COLUNAS;
}

function validarCoordenada(linha, coluna) {
  if (!estaDentro(linha, coluna)) {
    throw new Error(
      `Coordenada inválida: (${linha}, ${coluna}). `
      + `O tabuleiro é ${LINHAS}x${COLUNAS}, com linhas de 0 a ${LINHAS - 1} `
      + `e colunas de 0 a ${COLUNAS - 1}.`,
    );
  }
}

function vizinhos(linha, coluna) {
  validarCoordenada(linha, coluna);
  const deslocamentos = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  return deslocamentos
    .map(([dl, dc]) => ({ linha: linha + dl, coluna: coluna + dc }))
    .filter(p => estaDentro(p.linha, p.coluna));
}

function criarCelulas() {
  const celulas = [];
  for (let linha = 0; linha < LINHAS; linha += 1) {
    const fileira = [];
    for (let coluna = 0; coluna < COLUNAS; coluna += 1) {
      fileira.push({
        linha,
        coluna,
        bomba: false,
        revelada: false,
        bandeira: false,
        adjacentes: 0,
      });
    }
    celulas.push(fileira);
  }
  return celulas;
}

function todasAsPosicoes() {
  const posicoes = [];
  for (let linha = 0; linha < LINHAS; linha += 1) {
    for (let coluna = 0; coluna < COLUNAS; coluna += 1) {
      posicoes.push({ linha, coluna });
    }
  }
  return posicoes;
}

function sortearUnidade(gerador) {
  if (typeof gerador !== 'function') {
    throw new Error('O gerador aleatório deve ser uma função que retorna um número em [0, 1).');
  }
  const unidade = gerador();
  if (typeof unidade !== 'number' || Number.isNaN(unidade) || unidade < 0 || unidade >= 1) {
    throw new Error('O gerador aleatório deve retornar um número em [0, 1).');
  }
  return unidade;
}

function embaralhar(lista, gerador) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(sortearUnidade(gerador) * (i + 1));
    const temporario = copia[i];
    copia[i] = copia[j];
    copia[j] = temporario;
  }
  return copia;
}

function gerarPosicoesAleatorias(gerador = Math.random, quantidade = BOMBAS) {
  if (!Number.isInteger(quantidade) || quantidade < 0 || quantidade > LINHAS * COLUNAS) {
    throw new Error(`Quantidade de bombas inválida: ${quantidade}.`);
  }
  return embaralhar(todasAsPosicoes(), gerador).slice(0, quantidade);
}

function normalizarPosicao(posicao) {
  if (Array.isArray(posicao) && posicao.length === 2) {
    return { linha: posicao[0], coluna: posicao[1] };
  }
  if (posicao && Number.isInteger(posicao.linha) && Number.isInteger(posicao.coluna)) {
    return { linha: posicao.linha, coluna: posicao.coluna };
  }
  throw new Error(`Posição de bomba inválida: ${JSON.stringify(posicao)}.`);
}

function validarPosicoesBombas(posicoes) {
  if (!Array.isArray(posicoes)) {
    throw new Error('As posições das bombas devem ser uma lista.');
  }
  if (posicoes.length !== BOMBAS) {
    throw new Error(`O tabuleiro deve ter exatamente ${BOMBAS} bombas. Recebido: ${posicoes.length}.`);
  }

  const vistas = new Set();
  const normalizadas = posicoes.map(normalizarPosicao);
  for (const { linha, coluna } of normalizadas) {
    validarCoordenada(linha, coluna);
    const chave = `${linha},${coluna}`;
    if (vistas.has(chave)) {
      throw new Error(`Posição de bomba duplicada: (${linha}, ${coluna}).`);
    }
    vistas.add(chave);
  }
  return normalizadas;
}

function limparBombas(celulas) {
  for (const fileira of celulas) {
    for (const celula of fileira) {
      celula.bomba = false;
      celula.adjacentes = 0;
    }
  }
}

function calcularAdjacentes(celulas) {
  celulas.forEach((fileira, l) => fileira.forEach((celula, c) => {
    celula.adjacentes = celula.bomba ? 0 : vizinhos(l, c).reduce(
      (total, p) => total + Number(celulas[p.linha][p.coluna].bomba), 0);
  }));
}

function colocarBombas(celulas, posicoes) {
  const normalizadas = validarPosicoesBombas(posicoes);
  limparBombas(celulas);
  for (const { linha, coluna } of normalizadas) {
    celulas[linha][coluna].bomba = true;
  }
  calcularAdjacentes(celulas);
  return normalizadas;
}

function obterPosicoesBombas(celulas) {
  const posicoes = [];
  for (const fileira of celulas) {
    for (const celula of fileira) {
      if (celula.bomba) {
        posicoes.push({ linha: celula.linha, coluna: celula.coluna });
      }
    }
  }
  return posicoes;
}

function relocacionarBomba(celulas, origem, gerador = Math.random) {
  validarCoordenada(origem.linha, origem.coluna);
  if (!celulas[origem.linha][origem.coluna].bomba) {
    throw new Error(`Não há bomba em (${origem.linha}, ${origem.coluna}) para relocacionar.`);
  }

  const livres = todasAsPosicoes().filter(({ linha, coluna }) => (
    !celulas[linha][coluna].bomba
    && !(linha === origem.linha && coluna === origem.coluna)
  ));

  if (livres.length === 0) {
    throw new Error('Não há célula livre para relocacionar a bomba.');
  }

  const indice = Math.floor(sortearUnidade(gerador) * livres.length);
  const destino = livres[indice];
  celulas[origem.linha][origem.coluna].bomba = false;
  celulas[destino.linha][destino.coluna].bomba = true;
  calcularAdjacentes(celulas);
  return destino;
}

module.exports = {
  estaDentro,
  validarCoordenada,
  vizinhos,
  criarCelulas,
  todasAsPosicoes,
  gerarPosicoesAleatorias,
  normalizarPosicao,
  validarPosicoesBombas,
  calcularAdjacentes,
  colocarBombas,
  obterPosicoesBombas,
  relocacionarBomba,
};
