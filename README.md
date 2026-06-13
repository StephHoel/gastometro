# Gastômetro

Aplicativo mobile para organizar listas de compras de supermercado de forma simples, offline e com foco em uso rápido durante a compra.

![Demonstração do aplicativo](.github/mobile.gif)

## O que o app faz hoje

- Cria, edita e remove itens da lista de compras.
- Marca itens como coletados durante a compra.
- Calcula o total geral da lista com base em quantidade e preço.
- Exibe o total dos itens coletados ao lado do total geral.
- Aceita valores com vírgula ou ponto como separador decimal.
- Mantém os dados localmente no dispositivo, sem login e sem backend.
- Ordena os itens alfabeticamente.
- Compartilha a lista via WhatsApp.
- Importa uma lista copiada do WhatsApp quando ela segue o formato gerado pelo app.
- Ao colar uma lista na lista existente, une automaticamente itens duplicados com mesmo nome e preço normalizados.
- Permite salvar itens com preço ou quantidade zerada.
- Bloqueia valores negativos em quantidade e preço nos fluxos manuais.
- Bloqueia itens duplicados na criação manual de item.
- Inclui uma calculadora de mercado para calcular preço por unidade.

## Stack

- Expo 56.
- React Native 0.85.
- React 19.
- TypeScript com modo estrito.
- Expo Router para rotas.
- NativeWind/Tailwind para estilos.
- Zustand para estado global.
- AsyncStorage para persistência local.
- Node 24 conforme `.nvmrc`.

O foco atual da plataforma é Android. A versão web compatível com GitHub Pages já está disponível com limitações documentadas.

Compatibilidade atual de plataforma:

- Android mínimo: API 29 (Android 10).
- Build Android local e preview priorizam arquitetura `arm64-v8a` para reduzir tamanho de artefato.
- Build de produção Android usa AAB (`app-bundle`) para distribuição mais eficiente.

## Funcionalidades planejadas

As funcionalidades planejadas são documentadas em mini-specs dentro de [`docs/specs/planned/`](docs/specs/planned/):

- Notificações e lembretes.
- Múltiplas listas.
- Contas a pagar.

Funcionalidades concluídas recentemente:

- Compatibilidade web com GitHub Pages (mini-spec 08 em `docs/specs/done/`).

Antes de implementar uma feature maior, consulte o [`docs/SPEC.md`](docs/SPEC.md) e a mini-spec correspondente.

## Como usar

Baixe o APK mais recente pela página de releases:

[Releases do Gastômetro](https://github.com/StephHoel/gastometro/releases/latest)

Depois instale o APK no Android e abra o app. Não é necessário criar conta.

Observação de compatibilidade Android:

- O APK gerado para distribuição local prioriza dispositivos Android modernos com arquitetura arm64.

## Desenvolvimento

Instale as dependências:

```bash
npm install
```

Inicie o app com dev client:

```bash
npm run start
```

Outros comandos disponíveis:

```bash
npm run android
npm run web
npm run prebuild
npm run build:android
npm run build:local:eas
npm run deps:check
npm run deps:audit
```

Observações:

- `npm run web` inicia o app no modo web de desenvolvimento.
- `npm run build:android` usa EAS com o perfil `production` e gera AAB.
- `npm run build:local:eas` executa build local via EAS.
- O diretório nativo `android/` pode ser gerado por `npm run prebuild` quando necessário.

## Web e GitHub Pages

O app possui suporte para build web estática compatível com GitHub Pages:

```bash
# Build web estática (GitHub Pages)
EXPO_PUBLIC_ROUTER_BASE=/gastometro npm run web:build

# Servir localmente para testar (requer http-server)
npm run web:serve
```

**Notas sobre web:**

- A build web é gerada em `dist/` e é totalmente estática, sem necessidade de backend.
- O roteamento web é configurado via variável de ambiente `EXPO_PUBLIC_ROUTER_BASE=/gastometro` para funcionar corretamente no subdiretório do GitHub Pages.
- Não usar `public/index.html` customizado neste projeto, pois isso pode impedir a injeção dos scripts do Expo e causar tela em branco no `npm run web`.
- APIs nativas sem suporte web possuem fallbacks:
  - **Clipboard:** usa a Clipboard API do navegador na web e fallback seguro em caso de erro.
  - **WhatsApp Sharing:** usa URL `wa.me` na web e fallback para deep link/web link no Android.
  - **AsyncStorage:** usa localStorage do navegador via react-native-web.
- O tema escuro é preservado via CSS em web.
- Dados persistidos localmente funcionam tanto na web quanto no Android.
- O deploy para GitHub Pages é executado automaticamente pelo workflow `.github/workflows/deploy-web.yml` em pushes para `main`.
- Antes do primeiro deploy, habilite GitHub Pages em `Settings > Pages` com `Source: GitHub Actions` (senão o `actions/deploy-pages` retorna erro 404).
- A aplicação web está disponível em: **[https://stephhoel.github.io/gastometro/](https://stephhoel.github.io/gastometro/)**

### Limitações web conhecidas

- Compartilhamento via WhatsApp na web usa `wa.me`/WhatsApp Web, sem deep link nativo equivalente ao Android.
- Clipboard na web depende de `navigator.clipboard`, permissões do navegador e contexto compatível (`https` ou `localhost`).
- Os dados da web ficam no storage local do navegador e podem ser perdidos ao limpar dados do site.
- Não existe sincronização entre dados da web e do Android.
- A versão web não possui PWA/service worker neste momento; o primeiro carregamento depende de internet.
- O fallback de roteamento SPA no GitHub Pages depende de `404.html` + `sessionStorage`; com storage desabilitado, rotas profundas podem não ser restauradas.

## Qualidade e testes

O projeto possui uma suíte automatizada alinhada ao spec, com foco em regras de domínio, store, serviços e contrato:

- testes unitários;
- testes de store/estado;
- testes de componentes;
- testes de integração em serviços;
- testes de contrato/formato, especialmente para compartilhamento e importação via WhatsApp.

Execute os testes localmente com:

```bash
npm run test
```

Modo watch:

```bash
npm run test:watch
```

Cobertura:

```bash
npm run test:coverage
```

O Jest bloqueia a execução quando a cobertura global do código runtime fica abaixo de 80%.

Cobertura com exportação CSV:

```bash
npm run test:coverage:csv
```

O CSV é salvo em `docs/coverages/` com nome no formato `YYYY-MM-DD_HH-MM.csv`.
Header do arquivo: `File;% Stmts;% Branch;% Funcs;% Lines;Uncovered Line #s`.

Além dos testes, rode as verificações disponíveis quando fizer sentido:

```bash
npm run deps:check
npm run deps:audit
```

## Riscos técnicos atuais

- Cobertura de telas e fluxos de navegação ainda pode evoluir, apesar da boa cobertura de domínio e serviços.
- A importação de lista depende de um formato de texto rígido do WhatsApp.
- Fluxos de alerta dependem de referência global inicializada em runtime.

Mitigações já aplicadas no código:

- Validação de negativos em criação/edição manual e calculadora.
- Bloqueio de duplicados na criação manual de itens.
- União automática de duplicados por nome + preço normalizados ao colar na lista existente.

## Diretrizes do projeto

Este repositório segue um fluxo spec-driven para orientar mudanças humanas e assistidas por IA.

- [`docs/SPEC.md`](docs/SPEC.md) é a referência principal de produto, arquitetura, UX, validações e processo.
- [`docs/specs/`](docs/specs/README.md) contém mini-specs organizadas por status em `planned/`, `active/` e `done/`.
- [`docs/CHANGELOG.md`](docs/CHANGELOG.md) registra o histórico das versões.
- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) orienta sugestões do GitHub Copilot.

Ao alterar comportamento de usuário, persistência, formato de WhatsApp ou compatibilidade, atualize a documentação relevante.

## Versionamento

Regras atuais:

- `patch`: correções e atualizações de stack.
- `minor`: novas funcionalidades.
- `major`: mudanças que possam quebrar comportamento, dados persistidos, importação/exportação ou compatibilidade.

Fluxo de criação de versão:

- Interativo: `npm run new-version`
- Não-interativo (com argumentos): `npm run new-version -- <tipo> "<texto do changelog>"`
- Tipos aceitos em `<tipo>`: `1` (patch), `2` (minor), `3` (major), `4` (manual)
- Exemplo: `npm run new-version -- 1 "Ajustes de documentação e scripts de release"`
- Branch de release: criar uma branch nova para versionamento **apenas se** o fluxo for iniciado na `main` (ex.: `chore/new-version-YYYY-MM-DD`).
- Se o fluxo já estiver sendo executado em uma branch de trabalho/release, reutilizar a branch atual e não criar outra.

Regra de Pull Request:

- Se o PR alterar arquivos em `src/` e/ou `tests/`, é obrigatório atualizar a versão do projeto.
- O check automático valida o campo `version` em `package.json` e `app.config.js`.
- Se a versão não for atualizada (ou ficar inconsistente entre os dois arquivos), o check falha e o merge fica bloqueado.

## Política de dependências

Para reduzir risco em atualizações:

- use Node 24 e npm 11;
- atualize o stack Expo em conjunto (`expo`, `expo-*`, `react`, `react-native`, `expo-router`);
- atualize outras bibliotecas em PRs pequenos;
- rode `npm run deps:check` e `npm run deps:audit` antes de publicar alterações de dependências.

O Dependabot abre PRs semanais para dependências npm.

## Contribuição

Contribuições são bem-vindas.

1. Consulte o [`docs/SPEC.md`](docs/SPEC.md).
2. Para features maiores, consulte a mini-spec correspondente ou crie uma nova em [`docs/specs/planned/`](docs/specs/planned/).
3. Crie uma branch para a alteração.
4. Faça commits pequenos e objetivos.
5. Abra um pull request descrevendo mudança, impacto e validação feita.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## Suporte

Abra uma [issue](https://github.com/StephHoel/gastometro/issues) para relatar problemas ou sugerir melhorias.

## Agradecimentos

Agradecimento especial ao designer [Ivaneudo](https://github.com/Ivaneudo/).
