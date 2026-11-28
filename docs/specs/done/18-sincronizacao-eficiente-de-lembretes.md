# Mini-spec: Sincronização eficiente de lembretes

Número: 18
Status: implementado

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

## Implementação concluída

A sincronização foi reorganizada para reconciliar o estado persistido com os agendamentos nativos sem cancelar notificações válidas nem reagendar lembretes sem alterações relevantes.

### Decisões implementadas

- O bootstrap aguarda a hidratação do store e utiliza assinaturas estáveis dos campos relevantes dos lembretes e dos identificadores das listas.
- Alterações em produtos, nomes de listas e metadados transitórios não provocam sincronização desnecessária.
- Alterações individuais são reconciliadas pelo ID do lembrete; mudanças estruturais nos identificadores das listas e o bootstrap utilizam reconciliação global.
- A reconciliação consulta os agendamentos nativos, recupera referências persistidas perdidas, remove duplicidades e substitui somente agendamentos ausentes ou divergentes.
- As sincronizações globais e individuais são serializadas e solicitações concorrentes são consolidadas.
- Agendamentos concluídos após uma edição ou remoção concorrente são descartados e reconciliados com o estado atual.
- A limpeza de órfãos preserva registros para nova tentativa quando a consulta nativa falha e continua o processamento diante de falhas individuais de cancelamento.
- A retomada do aplicativo revalida permissões e tenta novamente a limpeza de órfãos antes de concluir o bootstrap.
- O fluxo de desativação cancela agendamentos mesmo quando a leitura de permissões está indisponível.
- Listeners de resposta são registrados uma vez por montagem e removidos no cleanup.

### Compatibilidade preservada

- Mantidos o contrato `ReminderProps` e a chave de persistência `gastometro-reminders`.
- O `AlertService` e o fallback in-app da web permanecem preservados.
- A web não tenta agendar notificações nativas.
- Não foram incluídos toasts, notificações push ou agendamento web em segundo plano; esses itens permanecem no escopo da mini-spec 23.

### Validação

- Testes unitários e de integração adicionados para reconciliação idempotente, sincronização granular, concorrência, permissões, falhas nativas, limpeza de órfãos e bootstrap.
- Expo Doctor, testes E2E Web, verificação de versionamento e workflow de build Android concluídos com sucesso na CI da PR 68.
- Validação funcional manual em Android e Web concluída.
