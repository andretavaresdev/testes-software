# Desafio de Teste — Ludo (2 jogadores)

**Nome:** André Tavares  
**RA:** 24066498-2

### Cenário adicional desta versão

Proteção contra alterações na sequência fornecida. O arquivo `tests/personalizacao.test.js` acrescenta essa verificação à suíte original. Execute somente esse cenário com `npm run test:personalizacao` ou todos os testes com `npm test`.

Esta versão adapta a implementação da base original mantendo as regras e a interface pública do desafio. Os créditos originais foram preservados.

Repositório `desafio_teste_ludo` da disciplina **Projeto, Implementação e Teste de Software (2026)**.

Casos de teste em JavaScript (Jest) para testar uma implementação em JavaScript de uma partida de Ludo para **dois jogadores**.

## Especificação do desafio

O enunciado em `desafios.md` pede casos de teste em JavaScript para testar JavaScript, em uma partida de Ludo para 02 jogadores. O regulamento completo do jogo não está no repositório da disciplina. Esta implementação segue o tabuleiro clássico e as regras abaixo, declaradas de forma explícita para o professor revisar.

### Tabuleiro e peões

- Dois jogadores (0 e 1), cada um com **4 peões**, que começam na **base**.
- Percurso principal de **52 casas**. O jogador 0 sai na casa **0**; o jogador 1, no lado oposto, sai na casa **26**.
- **Reta final** de **6 casas** por jogador (5 casas coloridas + chegada), independente da reta do adversário.
- Depois de **51 passos** a partir da casa de saída, o peão deixa o percurso e entra na reta. São necessários **57 passos** no total para chegar.

### Saída, movimento e dado

- Só se **sai da base com um 6**. O peão é colocado na casa de saída; o 6 **não** caminha no percurso.
- No percurso, o peão avança exatamente o valor do dado. A casa de destino é `(casaSaida + passos) % 52`.
- Tirar **6 concede nova jogada** (sair da base ou andar 6 casas, à escolha do jogador quando ambos forem possíveis).
- **Três 6 consecutivos** no mesmo turno cancelam o terceiro lance (sem movimento) e passam a vez. Os dois lances anteriores permanecem.
- Se não houver movimento válido, a vez passa automaticamente, **exceto** no 6, que ainda permite rolar de novo (salvo o terceiro 6 consecutivo).
- O dado é **injetável**: os testes usam uma sequência determinística de valores de 1 a 6.

### Captura e casas seguras

- Cair exatamente na casa de um peão adversário **isolado**, fora de casa segura, **captura**: o adversário volta à base e o jogador joga novamente.
- Casas seguras do tabuleiro padrão (mesmo em partida de 2 jogadores): saídas **0, 13, 26, 39** e estrelas **8, 21, 34, 47**.
- Dois ou mais peões do mesmo jogador na mesma casa formam uma **pilha**: não podem ser capturados, e o adversário não pode estacionar ali.
- Peões na reta final não podem ser capturados (as retas não se cruzam).
- Só importa a casa de destino: o peão pode “passar” por outro.

### Reta final e vitória

- A **chegada exige valor exato**. Se o valor for maior do que o necessário, o movimento é inválido (o peão não recua e não ultrapassa).
- Chegar com um peão concede nova jogada.
- **Vence** quem colocar os **4 peões** na chegada. Depois disso, rolar ou mover lança erro.

### Apoio aos testes

O método `definirPosicao(jogador, peão, passos)` monta cenários (base, percurso, reta ou chegada) sem simular dezenas de rolagens. A partida integrada `CT-INT-03` percorre a volta completa **somente** com `rolar()` e `mover()`.

## Como funcionam os casos de teste

Os testes estão em `tests/dado.test.js` e `tests/ludo.test.js`, organizados por requisito. Cada caso usa um jogo isolado e, quando o resultado depende do dado, uma sequência injetada.

| Caso | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-DADO-01 | Sorteio aleatório do dado | Cada valor é um inteiro entre 1 e 6 |
| CT-DADO-02 | Sequência injetada | Os valores saem na ordem informada |
| CT-DADO-03 | Sequência vazia | Erro: array não vazio |
| CT-DADO-04 | Valor fora de 1 a 6 | Erro de valor inválido |
| CT-DADO-05 | Sequência que não é array | Erro: array não vazio |
| CT-DADO-06 | Sequência esgotada | Erro: a sequência do dado acabou |
| CT-DADO-07 | Valores não inteiros (1,5 ou `"6"`) | Erro de valor inválido |
| CT-INIT-01 | Quantidade de jogadores | Partida com 2 jogadores |
| CT-INIT-02 | Peões iniciais | 4 peões de cada jogador na base |
| CT-INIT-03 | Quem começa | Jogador 0 é o primeiro |
| CT-INIT-04 | Estado inicial de vitória | Sem vencedor e partida em andamento |
| CT-INIT-05 | Casas de saída | A constante exportada `CASAS_SAIDA` vale `[0, 26]` |
| CT-INIT-06 | Dado injetado no construtor | A rolagem devolve o valor do dado informado |
| CT-INIT-07 | Atalho `sequenciaDado` | A rolagem devolve o primeiro valor da sequência |
| CT-INIT-08 | Dado sem método `rolar` | Erro de contrato do dado |
| CT-INIT-09 | `dado` e `sequenciaDado` juntos | Erro pedindo apenas uma das opções |
| CT-SAIDA-01 | Sair da base com 6 | Peão 0 vai para `CASAS_SAIDA[0]` (casa 0), com 0 passos |
| CT-SAIDA-02 | Tentar sair com valor diferente de 6 | Ninguém sai e a vez passa |
| CT-SAIDA-03 | Escolha do peão que sai | Apenas o peão escolhido deixa a base |
| CT-SAIDA-04 | O 6 não caminha no percurso | O peão permanece na casa de saída |
| CT-SAIDA-05 | Bônus ao sair com 6 | O mesmo jogador joga novamente |
| CT-SAIDA-06 | Saída do jogador 1 | Peão do jogador 1 vai para `CASAS_SAIDA[1]` (casa 26) |
| CT-SAIDA-07 | 6 com peões na base e na pista | É possível sair com outro peão ou andar 6 |
| CT-SAIDA-08 | Sair da base com adversário na casa de saída | Não captura, porque a saída é casa segura; os dois peões ficam na casa 0 |
| CT-MOV-01 | Avanço no percurso | Peão na casa de saída anda 4 e vai à casa 4 |
| CT-MOV-02 | Percurso circular do jogador 1 | De 26+26 (casa 0) anda 4 e chega à casa 4 |
| CT-MOV-03 | Movimento a partir da casa 26 | Após sair e andar 4, o peão está na casa 30 |
| CT-MOV-04 | Peão que já chegou | Não entra na lista de móveis e mover lança erro |
| CT-MOV-05 | Sem movimento válido e sem 6 | A vez passa automaticamente |
| CT-MOV-06 | Lista de peões móveis | Só entram peões que conseguem usar o valor |
| CT-MOV-07 | Passar por outro peão | Só a casa de destino importa; não há captura no caminho |
| CT-MOV-08 | Última casa do percurso | Com 51 passos, o jogador 0 está na casa 51 |
| CT-SEIS-01 | 6 no percurso | O peão anda 6 e o jogador mantém a vez |
| CT-SEIS-02 | Dois 6 seguidos | A vez só passa depois de um valor que não é 6 |
| CT-SEIS-03 | Três 6 consecutivos | O terceiro 6 não move e a vez passa |
| CT-SEIS-04 | Efeito dos dois primeiros 6 | O peão permanece com 6 passos após o cancelamento |
| CT-SEIS-05 | Interrupção da série de 6 | Um 5 zera o contador; uma nova série de três 6 cancela de novo |
| CT-SEIS-06 | 6 sem movimento válido | O jogador permanece na vez para rolar novamente |
| CT-CAP-01 | Captura de peão isolado | Cair na mesma casa captura o adversário |
| CT-CAP-02 | Destino do capturado | O peão volta à base, com casa `null` e 0 passos |
| CT-CAP-03 | Bônus de captura | O jogador que capturou joga novamente |
| CT-CAP-04 | Casa-estrela | Não há captura na casa 8; os dois peões permanecem lá |
| CT-CAP-05 | Casa de saída | Não há captura na casa 26 (saída segura do jogador 1) |
| CT-CAP-06 | Pilha adversária | Movimento para a casa da pilha é inválido; a vez passa |
| CT-CAP-07 | Peões do mesmo jogador | Dois peões próprios na mesma casa não se capturam |
| CT-CAP-08 | Reta final | O peão na reta permanece intacto após o lance do adversário |
| CT-SEG-01 | Conjunto de casas seguras | `[0, 8, 13, 21, 26, 34, 39, 47]` |
| CT-SEG-02 | Saída do jogador 0 | A casa 0 é segura |
| CT-SEG-03 | Saída do jogador 1 | A casa 26 é segura |
| CT-SEG-04 | Estrelas | As casas 8, 21, 34 e 47 são seguras |
| CT-SEG-05 | Casa comum | A casa 3 não é segura e permite captura |
| CT-RETA-01 | Entrada na reta | De 51 passos, um 2 coloca o peão na reta (casa 2 da reta) |
| CT-RETA-02 | Avanço na reta | Da reta 1, um 2 leva o peão à reta 3 |
| CT-RETA-03 | Chegada exata | Faltando 3, um 3 coloca o peão na chegada (57 passos) |
| CT-RETA-04 | Valor maior que o necessário | Movimento inválido; o peão não recua e a vez passa |
| CT-RETA-05 | Faltando 1 | Chega com 1 e não chega com 2 |
| CT-RETA-06 | Da última casa do percurso | Um 6 a partir de 51 passos leva à chegada |
| CT-RETA-07 | Bônus de chegada | Chegar com um peão (sem vencer) concede nova jogada |
| CT-RETA-08 | Retas independentes | Avançar na reta do jogador 0 não altera a reta do jogador 1 |
| CT-VIT-01 | Condição de vitória | O 4º peão na chegada encerra a partida com vencedor 0 |
| CT-VIT-02 | Ainda falta um peão | O 3º peão chega, mas a partida continua |
| CT-VIT-03 | Partida encerrada | `rolar()` e `mover()` lançam erro após a vitória |
| CT-VIT-04 | Vitória do jogador 1 | O jogador 1 também vence com os 4 peões na chegada |
| CT-ERR-01 | Mover sem rolar | Erro: é necessário rolar o dado antes de mover |
| CT-ERR-02 | Rolar duas vezes | Erro: é necessário mover antes de rolar novamente |
| CT-ERR-03 | Índice de peão inválido | Erro para 4, -1 ou 1,5 |
| CT-ERR-04 | Peão que não pode usar o valor | Erro ao tentar mover esse peão |
| CT-ERR-05 | Troca de vez | Sem bônus (6, captura ou chegada), a vez passa |
| CT-ERR-06 | Consulta inválida | `obterPeao` rejeita jogador ou peão inexistente |
| CT-ERR-07 | Posição inválida | `definirPosicao` rejeita passos fora de 0 a 57 |
| CT-ERR-08 | Reposição no meio da jogada | `definirPosicao` é recusado após rolar e antes de mover |
| CT-INT-01 | Vitória com os 4 peões | Sequência de quatro chegadas; o jogador 0 vence |
| CT-INT-02 | Turnos com os dois jogadores | Ambos saem e andam; a vez alterna corretamente |
| CT-INT-04 | Jogador 1 sem movimento | Sem peão na pista, o jogador 1 passa a vez de volta |
| CT-INT-03 | Volta completa só com a API pública | Um peão sai, percorre 57 passos e chega, sem `definirPosicao` |

## Como executar

Requisitos: Node.js e npm.

```bash
npm install
npm test
```

O script `npm test` executa o Jest em modo verboso e deve encerrar com todos os casos passando.

## Colaborador(es)

- Rodrigo A. Del Padre Filho

## Adaptação da implementação

A lógica de `src/dado.js` foi reorganizada nesta versão. As regras do jogo permanecem as descritas acima.
