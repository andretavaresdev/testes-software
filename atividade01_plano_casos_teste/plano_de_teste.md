# Plano de Teste - Sistema de Reserva de Salas

Alunos: André Tavares (24066498-2) e Rodrigo Antonio Del Padre Filho (24042092-2)

## 1. Introdução

Este documento é o plano de teste do sistema de reserva de salas e espaços educacionais, descrito na atividade 01 da disciplina. O sistema permite que professores reservem salas para suas turmas, respeitando capacidade, conflitos de horário, manutenção e permissões de cada perfil de usuário. O objetivo deste plano é organizar como os testes desse sistema serão feitos.

## 2. Objetivos

- Verificar se as regras de negócio (RF-01 a RF-08) foram implementadas corretamente.
- Verificar se os requisitos não funcionais (tempo de busca, auditoria e restrição por unidade) estão sendo atendidos.
- Encontrar o máximo de defeitos possível antes do sistema ir para produção, principalmente nos pontos de maior risco.

## 3. Escopo

Serão testados:

- Criação de reservas (sala compatível, capacidade, horário, manutenção).
- Alteração e cancelamento de reservas.
- Permissões de professor comum x coordenação.
- Notificações e histórico gerados por alteração/cancelamento.
- Os requisitos não funcionais que dá pra conferir por fora: tempo da busca, registro de auditoria e acesso limitado à unidade do usuário.

Não serão testados nesta rodada:

- Desempenho sob carga (apenas o tempo de resposta da busca, de forma simples).
- Segurança de infraestrutura (login, criptografia, etc).
- Envio real de e-mail/SMS das notificações (só o registro da notificação).

## 4. Estratégia de Teste

Os testes vão ser feitos de forma manual, em caixa-preta, a partir dos requisitos funcionais e não funcionais listados na atividade 01. Vamos usar principalmente:

- Classes de equivalência (ex: turma dentro/acima da capacidade).
- Valor-limite (ex: horário de início e fim da janela permitida, capacidade exata da sala).
- Alguns cenários negativos, testando o sistema com dados inválidos ou usuários sem permissão.

## 5. Casos de Teste

Os casos de teste completos estão no arquivo `casos_de_teste.md`, organizados por funcionalidade (criar reserva, alterar/cancelar reserva). Um exemplo:

Caso de Teste - Impedir turma maior que a capacidade da sala
- Descrição: verificar se o sistema recusa a reserva quando a turma é maior que a capacidade da sala escolhida.
- Pré-condições: sala com capacidade 10 cadastrada e disponível.
- Passos:
  1. Selecionar a sala de capacidade 10.
  2. Selecionar uma turma com 11 alunos.
  3. Confirmar a reserva.
- Resultado esperado: o sistema não permite a reserva e avisa que a capacidade foi excedida.

## 6. Ambiente de Teste

Os testes serão feitos em um ambiente de homologação, com uma massa de dados mínima: pelo menos duas salas (uma disponível e uma em manutenção), turmas de tamanhos diferentes e usuários com perfis diferentes (professor comum, coordenação e um usuário de outra unidade).

## 7. Recursos

- Dupla responsável pela elaboração e execução dos testes.
- Ambiente de homologação do sistema.
- Massa de dados de teste (salas, turmas e usuários) descrita acima.

## 8. Cronograma

- Elaboração do plano e dos casos de teste: até 20/08.
- Execução dos testes de maior risco (RF-02, RF-03, RF-06): assim que o ambiente estiver disponível.
- Execução dos demais casos: conforme o cronograma da disciplina.

## 9. Critérios de Aceitação

O sistema será considerado pronto para essa entrega quando:

- Todos os casos de teste relacionados aos riscos críticos (Seção 10) forem executados e aprovados.
- Não existir nenhum defeito grave em aberto ligado a dupla reserva, capacidade insegura ou alteração sem autorização.

## 10. Riscos

Os riscos críticos apontados no enunciado da atividade são:

- Dupla ocupação da mesma sala no mesmo horário (RF-02).
- Reserva com turma maior que a capacidade da sala (RF-03).
- Alteração de reserva sem autorização (RF-06).
- Falha no envio/registro de notificação (RF-08).

Esses são os casos priorizados na execução, caso não sobre tempo para testar tudo.

## 11. Responsabilidades

- A dupla fica responsável por escrever e executar os casos de teste e registrar os defeitos encontrados.
- O professor valida os critérios de aceite conforme a rubrica da avaliação.

## 12. Comunicação

Os resultados dos testes e eventuais defeitos encontrados serão registrados junto com os casos de teste, para consulta durante a correção da atividade.

## 13. Aprovação

Este plano foi feito pela dupla a partir do enunciado da atividade 01 e pode ser ajustado caso apareça alguma dúvida sobre os requisitos durante a execução dos testes.

## 14. Considerações Finais

Este plano cobre o essencial para testar o sistema de reserva de salas dentro do prazo da atividade, priorizando os pontos de maior risco apontados no enunciado.
