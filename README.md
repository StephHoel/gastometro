# Gastômetro

Aplicativo mobile para organizar listas de compras de supermercado de forma simples, offline e com foco em uso rápido durante a compra.

![Demonstração do aplicativo](.github/mobile.gif)

## O que o app faz hoje

- Cria, edita e remove itens da lista de compras.
- Marca itens como coletados durante a compra.
- Calcula o total geral da lista com base em quantidade e preço.
- Aceita valores com vírgula ou ponto como separador decimal.
- Mantém os dados localmente no dispositivo, sem login e sem backend.
- Ordena os itens alfabeticamente.
- Compartilha a lista via WhatsApp.
- Importa uma lista copiada do WhatsApp quando ela segue o formato gerado pelo app.
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

O foco atual da plataforma é Android. Uma versão web compatível com GitHub Pages está planejada.

## Funcionalidades planejadas

As próximas funcionalidades são documentadas em mini-specs dentro de [`docs/specs/`](docs/specs/README.md):

- Notificações e lembretes.
- Múltiplas listas.
- Contas a pagar.
- Total de itens coletados ao lado do total geral.
- Gestão de itens duplicados.
- Validação de valores negativos.
- Bloqueio de duplicados na criação manual.
- Suíte de testes automatizados.
- Versão web compatível com GitHub Pages.

Antes de implementar uma feature maior, consulte o [`docs/SPEC.md`](docs/SPEC.md) e a mini-spec correspondente.

## Como usar

Baixe o APK mais recente pela página de releases:

[Releases do Gastômetro](https://github.com/StephHoel/gastometro/releases/latest)

Depois instale o APK no Android e abra o app. Não é necessário criar conta.

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
- `npm run build:android` usa EAS com o perfil `preview`.
- `npm run build:local:eas` executa build local via EAS.
- O diretório nativo `android/` pode ser gerado por `npm run prebuild` quando necessário.

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

Cobertura com exportacao CSV:

```bash
npm run test:coverage:csv
```

O CSV e salvo em `docs/coverages/` com nome no formato `YYYY-MM-DD_HH-MM.csv`.
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

## Diretrizes do projeto

Este repositório segue um fluxo spec-driven para orientar mudanças humanas e assistidas por IA.

- [`docs/SPEC.md`](docs/SPEC.md) é a referência principal de produto, arquitetura, UX, validações e processo.
- [`docs/specs/`](docs/specs/README.md) contém mini-specs das funcionalidades pendentes.
- [`docs/CHANGELOG.md`](docs/CHANGELOG.md) registra o histórico das versões.
- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) orienta sugestões do GitHub Copilot.

Ao alterar comportamento de usuário, persistência, formato de WhatsApp ou compatibilidade, atualize a documentação relevante.

## Versionamento

Regras atuais:

- `patch`: correções e atualizações de stack.
- `minor`: novas funcionalidades.
- `major`: mudanças que possam quebrar comportamento, dados persistidos, importação/exportação ou compatibilidade.

Regra de Pull Request:

- Se o PR alterar arquivos em `src/` e/ou `tests/`, é obrigatório atualizar a versão do projeto.
- O check automático valida o campo `version` em `package.json` e `app.json`.
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
2. Para features maiores, consulte ou crie uma mini-spec em [`docs/specs/`](docs/specs/README.md).
3. Crie uma branch para a alteração.
4. Faça commits pequenos e objetivos.
5. Abra um pull request descrevendo mudança, impacto e validação feita.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## Suporte

Abra uma [issue](https://github.com/StephHoel/gastometro/issues) para relatar problemas ou sugerir melhorias.

## Agradecimentos

Agradecimento especial ao designer [Ivaneudo](https://github.com/Ivaneudo/).
