# Mini-spec: Feedback com toast e disparo de lembretes na web

Número: 23
Status: planejado

## Problema

O Gastômetro utiliza o `AlertService` para apresentar diferentes tipos de mensagens. Mensagens simples de feedback podem interromper o fluxo de uso quando apresentadas em alertas modais, embora não exijam decisão ou confirmação do usuário.

Na versão web, os lembretes são persistidos e possuem fallback in-app, mas não há um mecanismo de entrega no horário configurado enquanto o aplicativo permanece aberto. A experiência atual depende de o usuário abrir o app ou ativar a lista relacionada para encontrar lembretes vencidos.

## Objetivo

Introduzir mensagens toast para feedback não bloqueante e utilizar o mesmo mecanismo visual para avisar sobre lembretes vencidos na versão web, sem remover, descontinuar ou substituir o `AlertService`.

A implementação deve preservar o comportamento nativo de notificações no Android e manter os alertas que exigem atenção, decisão ou confirmação por meio do `AlertService`.

## Comportamento esperado

### Mensagens de feedback

- Disponibilizar um mecanismo reutilizável de toast para mensagens breves, não bloqueantes e relacionadas ao resultado de uma ação.
- Utilizar toast para feedback positivo ou informativo de operações concluídas, como salvar, atualizar, remover, copiar ou importar dados, quando a mensagem não exigir uma decisão do usuário.
- O toast deve apresentar texto objetivo, desaparecer automaticamente após um intervalo adequado e permitir dispensação manual.
- Mensagens simultâneas devem ser organizadas sem sobreposição ou perda silenciosa; definir limite de exibição e política de fila/substituição.
- O mecanismo deve funcionar na web e no Android, respeitando as particularidades de cada plataforma.
- Não migrar indiscriminadamente todas as chamadas atuais do `AlertService` para toast.

### Preservação do AlertService

- Manter o `AlertService`, sua inicialização, sua referência de apresentação e seus métodos públicos necessários.
- Alertas de confirmação, decisões com múltiplas opções, ações destrutivas, permissões, validações, erros e demais mensagens que não se enquadrem como feedback simples continuam sendo apresentados pelo `AlertService`.
- Não substituir confirmações ou escolhas do usuário por mensagens toast.
- A adoção do toast deve ser incremental e limitada aos pontos de feedback identificados durante a implementação.
- Não alterar a semântica das operações nem ocultar falhas: uma ação só pode apresentar feedback de sucesso depois de sua conclusão efetiva.

### Disparo de lembretes na web

- Na web, um lembrete habilitado deve gerar um toast quando sua data/hora chegar enquanto o aplicativo estiver aberto.
- A verificação deve funcionar também quando o horário do lembrete passar enquanto a página permanecer aberta, sem depender de navegação ou de uma nova interação do usuário.
- Ao iniciar ou retomar a aplicação, verificar lembretes vencidos ainda pendentes e apresentar os avisos correspondentes.
- Ao ativar uma lista, verificar também os lembretes vencidos vinculados a ela, preservando a regra de vínculo por `listId`.
- O aviso deve identificar o título do lembrete e fornecer contexto suficiente para que o usuário reconheça a lista relacionada. Quando viável, permitir acesso à lista correspondente a partir do aviso.
- Um mesmo lembrete não deve gerar toasts repetidos continuamente durante a mesma sessão de uso. Definir uma estratégia de deduplicação que considere o identificador do lembrete e o ciclo de vida da aplicação.
- Lembretes desabilitados, removidos ou vinculados a listas inexistentes não devem disparar avisos.
- A entrega web deve funcionar offline, utilizando os dados locais já persistidos.
- A implementação não deve depender de backend, notificações push ou de APIs de notificação do sistema operacional/navegador em segundo plano.
- Se a página estiver fechada ou o navegador não estiver executando o app, não há garantia de disparo no horário exato. Ao abrir ou retomar o app, os lembretes vencidos ainda pendentes devem ser identificados e apresentados.
- O Android deve continuar utilizando o agendamento nativo existente por meio do `NotificationService`/Expo Notifications; esta mini-spec não deve substituir esse fluxo por toasts.

## Telas e arquivos afetados

- Camada reutilizável de apresentação de toasts e seu ponto de montagem global.
- `src/services/AlertService.ts` (preservação e definição dos limites de responsabilidade, sem remoção).
- `src/services/ReminderService.ts`.
- `src/services/ReminderOrchestrator.ts` ou serviço/adaptador específico para entrega web de lembretes.
- `src/services/NotificationService.ts`, somente se necessário para manter explícita a separação entre entrega nativa e web.
- Layout raiz e ciclo de vida da aplicação web.
- Telas e fluxos que apresentem feedback simples de operações.
- Constantes de textos e testes relacionados.

## Dados e persistência

- Preservar o contrato atual de `ReminderProps` e a chave `gastometro-reminders`, salvo justificativa técnica documentada.
- Não persistir objetos de toast, filas de mensagens ou estado transitório de apresentação.
- A deduplicação de avisos deve evitar alterações desnecessárias no schema persistido. Caso seja indispensável registrar estado de entrega entre sessões, justificar a necessidade e propor migração compatível antes de alterar o modelo.
- Não persistir identificadores de notificações de navegador como se fossem identificadores de agendamentos nativos portáveis.
- Manter o armazenamento local e o funcionamento offline-first.

## Regras de validação

- Antes de adicionar uma biblioteca, verificar compatibilidade com Expo, React Native e React Native Web, impacto no bundle web/APK e manutenção do projeto.
- Não introduzir dependência de toast que carregue APIs nativas incompatíveis no ambiente web, nem APIs web no bundle Android sem isolamento adequado.
- Centralizar a apresentação dos toasts para manter consistência visual, acessibilidade e controle de concorrência.
- Mensagens devem ser acessíveis a leitores de tela, possuir semântica adequada e não depender apenas de cor ou ícone para comunicar o tipo.
- Respeitar preferência de movimento reduzido quando houver animações.
- Garantir contraste adequado, posicionamento que não cubra ações essenciais e tempo de leitura suficiente.
- Não anunciar repetidamente o mesmo lembrete em verificações consecutivas.
- Tratar mudança de horário, retorno do primeiro plano, atualização da página e falhas de leitura dos lembretes sem travar a aplicação.
- A verificação de lembretes deve considerar data/hora local corretamente e não disparar lembretes futuros.
- Não solicitar permissão de notificação do navegador como requisito para o toast in-app.
- Erros, confirmações, permissões e demais alertas não classificados como feedback simples continuam no `AlertService`.

## Critérios de aceite

- Existe uma API/componente centralizado para exibir e dispensar toasts.
- Pelo menos um fluxo representativo de feedback simples utiliza toast sem remover o `AlertService`.
- Alertas de confirmação, remoção destrutiva, permissões, validações e erros continuam sendo exibidos pelo `AlertService`.
- Nenhuma chamada necessária do `AlertService` é removida ou substituída globalmente.
- Toasts não bloqueiam a interação com a tela e não cobrem controles essenciais.
- Mensagens simultâneas seguem a política definida e podem ser dispensadas.
- Toasts são acessíveis por teclado e tecnologias assistivas na web e possuem comportamento equivalente adequado no Android.
- Na web, um lembrete habilitado dispara toast quando vence com o app aberto, mesmo sem interação adicional.
- Na web, lembretes vencidos pendentes são identificados ao iniciar/retomar o app e ao ativar a lista relacionada.
- Um lembrete não dispara avisos repetidos continuamente na mesma sessão.
- Lembretes desabilitados, removidos ou órfãos não geram toasts.
- O fluxo de lembretes web funciona offline e não depende de push ou de notificação em segundo plano.
- No Android, o agendamento e o recebimento de notificações nativas permanecem funcionando sem regressão.
- Testes cobrem apresentação, dispensação, concorrência, acessibilidade básica, roteamento entre toast e `AlertService`, disparo no vencimento, retomada, deduplicação e isolamento por plataforma.

## Fora de escopo

- Remover ou substituir o `AlertService`.
- Converter todos os alertas existentes para toast.
- Notificações push, backend ou entrega de lembretes com o navegador fechado.
- Solicitar permissão para notificações do navegador ou implementar notificações de sistema na web.
- Alterar o modelo de dados dos lembretes sem necessidade comprovada.
- Sincronização de lembretes entre dispositivos.
- Redesign global da interface.

## Observações para IA

- Inspecionar os usos atuais do `AlertService` e classificar cada ocorrência antes de migrar qualquer feedback.
- Preservar alertas que exigem confirmação, escolha, permissão ou comunicação de erro.
- Não assumir previamente uma biblioteca específica de toast; comparar compatibilidade, acessibilidade, tamanho e manutenção antes da decisão.
- Manter a entrega de lembretes separada por plataforma: Expo Notifications no Android e toast in-app na web.
- Aproveitar o mecanismo de lembretes persistidos e as regras de integridade já existentes, sem criar uma segunda fonte de verdade.
- Registrar decisões de UX, política de deduplicação e limitações de entrega web durante a implementação.
- Manter todos os textos em pt-BR e preparados para a estrutura de internacionalização/regionalização existente.
