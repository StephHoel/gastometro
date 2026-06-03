# Gastômetro - Spec Driven Guide para IA

> Status: rascunho vivo. Este arquivo deve ser atualizado sempre que uma decisão de produto, arquitetura, design ou processo mudar.

Este spec orienta futuras interações com ferramentas de IA como Codex, GitHub Copilot, ChatGPT ou agentes similares. Use-o como fonte primária antes de propor código, refatorações, testes, automações ou mudanças de produto.

## 1. Contexto do Produto

O Gastômetro e um aplicativo mobile para organizar listas de compras de supermercado.

Objetivo principal:

- permitir criar, editar, remover, marcar e compartilhar itens de uma lista de compras;
- calcular automaticamente o total da lista;
- funcionar sem login e com persistência local no dispositivo;
- facilitar comparações de preço por unidade usando a calculadora de mercado.

Público esperado:

- pessoas que fazem compras no supermercado e precisam de uma lista simples, rápida e offline;
- usuários brasileiros, com moeda BRL e formatos pt-BR.

## 2. Funcionalidades Existentes

- Gerenciamento de uma lista de compras.
- Adição, edição e remoção de produtos.
- Remoção total da lista.
- Marcação de produtos como coletados.
- Total geral calculado por `quantidade * preço`.
- Ordenação alfabética dos produtos.
- Compartilhamento da lista via WhatsApp.
- Importação de lista copiada do WhatsApp quando o texto segue o formato do app.
- Persistência local com AsyncStorage.
- Calculadora de preço por unidade.
- Suporte a números com vírgula ou ponto como separador decimal.
- Salvamento de itens com preço ou quantidade zerada quando normalizados pelas regras atuais.
- Bloqueio de valores negativos nos fluxos manuais (formulário e calculadora).
- Bloqueio de itens duplicados na criação manual de item.

## 3. Funcionalidades Planejadas

Todas as funcionalidades abaixo devem ser implementadas futuramente, mas ainda precisam de mini-spec antes da execução:

- notificações/lembretes;
- múltiplas listas com títulos personalizados;
- contas a pagar;
- total dos itens marcados como coletados, exibido ao lado do total geral;
- identificação de itens duplicados com uma ação para unir os itens ou alterar um deles.

As mini-specs ficam em `docs/specs/` e devem ser consultadas antes da implementação.

Antes de implementar qualquer item planejado, a IA deve pedir ou propor uma pequena especificação contendo comportamento esperado, telas afetadas, persistência e critérios de aceite.

## 4. Stack Real do Projeto

Use esta seção como verdade atual do repositório.

- Node 24 conforme `.nvmrc`.
- Expo `~56`.
- React Native `0.85`.
- React `19`.
- TypeScript com `strict: true`.
- Expo Router com rotas em `src/app`.
- NativeWind/Tailwind para estilos.
- Zustand para estado global.
- AsyncStorage para persistência local.
- Expo/React Native APIs para clipboard, linking, imagens, fontes, splash e UI.
- Biome configurado parcialmente em `biome.json`.
- Dependabot semanal para dependências npm.
- Foco de plataforma: Android.
- Plataforma futura: web compatível com GitHub Pages.

Não assumir Prisma, PostgreSQL, Jest ou Zod sem antes adicionar essas dependências e justificar a mudança. O arquivo antigo do Copilot citava essas tecnologias, mas elas não aparecem na stack atual.

## 5. Estrutura de Pastas

- `src/app`: telas e rotas do Expo Router.
- `src/components`: componentes reutilizáveis de UI.
- `src/constants`: textos, rotas, mensagens e valores constantes.
- `src/hooks`: hooks compartilhados.
- `src/interfaces`: tipos e contratos TypeScript.
- `src/services`: orquestração de casos de uso e integrações com APIs nativas.
- `src/stores`: estado global Zustand e helpers de manipulação da lista.
- `src/styles`: CSS global do NativeWind.
- `src/utils`: funções puras de domínio, formatação, conversão, ordenação e matemática.
- `assets`: imagens e ícones do app.
- `scripts`: scripts de build, release, limpeza e automações.
- `.github`: workflows, Dependabot, assets e instruções para Copilot.

## 6. Domínio Principal

Produto da lista:

```ts
interface ProductProps {
    id: string
    quantity: string
    item: string
    price: string
    collected: boolean
}
```

Regras atuais:

- `item` e normalizado para title case por `ProductService`.
- `quantity` e `price` são armazenados como string, mas convertidos para número nas operações matemáticas.
- `ParseToFloat` deve aceitar formatos com vírgula e ponto.
- `SetCurrency` deve formatar valores em `pt-BR` e `BRL`.
- produto coletado aparece riscado e em cinza.
- tocar no checkbox alterna `collected`.
- tocar no texto do item abre a edição.
- exclusão usa alerta de confirmação.
- o app permanece offline-first por tempo indeterminado.
- todos os comportamentos existentes devem ser preservados, exceto quando uma feature aprovada alterar explicitamente esse comportamento.

## 7. Arquitetura e Fluxo de Dados

Estado:

- `useCartStore` e o store global.
- Persistência usa `persist` do Zustand com `AsyncStorage`.
- A chave de storage atual e `gastometro`.

Manipulação da lista:

- telas e componentes chamam a API do store (`add`, `edit`, `remove`, `replace`, `get`, `clear`);
- o store delega operações puras para `src/stores/helpers/CartInMemory.ts`;
- serviços como `ProductService`, `AlertService`, `ShareService` e `ClipboardService` concentram regras de criação, alertas, compartilhamento e integrações.

UI:

- telas devem usar `Screen` ou `KeyboardScreen` para manter fundo e comportamento de teclado consistentes;
- `Header` decide botões conforme a rota atual;
- `CustomButton`, `CustomInput`, `Card`, `TextWhite`, `Divider`, `Row` e `TouchableIcons` devem ser preferidos antes de criar novos componentes.

## 8. Diretrizes de Codigo

Ao trabalhar neste projeto, a IA deve:

- manter TypeScript estrito;
- evitar `any`;
- preferir tipos em `src/interfaces` sempre;
- usar alias `@/` para imports internos;
- manter funções pequenas e com responsabilidade clara;
- preservar as regras pt-BR de moeda, texto e números;
- escrever entradas do `docs/CHANGELOG.md` em pt-BR, incluindo acentuacao e caracteres especiais;
- escrever mini-specs em pt-BR, incluindo acentuação e caracteres especiais;
- preferir funções puras em `src/utils` ou `src/stores/helpers` para regras testaveis;
- centralizar textos reutilizáveis em `src/constants`;
- evitar alterar formato de dados persistidos sem plano de migração;
- evitar mudar a chave do AsyncStorage sem necessidade explícita;
- não introduzir biblioteca nova sem justificar o ganho e verificar compatibilidade com Expo;
- manter escopo pequeno por alteração.

## 9. Diretrizes de Design e UX

Diretrizes encontradas no app:

- app mobile em orientação portrait.
- tema escuro com base em `bg-slate-900`.
- fonte Inter configurada no Tailwind (`heading`, `subtitle`, `body`, `bold`).
- botões principais usam estados visuais:
  - sucesso: `bg-lime-400`;
  - falha: `bg-red-600`;
  - neutro: `bg-zinc-400`.
- textos primários usam `TextWhite`.
- telas com entrada de dados devem lidar com teclado via `KeyboardScreen`, `KeyboardAvoidingView` e foco entre inputs.
- confirmações e erros devem usar `CustomAlert` via `AlertService`, quando possível.

Ao criar UI nova:

- priorizar legibilidade em telas pequenas;
- não usar landing page ou explicações longas dentro do app;
- manter controles simples e orientados a tarefa;
- respeitar acessibilidade básica de toque e contraste;
- evitar quebrar o fluxo rápido de compra.
- manter o tema escuro como identidade fixa do app.
- limitar a largura visual do nome do item a aproximadamente três quartos da largura horizontal da tela do dispositivo.

## 10. Validações e Regras de Entrada

Regras decididas:

- item vazio bloqueia salvamento.
- quantidade vazia deve ser aceita e tratada como `0`.
- preço vazio deve ser aceito e tratado como `0.00`.
- valores negativos não devem ser aceitos em quantidade nem preço.
- itens duplicados devem ser bloqueados no modo de criação de item.
- itens duplicados devem ser permitidos no modo de colar/importar lista.
- `ParseToFloat` remove caracteres não numéricos relevantes e interpreta vírgula como decimal.
- divisão por zero retorna `0`.

Pendências de implementação:

- planejar feature para listar duplicados e permitir união ou alteração pelo usuário.
- definir estratégia para tratar valores negativos vindos de importação de lista antiga, sem quebrar retrocompatibilidade.

## 11. Compartilhamento e Importação

Formato de compartilhamento:

- título e subtítulo vem de `src/constants/whatsapp.ts`;
- produtos são serializados no formato `|| {quantidade}x {item} | {preço} | {subtotal}`;
- total final e incluído no fim da mensagem.

Importação:

- só deve tentar importar se o clipboard começar com o título esperado do WhatsApp;
- `ConvertToProductsList` extrai os produtos entre separadores `--`;
- itens importados recebem novo `id`;
- itens importados entram com `collected: false`;
- a UI pergunta se deve adicionar a lista atual ou substituir por uma nova lista.
- itens duplicados são permitidos na importação.
- linhas malformadas ou com valores negativos devem ser ignoradas na importação.

Qualquer mudança nesse formato deve manter retrocompatibilidade com listas já compartilhadas.

## 12. Build, Qualidade e Verificação

Comandos existentes:

```bash
npm run start
npm run web
npm run android
npm run prebuild
npm run build:android
npm run build:local:eas
npm run deps:check
npm run deps:audit
```

Antes de finalizar mudanças, a IA deve tentar uma verificação proporcional ao escopo:

- para regras puras: adicionar ou atualizar testes unitários quando a suíte existir;
- para store/estado: testar operações do Zustand e helpers de lista;
- para componentes: testar renderização e interações principais;
- para integração: testar fluxos completos entre tela, store e serviços;
- para contrato/formato: testar compartilhamento e importação do WhatsApp, preservando retrocompatibilidade;
- para UI: rodar o app quando possível e verificar tela afetada;
- para dependências: rodar `npm run deps:check` e `npm run deps:audit`;
- para TypeScript: usar verificação de tipos quando houver script ou comando apropriado no projeto.

Estratégia de testes escolhida:

- testes unitários;
- testes de store/estado;
- testes de componentes;
- testes de integração;
- testes de contrato/formato.

Observação: o projeto ainda não tem script de teste automatizado configurado. Ao introduzir testes, priorizar funções puras, store e contrato do WhatsApp antes de ampliar cobertura de UI.

## 13. Política de Dependências

Diretrizes do README:

- usar Node 24 e npm 11;
- atualizar stack Expo em conjunto (`expo`, `expo-*`, `react`, `react-native`, `expo-router`);
- atualizar demais bibliotecas em PRs pequenos;
- usar Dependabot semanal;
- rodar `npm run deps:check` e `npm run deps:audit` antes de publicar alterações de dependência.

## 14. Versionamento e Release

Regras de versionamento:

- fix ou atualização de stack: incrementar `patch`;
- nova feature: incrementar `minor`;
- mudança que possa quebrar comportamento, dados persistidos, importação/exportação ou compatibilidade: incrementar `major`.

Os scripts atuais de release/build devem ser preservados até que uma nova estratégia seja especificada.

## 15. Como a IA Deve Trabalhar Neste Projeto

Antes de codar:

1. ler este `docs/SPEC.md`;
2. verificar os arquivos diretamente envolvidos;
3. confirmar se a solicitação muda produto, persistência, UI ou dependências;
4. propor uma mini-spec quando o pedido estiver ambíguo ou afetar comportamento de usuário.

Durante a implementação:

- seguir os padrões existentes de pasta, nomes e componentes;
- manter alterações pequenas e rastreáveis;
- não refatorar código não relacionado;
- proteger dados persistidos;
- preservar comportamento existente por padrão;
- pedir confirmação quando uma mudança alterar comportamento de usuário, formato de dados, formato de compartilhamento ou compatibilidade;
- atualizar este spec quando uma decisão nova for tomada;
- atualizar README somente quando a informação for útil para usuários ou contribuidores.

Ao finalizar:

- descrever arquivos alterados;
- informar verificações executadas;
- declarar riscos ou pendências;
- apontar decisões que ainda precisam de confirmação humana.

## 16. Template de Mini-Spec para Novas Features

As mini-specs do projeto ficam em `docs/specs/`. Elas devem ser escritas em pt-BR, incluindo acentuação e caracteres especiais. Copie e preencha o modelo abaixo antes de implementar funcionalidades maiores que ainda não tenham documento próprio:

```md
## Feature: <nome>

Problema:
- <qual problema do usuário resolve?>

Comportamento esperado:
- <o que deve acontecer?>

Telas afetadas:
- <rotas/componentes>

Dados e persistência:
- <campos novos, migração, compatibilidade>

Regras de validação:
- <entradas válidas/inválidas>

Critérios de aceite:
- <lista objetiva para validar>

Fora de escopo:
- <o que não será feito agora>
```

## 17. Decisões Registradas

- Múltiplas listas e uma feature futura.
- Quantidade vazia deve ser aceita e tratada como `0`.
- Preço vazio deve ser aceito e tratado como `0.00`.
- Valores negativos não devem ser aceitos.
- Nome de item deve ocupar no máximo aproximadamente três quartos da largura horizontal da tela.
- Duplicados devem ser bloqueados na criação manual e permitidos na importação/colagem.
- Deve existir uma feature futura para mostrar itens duplicados e permitir união ou alteração.
- Total de itens coletados deve aparecer ao lado do total geral.
- Formato atual de compartilhamento/importação via WhatsApp deve continuar retrocompatível.
- O app permanece offline-first por tempo indeterminado.
- Estratégia de testes: unitários, store/estado, componentes, integração e contrato/formato.
- Todas as funcionalidades planejadas devem ser implementadas futuramente.
- Tema escuro deve ser mantido como identidade fixa.
- Versionamento segue patch para fix/stack, minor para feature e major para mudança potencialmente quebrável.
- Foco continua Android, com versão web futura compatível com GitHub Pages.
- Todos os comportamentos devem ser preservados, exceto quando a feature aprovada os alterar com confirmação do usuário.
