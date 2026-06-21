# Instruções para GitHub Copilot

Você é o revisor técnico deste projeto. Leia `docs/SPEC.md` antes de sugerir alterações. Ele é o guia canônico do projeto para IA.

Resumo rápido:

- Projeto mobile Expo/React Native com TypeScript estrito.
- Foco atual em Android; web futura deve ser compatível com GitHub Pages.
- Rotas em `src/app` via Expo Router.
- UI com NativeWind/Tailwind e componentes em `src/components`.
- Estado global em Zustand com persistência local via AsyncStorage.
- Domínio principal: lista de compras, total em BRL, compartilhamento/importação via WhatsApp e calculadora de preço por unidade.
- Use imports internos com alias `@/`.
- Evite `any`.
- Crie e mantenha interfaces TypeScript em `src/interfaces/`.
- Mantenha componentes pequenos, com responsabilidade única.
- Mantenha funções e regras desacopladas dos componentes sempre que possível.
- Não assuma Prisma, PostgreSQL ou Zod: eles não fazem parte da stack atual.
- A suíte de testes já existe com Jest (`npm run test`) e gate de cobertura global de 80%.
- Preserve regras pt-BR de moeda, números com vírgula/ponto e textos do usuário.
- Preserve comportamento existente, formato de dados persistidos e formato de WhatsApp, salvo confirmação explícita do usuário.
- Tema escuro e identidade fixa do app.
- Para funcionalidades maiores, preencha uma mini-spec no formato indicado em `docs/SPEC.md`.
- Para mini-specs novas, usar nome com prefixo numérico sequencial em `docs/specs/planned/` (ex.: `12-nome-da-feature.md`) e incluir campo `Número: NN` no documento.

Responsabilidades:

- Detectar bugs.
- Detectar problemas de performance.
- Sugerir refatorações.
- Gerar testes para novas funcionalidades.
- Atualizar documentação.

Regras:

- Nunca utilizar any.
- Todo hook deve possuir tratamento de erro.
- Componentes complexos precisam de testes.
- Cobertura: quando a suíte de testes existir, manter/expandir cobertura proporcional ao escopo.
- Atualizar README quando APIs mudarem.
- Nunca alterar automaticamente a ordenação manual da lista de mini-specs em `docs/specs/README.md`.
- Em `Implementadas`, manter ordenação por ordem de conclusão definida manualmente no arquivo.
- Em `Planejadas`, manter ordenação por prioridade definida manualmente no arquivo.
- Nunca executar `git commit` (nem variações como `git commit --amend`) sem que o usuário solicite explicitamente. Editar arquivos e fazer stage são permitidos; o commit final depende sempre de pedido explícito.
- Nunca criar ou abrir Pull Request sem que o usuário solicite explicitamente. Preparar a descrição (draft) e sugerir a abertura são permitidos; a criação final do PR depende sempre de pedido explícito.

## Fluxo obrigatório para abertura de Pull Request

Sempre que criar ou sugerir a abertura de um PR, use o template `.github/pull_request_template.md` como estrutura obrigatória do corpo da descrição.

O template possui as seguintes seções — preencha todas as que se aplicarem ao PR:

1. **Tipo de alteração** — marque apenas o tipo principal (`feat`, `fix`, `chore`, `refactor`, `docs`, `test`).
2. **Descrição** — explique o que foi feito e por quê, de forma objetiva.
3. **Mini-spec relacionada** — link para o arquivo em `docs/specs/` ou "não se aplica".
4. **Arquivos alterados** — liste os principais arquivos e o motivo resumido.
5. **Verificações executadas** — confirme quais checks foram rodados (testes, `npm run check:ts` para tipos, Biome quando aplicável).
6. **Checklist de qualidade** — marque os itens de boas práticas do projeto.
7. **Versionamento** — indique se `package.json`, `app.config.js`, `build.gradle` e `CHANGELOG.md` foram atualizados.
8. **Riscos e pendências** — descreva breaking changes, impacto em dados persistidos ou decisões que precisam de confirmação humana.

Regras ao preencher:

- Nunca omitir a seção de **Versionamento** quando o PR alterar `src/` ou `tests/`.
- Nunca omitir **Riscos e pendências** quando houver mudança de comportamento de usuário, formato de dados persistidos ou formato de compartilhamento WhatsApp.
- Manter o texto em **pt-BR**.

## Fluxo obrigatório para criação de nova versão

Sempre que o usuário pedir para criar nova versão, siga este fluxo sem pular etapas.

### 1) Pré-condições obrigatórias

- Executar o fluxo oficial via script: `npm run new-version` (internamente chama `scripts/add-new-version.sh`).
- Quando apropriado, permitir modo não-interativo: `npm run new-version -- <tipo> "<texto do changelog>"`.
- Tipos aceitos em `<tipo>`: `1` (patch), `2` (minor), `3` (major), `4` (manual).
- Garantir que a execução acontece na raiz do repositório.
- Confirmar que existe repositório Git válido.
- Trabalhar a partir da branch `main` atualizada com `origin/main`.
- Criar branch de release para versionamento **apenas se** o fluxo tiver sido iniciado na `main` (ex.: `chore/new-version-YYYY-MM-DD`).
- Se o fluxo já estiver em uma branch de trabalho/release, reutilizar a branch atual e não criar outra.
- Se houver alterações locais, salvar WIP antes de continuar.
- Validar existência dos arquivos obrigatórios:
	- `package.json`
	- `app.config.js`
- Validar existência do arquivo opcional:
	- `android/app/build.gradle`
- Garantir que `docs/CHANGELOG.md` exista (criar se faltar).

### 2) Definição de versão

- Ler a versão atual em `package.json`.
- Classificar corretamente o tipo de incremento:
	- patch: correções pequenas e ajustes sem impacto funcional relevante.
	- minor: novas funcionalidades retrocompatíveis.
	- major: mudanças potencialmente incompatíveis.
- Permitir versão manual apenas quando solicitado explicitamente.

### 3) Atualizações obrigatórias de arquivos

- Atualizar obrigatoriamente estes pontos de versão:
	- `package.json` -> `version`
	- `app.config.js` -> `version`
- Se `android/app/build.gradle` existir, atualizar também:
	- `android/app/build.gradle` -> `versionName`
- Coletar descrição da release e registrar no topo de `docs/CHANGELOG.md` com data no formato `YYYY-MM-DD`.
- Normalizar o `docs/CHANGELOG.md`:
	- manter o título `# Changelog` no topo.
	- evitar múltiplas linhas em branco consecutivas.
	- garantir linha em branco final única.
- Remover arquivos temporários `.bak` gerados no processo.

### 4) Commit e publicação da branch

- Executar `npm i` antes do commit para atualizar o `package-lock.json` com a nova versão.
- Criar commit com os arquivos de release:
	- `package.json`
	- `package-lock.json`
	- `app.config.js`
	- `docs/CHANGELOG.md`
- Se existir, incluir também no commit:
	- `android/app/build.gradle`
- Não criar tag manualmente neste fluxo local.
- A tag de versão é criada exclusivamente no workflow `build-apk_gh-release`.
- Publicar commit na branch.
- Abrir PR para a `main` seguindo o template em `.github/pull_request_template.md`.

### 5) Pós-etapas recomendadas para disponibilização do APK

- Gerar APK de release local quando solicitado:
	- `npm run build:local`
	- validar que o artefato foi movido para `_apks/`.
- Fazer upload do APK para a release existente quando solicitado:
	- `npm run release:upload`
	- informar a tag no padrão da release (ex.: `v1.4.6`).
	- confirmar que o APK foi movido para `_apks/uploaded/` após upload.

### 6) Checklist de confirmação final (obrigatório)

Antes de encerrar, confirmar explicitamente ao usuário:

- versão antiga -> versão nova.
- commit publicado branch.
- arquivos atualizados.
- `package-lock.json` atualizado e incluído no commit/push.
- entrada adicionada no changelog.
- status do build APK (se executado).
- status do upload para release (se executado).

Se qualquer etapa falhar, interromper o fluxo, reportar erro objetivo e não mascarar pendências.
