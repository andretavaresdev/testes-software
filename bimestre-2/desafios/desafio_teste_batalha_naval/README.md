# Desafio de Teste — Batalha Naval

Regras e testes do jogo de Batalha Naval com tabuleiro 10 x 10.

## Especificação do desafio

Implementar e testar, em JavaScript, as regras de um tabuleiro de **Batalha Naval 10 x 10**, conforme o enunciado em [desafios.md](https://github.com/JoaoChoma/teste_software_2026/blob/main/desafios.md):

- 1 Porta-aviões (ocupa 5 casas)
- 1 Encouraçado (ocupa 4 casas)
- 1 Submarino (ocupa 3 casas)
- 1 Destroier ou Hidroavião (ocupa 2 casas)

Os testes usam Jest.

### Regras implementadas

1. O tabuleiro tem exatamente 10 linhas e 10 colunas. As coordenadas são aceitas em três formas equivalentes, em `posicionarNavio`, `atirar` e `obterCelula`:
   - dois argumentos numéricos `linha, coluna`, de `0` a `9`;
   - um objeto `{ linha, coluna }`, também com valores de `0` a `9`;
   - uma string algébrica `A1` (canto superior esquerdo) até `J10` (canto inferior direito), em que a letra é a linha (`A` = 0 … `J` = 9) e o número é a coluna (`1` = 0 … `10` = 9).
2. Cada navio é posicionado a partir de uma origem, apenas na **horizontal** (para a direita) ou na **vertical** (para baixo). Não há posicionamento diagonal.
3. O navio precisa caber inteiro no tabuleiro. Qualquer casa além da linha ou da coluna 9 é rejeitada.
4. Navios **não podem se sobrepor**. Navios **adjacentes** (lado a lado, sem compartilhar casas) são permitidos.
5. A frota é composta por exatamente um navio de cada grupo. Destroier e Hidroavião ocupam o mesmo lugar na frota: só um dos dois pode ser posicionado.
6. Os tiros só são aceitos depois que a frota estiver completa (os 4 navios).
7. Resultado de um tiro:
   - `agua` — a célula está vazia;
   - `acerto` — a célula pertence a um navio que ainda tem casas intactas;
   - `afundado` — o tiro acertou a última casa intacta daquele navio.
8. O jogo termina (`fimDeJogo: true`) quando todos os navios da frota foram afundados. Depois disso, novos tiros são rejeitados.
9. Não é permitido atirar duas vezes na mesma célula, nem posicionar navios depois que os tiros começaram.

### Regras e limites

São consideradas as seguintes regras:

- Navios adjacentes (lado a lado, sem compartilhar casas) são permitidos. Não há “casa de água” obrigatória entre eles.
- O Hidroavião é linear e ocupa 2 casas, como o Destroier; não tem forma especial em T. Só um dos dois entra na frota.
- Não é obrigatório implementar dois jogadores nem turnos alternados. A implementação testa um tabuleiro sob ataque (posicionamento, tiros e encerramento).
- A notação `A1`–`J10` é aceita, com a letra representando a linha.
- Tamanho e tipo do navio são fixos: o chamador informa o tipo, e o tamanho vem da especificação.

## Casos de teste

A suíte está em `tests/batalhaNaval.test.js` e cobre casos normais, de limite e de erro. Todas as formas da API de coordenadas (números, `{ linha, coluna }` e `A1`–`J10`) estão fixadas por teste. Os casos inválidos esperam o lançamento de `ErroBatalhaNaval` com um código específico.

| ID | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-01 | Criação de um tabuleiro vazio 10x10 | 100 células livres, nenhum navio, `frotaCompleta()` falso |
| CT-02 | Consulta de célula com linha -1 | Erro `FORA_DO_TABULEIRO` |
| CT-03 | Consulta de célula com coluna 10 | Erro `FORA_DO_TABULEIRO` |
| CT-04 | Posiciona Porta-aviões (5) na horizontal em (0,0) | Ocupa as colunas 0 a 4 da linha 0 |
| CT-05 | Posiciona Encouraçado (4) na vertical em (0,0) | Ocupa as linhas 0 a 3 da coluna 0 |
| CT-06 | Posiciona Submarino (3) na horizontal | Navio de tamanho 3, 3 casas ocupadas |
| CT-07 | Posiciona Destroier (2) na horizontal | Navio de tamanho 2, nome “Destroier” |
| CT-08 | Posiciona Hidroavião (2) no lugar do Destroier | Navio de tamanho 2, nome “Hidroavião” |
| CT-09 | Posiciona os 4 navios da frota sem sobreposição | `frotaCompleta()` verdadeiro e 4 navios restantes |
| CT-10 | Navios adjacentes, sem sobreposição | Posicionamento aceito |
| CT-11 | Porta-aviões no limite direito: origem (0,5) horizontal | Última casa em (0,9) |
| CT-12 | Encouraçado no limite inferior: origem (6,0) vertical | Última casa em (9,0) |
| CT-13 | Destroier no canto inferior direito: origem (9,8) | Casas (9,8) e (9,9) |
| CT-14 | Porta-aviões horizontal em (0,6) ultrapassa o tabuleiro | Erro `FORA_DO_TABULEIRO`; nenhum navio permanece |
| CT-15 | Submarino vertical em (8,0) ultrapassa o tabuleiro | Erro `FORA_DO_TABULEIRO` |
| CT-16 | Linha inicial negativa no posicionamento | Erro `FORA_DO_TABULEIRO` |
| CT-17 | Coluna inicial negativa no posicionamento | Erro `FORA_DO_TABULEIRO` |
| CT-18 | Linha inicial 10 no posicionamento | Erro `FORA_DO_TABULEIRO` |
| CT-19 | Coluna inicial 10 no posicionamento | Erro `FORA_DO_TABULEIRO` |
| CT-20 | Sobreposição parcial entre Porta-aviões e Encouraçado | Erro `SOBREPOSICAO`; permanece só o primeiro navio |
| CT-21 | Sobreposição total (mesma origem) | Erro `SOBREPOSICAO` |
| CT-22 | Segundo Porta-aviões na mesma frota | Erro `TIPO_DUPLICADO` |
| CT-23 | Destroier e Hidroavião no mesmo tabuleiro | Erro `TIPO_DUPLICADO` |
| CT-24 | Tipo de navio desconhecido (`cruzador`) | Erro `TIPO_INVALIDO` |
| CT-25 | Orientação inválida (`diagonal`) | Erro `ORIENTACAO_INVALIDA` |
| CT-26 | Frota com apenas 3 navios | `frotaCompleta()` permanece falso |
| CT-27 | Tiro em célula vazia | Resultado `agua`, `fimDeJogo` falso, 4 navios restantes |
| CT-28 | Tiro em navio com casas ainda intactas | Resultado `acerto`, identifica o Porta-aviões, jogo segue |
| CT-29 | Último tiro sobre o Destroier (2 casas) | Primeiro tiro `acerto`; segundo `afundado`; restam 3 navios |
| CT-30 | Afundar só o Submarino | Jogo não termina; restam 3 navios |
| CT-31 | Afundar os 4 navios da frota | Último tiro retorna `afundado` e `fimDeJogo` verdadeiro |
| CT-32 | Tiro no canto (0,0) | Coordenada aceita; acerto no Porta-aviões da frota padrão |
| CT-33 | Tiro no canto (9,9) | Coordenada aceita; acerto no Submarino da frota padrão |
| CT-34 | Tiro com linha -1 | Erro `FORA_DO_TABULEIRO` |
| CT-35 | Tiro com coluna 10 | Erro `FORA_DO_TABULEIRO` |
| CT-36 | Tiro repetido em célula que já foi água | Erro `TIRO_REPETIDO` |
| CT-37 | Tiro repetido em célula que já foi acerto | Erro `TIRO_REPETIDO` |
| CT-38 | Tiro antes da frota completa | Erro `FROTA_INCOMPLETA` |
| CT-39 | Posicionar navio depois que os tiros começaram | Erro `POSICIONAMENTO_ENCERRADO` |
| CT-40 | Tiro depois do fim de jogo | Erro `JOGO_FINALIZADO` |
| CT-41 | Sequência completa: água, acerto, um navio afundado e encerramento | Cada etapa devolve o resultado correspondente e o jogo termina só no último afundamento |
| CT-42 | Contagem de navios restantes | Permanece 4 após acertos parciais; cai para 3 só ao afundar |
| CT-43 | Marcação de células atingidas | Só a célula alvejada fica marcada; as demais intactas não registram tiro |
| CT-44 | Notação algébrica `A1`…`J10` no posicionamento e no tiro | Conversão correta; tiro em `J10` acerta o Submarino |
| CT-45 | Coordenadas algébricas inválidas (`K1`, `A0`, `A11`, vazio, `AA1`, `1A`) | Erro `COORDENADA_INVALIDA` em todas |
| CT-46 | Posicionamento com origem `{ linha, coluna }` (Porta-aviões e Encouraçado) | Casas iguais às da forma numérica; `obterCelula({ linha, coluna })` confirma a ocupação |
| CT-47 | Tiro com `{ linha, coluna }` após posicionar a frota nesse mesmo formato | `{ linha: 0, coluna: 9 }` retorna `agua`; `{ linha: 0, coluna: 0 }` retorna `acerto` no Porta-aviões |
| CT-48 | Objeto `{ linha, coluna }` válido e fora do tabuleiro no parse, na consulta, no posicionamento e no tiro | `parsearCoordenada` aceita `{0,0}` e `{9,9}`; origens/tiros fora de 0–9 geram `FORA_DO_TABULEIRO` |

## Como executar

Requisitos: Node.js 18+ e npm.

```bash
npm install
npm test
```

Os testes rodam com Jest (`package.json`, script `test`). A implementação está em `src/batalhaNaval.js`.

## Colaborador

- André Tavares (RA: 24066498-2)
