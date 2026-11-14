# Mini-spec: Sincronização eficiente de lembretes

Número: 18
Status: planejado

## Problema

A inicialização e a sincronização dos lembretes estão acopladas ao ciclo de vida das listas de compras em `src/app/_layout.tsx`. O efeito depende de `lists`, cuja referência muda também quando produtos são adicionados, editados, removidos ou coletados. Assim, operações comuns na lista podem disparar novamente a limpeza de órfãos e a sincronização de todos os lembretes.

Além disso, `ReminderOrchestrator.syncWithPermissions` cancela e agenda novamente cada lembrete habilitado sempre que é executado. O efeito de resposta a notificações também depende de valores de navegação e estado que mudam durante o uso, o que pode recriar listeners e repetir o bootstrap.

## Objetivo

Tornar a sincronização de lembretes previsível, idempotente e independente de alterações que não afetam sua validade, reduzindo chamadas nativas e evitando reagendamentos desnecessários.

## Comportamento esperado

- O bootstrap de lembretes deve ocorrer quando o estado persistido estiver hidratado e quando houver mudanças relevantes na coleção de lembretes, nas permissões ou nos identificadores das listas.
- Alterações em produtos ou no nome de uma lista não devem provocar reagendamento de notificações.
- A sincronização deve reconciliar o estado persistido com as notificações agendadas, preservando agendamentos válidos.
- Um lembrete deve ser reagendado somente quando sua data, título, estado habilitado ou contexto necessário mudar, ou quando o sistema operacional perder seu agendamento.
- A limpeza de lembretes órfãos deve ocorrer quando uma lista for removida ou quando a integridade das referências for verificada, sem depender de alterações nos produtos.
- Listeners de resposta a notificações devem ser registrados uma única vez por ciclo de montagem e removidos corretamente no cleanup.
- Inicialização, retomada do app e mudanças de permissão devem convergir para o mesmo estado final sem criar notificações duplicadas.
- A web deve continuar usando lembretes in-app, sem tentar agendar notificações nativas.

## Telas e arquivos afetados

- `src/app/_layout.tsx`
- `src/services/ReminderOrchestrator.ts`
- `src/services/NotificationService.ts`
- `src/stores/ReminderStore.ts`
- Testes de serviços, stores e layout.

## Dados e persistência

- Preservar o contrato atual de `ReminderProps` e a chave `gastometro-reminders`.
- Não persistir estado transitório de sincronização sem justificativa.
- O identificador nativo da notificação deve continuar sendo tratado como referência descartável e reconciliável.

## Regras de validação

- Não solicitar permissão automaticamente em um bootstrap silencioso.
- Tratar permissão negada, indisponível e plataforma web como estados válidos.
- Tratar falhas individuais de cancelamento/agendamento sem interromper a reconciliação de todos os demais lembretes.
- Evitar concorrência entre sincronizações simultâneas; execuções sobrepostas devem ser serializadas ou consolidadas.
- Não remover um lembrete persistido apenas porque o agendamento nativo falhou.

## Critérios de aceite

- Adicionar, editar, remover ou coletar produtos não dispara reagendamento de lembretes.
- Renomear uma lista não dispara reagendamento de lembretes.
- Remover uma lista cancela os agendamentos relacionados e remove seus lembretes persistidos.
- Alterar data ou habilitação de um lembrete atualiza somente o agendamento afetado.
- Reexecutar a sincronização sem alterações não cancela nem recria notificações válidas.
- O fluxo de toque em notificação continua selecionando a lista correta e navegando para a tela principal.
- Testes cobrem permissões concedidas/negadas, web, falhas nativas, execuções repetidas e concorrentes.
- A suíte existente permanece verde.

## Fora de escopo

- Notificações remotas ou backend.
- Lembretes recorrentes.
- Alteração da experiência de criação e edição de lembretes.
- Alteração do formato persistido dos lembretes.

## Observações para IA

- Inspecionar o comportamento de hidratação do Zustand antes de alterar o momento do bootstrap.
- Preferir seletores estáveis e dependências baseadas em identificadores, não em objetos completos de listas.
- Não assumir que o identificador salvo em `notificationId` garante que a notificação ainda existe no sistema operacional.
