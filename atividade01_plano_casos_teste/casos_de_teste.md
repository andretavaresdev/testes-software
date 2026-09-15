# Casos de Teste - Sistema de Reserva de Salas

## Caso de Teste - Criar reserva de sala

Descrição: verificar se o sistema permite reservar uma sala disponível para
uma turma compatível e recusa a reserva quando alguma regra não é atendida
(conflito de horário, capacidade, manutenção ou fora do horário permitido).

Pré-condições: usuário logado como professor, com pelo menos uma sala
disponível cadastrada.

Passos:
1. Acessar a tela de reserva de salas.
2. Buscar sala e horário desejados.
3. Selecionar a turma.
4. Confirmar a reserva.

Cenário 1 - Reserva válida:
- Dados de Teste:
  - Sala: Sala A (capacidade 30, sem manutenção)
  - Turma: Turma X (30 alunos)
  - Horário: 09h às 10h
- Resultado Esperado:
  - A reserva é criada e a sala aparece ocupada nesse horário.

Cenário 2 - Sobreposição de horário na mesma sala:
- Dados de Teste:
  - Sala A já reservada das 09h às 10h
  - Nova tentativa: Sala A, das 09h30 às 10h30
- Resultado Esperado:
  - O sistema recusa a reserva e avisa que já existe uma reserva conflitando
    com esse horário.

Cenário 3 - Turma maior que a capacidade da sala:
- Dados de Teste:
  - Sala B (capacidade 10)
  - Turma com 11 alunos
- Resultado Esperado:
  - O sistema não permite a reserva, avisando que a capacidade foi excedida.

Cenário 4 - Turma no limite da capacidade da sala:
- Dados de Teste:
  - Sala B (capacidade 10)
  - Turma com exatamente 10 alunos
- Resultado Esperado:
  - A reserva é aceita normalmente (o limite é inclusive).

Cenário 5 - Sala em manutenção:
- Dados de Teste:
  - Sala B em manutenção no dia da reserva
- Resultado Esperado:
  - O sistema não permite reservar essa sala nesse dia e informa que ela está
    em manutenção.

Cenário 6 - Horário antes do funcionamento (07h00):
- Dados de Teste:
  - Reserva das 07h00 às 08h00
- Resultado Esperado:
  - O sistema recusa por estar fora do horário permitido (07h30 às 22h30).

Cenário 7 - Horário no limite inicial permitido (07h30):
- Dados de Teste:
  - Reserva das 07h30 às 08h30
- Resultado Esperado:
  - A reserva é aceita normalmente.

Cenário 8 - Horário depois do funcionamento (23h00):
- Dados de Teste:
  - Reserva das 22h00 às 23h00
- Resultado Esperado:
  - O sistema recusa por ultrapassar o horário permitido.

Pós-condições: sala aparece como reservada no horário confirmado, ou
continua livre caso a reserva tenha sido recusada.

## Caso de Teste - Alterar e cancelar reserva

Descrição: verificar as regras de permissão para alterar uma reserva e se o
cancelamento libera o horário, gera histórico e dispara notificação.

Pré-condições: existe uma reserva confirmada, criada por um professor comum.

Passos:
1. Acessar a reserva existente.
2. Tentar alterar ou cancelar, conforme o cenário.

Cenário 1 - Professor tenta alterar reserva de outro professor:
- Dados de Teste:
  - Usuário: outro professor comum (não é o dono da reserva)
- Resultado Esperado:
  - O sistema não permite a alteração, por falta de permissão.

Cenário 2 - Coordenação altera reserva de qualquer professor:
- Dados de Teste:
  - Usuário: perfil coordenação
- Resultado Esperado:
  - A alteração é aceita e registrada normalmente.

Cenário 3 - Professor altera a própria reserva:
- Dados de Teste:
  - Usuário: o próprio professor que criou a reserva
- Resultado Esperado:
  - A alteração é aceita.

Cenário 4 - Cancelamento de reserva:
- Dados de Teste:
  - Reserva confirmada, cancelada pelo dono ou pela coordenação
- Resultado Esperado:
  - O horário volta a ficar disponível e o cancelamento fica registrado no
    histórico da sala (quem cancelou e quando).

Cenário 5 - Notificação após alteração ou cancelamento:
- Dados de Teste:
  - Reserva alterada ou cancelada no cenário anterior
- Resultado Esperado:
  - O responsável pela reserva recebe (ou tem registrada) uma notificação
    sobre a mudança.

Pós-condições: a reserva fica com o novo horário, ou volta a ficar disponível
em caso de cancelamento.
