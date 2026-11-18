# Desafio: Campo Minado

**Nome:** André Tavares  
**RA:** 24066498-2

### Cenário adicional desta versão

Ausência de vizinhos repetidos e da própria célula. O arquivo `tests/personalizacao.test.js` acrescenta essa verificação à suíte original. Execute somente esse cenário com `npm run test:personalizacao` ou todos os testes com `npm test`.

Esta versão adapta a implementação da base original mantendo as regras e a interface pública do desafio. Os créditos originais foram preservados.

Repositório: `desafio_teste_campo_minado`

Disciplina: Projeto, Implementação e Teste de Software (2026)  
Prazo: 22/11/2026

## Especificação do desafio

O enunciado pede **casos de teste em JavaScript para testar JavaScript** de um Campo Minado com tabuleiro **18 x 14** e **40 bombas**.

Como o enunciado não detalha as regras do jogo, esta implementação segue o Campo Minado clássico (estilo Windows), com as decisões abaixo documentadas para o professor.

### Tabuleiro oficial

| Parâmetro | Valor | Observação |
|-----------|-------|------------|
| Linhas | 18 | Índices de 0 a 17 |
| Colunas | 14 | Índices de 0 a 13 |
| Bombas | 40 | Posições únicas e dentro do tabuleiro |
| Células totais | 252 | 18 × 14 |
| Células seguras | 212 | 252 − 40 |

A convenção adotada é **18 linhas × 14 colunas** (altura × largura). Coordenadas são do tipo `(linha, coluna)`, começando em `(0, 0)` no canto superior esquerdo.

### Regras implementadas

1. **Posicionamento das bombas.** As 40 bombas são distribuídas aleatoriamente, ou recebem posições injetadas nos testes. A aleatoriedade é injetável (função que devolve um número em `[0, 1)`), para que os testes sejam determinísticos.
2. **Números adjacentes.** Cada célula segura mostra quantas bombas existem nas até 8 casas vizinhas (3 no canto, 5 na borda, 8 no centro).
3. **Revelar.** Clique em número revela só aquela célula. Clique em célula com 0 bombas adjacentes dispara a **abertura** (flood fill): revela a região vazia e a borda numérica, sem atravessar bombas nem células com bandeira.
4. **Primeiro clique seguro.** Em partida aleatória, o primeiro clique nunca cai em bomba: se a célula tiver bomba, ela é relocacionada para uma casa livre e os números são recalculados. A proteção só é aplicada quando o clique de fato abre uma célula; tentar revelar uma casa já aberta ou com bandeira não relocaciona bomba nem consome o primeiro clique. Quando as posições são injetadas nos testes, a proteção vem **desligada** por padrão, para ser possível testar a derrota. Dá para religá-la com `protegerPrimeiroClique: true`.
5. **Bandeira.** Alterna marca em célula fechada. Não é possível marcar célula já revelada nem revelar célula com bandeira. É permitido colocar mais bandeiras do que bombas; o contador `bombasRestantes` pode ficar negativo (comportamento clássico).
6. **Abrir adjacentes (acordeão / chord).** Em uma célula já revelada, se o número de bandeiras vizinhas for exatamente igual ao número da célula, os vizinhos sem bandeira são revelados. Se alguma dessas casas for uma bomba (bandeira no lugar errado), a partida termina em derrota.
7. **Vitória.** Todas as 212 células seguras foram reveladas. Não é necessário marcar as bombas com bandeira.
8. **Derrota.** Uma bomba foi revelada. A célula explodida é identificada e, após o fim da partida, as bombas passam a aparecer na visão do jogador.
9. **Fim de jogo.** Depois de vitória ou derrota, revelar, marcar bandeira ou abrir adjacentes lança erro.
10. **Marca de interrogação (?).** Não foi implementada, porque o enunciado não a exige.

### API principal

```js
const { criarJogo, completarBombas, geradorComSemente } = require('./src');

const jogo = criarJogo({
  posicoesBombas: completarBombas([[0, 0]]), // opcional, exatamente 40 posições
  geradorAleatorio: geradorComSemente(2026),  // opcional
  protegerPrimeiroClique: false,              // opcional
});

jogo.revelar(0, 0);
jogo.alternarBandeira(1, 2);
jogo.abrirAdjacentes(0, 0);
jogo.celula(0, 0);       // visão do jogador (esconde bombas durante a partida)
jogo.inspecionar(0, 0);  // visão completa, para os testes
```

### Estrutura do projeto

```
desafio_teste_campo_minado/
├── package.json
├── .gitignore
├── README.md
├── src/
│   ├── constantes.js   // 18x14, 40 bombas e estados da partida
│   ├── tabuleiro.js    // vizinhança, posicionamento e relocação de bombas
│   ├── auxiliares.js   // gerador com semente e montagem das 40 posições
│   ├── jogo.js         // regras da partida
│   └── index.js
└── tests/
    ├── tabuleiro.test.js
    ├── jogo.criacao.test.js
    ├── jogo.revelar.test.js
    ├── jogo.bandeira.test.js
    ├── jogo.abrirAdjacentes.test.js
    ├── jogo.vitoria-derrota.test.js
    ├── jogo.validacoes.test.js
    └── auxiliares.test.js
```

O curso usa sobretudo JUnit (Java) e Playwright. Como este desafio pede testes em JavaScript para código JavaScript e não há um padrão JS de teste unitário nas pastas `aulas/` e `atividades/`, a suíte foi escrita em **Jest**, com nomes no estilo da disciplina (`deve...`, `não deve...`).

## Como funcionam os casos de teste

São **69 casos**, agrupados em casos normais, limites e erros. A aleatoriedade é controlada com `geradorComSemente` ou com `posicoesBombas` fixas (sempre 40 bombas no tabuleiro 18×14).

### Tabuleiro (`tests/tabuleiro.test.js`)

| ID | O que testa | Resultado esperado |
|----|-------------|--------------------|
| CT-TAB-01 | Coordenadas internas e os quatro cantos | `(0,0)`, `(0,13)`, `(17,0)`, `(17,13)` e um ponto central são válidos |
| CT-TAB-02 | Coordenadas fora do 18×14 | `estaDentro` é falso e `validarCoordenada` lança erro |
| CT-TAB-03 | Coordenadas não inteiras ou ausentes (`1.5`, `null`, `undefined`, string, `NaN`) | Coordenada inválida e erro |
| CT-TAB-04 | Vizinhança nos cantos | Cada canto tem exatamente 3 vizinhos |
| CT-TAB-05 | Vizinhança nas bordas (sem ser canto) | Cada borda tem exatamente 5 vizinhos |
| CT-TAB-06 | Vizinhança no centro | Célula central tem exatamente 8 vizinhos |
| CT-TAB-07 | Criação do tabuleiro vazio | Matriz 18×14, 252 posições, sem bomba, bandeira ou revelação |
| CT-TAB-08 | Posicionamento injetado | Exatamente 40 bombas, inclusive nas posições pedidas |
| CT-TAB-09 | Contagem de adjacentes no canto, na borda e no centro | Vizinhos de uma bomba isolada valem 1; célula distante vale 0; bomba não exibe número |
| CT-TAB-10 | Quantidade diferente de 40 bombas, ou lista inválida | Erro informando que devem ser exatamente 40, ou que a lista é inválida |
| CT-TAB-11 | Bombas duplicadas | Erro de posição duplicada |
| CT-TAB-12 | Bomba fora do tabuleiro ou posição malformada | Erro de coordenada ou de posição inválida |
| CT-TAB-13 | Gerador injetado com semente | 40 posições distintas e válidas; a mesma semente repete o tabuleiro; semente diferente gera outro |
| CT-TAB-14 | Gerador inválido (`null`, `1`, número negativo, string) | Erro exigindo função com valor em `[0, 1)` |
| CT-TAB-15 | Relocação de uma bomba com gerador `() => 0` | A lista de casas livres é percorrida em ordem linha-coluna; o gerador `0` escolhe o índice 0, então a bomba de `(0,0)` vai para a primeira casa livre, `(0,1)`. A origem fica livre, o total continua 40 e os números são recalculados |
| CT-TAB-16 | Relocação onde não há bomba | Erro informando que não há bomba na origem |

### Criação do jogo (`tests/jogo.criacao.test.js`)

| ID | O que testa | Resultado esperado |
|----|-------------|--------------------|
| CT-CRI-01 | Partida oficial | 18 linhas, 14 colunas, 40 bombas, estado `em_andamento`, nenhuma célula revelada |
| CT-CRI-02 | Injeção de posições | As bombas pedidas estão no tabuleiro e o total é 40 |
| CT-CRI-03 | Gerador determinístico | Mesma semente implica o mesmo mapa; sementes diferentes, mapas diferentes |
| CT-CRI-04 | Visão do jogador durante a partida | `celula()` esconde bomba e adjacentes; `inspecionar()` mostra a bomba para o teste |
| CT-CRI-05 | Visão do jogador após a derrota | A bomba aparece e a célula clicada fica marcada como explodida |
| CT-CRI-06 | Proteção padrão no jogo aleatório | O primeiro clique em `(0,0)` não termina em derrota e aquela casa deixa de ter bomba |
| CT-CRI-07 | Sem proteção quando as bombas são injetadas | Clicar na bomba no primeiro lance causa derrota |
| CT-CRI-08 | Proteção ligada mesmo com posições injetadas | A bomba do primeiro clique é movida e a partida continua |
| CT-CRI-09 | Lista vazia ou com duplicata | Erro na criação do jogo |

### Revelar e abertura (`tests/jogo.revelar.test.js`)

| ID | O que testa | Resultado esperado |
|----|-------------|--------------------|
| CT-REV-01 | Clique em célula numérica | Só aquela célula é revelada; a partida segue |
| CT-REV-02 | Clique em célula com 0 adjacentes (muro de bombas na linha 2) | Abertura revela as 14 casas da linha 0 e as 14 da linha 1 (28 no total) |
| CT-REV-03 | Abertura não atravessa bombas | As bombas da linha 2 e as casas atrás do muro permanecem fechadas |
| CT-REV-04 | Bandeira no caminho da abertura | A célula com bandeira não abre; a abertura também não atravessa essa casa |
| CT-REV-05 | Segundo clique na mesma célula | Retorna `celula_ja_revelada` e não altera o tabuleiro |
| CT-REV-06 | Revelar célula com bandeira | Retorna `celula_com_bandeira` e a casa permanece fechada |
| CT-REV-07 | Clique em bomba sem proteção | Estado `derrota` e a célula explodida é registrada |
| CT-REV-08 | Primeiro clique protegido em cima de bomba | A bomba muda de lugar, a casa é revelada e o jogo não termina |
| CT-REV-09 | Clique seguinte em bomba | A proteção vale só para o primeiro clique; o segundo na bomba causa derrota |
| CT-REV-10 | Borda da abertura | 14 zeros na linha 0 e 14 números na linha 1; nada além da borda |
| CT-REV-11 | Abertura partindo do canto `(0,0)` | Não lança erro e revela as 28 casas esperadas, inclusive `(0,13)` |
| CT-REV-12 | Tentar revelar célula com bandeira (e com bomba) no primeiro clique | Retorna `celula_com_bandeira`, a bomba permanece em `(0,0)` e a proteção não é consumida: depois de desmarcar, o primeiro clique real relocaciona a bomba e não termina em derrota |

### Bandeiras (`tests/jogo.bandeira.test.js`)

| ID | O que testa | Resultado esperado |
|----|-------------|--------------------|
| CT-BAN-01 | Marcar e desmarcar | A bandeira alterna entre ligada e desligada |
| CT-BAN-02 | Contador de bombas restantes | Começa em 40; cai a cada bandeira e volta ao desmarcar |
| CT-BAN-03 | Mais bandeiras do que bombas | 42 bandeiras são aceitas e `bombasRestantes` fica em −2 |
| CT-BAN-04 | Bandeira em célula revelada | Operação recusada (`celula_ja_revelada`) |
| CT-BAN-05 | Revelar com bandeira e depois de desmarcar | Com bandeira não revela; depois de tirar a marca, revela normalmente |
| CT-BAN-06 | Bandeira antes do primeiro clique | A marca é aceita e nenhuma célula é revelada |

### Abrir adjacentes (`tests/jogo.abrirAdjacentes.test.js`)

| ID | O que testa | Resultado esperado |
|----|-------------|--------------------|
| CT-ADJ-01 | Número de bandeiras igual ao número da célula | Os vizinhos sem bandeira abrem; a casa marcada permanece fechada |
| CT-ADJ-02 | Nenhuma bandeira, ou bandeiras a mais | Retorna `bandeiras_incorretas` e nada é revelado |
| CT-ADJ-03 | Bandeira no lugar errado | Derrota, com explosão na bomba não marcada |
| CT-ADJ-04 | Acordeão em célula ainda fechada | Retorna `celula_nao_revelada` |
| CT-ADJ-05 | Vizinho vazio aberto pelo acordeão | A abertura se propaga para além dos vizinhos imediatos |
| CT-ADJ-06 | Célula com bandeira no acordeão | Continua fechada e marcada |

### Vitória e derrota (`tests/jogo.vitoria-derrota.test.js`)

| ID | O que testa | Resultado esperado |
|----|-------------|--------------------|
| CT-FIM-01 | Revelar todas as 212 células seguras (abertura a partir de `(0,0)`) | Estado `vitoria`; nenhuma bomba é revelada |
| CT-FIM-02 | Vitória sem bandeiras | A partida é vencida com zero bandeiras |
| CT-FIM-03 | Clique em bomba | Estado `derrota` |
| CT-FIM-04 | Célula explodida | Só a bomba clicada fica `explodida`; as demais bombas aparecem, mas não explodidas |
| CT-FIM-05 | Revelar após derrota | Erro: o jogo já terminou com derrota |
| CT-FIM-06 | Bandeira após vitória | Erro: o jogo já terminou com vitória |
| CT-FIM-07 | Acordeão após derrota | Erro: o jogo já terminou com derrota |
| CT-FIM-08 | Visão do jogador após derrota | Todas as 40 bombas ficam visíveis em `celula()` |

### Validações e limites (`tests/jogo.validacoes.test.js`)

| ID | O que testa | Resultado esperado |
|----|-------------|--------------------|
| CT-VAL-01 | `revelar` fora do tabuleiro (`-1`, `18`, coluna `14`) | Erro de coordenada inválida |
| CT-VAL-02 | `alternarBandeira` fora do tabuleiro | Erro de coordenada inválida |
| CT-VAL-03 | `abrirAdjacentes` fora do tabuleiro | Erro de coordenada inválida |
| CT-VAL-04 | `inspecionar` com valor não inteiro ou nulo | Erro de coordenada inválida |
| CT-VAL-05 | `celula` fora do tabuleiro ou com tipo inválido | Erro de coordenada inválida |
| CT-VAL-06 | Operações nos quatro cantos | Bandeira e revelação nos cantos são aceitas; não há erro |

### Auxiliares de teste (`tests/auxiliares.test.js`)

| ID | O que testa | Resultado esperado |
|----|-------------|--------------------|
| CT-AUX-01 | `completarBombas()` sem argumentos | Devolve exatamente 40 posições, todas únicas e dentro do tabuleiro 18×14 |
| CT-AUX-02 | Posições prioritárias no formato `[linha, coluna]` e `{linha, coluna}` | As 40 posições incluem `(0,0)`, `(5,7)` e `(17,13)` e continuam únicas |
| CT-AUX-03 | Lista `evitar` | Nenhuma das células evitadas entra no resultado; as prioritárias entram; o total continua 40 |
| CT-AUX-04 | Impossível completar 40 bombas (213 casas em `evitar`, restam 39) | Lança erro informando que não foi possível completar 40 bombas |
| CT-AUX-05 | `geradorComSemente` com a mesma semente | As duas sequências são iguais; cada valor está em `[0, 1)` |
| CT-AUX-06 | `geradorComSemente` com sementes diferentes | As sequências de 20 valores são diferentes |

## Como executar

Requisitos: Node.js 18 ou superior e npm.

```bash
npm install
npm test
```

O comando `npm test` dispara o Jest e deve encerrar com **69 testes passando**.

Para rodar um arquivo específico:

```bash
npx jest tests/jogo.revelar.test.js
```

## Adaptação da implementação

A lógica de `src/tabuleiro.js` foi reorganizada nesta versão. As regras do jogo permanecem as descritas acima.
