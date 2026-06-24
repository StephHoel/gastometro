# Changelog

## 1.7.3 - 2026-06-24 (em preparação)

Implementação da mini-spec 13 (Service Worker offline web), com cache versionado, fluxo de validação offline atualizado e ajustes de scripts para versionamento e testes locais.

### Funcionalidade (Web)

- Service Worker adicionado em `public/sw.js`, com estratégia híbrida de cache (`network-first` para navegação e `cache-first` para assets).
- Registro do Service Worker integrado ao app em `src/services/ServiceWorkerService.ts` e inicialização web no layout.
- Ativação imediata da nova versão de cache (`skipWaiting` + `clients.claim`) e limpeza de versões antigas.
- Versão de cache derivada de arquivo gerado (`public/sw-version.js`) a partir da versão do app.

### Scripts e versionamento

- Novo script `npm run sw:version` para gerar/atualizar `public/sw-version.js`.
- Build web passa a executar geração de versão do SW antes do export estático.
- Fluxo `npm run new-version` passa a atualizar `sw-version` automaticamente e incluir `public/sw-version.js` no commit de release.
- Adicionado `npm run web:test:offline` com launcher Node cross-platform para teste exploratório de SW em ambiente dev (`EXPO_PUBLIC_SW_DEV_ENABLED=1`).

### Qualidade

- Testes unitários adicionados para `ServiceWorkerService`.
- Teste adicionado para o script `scripts/generate-sw-version.js`.
- Ajuste de robustez no install do Service Worker para evitar falha global de cache quando algum asset não estiver disponível em ambiente dev.

### Documentação

- `README.md`, `docs/WEB_DEPLOY.md`, `docs/SPEC.md` e `docs/specs/README.md` sincronizados com o novo comportamento offline web.
- Mini-spec 13 movida para `docs/specs/done/` com `Status: implementado` e registro de decisões finais.
- Nova mini-spec planejada adicionada: `docs/specs/planned/17-comparacao-de-precos-entre-lugares.md`.

## 1.7.2 - 2026-06-23

Refatoração interna dos formulários para `react-hook-form` e adaptação do `CustomInput` para encapsular o `Controller`, reduzindo boilerplate nos fluxos de criação e edição.

### Refatoração

- Formulários de item, lembrete, listas e calculadora migrados de `useState` manual para `useForm` com tipagem estrita por fluxo.
- `CustomInput` passou a receber `control` e `name` diretamente, integrando o `Controller` internamente e eliminando a necessidade de envolver cada campo externamente.
- Interfaces TypeScript criadas para cada conjunto de dados de formulário (`ProductFormData`, `ReminderFormData`, `CalculatorFormData`, `CreateListForm`, `EditListForm`).

### Qualidade

- Testes de componentes e formulários atualizados para lidar com o comportamento assíncrono do `react-hook-form` via `waitFor`.
- 195 testes passando; cobertura global mantida acima de 80%.

### Compatibilidade

- Sem alteração no formato de dados persistidos ou no formato de compartilhamento/importação via WhatsApp.
- Sem mudança funcional visível ao usuário.

## 1.7.1 - 2026-06-23

Ajustes visuais nos botões do formulário de lembretes para melhorar legibilidade e simplificação dos rótulos de ação.

### Funcionalidade

- Reduzindo o tamanho do texto nos botões de ação do formulário de lembretes (`Salvar/Editar` e `Remover`) para melhorar a leitura.
- Simplificados os rótulos dos botões de edição e remoção de lembretes de `Editar Lembrete`/`Remover Lembrete` para `Editar`/`Remover`.

### Impacto

- Mudança focada em UX/visual; sem alteração de formato de dados persistidos e sem impacto no compartilhamento via WhatsApp.

## 1.7.0 - 2026-06-21

Implementação completa da mini-spec 10 com sistema de lembretes locais e notificações, incluindo CRUD por lista, central consolidada, fallback sem permissão e sincronização no bootstrap do app.

### Funcionalidade

- Store dedicado `ReminderStore` com persistência isolada em `gastometro-reminders` (sem impacto na chave `gastometro` do carrinho).
- Serviços de domínio: `ReminderService` (validações/regras), `NotificationService` (permissões/agendamento), `ReminderOrchestrator` (sincronização).
- CRUD de lembretes por lista em `src/app/reminders/[listId]/` (novo, edit, listagem).
- Central de lembretes consolidada em `src/app/reminders/index.tsx` com filtros (ativos, desativados, vencidos).
- Hook `useReminderPendingAlerts` para fallback de lembretes pendentes quando permissão de notificação não está concedida.
- Integração com notificações nativas: agendamento, cancelamento, sincronização no bootstrap.
- Navegação por payload: ao tocar na notificação, o app seleciona a lista relacionada e volta para a tela principal quando disponível.
- Remoção de lista agora informa quantidade de lembretes impactados e executa remoção em cascata.
- Limpeza de lembretes órfãos na inicialização.
- Atalho de lembretes na tela home.

### Arquitetura e qualidade

- Separação de camadas: store + serviços dedicados reduz risco de regressão no domínio principal de compras.
- Componentes novos: `Form/Reminder.tsx`, `Reminder/Item.tsx`, `HeaderActions.tsx` para suporte a ações de lembrete.
- Refatoração: `Header` refatorizado com `HeaderActions` para melhor gestão de botões/ações.
- Constantes: separação de mensagens por domínio em `src/constants/text/` (error, inputs, lists, reminders).
- Enums novos: `NameField`, `PermissionState`, `ReminderState`, `ReminderStatus`.
- Testes: 20+ novos testes cobrindo store, serviços, hooks, telas e componentes de lembrete (cobertura mantida ≥80%).

### Interfaces TypeScript

- `ReminderProps`, `ReminderStateProps`, `ReminderFilter`, `FormReminderProps`, `ReminderItemProps` adicionadas.
- Refatoração de interfaces existentes para melhor consistência e type-safety.

### Compatibilidade

- Nenhuma alteração no formato de persistência do carrinho ou compartilhamento WhatsApp.
- Persistência de lembretes usa chave dedicada, sem impacto em migração de dados legada.
- App continua funcional quando permissão de notificação for negada (fallback local).

### Documentação

- Mini-spec 10 movida de `docs/specs/planned/` para `docs/specs/done/` e marcada como `Status: implementado`.
- `README.md` atualizado para listar lembretes/notificações como funcionalidade existente.
- `docs/specs/README.md` atualizado para refletir a mudança de status da spec 10.
- `docs/SPEC.md` sincronizado com capacidades atuais de lembretes e notificações locais.

## 1.6.0 - 2026-06-16

Implementação da mini-spec 09 com suporte completo a múltiplas listas de compras, incluindo migração de dados, nova tela de gerenciamento e cobertura de testes.

### Funcionalidade

- Adicionada gestão de múltiplas listas com criação, renomeação, remoção e seleção de lista ativa.
- Nova tela de listas em `src/app/lists.tsx`, com fluxo de gerenciamento dedicado e integração ao Header.
- Operações de item (adicionar, editar, remover, limpar) passam a atuar na lista ativa.
- Importação/colar via WhatsApp com opção de criar nova lista usando nome padrão de lista importada.

### Persistência e migração

- Evoluído o modelo de estado para suportar `lists` e `activeListId`, preservando compatibilidade com a chave `gastometro`.
- Implementada migração automática do formato legado (lista única) para o novo formato sem perda de dados, criando lista padrão inicial.

### Qualidade

- Suite de testes ampliada para cobrir cenários de múltiplas listas no store e impactos em serviços/componentes.
- Atualizados mocks de `StateProps` nos testes para o novo contrato do estado.
- Execuções de validação da release: `npm run test` e `npm run check:ts` sem falhas.

### Documentação

- Mini-spec 09 movida para `docs/specs/done/` com status implementado.
- `docs/specs/README.md`, `docs/SPEC.md` e `README.md` atualizados para refletir a funcionalidade entregue.

## 1.5.1 - 2026-06-14

Correções no fluxo de versionamento/changelog e simplificação da gestão de título de página na web.

### Correções

- Ajustado o script de atualização de versão para melhorar a robustez de validações e tratamento de erro envolvendo `package-lock.json`.
- Aprimorada a atualização de versão no `app.config.js` com regex mais resiliente.
- Melhorado o script de criação de nova versão com texto de ajuda mais claro para os tipos de incremento e fluxo de commit mais previsível.

### Changelog e normalização

- Tratamento de argumento de changelog reforçado com trim de espaços para evitar entradas vazias acidentais.
- Normalização de linhas em branco e quebra final do changelog refinada para evitar ruído entre execuções.

### Web e navegação

- Removido o uso do hook `usePageTitle` em favor de gestão centralizada de título no layout, reduzindo complexidade e divergência entre telas.
- Ajustado `app.config.js` para manter consistência com o modelo atual de configuração.

## 1.5.0 - 2026-06-13

Implementação da base de compatibilidade web com GitHub Pages, incluindo build estática, deploy automatizado e ajustes de fallback para recursos nativos no navegador.

### Funcionalidade

- Build web estática habilitada com `expo export --platform web` e script dedicado `npm run web:build`.
- Fluxo de compartilhamento via WhatsApp preservado, com uso de URL `wa.me` na web e fallback para deep link/web link no Android.
- Leitura e escrita de clipboard adaptadas para web com `navigator.clipboard`, mantendo fallback seguro em caso de bloqueio/permissão negada.

### Qualidade e Infraestrutura

- Workflow de deploy web criado em `.github/workflows/deploy-web.yml`, com build, type-check e publicação em GitHub Pages.
- Gatilhos do workflow de deploy web para rodar a cada alteração na `main`.
- Arquivo `.nojekyll` adicionado para garantir compatibilidade de artefatos estáticos no GitHub Pages.

### Documentação

- `README.md` atualizado com status da spec 08 em andamento e diretrizes de execução/build web.
- `docs/WEB_DEPLOY.md` criado/atualizado com instruções de build, teste local, deploy e troubleshooting.
- `docs/specs/active/08-web-github-pages.md` atualizado com regras de validação e decisões técnicas adotadas.
- `docs/specs/README.md` atualizado para refletir a spec 08 em andamento.
- `docs/SPEC.md` atualizado para refletir a plataforma web como frente em andamento, não mais futura.

## 1.4.12 - 2026-06-13

Implementação da união automática de itens duplicados na colagem/importação para a lista existente, com cobertura de testes e alinhamento da documentação.

### Funcionalidade

- Ao colar uma lista na lista existente, o app agora identifica duplicados por nome + preço normalizados antes de concluir a união.
- Itens duplicados compatíveis passam a ser unidos automaticamente, somando a quantidade no item mantido.
- O estado `collected` do item mantido é preservado apenas quando a quantidade final não muda; quando a soma altera a quantidade, o item resultante volta para `false`.
- Itens com mesmo nome, mas preço diferente, continuam separados e não são mesclados.

### Qualidade

- Nova regra centralizada em `DuplicateProducts` para agrupar e mesclar duplicados com tipos dedicados para grupo e resultado de mesclagem.
- Quantidades mescladas agora são arredondadas para até 3 casas decimais, evitando imprecisões de ponto flutuante no total consolidado.
- Testes adicionados e ampliados para `AlertService`, mesclagem de duplicados e fluxo de colagem/importação com cenários de nome e preço normalizados.
- Relatório de cobertura adicionado em `docs/coverages/2026-06-13_13-13.csv`.

### Documentação

- Mini-spec 06 consolidada em `docs/specs/done/06-uniao-itens-duplicados.md` com comportamento final de união automática de duplicados na colagem em lista existente.
- `docs/SPEC.md` alinhado para refletir que a união de duplicados importados ocorre automaticamente no app.
- `README.md` revisado para mover a união de duplicados de funcionalidade planejada para comportamento já implementado.
- `docs/specs/README.md` atualizado para listar a mini-spec 06 como implementada.

## 1.4.11 - 2026-06-13

Refatoração da spec 12: redução de código duplicado, remoção de código não utilizado e ampliação de cobertura de testes

### Refatoração

- Extração do item de lista para componente dedicado (`src/components/List/ListItem.tsx`), removendo duplicação em `List.tsx`.
- Remoção de função não utilizada em `src/stores/helpers/CartInMemory.ts`.
- Remoção de campo não utilizado em `src/interfaces/ListProps.ts`.
- Remoção do arquivo sem uso `src/utils/products.ts` e ajuste correspondente em `jest.config.js`.
- Movida a interface `CustomAlertRef` para `src/interfaces/CustomAlertRef.ts` e atualização dos consumidores.

### Qualidade

- Novos testes de componentes/lista para cobrir callbacks e interações do `ListItem`.
- Ajustes em testes existentes para elevar e manter o gate mínimo de cobertura no escopo monitorado pelo Jest.
- Relatório de cobertura adicionado em `docs/coverages/2026-06-13_10-04.csv`.

### Documentação

- Mini-spec 12 movida para `docs/specs/done/` com status `implementado`.
- `docs/specs/README.md` atualizado com o novo status da spec 12.
- Regras de versionamento atualizadas para criar branch de release apenas quando o fluxo iniciar na `main`.

## 1.4.10 - 2026-06-12

Exibe itens coletados no final da lista, separados dos não coletados por cabeçalhos de seção com contador.

### Funcionalidade

- Itens não coletados aparecem primeiro; itens coletados aparecem no final.
- Cabeçalhos de seção "Não coletados" e "Coletados" com contador de itens separam visualmente os dois blocos.
- Marcar ou desmarcar item move-o imediatamente para o bloco correto, sem recarregar a tela.

### Qualidade

- Função pura `SortProductsByCollected` em `src/utils/functions/SortList.ts` para agrupamento testável.
- Novo componente `ListSectionHeader` com interface `ListSectionHeaderProps`.
- Testes adicionados para cobertura de ordem visual e presença dos cabeçalhos.
- Script `npm run new-version` atualizado para aceitar argumentos opcionais (`tipo` e texto do changelog), com suporte a execução não-interativa.

### Documentação

- Mini-spec 07 movida para `docs/specs/done/` com status `implementado`.
- `docs/SPEC.md` e `docs/specs/README.md` atualizados.
- Regra adicionada nas instruções do Copilot: nunca executar `git commit` sem pedido explícito do usuário.

## 1.4.9 - 2026-06-07

Implementação da visualização de total de itens coletados na tela principal, com atualização de documentação e cobertura de testes.

### Funcionalidade

- Exibe `Total Geral | Total Coletado` na tela principal.
- Atualiza o total coletado imediatamente ao marcar ou desmarcar itens.
- Mantém formato monetário `pt-BR` com `BRL` e regras atuais de cálculo.

### Qualidade

- Adiciona função pura para cálculo de total coletado.
- Expande testes unitários de matemática para cobrir total de coletados.
- Adiciona teste de componente para validar exibição dos dois totais na Home.

### Documentação

- Atualiza mini-spec `docs/specs/done/03-total-itens-coletados.md` para `Status: implementado`.
- Atualiza README e SPEC para refletir que o total coletado não é mais item planejado.

## 1.4.8 - 2026-06-07

Melhorias de infraestrutura, UX e qualidade com foco em Android moderno e estabilidade do app.

### Build e distribuição Android

- Ajuste da baseline para Android moderno (API 29+), com estratégia de build orientada a artefatos menores.
- Otimizações de configuração Android para reduzir peso de distribuição e melhorar performance de empacotamento.
- Refinamentos em scripts e propriedades de build para tornar o processo mais previsível em ambiente local e CI.
- Redução mensurável do APK de aproximadamente 102 MB para 22 MB (queda aproximada de 78%).

### Compartilhamento e regras de negócio

- Fluxo de compartilhamento via WhatsApp reforçado com deep link e fallback web.
- Tratamento de erro mais robusto nos fluxos relacionados ao compartilhamento.

### Interface e consistência visual

- Padronização de uso de constantes de cor em componentes.
- Ajustes visuais em ícones e alertas para melhorar consistência da interface.

### Qualidade, testes e manutenção

- Ajustes em testes para maior estabilidade de execução entre plataformas.
- Limpeza de dependência não utilizada e atualização de itens de suporte ao build.
- Atualizações em workflows para melhorar gatilhos e confiabilidade da automação.
- Validação manual concluída em Android API 29+ e Web, sem regressão funcional crítica nos fluxos principais.

## 1.4.7 - 2026-06-04

Ajustes internos e melhorias na documentação e suíte de testes automatizados.

## 1.4.6 - 2026-06-03

Correção

- Bloqueia a criação manual de itens duplicados na lista atual.
- Bloqueia a edição para um nome que já exista em outro item.
- Preserva a importação/colagem com duplicados permitidos.
- Adiciona registro da mini-spec de bloqueio de duplicados na criação manual.

## 1.4.5 - 2026-06-02

Correção

- Bloqueia valores negativos em quantidade e preço no formulário de adicionar/editar item.
- Bloqueia cálculo com valores negativos na calculadora.
- Adiciona mensagem de erro dedicada para valor negativo (`valor_negativo`).
- Refatora normalização numérica para utilitários compartilhados (entrada decimal e normalização de string numérica).
- Atualiza README, SPEC e mini-spec de validação de valores negativos para refletir a implementação.

## 1.4.4 - 2026-06-02

Refatoração

- Remove ordenação duplicada em render da lista e centraliza ordenação no helper do store.
- Atualiza assinatura de `SortProductsAlphabetically` para API explícita por parâmetro.
- Adiciona tratamento de erro no hook `useInitAlert`.
- Fortalece fluxo de colagem/importação com `try/catch` no `AlertService`.
- Torna parser de importação mais defensivo para linhas malformadas.

## 1.4.3 - 2026-05-17

Correção

## 1.4.2 - 2026-05-17

Correção da v1.4.1

## 1.4.0 - 2025-05-01

Criação de calculadora de preços
