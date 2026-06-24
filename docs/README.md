# Documentação do Gastômetro

Esta pasta concentra a documentação principal do projeto.

## Índice

### Documentação Principal

- [**SPEC.md**](./SPEC.md) — Guia oficial para tomada de decisão de produto, arquitetura, design e processo. Leitura obrigatória antes de propor mudanças.
- [**CHANGELOG.md**](./CHANGELOG.md) — Histórico de versões com descrição de funcionalidades, correções, impactos e compatibilidade.
- [**WEB_DEPLOY.md**](./WEB_DEPLOY.md) — Instruções de build, deploy e troubleshooting para a versão web estática (GitHub Pages).

### Mini-specs

- [**specs/README.md**](./specs/README.md) — Índice de mini-specs organizadas por status (planejadas, ativas, implementadas).
- [**specs/planned/**](./specs/planned/) — Funcionalidades planejadas aguardando implementação.
- [**specs/active/**](./specs/active/) — Funcionalidades em desenvolvimento ou evolução contínua.
- [**specs/done/**](./specs/done/) — Funcionalidades implementadas e referências de decisões incorporadas.

### Relatórios

- [**coverages/README.md**](./coverages/) — Relatórios de cobertura de testes exportados em CSV (histórico de execuções).

## Convenções

- Toda documentação deve ser escrita em PT-BR incluindo acentuações e caracteres especiais.
- Consulte o `docs/SPEC.md` antes de alterar produto, UX, persistência ou dependências.
- Use as mini-specs em `docs/specs/`, organizadas em `planned/`, `active/` e `done/`, para funcionalidades planejadas ou mudanças maiores.
- Registre decisões relevantes no `docs/CHANGELOG.md` quando houver versão nova.
- Todas as interfaces TypeScript do projeto devem ser definidas em `src/interfaces/`.
- Componentes devem permanecer pequenos, focados em responsabilidade única e composição.
- Funções e regras de negócio devem ser desacopladas dos componentes sempre que possível, priorizando `src/utils/`, `src/services/` e helpers de store.

## Fluxo de Atualização de Documentação

### Para Novas Features

1. Crie uma mini-spec em `docs/specs/planned/` com prefixo numérico sequencial (`NN-nome.md`).
2. Discuta o escopo, dados persistidos, telas afetadas e critérios de aceite.
3. Ao implementar, mude a mini-spec para `docs/specs/active/`.
4. Após conclusão, mude para `docs/specs/done/` e atualize o status.
5. Registre o que foi aprendido/mudado na mini-spec como referência futura.

### Para Mudanças de Arquitetura

1. Atualize a seção correspondente em `docs/SPEC.md`.
2. Adicione nota em `docs/CHANGELOG.md` se for release pública.
3. Preserve retrocompatibilidade ou documente breaking changes explicitamente.

### Para Releases

1. Execute `npm run new-version` para criar a versão.
2. Preencha a descrição da release em `docs/CHANGELOG.md`.
3. Verifique se `package.json`, `app.config.js` e `build.gradle` foram atualizados.
4. Confirme que testes passam: `npm run test` e cobertura está ≥80%.

Observação:

- O fluxo não-interativo aceita `npm run new-version -- <tipo> "<texto do changelog>" [n|no|no-commit]`.
- Quando usado `n`, `no` ou `no-commit`, o script atualiza versão/changelog sem commit e sem push.

## Status Atual

| Métrica                      | Valor                          |
| ---------------------------- | ------------------------------ |
| **Versão**                   | 1.7.3                          |
| **Data**                     | 2026-06-24                     |
| **Testes**                   | 195 passando                   |
| **Cobertura**                | 90.08%                         |
| **Mini-specs Implementadas** | 13                             |
| **Mini-specs Ativas**        | 1 (testes - evolução contínua) |
| **Mini-specs Planejadas**    | 3                              |

Consulte `docs/specs/README.md` para o status detalhado de todas as mini-specs.
