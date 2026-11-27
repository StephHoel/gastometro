# Documentação do Gastômetro

Esta pasta concentra a documentação principal do projeto.

## Índice

### Documentação Principal

- [**SPEC.md**](./SPEC.md) — Guia oficial para tomada de decisão de produto, arquitetura, design e processo. Leitura obrigatória antes de propor mudanças.
- [**CHANGELOG.md**](./CHANGELOG.md) — Histórico de versões com descrição de funcionalidades, correções, impactos e compatibilidade.
- [**WEB_DEPLOY.md**](./WEB_DEPLOY.md) — Instruções de build, deploy e troubleshooting para a versão web estática (GitHub Pages).
- [**WEB_E2E.md**](./WEB_E2E.md) — Preparação e execução dos testes E2E web, incluindo comparação de preços e backup/restauração com dados representativos.

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

- O fluxo não-interativo aceita `npm run new-version -- <tipo|versão> "<texto do changelog>" [n|no|no-commit]`, com `1` (patch), `2` (minor), `3` (major) ou uma versão exata `X.Y.Z`, como `2.1.0`. A opção `4` abre o prompt de versão manual.
- Quando usado `n`, `no` ou `no-commit`, o script atualiza versão/changelog sem commit e sem push.

## Status Atual

| Métrica                      | Valor                          |
| ---------------------------- | ------------------------------ |
| **Versão**                   | 1.11.0                         |
| **Data**                     | 2026-11-27                     |
| **Testes**                   | 456 passando (65 suítes)       |
| **Cobertura de linhas**       | 93,38%                         |
| **Branches**                 | 86,00%                         |
| **Statements**               | 91,81%                         |
| **Funções**                  | 90,00%                         |

A execução automatizada registrada é o workflow `46021328819`, no commit `b122f3c43c3326921d6bc4b800cced26435b843e` (27/11/2026). TypeScript, 456 testes em 65 suítes, Expo Doctor, CodeQL, verificação de versionamento e as três execuções do E2E Web foram aprovados. O E2E inclui dados nas seis coleções, valida os campos restaurados e confirma que a mesclagem repetida não duplica registros. O build Android Release iniciou após o E2E aprovado, mas o job foi cancelado durante `assembleRelease`; não houve confirmação de APK concluído nessa execução. A validação manual Android/Web da Spec 20 foi concluída e a mini-spec foi movida para `done/`. Consulte `coverages/README.md` para o histórico de cobertura e `specs/README.md` para o status das mini-specs.
