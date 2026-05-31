# Gastometro - Spec Driven Guide para IA

> Status: rascunho vivo. Este arquivo deve ser atualizado sempre que uma decisao de produto, arquitetura, design ou processo mudar.

Este spec orienta futuras interacoes com ferramentas de IA como Codex, GitHub Copilot, ChatGPT ou agentes similares. Use-o como fonte primaria antes de propor codigo, refatoracoes, testes, automacoes ou mudancas de produto.

## 1. Contexto do Produto

O Gastometro e um aplicativo mobile para organizar listas de compras de supermercado.

Objetivo principal:

- permitir criar, editar, remover, marcar e compartilhar itens de uma lista de compras;
- calcular automaticamente o total da lista;
- funcionar sem login e com persistencia local no dispositivo;
- facilitar comparacoes de preco por unidade usando a calculadora de mercado.

Publico esperado:

- pessoas que fazem compras no supermercado e precisam de uma lista simples, rapida e offline;
- usuarios brasileiros, com moeda BRL e formatos pt-BR.

## 2. Funcionalidades Existentes

- Gerenciamento de uma lista de compras.
- Adicao, edicao e remocao de produtos.
- Remocao total da lista.
- Marcacao de produtos como coletados.
- Total geral calculado por `quantidade * preco`.
- Ordenacao alfabetica dos produtos.
- Compartilhamento da lista via WhatsApp.
- Importacao de lista copiada do WhatsApp quando o texto segue o formato do app.
- Persistencia local com AsyncStorage.
- Calculadora de preco por unidade.
- Suporte a numeros com virgula ou ponto como separador decimal.
- Salvamento de itens com preco ou quantidade zerada quando normalizados pelas regras atuais.

## 3. Funcionalidades Planejadas

Estas ideias aparecem no README e ainda devem ser detalhadas antes de implementacao:

- notificacoes/lembretes;
- multiplas listas com titulos personalizados;
- contas a pagar;
- total apenas dos itens marcados como coletados.

Antes de implementar qualquer item planejado, a IA deve pedir ou propor uma pequena especificacao contendo comportamento esperado, telas afetadas, persistencia e criterios de aceite.

## 4. Stack Real do Projeto

Use esta secao como verdade atual do repositorio.

- Node 20 conforme `.nvmrc`.
- Expo `~56`.
- React Native `0.85`.
- React `19`.
- TypeScript com `strict: true`.
- Expo Router com rotas em `src/app`.
- NativeWind/Tailwind para estilos.
- Zustand para estado global.
- AsyncStorage para persistencia local.
- Expo/React Native APIs para clipboard, linking, imagens, fontes, splash e UI.
- Biome configurado parcialmente em `biome.json`.
- Dependabot semanal para dependencias npm.

Nao assumir Prisma, PostgreSQL, Jest ou Zod sem antes adicionar essas dependencias e justificar a mudanca. O arquivo antigo do Copilot citava essas tecnologias, mas elas nao aparecem na stack atual.

## 5. Estrutura de Pastas

- `src/app`: telas e rotas do Expo Router.
- `src/components`: componentes reutilizaveis de UI.
- `src/constants`: textos, rotas, mensagens e valores constantes.
- `src/hooks`: hooks compartilhados.
- `src/interfaces`: tipos e contratos TypeScript.
- `src/services`: orquestracao de casos de uso e integracoes com APIs nativas.
- `src/stores`: estado global Zustand e helpers de manipulacao da lista.
- `src/styles`: CSS global do NativeWind.
- `src/utils`: funcoes puras de dominio, formatacao, conversao, ordenacao e matematica.
- `assets`: imagens e icones do app.
- `scripts`: scripts de build, release, limpeza e automacoes.
- `.github`: workflows, Dependabot, assets e instrucoes para Copilot.

## 6. Dominio Principal

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
- `quantity` e `price` sao armazenados como string, mas convertidos para numero nas operacoes matematicas.
- `ParseToFloat` deve aceitar formatos com virgula e ponto.
- `SetCurrency` deve formatar valores em `pt-BR` e `BRL`.
- produto coletado aparece riscado e em cinza.
- tocar no checkbox alterna `collected`.
- tocar no texto do item abre a edicao.
- exclusao usa alerta de confirmacao.

## 7. Arquitetura e Fluxo de Dados

Estado:

- `useCartStore` e o store global.
- Persistencia usa `persist` do Zustand com `AsyncStorage`.
- A chave de storage atual e `gastometro`.

Manipulacao da lista:

- telas e componentes chamam a API do store (`add`, `edit`, `remove`, `replace`, `get`, `clear`);
- o store delega operacoes puras para `src/stores/helpers/CartInMemory.ts`;
- servicos como `ProductService`, `AlertService`, `ShareService` e `ClipboardService` concentram regras de criacao, alertas, compartilhamento e integracoes.

UI:

- telas devem usar `Screen` ou `KeyboardScreen` para manter fundo e comportamento de teclado consistentes;
- `Header` decide botoes conforme a rota atual;
- `CustomButton`, `CustomInput`, `Card`, `TextWhite`, `Divider`, `Row` e `TouchableIcons` devem ser preferidos antes de criar novos componentes.

## 8. Diretrizes de Codigo

Ao trabalhar neste projeto, a IA deve:

- manter TypeScript estrito;
- evitar `any`;
- preferir tipos em `src/interfaces` sempre;
- usar alias `@/` para imports internos;
- manter funcoes pequenas e com responsabilidade clara;
- preservar as regras pt-BR de moeda, texto e numeros;
- preferir funcoes puras em `src/utils` ou `src/stores/helpers` para regras testaveis;
- centralizar textos reutilizaveis em `src/constants`;
- evitar alterar formato de dados persistidos sem plano de migracao;
- evitar mudar a chave do AsyncStorage sem necessidade explicita;
- nao introduzir biblioteca nova sem justificar o ganho e verificar compatibilidade com Expo;
- manter escopo pequeno por alteracao.

## 9. Diretrizes de Design e UX

Diretrizes encontradas no app:

- app mobile em orientacao portrait.
- tema escuro com base em `bg-slate-900`.
- fonte Inter configurada no Tailwind (`heading`, `subtitle`, `body`, `bold`).
- botoes principais usam estados visuais:
  - sucesso: `bg-lime-400`;
  - falha: `bg-red-600`;
  - neutro: `bg-zinc-400`.
- textos primarios usam `TextWhite`.
- telas com entrada de dados devem lidar com teclado via `KeyboardScreen`, `KeyboardAvoidingView` e foco entre inputs.
- confirmacoes e erros devem usar `CustomAlert` via `AlertService`, quando possivel.

Ao criar UI nova:

- priorizar legibilidade em telas pequenas;
- nao usar landing page ou explicacoes longas dentro do app;
- manter controles simples e orientados a tarefa;
- respeitar acessibilidade basica de toque e contraste;
- evitar quebrar o fluxo rapido de compra.

## 10. Validacoes e Regras de Entrada

Regras atuais:

- item vazio bloqueia salvamento.
- calculadora bloqueia calculo quando preco ou quantidade estao vazios.
- quantidade e preco vazios ou invalidos sao normalizados para `0` ou `0.00` conforme regras em `ProductService`.
- `ParseToFloat` remove caracteres nao numericos relevantes e interpreta virgula como decimal.
- divisao por zero retorna `0`.

Pendencias para detalhar:

- decidir se quantidade vazia deve ser permitida em novos itens;
- decidir se preco vazio deve ser permitido em novos itens;
- definir comportamento para valores negativos;
- definir limite maximo de caracteres para nome do item;
- definir se duplicidade de item deve ser permitida.

## 11. Compartilhamento e Importacao

Formato de compartilhamento:

- titulo e subtitulo vem de `src/constants/whatsapp.ts`;
- produtos sao serializados no formato `|| {quantidade}x {item} | {preco} | {subtotal}`;
- total final e incluido no fim da mensagem.

Importacao:

- so deve tentar importar se o clipboard comecar com o titulo esperado do WhatsApp;
- `ConvertToProductsList` extrai os produtos entre separadores `--`;
- itens importados recebem novo `id`;
- itens importados entram com `collected: false`;
- a UI pergunta se deve adicionar a lista atual ou substituir por uma nova lista.

Qualquer mudanca nesse formato deve considerar retrocompatibilidade com listas ja compartilhadas.

## 12. Build, Qualidade e Verificacao

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

Antes de finalizar mudancas, a IA deve tentar uma verificacao proporcional ao escopo:

- para regras puras: validar manualmente os cenarios relevantes e, se houver suite de testes futura, adicionar testes;
- para UI: rodar o app quando possivel e verificar tela afetada;
- para dependencias: rodar `npm run deps:check` e `npm run deps:audit`;
- para TypeScript: usar verificacao de tipos quando houver script ou comando apropriado no projeto.

Observacao: o projeto ainda nao tem script de teste automatizado configurado.

## 13. Politica de Dependencias

Diretrizes do README:

- usar Node 20 e npm 10;
- atualizar stack Expo em conjunto (`expo`, `expo-*`, `react`, `react-native`, `expo-router`);
- atualizar demais bibliotecas em PRs pequenos;
- usar Dependabot semanal;
- rodar `npm run deps:check` e `npm run deps:audit` antes de publicar alteracoes de dependencia.

## 14. Como a IA Deve Trabalhar Neste Projeto

Antes de codar:

1. ler este `SPEC.md`;
2. verificar os arquivos diretamente envolvidos;
3. confirmar se a solicitacao muda produto, persistencia, UI ou dependencias;
4. propor uma mini-spec quando o pedido estiver ambiguo ou afetar comportamento de usuario.

Durante a implementacao:

- seguir os padroes existentes de pasta, nomes e componentes;
- manter alteracoes pequenas e rastreaveis;
- nao refatorar codigo nao relacionado;
- proteger dados persistidos;
- atualizar este spec quando uma decisao nova for tomada;
- atualizar README somente quando a informacao for util para usuarios ou contribuidores.

Ao finalizar:

- descrever arquivos alterados;
- informar verificacoes executadas;
- declarar riscos ou pendencias;
- apontar decisoes que ainda precisam de confirmacao humana.

## 15. Template de Mini-Spec para Novas Features

Copie e preencha antes de implementar funcionalidades maiores:

```md
## Feature: <nome>

Problema:
- <qual problema do usuario resolve?>

Comportamento esperado:
- <o que deve acontecer?>

Telas afetadas:
- <rotas/componentes>

Dados e persistencia:
- <campos novos, migracao, compatibilidade>

Regras de validacao:
- <entradas validas/invalidas>

Criterios de aceite:
- <lista objetiva para validar>

Fora de escopo:
- <o que nao sera feito agora>
```

## 16. Perguntas Abertas

- O app deve continuar com apenas uma lista ou multiplas listas viraram prioridade?
- Produtos com quantidade/preco vazios devem ser aceitos ou bloqueados?
- Itens duplicados devem ser agrupados, bloqueados ou permitidos?
- O total de itens coletados deve aparecer junto ao total geral?
- A importacao de listas antigas deve continuar aceitando exatamente o formato atual?
- Havera backend no futuro ou o produto deve permanecer offline-first?
- Qual estrategia de testes automatizados sera adotada?
