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
- Não assuma Prisma, PostgreSQL, Jest ou Zod: eles não fazem parte da stack atual.
- Preserve regras pt-BR de moeda, números com vírgula/ponto e textos do usuário.
- Preserve comportamento existente, formato de dados persistidos e formato de WhatsApp, salvo confirmação explícita do usuário.
- Tema escuro e identidade fixa do app.
- Para funcionalidades maiores, preencha uma mini-spec no formato indicado em `docs/SPEC.md`.

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

## Fluxo obrigatório para criação de nova versão

Sempre que o usuário pedir para criar nova versão, siga este fluxo sem pular etapas.

### 1) Pré-condições obrigatórias

- Executar o fluxo oficial via script: `npm run new-version` (internamente chama `scripts/add-new-version.sh`).
- Garantir que a execução acontece na raiz do repositório.
- Confirmar que existe repositório Git válido.
- Trabalhar a partir da branch `main` atualizada com `origin/main`.
- Se houver alterações locais, salvar WIP antes de continuar.
- Validar existência dos arquivos obrigatórios:
	- `package.json`
	- `app.json`
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
	- `app.json` -> `version`
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
	- `app.json`
	- `docs/CHANGELOG.md`
- Se existir, incluir também no commit:
	- `android/app/build.gradle`
- Não criar tag manualmente neste fluxo local.
- A tag de versão é criada exclusivamente no workflow `build-apk_gh-release`.
- Publicar commit na branch.
- Abrir PR para a `main` seguindo o template.

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
