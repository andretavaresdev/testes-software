'use strict';

const { LINHAS, COLUNAS, BOMBAS, CELULAS_SEGURAS, ESTADO } = require('./constantes');
const tabuleiro = require('./tabuleiro');

class JogoCampoMinado {
  /**
   * @param {object} [opcoes]
   * @param {Array} [opcoes.posicoesBombas] Lista de 40 posições ([linha, coluna] ou {linha, coluna}).
   * @param {Function} [opcoes.geradorAleatorio] Função que retorna um número em [0, 1).
   * @param {boolean} [opcoes.protegerPrimeiroClique] Se true, o primeiro clique nunca cai em bomba.
   *        Padrão: true quando as bombas são aleatórias; false quando as posições são injetadas.
   */
  constructor(opcoes = {}) {
    const {
      posicoesBombas,
      geradorAleatorio = Math.random,
      protegerPrimeiroClique = posicoesBombas == null,
    } = opcoes;

    this.geradorAleatorio = geradorAleatorio;
    this.protegerPrimeiroClique = protegerPrimeiroClique;
    this.celulas = tabuleiro.criarCelulas();
    this.estado = ESTADO.EM_ANDAMENTO;
    this.primeiroClique = true;
    this.explodida = null;

    const posicionamento = posicoesBombas
      ?? tabuleiro.gerarPosicoesAleatorias(this.geradorAleatorio, BOMBAS);
    tabuleiro.colocarBombas(this.celulas, posicionamento);
  }

  get linhas() {
    return LINHAS;
  }

  get colunas() {
    return COLUNAS;
  }

  get totalBombas() {
    return BOMBAS;
  }

  get bombasRestantes() {
    let bandeiras = 0;
    for (const fileira of this.celulas) {
      for (const celula of fileira) {
        if (celula.bandeira) bandeiras += 1;
      }
    }
    return BOMBAS - bandeiras;
  }

  get totalReveladas() {
    let total = 0;
    for (const fileira of this.celulas) {
      for (const celula of fileira) {
        if (celula.revelada) total += 1;
      }
    }
    return total;
  }

  get totalBandeiras() {
    return BOMBAS - this.bombasRestantes;
  }

  #garantirEmAndamento(acao) {
    if (this.estado !== ESTADO.EM_ANDAMENTO) {
      throw new Error(`Não é possível ${acao}: o jogo já terminou com ${this.estado}.`);
    }
  }

  #protegerSeNecessario(linha, coluna) {
    if (!this.protegerPrimeiroClique || !this.primeiroClique) {
      return;
    }
    if (this.celulas[linha][coluna].bomba) {
      tabuleiro.relocacionarBomba(
        this.celulas,
        { linha, coluna },
        this.geradorAleatorio,
      );
    }
  }

  /**
   * Visão do jogador: bomba e adjacentes só aparecem se a célula
   * já foi revelada ou se a partida terminou.
   */
  celula(linha, coluna) {
    tabuleiro.validarCoordenada(linha, coluna);
    const atual = this.celulas[linha][coluna];
    const visivel = atual.revelada || this.estado !== ESTADO.EM_ANDAMENTO;
    return {
      linha: atual.linha,
      coluna: atual.coluna,
      revelada: atual.revelada,
      bandeira: atual.bandeira,
      adjacentes: visivel && !atual.bomba ? atual.adjacentes : null,
      bomba: visivel ? atual.bomba : null,
      explodida: Boolean(
        this.explodida
        && this.explodida.linha === linha
        && this.explodida.coluna === coluna,
      ),
    };
  }

  /**
   * Visão completa da célula, inclusive com bomba oculta.
   * Destinada aos testes, não ao jogador.
   */
  inspecionar(linha, coluna) {
    tabuleiro.validarCoordenada(linha, coluna);
    const atual = this.celulas[linha][coluna];
    return {
      linha: atual.linha,
      coluna: atual.coluna,
      bomba: atual.bomba,
      revelada: atual.revelada,
      bandeira: atual.bandeira,
      adjacentes: atual.adjacentes,
    };
  }

  obterPosicoesBombas() {
    return tabuleiro.obterPosicoesBombas(this.celulas);
  }

  revelar(linha, coluna) {
    tabuleiro.validarCoordenada(linha, coluna);
    this.#garantirEmAndamento('revelar uma célula');

    const atual = this.celulas[linha][coluna];
    if (atual.revelada) {
      return this.#resposta(false, 'celula_ja_revelada', []);
    }
    if (atual.bandeira) {
      return this.#resposta(false, 'celula_com_bandeira', []);
    }

    // A proteção só vale para um clique que de fato abre uma célula.
    // Tentar revelar uma casa já aberta ou com bandeira não relocaciona
    // bomba nem consome o primeiro clique.
    this.#protegerSeNecessario(linha, coluna);
    this.primeiroClique = false;

    if (atual.bomba) {
      atual.revelada = true;
      this.estado = ESTADO.DERROTA;
      this.explodida = { linha, coluna };
      return this.#resposta(true, null, [this.#snapshot(atual)], this.explodida);
    }

    const reveladas = [];
    this.#expandir(linha, coluna, reveladas);
    this.#verificarVitoria();
    return this.#resposta(true, null, reveladas, null);
  }

  alternarBandeira(linha, coluna) {
    tabuleiro.validarCoordenada(linha, coluna);
    this.#garantirEmAndamento('marcar bandeira');

    const atual = this.celulas[linha][coluna];
    if (atual.revelada) {
      return {
        ok: false,
        motivo: 'celula_ja_revelada',
        estado: this.estado,
        bandeira: false,
        bombasRestantes: this.bombasRestantes,
      };
    }

    atual.bandeira = !atual.bandeira;
    return {
      ok: true,
      motivo: null,
      estado: this.estado,
      bandeira: atual.bandeira,
      bombasRestantes: this.bombasRestantes,
    };
  }

  /**
   * Jogada clássica de "acordeão": se a célula revelada tem exatamente
   * `adjacentes` bandeiras ao redor, abre os vizinhos sem bandeira.
   */
  abrirAdjacentes(linha, coluna) {
    tabuleiro.validarCoordenada(linha, coluna);
    this.#garantirEmAndamento('abrir células adjacentes');

    const atual = this.celulas[linha][coluna];
    if (!atual.revelada || atual.bomba) {
      return this.#resposta(false, 'celula_nao_revelada', []);
    }

    const vizinhanca = tabuleiro.vizinhos(linha, coluna);
    const bandeiras = vizinhanca.filter(({ linha: l, coluna: c }) => (
      this.celulas[l][c].bandeira
    )).length;

    if (bandeiras !== atual.adjacentes) {
      return this.#resposta(false, 'bandeiras_incorretas', []);
    }

    const reveladas = [];
    for (const vizinho of vizinhanca) {
      const celulaVizinha = this.celulas[vizinho.linha][vizinho.coluna];
      if (celulaVizinha.revelada || celulaVizinha.bandeira) continue;

      if (celulaVizinha.bomba) {
        celulaVizinha.revelada = true;
        this.estado = ESTADO.DERROTA;
        this.explodida = { linha: vizinho.linha, coluna: vizinho.coluna };
        reveladas.push(this.#snapshot(celulaVizinha));
        return this.#resposta(true, null, reveladas, this.explodida);
      }

      this.#expandir(vizinho.linha, vizinho.coluna, reveladas);
    }

    this.#verificarVitoria();
    return this.#resposta(true, null, reveladas, null);
  }

  #expandir(linha, coluna, reveladas) {
    const pilha = [{ linha, coluna }];
    const visitados = new Set();

    while (pilha.length > 0) {
      const atual = pilha.pop();
      const chave = `${atual.linha},${atual.coluna}`;
      if (visitados.has(chave)) continue;
      visitados.add(chave);

      const celula = this.celulas[atual.linha][atual.coluna];
      if (celula.revelada || celula.bandeira || celula.bomba) continue;

      celula.revelada = true;
      reveladas.push(this.#snapshot(celula));

      if (celula.adjacentes === 0) {
        for (const vizinho of tabuleiro.vizinhos(atual.linha, atual.coluna)) {
          pilha.push(vizinho);
        }
      }
    }
  }

  #verificarVitoria() {
    let reveladasSeguras = 0;
    for (const fileira of this.celulas) {
      for (const celula of fileira) {
        if (celula.revelada && !celula.bomba) reveladasSeguras += 1;
      }
    }
    if (reveladasSeguras === CELULAS_SEGURAS) {
      this.estado = ESTADO.VITORIA;
    }
  }

  #snapshot(celula) {
    return {
      linha: celula.linha,
      coluna: celula.coluna,
      adjacentes: celula.adjacentes,
      bomba: celula.bomba,
    };
  }

  #resposta(ok, motivo, reveladas, explodiu = null) {
    return {
      ok,
      motivo,
      estado: this.estado,
      reveladas,
      explodiu,
    };
  }
}

function criarJogo(opcoes) {
  return new JogoCampoMinado(opcoes);
}

module.exports = {
  JogoCampoMinado,
  criarJogo,
};
