'use strict';

const { ESTADO, criarJogo, completarBombas } = require('../src');

function jogoComBombaIsoladaNoCanto() {
  return criarJogo({
    posicoesBombas: completarBombas([[0, 1]], [[0, 0], [1, 0], [1, 1]]),
    protegerPrimeiroClique: false,
  });
}

describe('Jogo — abrir adjacentes (acordeão / chord)', () => {
  test('CT-ADJ-01 deve abrir os vizinhos quando o número de bandeiras confere', () => {
    const jogo = jogoComBombaIsoladaNoCanto();
    jogo.revelar(0, 0);
    expect(jogo.inspecionar(0, 0).adjacentes).toBe(1);
    expect(jogo.inspecionar(1, 0).revelada).toBe(false);

    jogo.alternarBandeira(0, 1);
    const resultado = jogo.abrirAdjacentes(0, 0);

    expect(resultado.ok).toBe(true);
    expect(jogo.estado).toBe(ESTADO.EM_ANDAMENTO);
    expect(jogo.inspecionar(1, 0).revelada).toBe(true);
    expect(jogo.inspecionar(1, 1).revelada).toBe(true);
    expect(jogo.inspecionar(0, 1).revelada).toBe(false);
    expect(jogo.inspecionar(0, 1).bandeira).toBe(true);
  });

  test('CT-ADJ-02 não deve abrir quando o número de bandeiras é diferente do número da célula', () => {
    const jogo = jogoComBombaIsoladaNoCanto();
    jogo.revelar(0, 0);

    const semBandeira = jogo.abrirAdjacentes(0, 0);
    expect(semBandeira.ok).toBe(false);
    expect(semBandeira.motivo).toBe('bandeiras_incorretas');
    expect(jogo.inspecionar(1, 0).revelada).toBe(false);

    jogo.alternarBandeira(1, 0);
    jogo.alternarBandeira(1, 1);
    const demaisBandeiras = jogo.abrirAdjacentes(0, 0);
    expect(demaisBandeiras.ok).toBe(false);
    expect(demaisBandeiras.motivo).toBe('bandeiras_incorretas');
  });

  test('CT-ADJ-03 deve perder se a bandeira estiver no lugar errado', () => {
    const jogo = jogoComBombaIsoladaNoCanto();
    jogo.revelar(0, 0);
    jogo.alternarBandeira(1, 0);

    const resultado = jogo.abrirAdjacentes(0, 0);
    expect(resultado.estado).toBe(ESTADO.DERROTA);
    expect(resultado.explodiu).toEqual({ linha: 0, coluna: 1 });
    expect(jogo.inspecionar(0, 1).revelada).toBe(true);
  });

  test('CT-ADJ-04 não deve abrir adjacentes em célula não revelada', () => {
    const jogo = jogoComBombaIsoladaNoCanto();
    const resultado = jogo.abrirAdjacentes(0, 0);

    expect(resultado.ok).toBe(false);
    expect(resultado.motivo).toBe('celula_nao_revelada');
    expect(jogo.totalReveladas).toBe(0);
  });

  test('CT-ADJ-05 deve expandir a abertura a partir dos vizinhos abertos pelo acordeão', () => {
    // Bomba em (0,0). Ao abrir os vizinhos de (0,1), a célula (0,2)
    // tem zero adjacentes e dispara a abertura.
    const jogo = criarJogo({
      posicoesBombas: completarBombas([[0, 0]], [[0, 1], [0, 2], [1, 0], [1, 1], [1, 2]]),
    });
    jogo.revelar(0, 1);
    expect(jogo.inspecionar(0, 1).adjacentes).toBe(1);
    jogo.alternarBandeira(0, 0);

    const resultado = jogo.abrirAdjacentes(0, 1);
    expect(resultado.ok).toBe(true);
    expect(resultado.reveladas.length).toBeGreaterThan(2);
    expect(jogo.inspecionar(0, 2).revelada).toBe(true);
    expect(jogo.inspecionar(0, 2).adjacentes).toBe(0);
  });

  test('CT-ADJ-06 não deve alterar células com bandeira no acordeão', () => {
    const jogo = jogoComBombaIsoladaNoCanto();
    jogo.revelar(0, 0);
    jogo.alternarBandeira(0, 1);
    jogo.abrirAdjacentes(0, 0);

    expect(jogo.inspecionar(0, 1).bandeira).toBe(true);
    expect(jogo.inspecionar(0, 1).revelada).toBe(false);
  });
});
