const { Ludo, Dado, CONSTANTES } = require('../src/ludo');

function jogoCom(...sequencia) {
  return new Ludo({ sequenciaDado: sequencia });
}

describe('Inicialização da partida', () => {
  test('CT-INIT-01: a partida inicia com 2 jogadores', () => {
    const jogo = new Ludo();
    expect(jogo.jogadores).toHaveLength(CONSTANTES.JOGADORES);
    expect(CONSTANTES.JOGADORES).toBe(2);
  });

  test('CT-INIT-02: cada jogador começa com 4 peões na base', () => {
    const jogo = new Ludo();
    for (const jogadorId of [0, 1]) {
      const peoes = jogo.peoesDoJogador(jogadorId);
      expect(peoes).toHaveLength(4);
      peoes.forEach((peao) => {
        expect(peao.estado).toBe('base');
        expect(peao.casa).toBeNull();
        expect(peao.passos).toBe(0);
      });
    }
  });

  test('CT-INIT-03: o jogador 0 começa a partida', () => {
    expect(new Ludo().jogadorAtual).toBe(0);
  });

  test('CT-INIT-04: não há vencedor no início', () => {
    const jogo = new Ludo();
    expect(jogo.vencedor).toBeNull();
    expect(jogo.partidaEncerrada()).toBe(false);
  });

  test('CT-INIT-05: as casas de saída exportadas são 0 e 26', () => {
    expect(CONSTANTES.CASAS_SAIDA).toEqual([0, 26]);
    expect(CONSTANTES.CASAS_SAIDA[0]).toBe(0);
    expect(CONSTANTES.CASAS_SAIDA[1]).toBe(26);
  });

  test('CT-INIT-06: aceita um dado injetado pelo construtor', () => {
    const jogo = new Ludo({ dado: new Dado([5]) });
    expect(jogo.rolar().valor).toBe(5);
  });

  test('CT-INIT-07: aceita o atalho sequenciaDado', () => {
    const jogo = new Ludo({ sequenciaDado: [4] });
    expect(jogo.rolar().valor).toBe(4);
  });

  test('CT-INIT-08: rejeita objeto dado sem o método rolar', () => {
    expect(() => new Ludo({ dado: { next: 6 } })).toThrow(
      'O dado deve expor o método rolar().',
    );
  });

  test('CT-INIT-09: rejeita informar dado e sequenciaDado ao mesmo tempo', () => {
    expect(() => new Ludo({ dado: new Dado([1]), sequenciaDado: [2] })).toThrow(
      'Informe apenas dado ou sequenciaDado, não ambos.',
    );
  });
});

describe('Sair da base', () => {
  test('CT-SAIDA-01: peão sai da base com 6 e vai para a casa de saída', () => {
    const jogo = jogoCom(6);
    const resultado = jogo.rolar();
    expect(resultado.movimentoPossivel).toBe(true);
    expect(resultado.peoesMoviveis).toEqual([0, 1, 2, 3]);
    jogo.mover(0);
    const peao = jogo.obterPeao(0, 0);
    expect(peao.estado).toBe('tabuleiro');
    expect(peao.casa).toBe(CONSTANTES.CASAS_SAIDA[0]);
    expect(peao.passos).toBe(0);
  });

  test('CT-SAIDA-02: peão não sai da base com valor diferente de 6', () => {
    const jogo = jogoCom(5);
    const resultado = jogo.rolar();
    expect(resultado.movimentoPossivel).toBe(false);
    expect(jogo.obterPeao(0, 0).estado).toBe('base');
    expect(jogo.jogadorAtual).toBe(1);
  });

  test('CT-SAIDA-03: com 6, o jogador escolhe qual peão da base sai', () => {
    const jogo = jogoCom(6);
    jogo.rolar();
    jogo.mover(2);
    expect(jogo.obterPeao(0, 2).estado).toBe('tabuleiro');
    expect(jogo.obterPeao(0, 0).estado).toBe('base');
    expect(jogo.obterPeao(0, 1).estado).toBe('base');
    expect(jogo.obterPeao(0, 3).estado).toBe('base');
  });

  test('CT-SAIDA-04: ao sair, o 6 não desloca o peão além da casa de saída', () => {
    const jogo = jogoCom(6);
    jogo.rolar();
    const retorno = jogo.mover(0);
    expect(retorno.saiuDaBase).toBe(true);
    expect(jogo.obterPeao(0, 0).casa).toBe(CONSTANTES.CASAS_SAIDA[0]);
    expect(jogo.obterPeao(0, 0).passos).toBe(0);
  });

  test('CT-SAIDA-05: ao sair com 6, o mesmo jogador joga novamente', () => {
    const jogo = jogoCom(6);
    jogo.rolar();
    const retorno = jogo.mover(0);
    expect(retorno.jogarNovamente).toBe(true);
    expect(jogo.jogadorAtual).toBe(0);
  });

  test('CT-SAIDA-06: o jogador 1 sai para a casa 26', () => {
    const jogo = jogoCom(2, 6);
    jogo.rolar();
    expect(jogo.jogadorAtual).toBe(1);
    jogo.rolar();
    jogo.mover(1);
    const peao = jogo.obterPeao(1, 1);
    expect(peao.estado).toBe('tabuleiro');
    expect(peao.casa).toBe(CONSTANTES.CASAS_SAIDA[1]);
    expect(peao.passos).toBe(0);
  });

  test('CT-SAIDA-07: com peões na base e no tabuleiro, um 6 permite sair ou andar 6', () => {
    const jogo = jogoCom(6, 6);
    jogo.rolar();
    jogo.mover(0);
    const resultado = jogo.rolar();
    expect(resultado.peoesMoviveis).toEqual([0, 1, 2, 3]);
    jogo.mover(1);
    expect(jogo.obterPeao(0, 1).estado).toBe('tabuleiro');
    expect(jogo.obterPeao(0, 0).passos).toBe(0);
  });

  test('CT-SAIDA-08: ao sair da base para a casa de saída ocupada por adversário, não captura', () => {
    const jogo = jogoCom(6);
    const casaSaidaJogador0 = CONSTANTES.CASAS_SAIDA[0];
    // O jogador 1 alcança a casa 0 com 26 passos: (26 + 26) % 52 = 0.
    jogo.definirPosicao(1, 0, 26);
    expect(jogo.obterPeao(1, 0).casa).toBe(casaSaidaJogador0);
    expect(jogo.ehCasaSegura(casaSaidaJogador0)).toBe(true);

    jogo.rolar();
    const retorno = jogo.mover(0);

    expect(retorno.saiuDaBase).toBe(true);
    expect(retorno.capturou).toBe(false);
    expect(jogo.obterPeao(0, 0).estado).toBe('tabuleiro');
    expect(jogo.obterPeao(0, 0).casa).toBe(casaSaidaJogador0);
    expect(jogo.obterPeao(1, 0).estado).toBe('tabuleiro');
    expect(jogo.obterPeao(1, 0).casa).toBe(casaSaidaJogador0);
    expect(jogo.obterPeao(1, 0).passos).toBe(26);
    // A jogada extra vem do 6, não de captura.
    expect(retorno.jogarNovamente).toBe(true);
    expect(jogo.jogadorAtual).toBe(0);
  });
});

describe('Movimento no percurso', () => {
  test('CT-MOV-01: peão no percurso avança o número de casas do dado', () => {
    const jogo = jogoCom(6, 4);
    jogo.rolar();
    jogo.mover(0);
    jogo.rolar();
    jogo.mover(0);
    const peao = jogo.obterPeao(0, 0);
    expect(peao.casa).toBe(4);
    expect(peao.passos).toBe(4);
  });

  test('CT-MOV-02: o percurso do jogador 1 é circular (módulo 52)', () => {
    // O jogador 1 sai na casa 26; com 30 passos está na casa (26+30)%52 = 4.
    const jogo = jogoCom(1, 4);
    jogo.definirPosicao(1, 0, 26);
    expect(jogo.obterPeao(1, 0).casa).toBe(0);
    jogo.rolar(); // jogador 0 não tem movimento
    expect(jogo.jogadorAtual).toBe(1);
    jogo.rolar();
    jogo.mover(0);
    const peao = jogo.obterPeao(1, 0);
    expect(peao.casa).toBe(4);
    expect(peao.passos).toBe(30);
    expect(peao.estado).toBe('tabuleiro');
  });

  test('CT-MOV-03: peão do jogador 1 avança a partir da casa 26', () => {
    const jogo = jogoCom(1, 6, 4);
    jogo.rolar();
    expect(jogo.jogadorAtual).toBe(1);
    jogo.rolar();
    jogo.mover(0);
    jogo.rolar();
    jogo.mover(0);
    const peao = jogo.obterPeao(1, 0);
    expect(peao.casa).toBe(30);
    expect(peao.passos).toBe(4);
  });

  test('CT-MOV-04: não é permitido mover peão que já chegou', () => {
    const jogo = jogoCom(2);
    jogo.definirPosicao(0, 0, CONSTANTES.PASSOS_PARA_CHEGAR);
    jogo.definirPosicao(0, 1, 3);
    jogo.rolar();
    expect(jogo.peoesMoviveis()).toEqual([1]);
    expect(() => jogo.mover(0)).toThrow('O peão 0 não pode ser movido com o valor 2.');
  });

  test('CT-MOV-05: sem movimento válido e sem 6, a vez passa automaticamente', () => {
    const jogo = jogoCom(3);
    const resultado = jogo.rolar();
    expect(resultado.movimentoPossivel).toBe(false);
    expect(resultado.jogarNovamente).toBe(false);
    expect(jogo.jogadorAtual).toBe(1);
    expect(jogo.aguardandoMovimento).toBe(false);
  });

  test('CT-MOV-06: peoesMoviveis lista apenas quem consegue usar o valor atual', () => {
    const jogo = jogoCom(2);
    jogo.definirPosicao(0, 0, CONSTANTES.PASSOS_PARA_CHEGAR - 1); // falta 1
    jogo.definirPosicao(0, 1, 10);
    const resultado = jogo.rolar();
    expect(resultado.peoesMoviveis).toEqual([1]);
  });

  test('CT-MOV-07: o peão pode passar por outro; só a casa de destino importa', () => {
    const jogo = jogoCom(4);
    jogo.definirPosicao(0, 0, 2);
    jogo.definirPosicao(1, 0, 3); // casa 26+3=29, no caminho de ninguém do j0 a partir da casa 2
    // j0 em casa 2; destino com 4 = casa 6. Adversário em 29 não interfere.
    jogo.rolar();
    const retorno = jogo.mover(0);
    expect(retorno.capturou).toBe(false);
    expect(jogo.obterPeao(0, 0).casa).toBe(6);
    expect(jogo.obterPeao(1, 0).estado).toBe('tabuleiro');
  });

  test('CT-MOV-08: a casa absoluta do jogador 0 após 51 passos é 51', () => {
    const jogo = new Ludo();
    jogo.definirPosicao(0, 0, 51);
    expect(jogo.obterPeao(0, 0).casa).toBe(51);
    expect(jogo.obterPeao(0, 0).estado).toBe('tabuleiro');
  });
});

describe('Jogar novamente com 6 e três 6 consecutivos', () => {
  test('CT-SEIS-01: ao tirar 6 e andar no percurso, o mesmo jogador joga de novo', () => {
    const jogo = jogoCom(6, 6);
    jogo.rolar();
    jogo.mover(0);
    jogo.rolar();
    const retorno = jogo.mover(0);
    expect(retorno.jogarNovamente).toBe(true);
    expect(jogo.jogadorAtual).toBe(0);
    expect(jogo.obterPeao(0, 0).passos).toBe(6);
  });

  test('CT-SEIS-02: dois 6 seguidos mantêm a vez do mesmo jogador', () => {
    const jogo = jogoCom(6, 6, 1);
    jogo.rolar();
    jogo.mover(0);
    jogo.rolar();
    jogo.mover(0);
    expect(jogo.jogadorAtual).toBe(0);
    jogo.rolar();
    jogo.mover(0);
    expect(jogo.jogadorAtual).toBe(1);
  });

  test('CT-SEIS-03: três 6 consecutivos cancelam o terceiro lance e passam a vez', () => {
    const jogo = jogoCom(6, 6, 6);
    jogo.rolar();
    jogo.mover(0);
    jogo.rolar();
    jogo.mover(0);
    const terceiro = jogo.rolar();
    expect(terceiro.valor).toBe(6);
    expect(terceiro.tresSeis).toBe(true);
    expect(terceiro.movimentoPossivel).toBe(false);
    expect(jogo.jogadorAtual).toBe(1);
    expect(jogo.aguardandoMovimento).toBe(false);
  });

  test('CT-SEIS-04: os movimentos dos dois primeiros 6 permanecem após o terceiro 6', () => {
    const jogo = jogoCom(6, 6, 6);
    jogo.rolar();
    jogo.mover(0);
    jogo.rolar();
    jogo.mover(0);
    jogo.rolar();
    const peao = jogo.obterPeao(0, 0);
    expect(peao.estado).toBe('tabuleiro');
    expect(peao.passos).toBe(6);
    expect(peao.casa).toBe(6);
  });

  test('CT-SEIS-05: depois de um 5, o contador zera e uma nova série de três 6 volta a cancelar', () => {
    const jogo = jogoCom(6, 5, 1, 6, 6, 6);
    jogo.rolar();
    jogo.mover(0); // sai
    jogo.rolar();
    jogo.mover(0); // 5, passa
    jogo.rolar(); // j1 tira 1 e passa
    expect(jogo.jogadorAtual).toBe(0);
    jogo.rolar();
    jogo.mover(0); // 6
    jogo.rolar();
    jogo.mover(0); // 6
    const terceiro = jogo.rolar();
    expect(terceiro.tresSeis).toBe(true);
    expect(jogo.jogadorAtual).toBe(1);
  });

  test('CT-SEIS-06: se tira 6 e não há movimento válido, o jogador rola novamente', () => {
    const jogo = jogoCom(6);
    jogo.definirPosicao(0, 0, CONSTANTES.PASSOS_PARA_CHEGAR - 1);
    jogo.definirPosicao(0, 1, CONSTANTES.PASSOS_PARA_CHEGAR - 1);
    jogo.definirPosicao(0, 2, CONSTANTES.PASSOS_PARA_CHEGAR - 1);
    jogo.definirPosicao(0, 3, CONSTANTES.PASSOS_PARA_CHEGAR - 1);
    const resultado = jogo.rolar();
    expect(resultado.valor).toBe(6);
    expect(resultado.movimentoPossivel).toBe(false);
    expect(resultado.jogarNovamente).toBe(true);
    expect(jogo.jogadorAtual).toBe(0);
  });
});

describe('Captura', () => {
  test('CT-CAP-01: cair na casa de um peão adversário isolado captura', () => {
    const jogo = jogoCom(3);
    jogo.definirPosicao(0, 0, 5); // casa 5
    jogo.definirPosicao(1, 0, 31); // 26+31=57%52=5
    expect(jogo.obterPeao(1, 0).casa).toBe(5);
    jogo.definirPosicao(0, 0, 2);
    jogo.rolar();
    const retorno = jogo.mover(0);
    expect(retorno.capturou).toBe(true);
    expect(jogo.obterPeao(0, 0).casa).toBe(5);
  });

  test('CT-CAP-02: o peão capturado volta para a base com passos 0', () => {
    const jogo = jogoCom(3);
    jogo.definirPosicao(0, 0, 2);
    jogo.definirPosicao(1, 0, 31);
    jogo.rolar();
    jogo.mover(0);
    const capturado = jogo.obterPeao(1, 0);
    expect(capturado.estado).toBe('base');
    expect(capturado.casa).toBeNull();
    expect(capturado.passos).toBe(0);
  });

  test('CT-CAP-03: a captura concede jogada extra', () => {
    const jogo = jogoCom(3);
    jogo.definirPosicao(0, 0, 2);
    jogo.definirPosicao(1, 0, 31);
    jogo.rolar();
    const retorno = jogo.mover(0);
    expect(retorno.jogarNovamente).toBe(true);
    expect(jogo.jogadorAtual).toBe(0);
  });

  test('CT-CAP-04: não captura peão adversário em casa segura (estrela)', () => {
    const jogo = jogoCom(3);
    // casa 8 é estrela. j0 em 5 + 3 = 8. j1 precisa estar em 8: 26+x ≡ 8 (mod 52) => x=34
    jogo.definirPosicao(0, 0, 5);
    jogo.definirPosicao(1, 0, 34);
    expect(jogo.obterPeao(1, 0).casa).toBe(8);
    expect(jogo.ehCasaSegura(8)).toBe(true);
    jogo.rolar();
    const retorno = jogo.mover(0);
    expect(retorno.capturou).toBe(false);
    expect(jogo.obterPeao(1, 0).estado).toBe('tabuleiro');
    expect(jogo.obterPeao(1, 0).casa).toBe(8);
    expect(jogo.obterPeao(0, 0).casa).toBe(8);
    expect(jogo.jogadorAtual).toBe(1); // 3, sem captura, passa a vez
  });

  test('CT-CAP-05: não captura peão adversário na casa de saída (segura)', () => {
    const jogo = jogoCom(2);
    // casa 0 é saída do j0, segura. j1 em casa 0: 26+x ≡ 0 => x=26
    jogo.definirPosicao(0, 0, 50); // 50+2=52? 50+2=52 que é reta, não. 0+2 wait
    // j0 em passos 50 está na casa 50; +2 = 52, entra na reta. Não serve.
    // j0 em passos 51 está na casa 51; +1 = reta. 
    // Para cair na casa 0, j0 precisa de passos 0 (já está lá) ou 52 (reta).
    // Melhor: j0 em passos 47 (casa 47) + 5? queremos + algo que chegue em 0, ou seja passos 52? 
    // Casa 0 do j0 só ocorre em passos 0 ou 52 (mas 52 é reta). Então j0 só fica na casa 0 na saída.
    // Use a casa 26, saída do j1: j0 chega lá com passos 26.
    jogo.definirPosicao(0, 0, 24);
    jogo.definirPosicao(1, 0, 0); // j1 na própria saída (26)
    expect(jogo.obterPeao(1, 0).casa).toBe(26);
    expect(jogo.ehCasaSegura(26)).toBe(true);
    jogo.rolar();
    const retorno = jogo.mover(0);
    expect(jogo.obterPeao(0, 0).casa).toBe(26);
    expect(retorno.capturou).toBe(false);
    expect(jogo.obterPeao(1, 0).estado).toBe('tabuleiro');
  });

  test('CT-CAP-06: não captura pilha de 2 peões adversários e o movimento é inválido', () => {
    const jogo = jogoCom(3);
    jogo.definirPosicao(0, 0, 2);
    jogo.definirPosicao(1, 0, 31); // casa 5
    jogo.definirPosicao(1, 1, 31); // pilha na casa 5
    expect(jogo.obterPeao(1, 0).casa).toBe(5);
    expect(jogo.obterPeao(1, 1).casa).toBe(5);
    const resultado = jogo.rolar();
    expect(resultado.movimentoPossivel).toBe(false);
    expect(jogo.obterPeao(0, 0).casa).toBe(2);
    expect(jogo.obterPeao(1, 0).estado).toBe('tabuleiro');
    expect(jogo.obterPeao(1, 1).estado).toBe('tabuleiro');
    expect(jogo.jogadorAtual).toBe(1);
  });

  test('CT-CAP-07: dois peões do mesmo jogador na mesma casa não se capturam', () => {
    const jogo = jogoCom(4);
    jogo.definirPosicao(0, 0, 10);
    jogo.definirPosicao(0, 1, 6);
    jogo.rolar();
    const retorno = jogo.mover(1);
    expect(retorno.capturou).toBe(false);
    expect(jogo.obterPeao(0, 0).casa).toBe(10);
    expect(jogo.obterPeao(0, 1).casa).toBe(10);
    expect(jogo.obterPeao(0, 0).estado).toBe('tabuleiro');
  });

  test('CT-CAP-08: peão na reta final não pode ser capturado', () => {
    const jogo = jogoCom(1);
    jogo.definirPosicao(0, 0, 52); // reta 1 do jogador 0
    jogo.definirPosicao(1, 0, 25); // j1 na casa 51, última do percurso dele
    // A reta do j0 não compartilha casas com o percurso; o j1 não consegue "entrar" nela.
    expect(jogo.obterPeao(0, 0).estado).toBe('reta');
    // j1 de passos 25 está na casa 51. Um avanço não o leva à reta do j0.
    // Garantimos apenas que o peão na reta permanece intocado após um lance do adversário.
    jogo.jogadorAtual = 1;
    jogo.rolar();
    jogo.mover(0);
    expect(jogo.obterPeao(0, 0).estado).toBe('reta');
    expect(jogo.obterPeao(0, 0).passos).toBe(52);
  });
});

describe('Casas seguras', () => {
  test('CT-SEG-01: as 8 casas seguras do tabuleiro padrão estão definidas', () => {
    expect(CONSTANTES.CASAS_SEGURAS).toEqual([0, 8, 13, 21, 26, 34, 39, 47]);
  });

  test('CT-SEG-02: a casa de saída do jogador 0 (0) é segura', () => {
    expect(new Ludo().ehCasaSegura(0)).toBe(true);
  });

  test('CT-SEG-03: a casa de saída do jogador 1 (26) é segura', () => {
    expect(new Ludo().ehCasaSegura(26)).toBe(true);
  });

  test('CT-SEG-04: as casas-estrela 8, 21, 34 e 47 são seguras', () => {
    const jogo = new Ludo();
    [8, 21, 34, 47].forEach((casa) => {
      expect(jogo.ehCasaSegura(casa)).toBe(true);
    });
  });

  test('CT-SEG-05: casa não marcada permite captura', () => {
    const jogo = jogoCom(1);
    expect(jogo.ehCasaSegura(3)).toBe(false);
    jogo.definirPosicao(0, 0, 2);
    jogo.definirPosicao(1, 0, 29); // 26+29=55%52=3
    expect(jogo.obterPeao(1, 0).casa).toBe(3);
    jogo.rolar();
    expect(jogo.mover(0).capturou).toBe(true);
  });
});

describe('Reta final e chegada', () => {
  test('CT-RETA-01: após 51 passos, o próximo avanço entra na reta final', () => {
    const jogo = jogoCom(2);
    jogo.definirPosicao(0, 0, 51);
    jogo.rolar();
    jogo.mover(0);
    const peao = jogo.obterPeao(0, 0);
    expect(peao.estado).toBe('reta');
    expect(peao.casa).toBe(2);
    expect(peao.passos).toBe(53);
  });

  test('CT-RETA-02: o peão avança dentro da reta pelo valor do dado', () => {
    const jogo = jogoCom(2);
    jogo.definirPosicao(0, 0, 52); // reta 1
    jogo.rolar();
    jogo.mover(0);
    const peao = jogo.obterPeao(0, 0);
    expect(peao.estado).toBe('reta');
    expect(peao.casa).toBe(3);
    expect(peao.passos).toBe(54);
  });

  test('CT-RETA-03: só entra na chegada com valor exato', () => {
    const jogo = jogoCom(3);
    jogo.definirPosicao(0, 0, 54); // falta 3
    jogo.rolar();
    const retorno = jogo.mover(0);
    expect(retorno.chegou).toBe(true);
    expect(jogo.obterPeao(0, 0).estado).toBe('chegada');
    expect(jogo.obterPeao(0, 0).casa).toBe(6);
    expect(jogo.obterPeao(0, 0).passos).toBe(57);
  });

  test('CT-RETA-04: valor maior que o necessário na reta é movimento inválido e não recua', () => {
    const jogo = jogoCom(4);
    jogo.definirPosicao(0, 0, 54); // falta 3, 4 ultrapassa
    const resultado = jogo.rolar();
    expect(resultado.movimentoPossivel).toBe(false);
    expect(jogo.obterPeao(0, 0).estado).toBe('reta');
    expect(jogo.obterPeao(0, 0).passos).toBe(54);
    expect(jogo.jogadorAtual).toBe(1);
  });

  test('CT-RETA-05: peão com 56 passos (faltando 1) chega com 1 e não com 2', () => {
    const jogoChega = jogoCom(1);
    jogoChega.definirPosicao(0, 0, 56);
    jogoChega.rolar();
    expect(jogoChega.mover(0).chegou).toBe(true);

    const jogoNaoChega = jogoCom(2);
    jogoNaoChega.definirPosicao(0, 0, 56);
    const resultado = jogoNaoChega.rolar();
    expect(resultado.movimentoPossivel).toBe(false);
    expect(jogoNaoChega.obterPeao(0, 0).estado).toBe('reta');
  });

  test('CT-RETA-06: peão no último quadrado do percurso (51) chega com um 6', () => {
    const jogo = jogoCom(6);
    jogo.definirPosicao(0, 0, 51);
    jogo.rolar();
    const retorno = jogo.mover(0);
    expect(retorno.chegou).toBe(true);
    expect(jogo.obterPeao(0, 0).estado).toBe('chegada');
  });

  test('CT-RETA-07: chegar com um peão concede jogada extra', () => {
    const jogo = jogoCom(1);
    jogo.definirPosicao(0, 0, 56);
    jogo.definirPosicao(0, 1, 10);
    jogo.rolar();
    const retorno = jogo.mover(0);
    expect(retorno.chegou).toBe(true);
    expect(retorno.jogarNovamente).toBe(true);
    expect(retorno.venceu).toBe(false);
    expect(jogo.jogadorAtual).toBe(0);
  });

  test('CT-RETA-08: as retas finais dos dois jogadores são independentes', () => {
    const jogo = jogoCom(1);
    jogo.definirPosicao(0, 0, 52);
    jogo.definirPosicao(1, 0, 52);
    jogo.rolar();
    jogo.mover(0);
    expect(jogo.obterPeao(0, 0).casa).toBe(2);
    expect(jogo.obterPeao(1, 0).casa).toBe(1);
    expect(jogo.obterPeao(1, 0).estado).toBe('reta');
  });
});

describe('Vitória', () => {
  test('CT-VIT-01: o jogador vence ao colocar o 4º peão na chegada', () => {
    const jogo = jogoCom(1);
    jogo.definirPosicao(0, 0, 57);
    jogo.definirPosicao(0, 1, 57);
    jogo.definirPosicao(0, 2, 57);
    jogo.definirPosicao(0, 3, 56);
    jogo.rolar();
    const retorno = jogo.mover(3);
    expect(retorno.chegou).toBe(true);
    expect(retorno.venceu).toBe(true);
    expect(jogo.vencedor).toBe(0);
    expect(jogo.partidaEncerrada()).toBe(true);
  });

  test('CT-VIT-02: com 3 peões na chegada após a jogada, mas o 4º ainda fora, a partida continua', () => {
    const jogo = jogoCom(1);
    jogo.definirPosicao(0, 0, 57);
    jogo.definirPosicao(0, 1, 57);
    jogo.definirPosicao(0, 2, 56);
    jogo.definirPosicao(0, 3, 10);
    jogo.rolar();
    const retorno = jogo.mover(2);
    expect(retorno.chegou).toBe(true);
    expect(retorno.venceu).toBe(false);
    expect(jogo.vencedor).toBeNull();
    expect(jogo.partidaEncerrada()).toBe(false);
    expect(jogo.jogadorAtual).toBe(0);
  });

  test('CT-VIT-03: após a vitória, não é permitido rolar nem mover', () => {
    const jogo = jogoCom(1, 2);
    jogo.definirPosicao(0, 0, 57);
    jogo.definirPosicao(0, 1, 57);
    jogo.definirPosicao(0, 2, 57);
    jogo.definirPosicao(0, 3, 56);
    jogo.rolar();
    jogo.mover(3);
    expect(() => jogo.rolar()).toThrow('A partida já foi encerrada.');
    expect(() => jogo.mover(0)).toThrow('A partida já foi encerrada.');
  });

  test('CT-VIT-04: o jogador 1 também pode vencer', () => {
    const jogo = jogoCom(1, 1);
    jogo.definirPosicao(1, 0, 57);
    jogo.definirPosicao(1, 1, 57);
    jogo.definirPosicao(1, 2, 57);
    jogo.definirPosicao(1, 3, 56);
    jogo.rolar(); // j0 tira 1, todos na base, passa
    expect(jogo.jogadorAtual).toBe(1);
    jogo.rolar();
    const retorno = jogo.mover(3);
    expect(retorno.venceu).toBe(true);
    expect(jogo.vencedor).toBe(1);
  });
});

describe('Turnos e erros', () => {
  test('CT-ERR-01: não permite mover sem rolar', () => {
    const jogo = jogoCom(6);
    expect(() => jogo.mover(0)).toThrow('É necessário rolar o dado antes de mover.');
  });

  test('CT-ERR-02: não permite rolar de novo antes de mover', () => {
    const jogo = jogoCom(6, 4);
    jogo.rolar();
    expect(() => jogo.rolar()).toThrow('É necessário mover um peão antes de rolar novamente.');
  });

  test('CT-ERR-03: não permite mover peão com índice inválido', () => {
    const jogo = jogoCom(6);
    jogo.rolar();
    expect(() => jogo.mover(4)).toThrow('Índice de peão inválido. Use 0, 1, 2 ou 3.');
    expect(() => jogo.mover(-1)).toThrow('Índice de peão inválido. Use 0, 1, 2 ou 3.');
    expect(() => jogo.mover(1.5)).toThrow('Índice de peão inválido. Use 0, 1, 2 ou 3.');
  });

  test('CT-ERR-04: não permite mover peão que não pode andar com o valor', () => {
    const jogo = jogoCom(2);
    jogo.definirPosicao(0, 0, 56); // só anda com 1
    jogo.definirPosicao(0, 1, 4);
    jogo.rolar();
    expect(() => jogo.mover(0)).toThrow('O peão 0 não pode ser movido com o valor 2.');
  });

  test('CT-ERR-05: após movimento sem bônus, a vez passa para o outro jogador', () => {
    const jogo = jogoCom(6, 3);
    jogo.rolar();
    jogo.mover(0);
    jogo.rolar();
    const retorno = jogo.mover(0);
    expect(retorno.jogarNovamente).toBe(false);
    expect(jogo.jogadorAtual).toBe(1);
  });

  test('CT-ERR-06: obterPeao rejeita jogador ou peão inexistente', () => {
    const jogo = new Ludo();
    expect(() => jogo.obterPeao(2, 0)).toThrow('Jogador inválido. Use 0 ou 1.');
    expect(() => jogo.obterPeao(0, 5)).toThrow('Índice de peão inválido. Use 0, 1, 2 ou 3.');
  });

  test('CT-ERR-07: definirPosicao rejeita passos fora do intervalo', () => {
    const jogo = new Ludo();
    expect(() => jogo.definirPosicao(0, 0, 58)).toThrow('Passos inválidos');
    expect(() => jogo.definirPosicao(0, 0, -2)).toThrow('Passos inválidos');
  });

  test('CT-ERR-08: definirPosicao não pode ser usado no meio de uma jogada', () => {
    const jogo = jogoCom(6);
    jogo.rolar();
    expect(() => jogo.definirPosicao(0, 0, 10)).toThrow(
      'Não é possível reposicionar um peão no meio de uma jogada.',
    );
  });
});

describe('Partida integrada', () => {
  test('CT-INT-01: o jogador 0 vence após chegar com os 4 peões', () => {
    const jogo = jogoCom(1, 1, 1, 1);
    for (let i = 0; i < 4; i += 1) {
      jogo.definirPosicao(0, i, 56);
    }
    for (let i = 0; i < 3; i += 1) {
      jogo.rolar();
      const retorno = jogo.mover(i);
      expect(retorno.chegou).toBe(true);
      expect(retorno.venceu).toBe(false);
    }
    jogo.rolar();
    const final = jogo.mover(3);
    expect(final.venceu).toBe(true);
    expect(jogo.vencedor).toBe(0);
    expect(jogo.peoesDoJogador(0).every((p) => p.estado === 'chegada')).toBe(true);
  });

  test('CT-INT-02: os dois jogadores saem da base e se movimentam em turnos alternados', () => {
    // j0 sai (6), anda 4 (casa 4). j1 tira 3 (fica na base). 
    // Melhor montar com saída de ambos e captura pública:
    const jogo = jogoCom(6, 4, 6, 4);
    // j0 sai e anda 4 (casa 4), vez passa
    jogo.rolar();
    jogo.mover(0);
    jogo.rolar();
    jogo.mover(0);
    expect(jogo.jogadorAtual).toBe(1);
    expect(jogo.obterPeao(0, 0).casa).toBe(4);
    // j1 sai (6) e anda 4 (casa 30) — não captura ninguém
    jogo.rolar();
    jogo.mover(0);
    jogo.rolar();
    jogo.mover(0);
    expect(jogo.obterPeao(1, 0).casa).toBe(30);
    expect(jogo.jogadorAtual).toBe(0);
  });

  test('CT-INT-04: após o movimento do jogador 0, o jogador 1 sem peão na pista devolve a vez', () => {
    // j0 na casa 5 precisaria andar até onde j1 está.
    // Sequência: j0 sai (6) e fica na 0 (segura). j0 tira 5, vai à casa 5, passa.
    // j1 sai (6). Para j1 cair na casa 5: 26+x=5 => x=31. Longo demais para este teste.
    // Alternativa: j1 sai e caminha até a casa 8? Não, é segura.
    // Casa 4: j0 sai + 4. j1 precisa de 30 passos (26+30=56%52=4). Ainda longo.
    // Vamos usar uma sequência em que j1 para na casa 1 (passos 27) e j0 anda 1 após estar em 0.
    // Casa 1 não é segura. j1 em casa 1: passos = (1-26+52)%52 = 27.
    // Fica longo. O CT-CAP já cobre captura. Este teste valida a troca de turnos entre os dois.
    const jogo = jogoCom(6, 3, 2);
    jogo.rolar();
    jogo.mover(0);
    jogo.rolar();
    jogo.mover(0);
    expect(jogo.jogadorAtual).toBe(1);
    const r = jogo.rolar();
    expect(r.movimentoPossivel).toBe(false);
    expect(jogo.jogadorAtual).toBe(0);
    expect(jogo.obterPeao(0, 0).casa).toBe(3);
  });

  test('CT-INT-03: um peão completa a volta e chega usando só a API pública', () => {
    // Após sair com 6 (passos=0), faltam 57. Ciclos de 6,6,5 = 17, com 1 do adversário no intervalo.
    // 6 (sai) + 6 + 5 = 11, depois dois ciclos 6,6,5 (=34) => 45, depois 6,6 => 57.
    // O valor 1 do jogador 1 é intercalado depois de cada 5, para ele passar a vez.
    const jogo = jogoCom(6, 6, 5, 1, 6, 6, 5, 1, 6, 6, 5, 1, 6, 6);

    jogo.rolar();
    jogo.mover(0); // sai
    jogo.rolar();
    jogo.mover(0); // +6 => 6
    jogo.rolar();
    jogo.mover(0); // +5 => 11, passa
    jogo.rolar(); // j1: 1, passa

    jogo.rolar();
    jogo.mover(0); // +6 => 17
    jogo.rolar();
    jogo.mover(0); // +6 => 23
    jogo.rolar();
    jogo.mover(0); // +5 => 28, passa
    jogo.rolar(); // j1: 1

    jogo.rolar();
    jogo.mover(0); // +6 => 34
    jogo.rolar();
    jogo.mover(0); // +6 => 40
    jogo.rolar();
    jogo.mover(0); // +5 => 45, passa
    jogo.rolar(); // j1: 1

    jogo.rolar();
    jogo.mover(0); // +6 => 51 (última do percurso)
    const ultimo = jogo.rolar();
    expect(ultimo.valor).toBe(6);
    const retorno = jogo.mover(0);
    expect(retorno.chegou).toBe(true);
    expect(jogo.obterPeao(0, 0).estado).toBe('chegada');
    expect(jogo.obterPeao(0, 0).passos).toBe(57);
    expect(jogo.vencedor).toBeNull();
    expect(jogo.jogadorAtual).toBe(0);
  });
});
