# Desafio de Teste — Dominó (2 jogadores)

**Nome:** André Tavares  
**RA:** 24066498-2

### Cenário adicional desta versão

Conservação de peças na distribuição. O arquivo `tests/personalizacao.test.js` acrescenta essa verificação à suíte original. Execute somente esse cenário com `npm run test:personalizacao` ou todos os testes com `npm test`.

Esta versão adapta a implementação da base original mantendo as regras e a interface pública do desafio. Os créditos originais foram preservados.

Repositório: `desafio_teste_domino`

Disciplina: Projeto, Implementação e Teste de Software (2026)

Entrega até 22/11/2026.

Implementação em JavaScript das regras de uma partida de dominó para 2 jogadores, com casos de teste em JavaScript (Jest) para testar o JavaScript.

---

## Especificação do desafio

O enunciado pede casos de teste em JavaScript para testar uma partida de Dominó para 2 jogadores. Como o repositório da disciplina não detalha a variante, foi adotada a **variante clássica com compra** no conjunto **duplo-seis**, com as regras abaixo explicitadas para que os testes sejam determinísticos.

### Regras de negócio

| ID | Regra |
| --- | --- |
| RN-01 | O conjunto é o duplo-seis: 28 peças únicas, de `[0\|0]` até `[6\|6]`. Cada peça vale a soma dos dois lados (pips). Ex.: `[6\|6]` vale 12 e `[0\|0]` vale 0. |
| RN-02 | A partida é para exatamente 2 jogadores, identificados por `0` e `1`. |
| RN-03 | Cada jogador recebe 7 peças. As 14 restantes formam o monte de compra. |
| RN-04 | A aleatoriedade é injetável: aceita uma função `rng` que devolve um número em `[0, 1)` ou uma `seed` inteira. Também é possível injetar um baralho já ordenado (sem novo embaralhamento, salvo se `embaralharBaralho: true`). |
| RN-05 | Começa quem possui o **maior duplo** na mão (`[6\|6]`, senão `[5\|5]`, e assim por diante). A primeira peça obrigatória é esse duplo. |
| RN-06 | Se nenhum dos dois tem duplo na mão, começa quem possui a **maior peça** (maior lado alto; empate quebrado pelo lado baixo). Não há empate, porque cada peça é única. Não se reembaralha. |
| RN-07 | A primeira jogada deve ser exatamente a peça inicial obrigatória. Depois da abertura, a vez passa ao oponente. |
| RN-08 | Uma jogada posterior é válida somente se a peça estiver na mão do jogador da vez e um de seus lados coincidir com a ponta escolhida (`esquerda` ou `direita`). |
| RN-09 | A peça é orientada automaticamente para casar com a ponta. Um duplo mantém o mesmo valor naquela ponta. Se a peça casa com uma única ponta, a ponta pode ser omitida. Se casa com as duas, a ponta é obrigatória. |
| RN-10 | É obrigatório jogar quando houver peça jogável. Não se compra nem se passa nesse caso. |
| RN-11 | Se o jogador da vez não puder jogar e o monte não estiver vazio, ele compra **uma peça por vez**. A vez não passa: ele compra até poder jogar ou até o monte acabar. |
| RN-12 | Se o jogador da vez não puder jogar e o monte estiver vazio, ele passa e a vez vai ao oponente. |
| RN-13 | **Batida:** quem ficar sem peças vence imediatamente. A pontuação é a soma dos pips da mão do adversário. |
| RN-14 | **Jogo trancado:** dois passes consecutivos encerram a partida. Vence quem tiver a menor soma na mão e recebe a soma do adversário. Somas iguais: empate, sem vencedor e sem pontos. |
| RN-15 | Após o encerramento (batida, trancado ou empate), jogar, comprar ou passar é rejeitado. |
| RN-16 | Jogador, peça, ponta ou operação incompatível com o estado atual geram erro com código e mensagem em português. |

### Regras confirmadas

Além das RN acima, valem as definições abaixo (já fixadas pelos testes):

1. Variante clássica **com compra**, e não “tranca” nem bloqueio puro sem monte.
2. **Não há dorme:** as 14 peças do monte podem ser compradas até o monte zerar (CT-COMPRA-08).
3. **Não há bônus de batida especial** (cruzada, lá e ló, carroça): a pontuação da batida é só a soma dos pips da mão do adversário.
4. No trancado, a **menor soma** vence e recebe a **soma do adversário**, não a diferença nem a soma das duas mãos. Somas iguais: empate, 0 a 0.
5. Cada instância de `Partida` representa **uma mão**. Não há série até 100 pontos.
6. Se o `[6|6]` estiver no monte, abre o **maior duplo presente nas mãos** (CT-INICIO-03). Se não houver duplo nas mãos, abre a maior peça, sem reembaralhar (CT-INICIO-04).
7. Na abertura de peça não-dupla, a mesa começa com o lado menor à esquerda e o maior à direita (CT-INICIO-08).

### Contrato dos erros

Os erros de domínio são instâncias de `ErroPeca`, `ErroBaralho` ou `ErroPartida`. Cada um expõe a propriedade **`codigo`** (não `code`), o `name` igual ao nome da classe e uma mensagem em português. Os testes conferem os três (classe, `codigo` e mensagem) por meio de `esperarErro` em `tests/helpers.js`.

| Classe | Códigos |
| --- | --- |
| `ErroPeca` | `VALOR_INVALIDO`, `PECA_INVALIDA`, `LADO_INCOMPATIVEL` |
| `ErroBaralho` | `BARALHO_INCOMPLETO`, `PECA_DUPLICADA`, `SEED_INVALIDA`, `BARALHO_INVALIDO`, `RNG_INVALIDO`, `JOGADORES_INVALIDOS`, `DISTRIBUICAO_INVALIDA` |
| `ErroPartida` | `ABERTURA_OBRIGATORIA`, `JA_INICIADA`, `PECA_FORA_DA_MAO`, `JOGADA_INVALIDA`, `PONTA_INVALIDA`, `PONTA_OBRIGATORIA`, `FORA_DA_VEZ`, `PARTIDA_ENCERRADA`, `NAO_INICIADA`, `JOGADOR_INVALIDO`, `ALEATORIEDADE_AMBIGUA`, `COMPRA_INVALIDA`, `MONTE_VAZIO`, `PASSE_INVALIDO`, `PECA_DUPLICADA`, `MESA_INVALIDA`, `ESTADO_INVALIDO`, `MAOS_VAZIAS` |

### API resumida

```javascript
const { Partida } = require("./src");

const partida = new Partida({ seed: 2026 }); // ou { rng }, ou { baralho }
partida.iniciar();
partida.jogar(partida.jogadorAtual, partida.pecaInicialObrigatoria);
partida.jogar(jogador, "6-3", "direita");
partida.comprar(jogador);
partida.passar(jogador);
partida.estado(); // status, mãos, mesa, pontas, vencedor, pontuação
```

Para cenários de meio e fim de jogo, use `Partida.criarParaTeste({ maos, monte, mesa, jogadorAtual })`.

---

## Como funcionam os casos de teste

Os testes estão em `tests/*.test.js`, escritos com Jest. Cada caso tem um identificador `CT-...` e cobre situação normal, limite ou erro. A suíte tem **87 testes**.

O arquivo `tests/helpers.js` **faz parte da especificação**: concentra as fábricas `baralhoComMaos`, `partidaComBaralho` e `partidaEmAndamento`, e a função `esperarErro(fn, codigo, mensagem, tipo)`, que exige a classe do erro, a propriedade `codigo` e a mensagem. Ele não entra no cálculo de cobertura (`collectCoverageFrom` considera só `src/**/*.js`).

Para isolar regras de meio e fim de partida, vários casos usam `Partida.criarParaTeste`, que monta um estado controlado sem depender do embaralhamento. A aleatoriedade verdadeira é testada com `seed` e `rng` injetados.

### Peças (`tests/peca.test.js`)

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-PECA-01 | Criar a peça 3-5 | Identificador `3-5`, 8 pontos, não é duplo |
| CT-PECA-02 | Criar o duplo 4-4 | É duplo e vale 8 pontos |
| CT-PECA-03 | Criar a branca 0-0 | Peça válida com 0 pontos |
| CT-PECA-04 | Criar o 6-6 a partir da string `"6-6"` | Peça válida com 12 pontos |
| CT-PECA-05 | Comparar 3-5, 5-3 e `"[5\|3]"` | São a mesma peça |
| CT-PECA-06 | Valor negativo | `ErroPeca` com código `VALOR_INVALIDO` |
| CT-PECA-07 | Valor 7, fora do duplo-seis | `ErroPeca` com código `VALOR_INVALIDO` e mensagem com o intervalo 0 a 6 |
| CT-PECA-08 | Número não inteiro ou referência inválida | `VALOR_INVALIDO` para 2.5; `PECA_INVALIDA` para string ou `null` |
| CT-PECA-09 | `combinaCom` e `outroLado` com lado existente | Casa com 2 e com 5; o lado oposto é o outro valor |
| CT-PECA-10 | `combinaCom` e `outroLado` com lado inexistente | Não casa com 6; `outroLado(6)` lança `ErroPeca` com código `LADO_INCOMPATIVEL` |
| CT-PECA-11 | Prioridade de abertura | Duplo vence não-duplo; 6-6 vence 0-0; 6-5 vence 6-4 |

### Baralho e distribuição (`tests/baralho.test.js`)

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-BARALHO-01 | Tamanho e unicidade do baralho | 28 peças únicas |
| CT-BARALHO-02 | Composição do duplo-seis | Todos os pares de 0-0 até 6-6 |
| CT-BARALHO-03 | Embaralhar com o mesmo `rng` injetado | As duas ordens são idênticas e o original não muda |
| CT-BARALHO-04 | Dois geradores diferentes | Ordens diferentes |
| CT-BARALHO-05 | Distribuição para 2 jogadores | 7 + 7 peças e 14 no monte |
| CT-BARALHO-06 | Ausência de repetição na distribuição | 28 identificadores distintos entre mãos e monte |
| CT-BARALHO-07 | Semente numérica | A mesma seed reproduz a ordem; seeds diferentes divergem |
| CT-BARALHO-08 | Baralho incompleto, duplicado, não-arranjo, seed/rng inválidos e parâmetros fora do desafio | Códigos `BARALHO_INCOMPLETO`, `PECA_DUPLICADA`, `SEED_INVALIDA`, `BARALHO_INVALIDO`, `RNG_INVALIDO`, `JOGADORES_INVALIDOS` e `DISTRIBUICAO_INVALIDA` |

### Início da partida (`tests/partida.test.js`)

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-INICIO-01 | Estado após `iniciar()` | 7 peças por jogador, monte com 14, mesa vazia, status `aguardando_primeira` |
| CT-INICIO-02 | Abertura com `[6\|6]` na mão | O dono do `[6\|6]` começa e essa é a peça obrigatória |
| CT-INICIO-03 | `[6\|6]` está no monte e há `[5\|5]` na mão | Começa o dono do maior duplo das mãos (`[5\|5]`); o `[6\|6]` permanece no monte |
| CT-INICIO-04 | Abertura sem nenhum duplo nas mãos | Começa quem tem a maior peça (6-5) |
| CT-INICIO-05 | Primeira jogada | Outra peça é recusada com `ABERTURA_OBRIGATORIA`; a obrigatória é aceita e vai para a mesa |
| CT-INICIO-06 | Efeito da abertura | Mesa com 1 peça, mão com 6, vez do oponente |
| CT-INICIO-07 | Pontas de um duplo inicial | As duas pontas valem 6 |
| CT-INICIO-08 | Pontas de uma não-dupla inicial | Esquerda 5 e direita 6 |
| CT-INICIO-09 | Reprodutibilidade por seed | Duas partidas com a seed 99 nascem iguais |
| CT-INICIO-10 | `iniciar()` pela segunda vez | `ErroPartida` com código `JA_INICIADA` |
| CT-INICIO-11 | Baralho injetado incompleto ou com peça repetida | `ErroBaralho` com `BARALHO_INCOMPLETO` ou `PECA_DUPLICADA` |
| CT-INICIO-12 | `[0\|0]` contra 6-5 | O duplo baixo tem prioridade de abertura |

### Jogadas válidas

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-JOGADA-01 | Encaixe na ponta direita | A ponta direita passa a ser o lado livre da peça |
| CT-JOGADA-02 | Encaixe na ponta esquerda | A ponta esquerda é atualizada e a peça entra no início da cadeia |
| CT-JOGADA-03 | Virada automática | `[2\|5]` na ponta esquerda 5 fica orientada como 2\|5 |
| CT-JOGADA-04 | Duplo na ponta | O valor da ponta permanece o mesmo |
| CT-JOGADA-05 | Peça que casa nas duas pontas | O jogador escolhe esquerda ou direita e as pontas resultantes respeitam a escolha |
| CT-JOGADA-06 | Saída da mão e alternância de vez | A peça some da mão e a vez passa ao oponente |
| CT-JOGADA-07 | `pecasJogaveis` | Lista só as peças que casam com alguma ponta |
| CT-JOGADA-08 | Duas peças jogáveis | O jogador pode escolher qualquer uma delas |
| CT-JOGADA-09 | Omissão da ponta quando só um lado casa | A jogada é aceita e encaixa na única ponta possível |

### Jogadas inválidas e erros

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-ERRO-01 | Peça que não está na mão | `ErroPartida` com código `PECA_FORA_DA_MAO` |
| CT-ERRO-02 | Peça que não casa com a ponta escolhida | `ErroPartida` com código `JOGADA_INVALIDA` |
| CT-ERRO-03 | Ponta `"meio"` | `ErroPartida` com código `PONTA_INVALIDA` |
| CT-ERRO-04 | Jogar fora da vez | `ErroPartida` com código `FORA_DA_VEZ` |
| CT-ERRO-05 | Jogar, comprar ou passar após batida | `ErroPartida` com código `PARTIDA_ENCERRADA` |
| CT-ERRO-06 | Outra peça na abertura | `ErroPartida` com código `ABERTURA_OBRIGATORIA` |
| CT-ERRO-07 | Operações antes de `iniciar()` | `ErroPartida` com código `NAO_INICIADA` |
| CT-ERRO-08 | Peça nula ou jogador inválido | `ErroPeca` com `PECA_INVALIDA`; `ErroPartida` com `JOGADOR_INVALIDO` |
| CT-ERRO-09 | Peça ambígua sem informar a ponta | `ErroPartida` com código `PONTA_OBRIGATORIA` |
| CT-ERRO-10 | `seed` e `rng` informados juntos | `ErroPartida` com código `ALEATORIEDADE_AMBIGUA` |
| CT-ERRO-11 | Comprar ou passar fora da vez | `ErroPartida` com código `FORA_DA_VEZ` |
| CT-ERRO-12 | Jogar, comprar ou passar após trancado ou empate | Status literal `trancado`/`empate` e código `PARTIDA_ENCERRADA` |
| CT-ERRO-13 | Peça que não casa com nenhuma ponta | `ErroPartida` com código `JOGADA_INVALIDA`, com ou sem ponta informada |

### Compra e passe

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-COMPRA-01 | Compra legal | A primeira peça do monte vai para a mão e o monte diminui |
| CT-COMPRA-02 | Compra com peça jogável | Recusada com código `COMPRA_INVALIDA` |
| CT-COMPRA-03 | Compra com monte vazio | Recusada com código `MONTE_VAZIO` |
| CT-COMPRA-04 | Vez após a compra | Continua com o mesmo jogador, que agora pode jogar |
| CT-COMPRA-05 | Compras sucessivas | Compra até surgir peça jogável e então joga |
| CT-COMPRA-06 | Última peça do monte ainda inútil | Monte esvazia e o passe passa a ser a única opção |
| CT-COMPRA-07 | Compra na abertura | Recusada com código `COMPRA_INVALIDA` |
| CT-COMPRA-08 | Compra das 14 peças do monte | O monte zera; não há dorme; o jogador ainda pode passar |
| CT-PASSE-01 | Passe legal | A vez vai ao oponente e há 1 passe consecutivo |
| CT-PASSE-02 | Passe com peça jogável | Recusado com código `PASSE_INVALIDO` |
| CT-PASSE-03 | Passe com monte ainda cheio | Recusado com código `PASSE_INVALIDO` |
| CT-PASSE-04 | Passe seguido de oponente com jogada | O oponente pode jogar normalmente |
| CT-PASSE-05 | Dois passes consecutivos | A partida fecha como `trancado` |
| CT-PASSE-06 | Jogada após um passe | A sequência de passes volta a zero |
| CT-PASSE-07 | Passe na abertura | Recusado com código `PASSE_INVALIDO` |

### Batida, trancado e pontuação

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-BATIDA-01 | Jogar a última peça | Status `batida`, vencedor 0, mão vazia |
| CT-BATIDA-02 | Cálculo da pontuação | Vencedor recebe a soma dos pips do adversário (9) |
| CT-BATIDA-03 | Duplos na soma | `[6\|6]` e `[5\|5]` somam 22 |
| CT-BATIDA-04 | Adversário só com `[0\|0]` | Há vencedor, mas a pontuação é 0 |
| CT-BATIDA-05 | Abertura que já esgota a mão (cenário reduzido) | Batida imediata com a soma do oponente |
| CT-TRANCA-01 | Comparação das mãos no trancado | Vence a menor soma (3 contra 7) |
| CT-TRANCA-02 | Pontos do trancado | Vencedor recebe os 11 pontos da mão do adversário |
| CT-TRANCA-03 | Somas iguais | Status `empate`, `vencedor` nulo e pontuação 0-0 |
| CT-TRANCA-04 | Duplos na comparação | 12 contra 11: vence quem tem 11 e recebe 12 |
| CT-TRANCA-05 | Limite 0-0 contra 0-1 | `[0\|0]` vence e recebe 1 ponto |

### Limites e partida completa

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-LIMITE-01 | Crescimento da mesa nos dois extremos | Cinco peças na cadeia e pontas 0 e 6 |
| CT-LIMITE-02 | `criarParaTeste` | Estado de meio de jogo com pontas, monte e vez controlados |
| CT-LIMITE-03 | Peça repetida no estado de teste | `ErroPartida` com código `PECA_DUPLICADA`; estado sem repetição é aceito |
| CT-LIMITE-04 | Imutabilidade das consultas | Alterar cópias de mão, monte, mesa, histórico ou pontuação não muda a partida |
| CT-LIMITE-05 | Mesa desconexa, orientação inválida, uma só mão ou mãos vazias | Códigos `MESA_INVALIDA`, `ESTADO_INVALIDO` e `MAOS_VAZIAS` |
| CT-LIMITE-06 | Partida completa com baralho injetado, do início à batida | Jogador 0 bate; o adversário fica com `[1\|3]` e a pontuação é 4 |
| CT-LIMITE-07 | Baralho original injetado | Permanece intacto após iniciar e jogar |
| CT-LIMITE-08 | Baralho injetado com e sem `embaralharBaralho` | Sem embaralhar, a ordem das mãos é a do baralho; com `embaralharBaralho: true` e seed, a ordem muda |
| CT-API-01 | Literais de status/pontas e exportações de `src/index.js` | Status `nao_iniciada`, `aguardando_primeira`, `em_andamento`, `batida`, `trancado`, `empate`; pontas `esquerda` e `direita`; classes e erros reexportados |

---

## Como executar

Requisitos: Node.js 18+ e npm.

```bash
npm install
npm test
```

O script `npm test` executa o Jest em todos os arquivos `tests/**/*.test.js`. Os 87 testes devem passar. A cobertura, se for pedida com `npx jest --coverage`, considera apenas `src/**/*.js` e ignora `tests/helpers.js`.

Estrutura do projeto:

```text
desafio_teste_domino/
├── README.md
├── package.json
├── .gitignore
├── src/
│   ├── index.js
│   ├── peca.js
│   ├── baralho.js
│   └── partida.js
└── tests/
    ├── helpers.js
    ├── peca.test.js
    ├── baralho.test.js
    └── partida.test.js
```

---

## Identificação da versão

Nome: **André Tavares**  
RA: **24066498-2**

## Créditos da base original

Rodrigo A. Del Padre Filho

## Adaptação da implementação

A lógica de `src/baralho.js` foi reorganizada nesta versão. As regras do jogo permanecem as descritas acima.
