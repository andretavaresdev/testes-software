# Teste de Usuário Final - Mercado Livre

## 1. Objetivo do teste

Avaliar a facilidade de uso, eficiência e clareza da interface na busca, comparação e simulação de compra de um produto no Mercado Livre.

**Tipo de atividade:** simulação de usabilidade com quatro perfis. Os tempos e erros foram definidos para o exercício e não são registros de participantes observados presencialmente.

## 2. Cenário de uso

O usuário busca um fone de ouvido sem fio para uso diário. Deve pesquisar por `fone de ouvido Bluetooth`, selecionar entrega Full, ordenar pelos melhores avaliados, comparar produtos, adicionar ao carrinho, simular o início da compra sem pagar e retornar ao início.

## 3. Tarefas

1. Acessar https://www.mercadolivre.com.br.
2. Pesquisar por fone de ouvido Bluetooth.
3. Aplicar o filtro de entrega Full e ordenar pelos melhores avaliados.
4. Comparar opções e acessar detalhes de um produto.
5. Adicionar o produto ao carrinho.
6. Simular o início da compra sem finalizar pagamento.
7. Retornar à tela inicial.

## 4. Perfis usados na simulação

- P01: comprador frequente, conhece filtros e carrinho.
- P02: comprador ocasional, consulta avaliações antes de decidir.
- P03: pouca experiência com compras pela internet.
- P04: prioriza preço e frete.

O avaliador registra tempo, erros e observações de cada etapa. O instrutor orienta o método.

## 5. Planilha de observação

| Tarefa | P01 (s) | P02 (s) | P03 (s) | P04 (s) |
|---|---:|---:|---:|---:|
| Acessar o site | 12 | 15 | 18 | 14 |
| Buscar produto | 25 | 32 | 37 | 31 |
| Aplicar filtros | 42 | 55 | 66 | 58 |
| Comparar e abrir detalhes | 39 | 44 | 49 | 42 |
| Adicionar ao carrinho | 24 | 27 | 31 | 27 |
| Simular compra | 25 | 25 | 28 | 36 |
| Voltar ao início | 18 | 19 | 20 | 21 |
| **Total** | **185** | **217** | **249** | **229** |

| Perfil | Tempo | Erros | Carrinho | Concluiu sem ajuda |
|---|---|---:|---|---|
| P01 | 3min05s | 0 | Sim | Sim |
| P02 | 3min37s | 1 | Sim | Sim |
| P03 | 4min09s | 2 | Sim | Sim |
| P04 | 3min49s | 1 | Sim | Sim |

A planilha `FICHA_OBSERVACAO.csv` registra todas as etapas e observações individuais.

## 6. Observações dos perfis

- P01: concluiu as etapas sem dificuldade.
- P02: selecionou um filtro incorreto e corrigiu.
- P03: demorou para localizar a ordenação e retornou à lista depois de abrir um produto.
- P04: confundiu entrega Full com frete grátis antes de corrigir a seleção.

## 7. Métricas e critérios de sucesso

- Tempo médio: (185 + 217 + 249 + 229) / 4 = **220 segundos (3min40s)**.
- Taxa de sucesso sem ajuda: 4 de 4 = **100%**.
- Taxa de sucesso ao adicionar ao carrinho: 4 de 4 = **100%**.
- Total de erros: 0 + 1 + 2 + 1 = **4**.

| Critério | Resultado | Situação |
|---|---|---|
| 90% devem adicionar o produto ao carrinho | 100% | Atendido na simulação |
| Tempo médio de até 4 minutos | 3min40s | Atendido na simulação |

Embora P03 tenha levado 4min09s, o critério do enunciado utiliza a média dos participantes.

## 8. Discussão

A aplicação de filtros foi a etapa com maiores tempos e mais erros. O filtro Full pode ser confundido com frete grátis, e a ordenação por avaliação pode ser difícil de localizar. Sugere-se melhorar a identificação desses controles e deixar a diferença entre Full e frete grátis mais clara.

O enunciado menciona o questionário SUS, mas não fornece respostas. Não foi calculada pontuação SUS porque isso exigiria respostas individuais às dez questões.

## 9. Conclusão

Nos dados da simulação, os quatro perfis conseguiram concluir o fluxo sem ajuda e adicionar o produto ao carrinho. A média foi de 3min40s e houve quatro erros corrigidos. Os dois critérios foram alcançados no cenário simulado. Os resultados mostram como registrar e calcular os indicadores, mas não representam uma medição real do site com participantes.
