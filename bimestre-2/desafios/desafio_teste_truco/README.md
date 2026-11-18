# Desafio: Teste do Truco Paulista

**Nome:** André Tavares  
**RA:** 24066498-2

### Cenário adicional desta versão

Distribuição para todas as posições de carteador. O arquivo `tests/personalizacao.test.js` acrescenta essa verificação à suíte original. Execute somente esse cenário com `npm run test:personalizacao` ou todos os testes com `npm test`.

Esta versão adapta a implementação da base original mantendo as regras e a interface pública do desafio. Os créditos originais foram preservados.

Repositório: `desafio_teste_truco`

Disciplina: Projeto, Implementação e Teste de Software (2026)

## Especificação do desafio

O enunciado do curso pede:

- casos de teste para testar o **truco paulista**;
- truco de **duas duplas** (4 jogadores);
- casos de teste em **JavaScript para testar JavaScript**.

Como o repositório da disciplina não detalha as regras da modalidade, a implementação e os testes seguem o regulamento da **Federação Paulista de Truco**, conforme o texto do VI JUFFS (2024), com detalhes operacionais de mesa (ordem das cartas, início da rodada e carta coberta) que esse regulamento deixa implícitos.

### Mesa e baralho

- Quatro jogadores em duas duplas, sentados em posições alternadas: jogadores **0 e 2** formam a dupla 0; jogadores **1 e 3** formam a dupla 1.
- Baralho limpo de **40 cartas** (sem 8, 9, 10 e curingas).
- Cada jogador recebe **3 cartas**. Em seguida é virada a **vira**, que define as manilhas.
- O jogador à **direita do carteador** é a mão (começa a primeira rodada). O jogo corre em sentido **anti-horário**.
- O carteador rotaciona à direita ao fim de cada mão.

### Força das cartas

Sequência das cartas comuns, da maior para a menor:

`3, 2, A, K, J, Q, 7, 6, 5, 4`

A manilha é **variável**: é a carta imediatamente acima da vira, nos quatro naipes. A sequência sobe `4, 5, 6, 7, Q, J, K, A, 2, 3` e volta de 3 para 4. Exemplos: vira 7 → manilhas são as damas; vira 3 → manilhas são os 4.

Entre as manilhas, a ordem de força é:

1. Paus — **zap**
2. Copas — **copeta**
3. Espadas — **espadilha**
4. Ouros — **pica-fumo**

Qualquer manilha é mais forte do que o 3. O naipe da vira não altera a força das cartas comuns: dois 3, por exemplo, empatam.

### Mão, rodada e pontuação

- A partida vai até **12 pontos**.
- Cada mão vale **1 ponto** e é disputada em melhor de 3 rodadas. O valor pode subir para **3 (truco), 6, 9 e 12**.
- Quem ganhar duas rodadas leva a mão.
- Regras de empate (cango), segundo o Art. 5º §2º do regulamento da Federação Paulista / VI JUFFS:
  - empate na primeira: quem ganhar a segunda vence a mão;
  - empate na segunda: vence quem ganhou a primeira;
  - empate na primeira e na segunda: quem fizer a terceira vence a mão;
  - empate na terceira (após 1 a 1): vence quem ganhou a primeira;
  - empate nas três rodadas: **ninguém pontua**.
- Só empata a rodada quando as **duas duplas** exibem a maior força. Se os dois parceiros tiverem a maior carta, a dupla vence.
- Quem vence a rodada começa a seguinte. Se a rodada empatar, quem jogou a carta que cangou abre a próxima.

### Aumentos (truco, seis, nove e doze)

- O pedido só pode ser feito **na vez** do jogador, como prevê o regulamento da Federação Paulista.
- Se o adversário **aceitar**, a mão passa a valer o valor proposto.
- Se o adversário **correr**, a dupla que pediu leva o valor anterior: correr do truco vale 1; do seis vale 3; do nove vale 6; do doze vale 9.
- A dupla adversária também pode **retrucar** (aumentar) imediatamente.
- Depois de um aumento aceito, o próximo valor pode ser pedido mais tarde, **na vez** de um jogador, mas **somente pela dupla que aceitou o último aumento**. A dupla que pediu e teve o aumento aceito não pode pedir o seguinte.
- A dupla que pediu o aumento não pode respondê-lo.
- O construtor de `Partida` aceita `placarInicial: [pontosDupla0, pontosDupla1]`, com inteiros de 0 a 11, para começar a partida em um placar conhecido (mão de onze, mão de ferro, etc.). O padrão é `[0, 0]`.

O § 9º do regulamento do VI JUFFS, sobre o doze, está evidentemente trocado (repete o texto do seis/nove). Aqui o doze é o aumento feito sobre o **nove**: aceito vale 12; se o adversário correr, quem pediu leva 9.

### Carta coberta

- Jogar a carta virada para baixo faz com que ela **não valha nada**.
- **Não é permitido** esconder a carta na primeira rodada de cada mão.

### Mão de onze

- Quando **apenas uma** dupla chega a 11 pontos, os dois parceiros podem olhar as cartas um do outro e decidir se aceitam ou correm.
- Se aceitarem, a mão já começa valendo **3 pontos**.
- Se correrem, a dupla adversária soma **1 ponto**.
- Não é permitido pedir truco, seis, nove ou doze.

### Mão de ferro (11 a 11)

- As cartas e a vira saem **cobertas**. Ninguém vê a própria mão.
- A vira só é revelada depois que as quatro cartas da primeira rodada estão na mesa (as cartas jogadas ainda podem ser manilhas).
- Quem vencer a mão vence a partida (o placar da dupla vencedora vai a 12).
- Não é permitido pedir aumento nem esconder carta com valor nulo: no escuro, a carta conserva o valor real.
- Se as três rodadas empatarem, ninguém pontua e joga-se outra mão de ferro.

### Decisões de regra assumidas (para o professor)

Estes pontos não estavam no enunciado e foram fixados para a implementação ficar testável:

1. Fonte principal: regulamento da Federação Paulista / VI JUFFS. Em caso de conflito com outros regulamentos de torneio (por exemplo, no empate das três rodadas alguns textos dão o ponto à dupla que distribuiu as cartas), prevalece o JUFFS: **ninguém pontua**.
2. Pedido de aumento somente na vez do jogador (Federação Paulista), e não “a qualquer momento”.
3. Depois de aceito um aumento, o próximo valor (por exemplo o seis, depois do truco) pode ser pedido mais tarde, na vez de um jogador, **somente pela dupla que aceitou o último aumento**.
4. Na mão de onze não há novos aumentos: a mão vale 3; se a dupla com 11 correr, o adversário leva 1. Na mão de ferro também não há aumentos.
5. O placar é limitado a 12, mesmo que a mão valha mais do que o necessário para fechar a partida.
6. Sinais entre parceiros, corte, queima de cartas e punições de mesa (“tento” por carta a mais) ficaram **fora do escopo**, porque são regras de condução de torneio, não da lógica da mão.

## Como funcionam os casos de teste

Os testes foram escritos com **Jest**. Cada caso tem um identificador (`CT-...`), cobre um caminho da regra (caso normal, limite ou erro) e declara o resultado esperado. A suíte tem **91 testes**, todos executados por `npm test`.

### Carta (`tests/carta.test.js`)

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-CARTA-01 | Criação de carta válida | A carta guarda valor, naipe e o identificador `3-paus` |
| CT-CARTA-02 | Valores fora do baralho limpo (8, 9, 10 e curinga) | Lança erro `Valor de carta inválido` |
| CT-CARTA-03 | Naipe inexistente | Lança erro `Naipe inválido` |
| CT-CARTA-04 | Composição do baralho limpo | 10 valores (`4`…`3`) e 4 naipes (`ouros`, `espadas`, `copas`, `paus`) |
| CT-CARTA-05 | Igualdade entre cartas | Iguais só quando valor e naipe coincidem |
| CT-CARTA-06 | Descrição em português | Retorna, por exemplo, `K de espadas` |
| CT-CARTA-07 | Leitura de identificador e de objeto | `2-copas` e o objeto equivalente geram a mesma carta |
| CT-CARTA-08 | Identificador ou tipo inválido | Lança erro de identificador ou de carta inválida |

### Baralho (`tests/baralho.test.js`)

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-BARALHO-01 | Tamanho e unicidade do baralho | 40 cartas únicas, sem 8, 9, 10 ou curingas |
| CT-BARALHO-02 | Distribuição por naipe e valor | 10 cartas por naipe e 4 de cada valor |
| CT-BARALHO-03 | Embaralhar com semente | A mesma semente reproduz a ordem; sementes diferentes divergem |
| CT-BARALHO-04 | Imutabilidade do baralho original | O vetor original não muda e as 40 cartas são preservadas |
| CT-BARALHO-05 | Distribuição começando à direita do carteador | 3 cartas por jogador, uma vira e 27 no resto |
| CT-BARALHO-06 | Disjunção das cartas após o deal | Mãos, vira e resto cobrem as 40 cartas sem repetição |
| CT-BARALHO-07 | Baralho incompleto ou com repetição | Lança erro |
| CT-BARALHO-08 | Validação de uma distribuição injetada | Recusa mão com tamanho errado, vira ausente ou carta repetida |

### Ranking e manilhas (`tests/ranking.test.js`)

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-RANK-01 | Sequência imediatamente acima da vira | Sobe até o 3 e volta para o 4 |
| CT-RANK-02 | Vira 4 | Manilhas são os 5; zap é o 5 de paus |
| CT-RANK-03 | Vira 7, vira 3 e vira J | Manilhas são Q, 4 e K, respectivamente |
| CT-RANK-04 | Naipe da vira | Não muda a força das cartas comuns nem a ordem das manilhas |
| CT-RANK-05 | Ordem das manilhas | Paus > copas > espadas > ouros, com os nomes zap, copeta, espadilha e pica-fumo |
| CT-RANK-06 | Manilha contra o 3 | Qualquer manilha vence o 3 |
| CT-RANK-07 | Hierarquia das cartas comuns | `3 > 2 > A > K > J > Q > 7 > 6 > 5 > 4` quando não são manilha |
| CT-RANK-08 | Empate de cartas comuns | Mesmo valor empata, independentemente do naipe |
| CT-RANK-09 | Carta coberta | Vale menos do que qualquer carta aberta; duas cobertas empatam entre si |
| CT-RANK-10 | A própria vira | Não é manilha; manilha é a carta imediatamente acima |
| CT-RANK-11 | Valor inexistente na sequência | Lança erro |

### Aposta (`tests/aposta.test.js`)

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-APOSTA-01 | Escada de valores | 1 → 3 → 6 → 9 → 12 |
| CT-APOSTA-02 | Nomes dos aumentos | truco, seis, nove e doze |
| CT-APOSTA-03 | Pontos se o adversário correr | 1, 3, 6 e 9, respectivamente |
| CT-APOSTA-04 | Teto de 12 | Não é possível aumentar além de 12 |
| CT-APOSTA-05 | Valor inválido | Lança erro |

### Rodada (`tests/rodada.test.js`)

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-RODADA-01 | Carta mais forte | O jogador dessa carta vence a rodada |
| CT-RODADA-02 | Zap contra as outras manilhas | O zap vence a rodada |
| CT-RODADA-03 | Cango | Empate quando as duas duplas exibem a maior força |
| CT-RODADA-04 | Parceiros com a maior carta | A dupla vence; não é empate |
| CT-RODADA-05 | Cartas cobertas na vaza | Qualquer carta aberta vence; todas cobertas empatam |
| CT-RODADA-06 | Quem cangou | Fica registrado o jogador que jogou a carta do empate, para abrir a próxima |
| CT-RODADA-07 | Número de jogadas | Recusa rodada que não tenha 4 jogadas |

### Mão e empates (`tests/mao.test.js`)

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-MAO-01 | Uma só rodada | A mão ainda não acaba |
| CT-MAO-02 | Duas rodadas da mesma dupla | Essa dupla vence a mão |
| CT-MAO-03 | Empate na primeira | Quem ganha a segunda vence; não se joga a terceira |
| CT-MAO-04 | Empate na segunda | Vence quem ganhou a primeira; não se joga a terceira |
| CT-MAO-05 | 1 a 1 | A mão segue para a terceira rodada |
| CT-MAO-06 | Empate nas duas primeiras | Vence quem fizer a terceira |
| CT-MAO-07 | Empate na terceira após 1 a 1 | Vence quem ganhou a primeira |
| CT-MAO-08 | Três empates | Ninguém pontua |
| CT-MAO-09 | Terceira rodada decisiva | Vence a dupla da terceira |
| CT-MAO-10 | Lista vazia ou com 4 rodadas | Vazia não encerra; mais de 3 rodadas lança erro |

### Partida (`tests/partida.test.js`)

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-PARTIDA-01 | Início da partida | Placar 0 a 0 e estado `aguardando_inicio` |
| CT-PARTIDA-02 | Quem é mão | Com carteador 3, o jogador 0 começa; a mão vale 1 e a vira define as manilhas |
| CT-PARTIDA-03 | Visão das cartas | Cada um vê só as próprias 3 cartas; não vê as do parceiro fora da mão de onze |
| CT-PARTIDA-04 | Mão simples vencida em duas rodadas | A dupla 0 soma 1 ponto |
| CT-PARTIDA-05 | Abertura da próxima rodada | Quem venceu a rodada é o próximo a jogar |
| CT-PARTIDA-06 | Rotação do carteador | Após a mão, o carteador passa a ser o jogador à direita |
| CT-PARTIDA-07 | Três empates na mesa | Placar permanece 0 a 0 e a partida continua |
| CT-PARTIDA-08 | Fim da partida | A primeira dupla a chegar a 12 vence |
| CT-PARTIDA-09 | Teto do placar | Mesmo com mão valendo 3, o placar fecha em 12 (não em 13) |
| CT-PARTIDA-10 | Partida já encerrada | Não se inicia nova mão |
| CT-PARTIDA-11 | Distribuição aleatória com semente | A mesma semente reproduz mãos e vira |
| CT-PARTIDA-12 | Opção de construtor `placarInicial` | O padrão é 0 a 0; `[11, 5]` inicia mão de onze; `[11, 11]` inicia mão de ferro |
| CT-PARTIDA-13 | `placarInicial` inválido | Recusa tamanho diferente de 2, valores fora de 0 a 11 ou não inteiros |

### Aumentos na mesa (`tests/aumento.test.js`)

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-AUMENTO-01 | Pedir e aceitar truco | A mão passa a valer 3 e a vez permanece com quem pediu |
| CT-AUMENTO-02 | Correr do truco | Quem pediu soma 1 ponto e a mão acaba |
| CT-AUMENTO-03 | Retruco para seis e corrida | Quem pediu seis soma 3 pontos |
| CT-AUMENTO-04 | Cadeia até o doze | Truco → seis → nove → doze, aceito, deixa a mão valendo 12 |
| CT-AUMENTO-05 | Correr do doze | Quem pediu soma 9 pontos |
| CT-AUMENTO-06 | Novo aumento depois de aceito o truco | Na sua vez, a dupla que aceitou pode pedir seis |
| CT-AUMENTO-09 | Quem pediu o truco tenta pedir o seis após a aceitação | É recusado: somente a dupla que aceitou o último aumento pode pedir o próximo. O direito passa para a outra dupla quando ela aceita o seis |
| CT-AUMENTO-10 | Parceiro de quem aceitou | Na sua vez, o parceiro também pode pedir o próximo aumento |
| CT-AUMENTO-07 | Limite de 12 e resposta sem pendência | Recusa aumentar além de 12 e responder aumento inexistente |
| CT-AUMENTO-08 | Mão vencida com truco aceito | A dupla vencedora soma 3 pontos |

### Mão de onze e mão de ferro (`tests/maoDeOnze.test.js`)

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-ONZE-01 | Chegada a 11 de apenas uma dupla | Estado de decisão; a dupla em 11 vê as cartas do parceiro; aceitar mantém a mão em 3 |
| CT-ONZE-02 | Correr da mão de onze | A adversária soma 1 ponto |
| CT-ONZE-03 | Aceitar e vencer | A partida termina em 12 para a dupla que estava com 11 |
| CT-ONZE-04 | Aumento na mão de onze | Pedir truco/seis/nove/doze é recusado |
| CT-ONZE-05 | Dupla que não está com 11 | Não vê as cartas do parceiro nem decide a mão |
| CT-ONZE-06 | Jogar antes da decisão | É recusado até aceitar ou correr |
| CT-FERRO-01 | 11 a 11 | Cartas e vira cobertas; a vira aparece ao fim da primeira rodada; quem vence leva a partida |
| CT-FERRO-02 | Jogada no escuro | É permitido jogar pelo índice da carta, sem revelá-la antes |
| CT-FERRO-03 | Carta escondida (valor nulo) na ferro | É recusada; no escuro a carta conserva o valor real |
| CT-FERRO-04 | Três empates na ferro | O placar permanece 11 a 11 e a próxima mão também é de ferro |

### Erros e limites (`tests/erros.test.js`)

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-ERRO-01 | Jogada ilegal | Recusa jogar fora da vez ou carta que não está na mão |
| CT-ERRO-02 | Carta coberta na primeira rodada | É recusada |
| CT-ERRO-03 | Carta coberta a partir da segunda | É aceita e passa a não valer nada (um 3 coberto perde para um 2 aberto) |
| CT-ERRO-04 | Pedido e resposta de aumento inválidos | Recusa pedir fora da vez, pedir com aumento pendente, jogar antes de responder, resposta inválida e resposta da própria dupla |
| CT-ERRO-05 | Entradas inválidas | Recusa jogador, decisão e índice inválidos |
| CT-ERRO-06 | Duas mãos ao mesmo tempo | Recusa iniciar mão com outra em andamento |
| CT-ERRO-07 | Operações fora de hora | Recusa ver a vira antes do deal e decidir mão de onze sem decisão pendente |
| CT-ERRO-08 | Organização da mesa | Duplas 0-2 e 1-3, parceiros opostos e próximo jogador anti-horário |
| CT-ERRO-09 | Empate na primeira, na mesa | Quem cangou abre a segunda; a dupla que vence essa rodada leva a mão |

## Como executar

Requisitos: Node.js 18 ou superior e npm.

```bash
cd desafio_teste_truco
npm install
npm test
```

O comando `npm test` dispara o Jest em modo verbose e deve encerrar com **91 testes passando**.

Os módulos da implementação estão em `src/` (`carta.js`, `baralho.js`, `ranking.js`, `aposta.js` e `partida.js`). Os testes estão em `tests/`. A classe `Partida` permite injetar as mãos e a vira, para que os casos não dependam de sorte no embaralhamento. Para começar em um placar conhecido, use a opção de construtor `placarInicial` (inteiros de 0 a 11 por dupla); não altere `partida.placar` diretamente.

O arquivo `tests/helpers.js` **faz parte da especificação** dos casos de teste: reúne as fábricas `C`, `distribuicaoPadrao`, `novaPartida` e `jogar`. A função `novaPartida` encaminha `placarInicial` ao construtor de `Partida`. Esse arquivo não é código de produção e fica fora da cobertura (`collectCoverageFrom` aponta só para `src/`).

## Identificação da versão

Nome: **André Tavares**  
RA: **24066498-2**

## Adaptação da implementação

A lógica de `src/baralho.js` foi reorganizada nesta versão. As regras do jogo permanecem as descritas acima.
