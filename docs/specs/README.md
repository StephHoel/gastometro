# Mini-specs do Gastômetro

Esta pasta organiza mini-specs por status para funcionalidades e pendências do projeto.

Use estes documentos antes de iniciar qualquer alteração de produto. Quando uma mini-spec mudar de estágio, mova o arquivo para a pasta correspondente, atualize o status no documento, registre decisões tomadas durante a execução e mantenha o `docs/SPEC.md` sincronizado quando houver mudança de diretriz.

## Estrutura

- `planned/`: mini-specs planejadas, ainda não iniciadas.
- `active/`: mini-specs em andamento ou em evolução contínua.
- `done/`: mini-specs concluídas, implementadas ou mantidas como referência de decisões já incorporadas.

## Regra de idioma

Todas as mini-specs devem ser escritas em pt-BR, incluindo acentuação e caracteres especiais.

## Resumo de Status

| Status | Quantidade | Últimas Atualizações |
| ------ | ---------- | -------------------- |
| **Implementadas** | 11 | Mini-spec 10 (notificações/lembretes) |
| **Ativas** | 1 | Mini-spec 05 (testes - evolução contínua) |
| **Planejadas** | 4 | Em prioridade de execução |
| **Total** | 16 | - |

## Status das mini-specs

### Implementadas (ordem de conclusão)

- [Bloqueio de duplicados na criação](./done/01-bloqueio-duplicados-criacao.md)
- [Validação de valores negativos](./done/02-validacao-valores-negativos.md)
- [Total de itens coletados](./done/03-total-itens-coletados.md)
- [APK menor com foco em Android moderno e web](./done/04-apk-menor-android-moderno-web.md)
- [União de itens duplicados](./done/06-uniao-itens-duplicados.md)
- [Itens coletados no final da lista](./done/07-itens-coletados-no-final-da-lista.md)
- [Web compatível com GitHub Pages](./done/08-web-github-pages.md)
- [Refactor — dead code e duplicação de código](./done/12-refactor-dead-code-e-duplicacao.md)
- [Limitações web explicitamente documentadas](./done/15-limitacoes-web-explicitas.md)
- [Múltiplas listas](./done/09-multiplas-listas.md)
- [Notificações e lembretes](./done/10-notificacoes-lembretes.md)

### Ativas/Em andamento

- [Suíte de testes automatizados](./active/05-testes-automatizados.md)
- [Refatoração de formulários para react-hook-form](./planned/16-refatoracao-formularios-react-hook-form.md)

### Planejadas (ordem de prioridade)

1. [Contas a pagar](./planned/11-contas-a-pagar.md)
2. [Service Worker para funcionamento offline em web](./planned/13-service-worker-offline-web.md)
3. [Testes E2E para roteamento web SPA](./planned/14-testes-e2e-roteamento-web-spa.md)
