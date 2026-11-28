# Mini-spec: Notificações e lembretes

Número: 10
Status: implementado

## Problema

Usuários podem esquecer de comprar itens recorrentes ou de revisar a lista antes de ir ao mercado.

## Objetivo

Permitir criar lembretes locais para revisar listas ou itens sem depender de login, backend ou conexão com internet.

## Comportamento esperado

- O usuário deve poder criar, editar e remover lembretes locais.
- O lembrete deve disparar uma notificação no dispositivo no horário configurado.
- Ao tocar na notificação, o app deve selecionar a lista relacionada e voltar para a tela principal quando isso for tecnicamente possível.
- O app deve continuar funcionando quando permissões de notificação forem negadas.
- Permissões devem ser solicitadas apenas no momento em que o usuário tentar ativar notificações.

## Telas afetadas

- Tela principal da lista.
- Tela futura de configuração de lista ou item.
- Possível tela/modal de configuração de lembrete.

## Gestão pelo usuário

### Nível 1: gestão por lista (fluxo principal)

- Cada lista deve ter acesso direto aos seus lembretes (ex.: botão/ícone no contexto da lista ativa).
- Ao abrir essa área, o usuário deve ver apenas lembretes vinculados à lista ativa.
- Ações disponíveis: criar, editar data/hora, ativar/desativar, remover.

### Nível 2: central de lembretes (visão consolidada)

- Deve existir uma visão consolidada com todos os lembretes agrupados por lista.
- Essa visão deve facilitar revisão rápida e manutenção dos lembretes.
- Filtros recomendados: ativos, desativados e vencidos.

### Fluxo principal de uso

- Usuário entra em uma lista e acessa lembretes.
- Usuário cria lembrete com título e data/hora.
- Ao tentar ativar lembrete, o app solicita permissão de notificação (sob demanda).
- Se permissão for negada, lembrete continua salvo e deve ser exibido nos pontos definidos nesta spec.

### Regras de UX obrigatórias

- Remover lembrete deve cancelar automaticamente o agendamento/notificação associado.
- Ao remover lista com lembretes, informar quantidade impactada e pedir confirmação.
- Confirmada a remoção da lista, remover em cascata todos os lembretes vinculados.
- Não permitir criação de lembrete sem lista vinculada.

## Dados e persistência

- Persistir lembretes localmente com AsyncStorage ou storage equivalente offline-first.
- Relacionar cada lembrete a uma lista específica, considerando o modelo atual com múltiplas listas.
- Todo lembrete deve estar vinculado a uma lista existente.
- Não deve existir lembrete global ou órfão.

### Modelo técnico inicial (v1)

- Criar store dedicado de lembretes (separado do store de compras) para reduzir risco de regressão no domínio principal.
- Usar chave de persistência própria para lembretes, sem alterar a chave `gastometro` já usada pelo carrinho.
- Estrutura sugerida para lembrete local:
  - `id: string`
  - `title: string`
  - `datetimeISO: string`
  - `enabled: boolean`
  - `listId: string`
  - `itemId?: string` (opcional para evolução futura)
  - `notificationId?: string` (id retornado pelo agendamento nativo)
  - `createdAt: string`
  - `updatedAt: string`

### Regras de consistência de dados

- Ao remover lista com lembretes vinculados, o app deve informar quantidade de lembretes impactados e pedir confirmação explícita.
- Se o usuário confirmar a remoção da lista, todos os lembretes vinculados a ela devem ser removidos em cascata.
- Ao remover lembrete, o agendamento/notificação associado também deve ser cancelado/removido.
- Não é permitido manter lembretes com `listId` inexistente.
- Alterar data/hora de lembrete ativo deve cancelar e reagendar notificação correspondente.

## Regras de validação

- Horário/data do lembrete devem ser válidos.
- Lembretes no passado não devem ser aceitos sem confirmação ou ajuste.
- O usuário deve conseguir remover lembretes mesmo sem permissão ativa de notificação.

### Regras adicionais de permissão

- Solicitar permissão apenas quando o usuário ativar um lembrete pela primeira vez.
- Se permissão for negada, manter lembrete salvo e exibi-lo sempre que o app abrir na lista alvo ou quando a lista alvo for ativada.
- Falha de agendamento não deve apagar lembrete já salvo; deve apenas marcar como não agendado.

## Critérios de aceite

- Criar um lembrete local.
- Editar horário/data de um lembrete.
- Remover um lembrete.
- Negar permissão sem quebrar o app.
- Com permissão negada, lembretes aparecem ao abrir o app e ao ativar a lista relacionada.
- Ao remover lista com lembretes, pedir confirmação e, ao confirmar, remover lembretes vinculados.
- Ao remover lembrete, cancelar também o agendamento/notificação correspondente.
- Persistir lembretes após reiniciar o app.

## Direções técnicas de implementação

### Estratégia por plataforma

- Android/iOS (Expo nativo): implementar agendamento local com `expo-notifications`.
- Web (incluindo uso no celular via navegador): manter CRUD e persistência de lembretes, com fallback in-app para lembretes vencidos quando abrir o app.
- Web não deve depender de notificação em background nesta fase.

### Navegação ao tocar na notificação

- Incluir `listId` no payload da notificação.
- Ao abrir o app pela notificação, selecionar a lista relacionada e navegar para a tela principal.
- Se a lista não existir mais por inconsistência de dados, cancelar o lembrete inválido e seguir fluxo padrão do app.

### Camadas sugeridas

- `ReminderStore`: CRUD, persistência e estado de sincronização local.
- `NotificationService`: pedido de permissão, agendamento, cancelamento e re-sincronização.
- `ReminderService`: validações de negócio (passado, vínculo com lista, mensagens de erro).

### Estratégia de inicialização

- Na inicialização do app, revalidar lembretes salvos e re-sincronizar agendamentos quando aplicável.
- Na inicialização, exibir lembretes pendentes quando não houver permissão de notificação ativa.
- Ao ativar uma lista, exibir lembretes pendentes vinculados a essa lista quando não houver permissão ativa.
- Na web, detectar lembretes vencidos e exibir aviso local (modal/alerta) sem depender de API nativa.

## Compatibilidade com a spec 13 (offline web com Service Worker)

- Implementar agora em formato de arquitetura extensível para evitar retrabalho.
- A integração com Service Worker na spec 13 deve ser tratada como camada adicional de entrega de notificação web, sem alterar o contrato de dados do lembrete.
- O modelo de lembrete (id, data/hora, vínculo com lista, status) deve permanecer o mesmo entre fases.
- Mudanças esperadas na spec 13:
  - adicionar adaptador web para entrega de lembretes (quando houver suporte);
  - manter fallback in-app para navegadores sem suporte;
  - manter regra de não existência de lembrete global/órfão;
  - evitar migração de dados sempre que possível.

### Resposta objetiva sobre impacto futuro

- O impacto da spec 10 na spec 13 é baixo a moderado se a implementação seguir separação de camadas (store/serviço/adaptador).
- O principal ponto de mudança futura deve ficar no mecanismo de entrega web, não no CRUD nem no formato persistido.
- Evitar acoplamento a APIs web específicas nesta fase reduz retrabalho quando a spec 13 entrar.

## Fora de escopo

- Sincronização em nuvem.
- Lembretes compartilhados entre usuários.
- Backend de notificações push.

## Observações para IA

- Manter o app offline-first.
- Verificar compatibilidade Expo antes de adicionar biblioteca.
- Preservar foco Android; avaliar impacto futuro na versão web.
- Priorizar implementação incremental: primeiro Android estável + fallback web, depois evolução de entrega web na spec 13.

## Implementação concluída (2026-06-17)

- Store dedicado `ReminderStore` com persistência separada em `gastometro-reminders`.
- Camadas `ReminderService`, `NotificationService` e `ReminderOrchestrator` implementadas.
- CRUD de lembretes por lista implementado em `src/app/reminders/[listId].tsx`.
- Central de lembretes com filtros implementada em `src/app/reminders/index.tsx`.
- Remoção de lista agora informa quantidade de lembretes impactados e executa remoção em cascata.
- Atalho de lembretes na home e fallback de pendentes quando permissão de notificação não está concedida.
- Integração de resposta de notificação para selecionar a lista relacionada e voltar para a tela principal quando disponível.
- Limpeza de lembretes órfãos e sincronização de agendamentos no bootstrap do app.
