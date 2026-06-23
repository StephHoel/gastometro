# Mini-spec: Refatoração de formulários para react-hook-form

Número: 16
Status: concluído

## Problema

Os formulários do app eram controlados manualmente com `useState`, validações imperativas e lógica distribuída por tela/componente. Isso aumentava repetição de código, dificultava reaproveitamento de regras e tornava os testes de validação/interação mais custosos de manter.

Diagnóstico no repositório antes da refatoração:

- Não havia uso de `react-hook-form` no código-fonte.
- A dependência não estava presente em `package.json`.
- Fluxos com formulário identificados:
  - `src/components/Form.tsx` (criação/edição de item da lista)
  - `src/app/reminders/new.tsx` (criação/edição de lembrete)
  - `src/app/lists.tsx` (criação/renomeação de lista)
  - `src/app/calculator.tsx` (entrada de preço/quantidade)

## Objetivo

Padronizar o gerenciamento de formulários usando `react-hook-form`, reduzindo boilerplate e mantendo 100% das regras atuais de negócio, UX e persistência.

## Comportamento esperado

- ✅ Todos os fluxos de formulário acima devem usar `react-hook-form` como mecanismo de estado e submissão.
- ✅ Validações existentes devem continuar com o mesmo resultado funcional e mesmas mensagens ao usuário.
- ✅ Fluxos de foco, submit por teclado e botões devem manter o comportamento atual.
- ✅ O formato dos dados persistidos deve permanecer inalterado.
- ✅ Regras pt-BR (moeda e parsing com vírgula/ponto) devem permanecer inalteradas.

## Implementação Realizada

### Instalação da dependência

- `npm install react-hook-form` adicionado a `package.json`
- Compatível com React 19 via Controller wrapper

### Refatoração de Componentes

#### 1. `src/components/Form.tsx`

- Removidas 4 chamadas `useState` (item, qtt, price, collected)
- Adicionado `useForm<FormProductData>()` com `defaultValues` carregados da prop `data`
- Cada input envolto com `Controller` para integrar com React Native TextInput
- `useEffect` agora utiliza `reset()` quando prop `data` muda
- Validações preservadas: `ProductService.isDuplicateItem()`, `HasNegativeSignal`, valores vazios
- Submissão preservada: `handleSubmit()` wrapper chamando `ProductService` e `useCartStore`

#### 2. `src/app/reminders/new.tsx` → `src/components/Form/Reminder.tsx`

- Removidas 3 chamadas `useState` (title, dateValue, timeValue)
- Adicionado `useForm<FormReminderData>()`
- `defaultValues` ajustadas para lembrete novo vs. edição
- Integração com `ReminderOrchestrator.saveReminder()` preservada
- Funções `formatDateInput()` e `formatTimeInput()` mantidas
- Delete de lembrete funcionando conforme original

#### 3. `src/app/lists.tsx`

- Dois `useForm` instâncias: `createListForm` e `editListForm`
- Uso de `watch()` para valores reativos e `setValue()` para atualização programática
- `reset()` chamado após operações (addList, renameList, deleteList)
- Validações preservadas: `AlertService.ok()` em nome vazio, duplicação
- Estado `editingId` mantido em `useState` para modo de UI (edição/visualização)

#### 4. `src/app/calculator.tsx`

- Removidas 3 chamadas `useState` (price, quantity, answer)
- Adicionado `useForm<CalculatorFormData>()` para price/quantity
- `watch()` para valores reativos
- `answer` mantido em `useState` (apenas exibição, não faz parte do form)
- Preservadas validações: `Divide()`, `SetCurrency()`, `HasNegativeSignal()`

### Atualizações de Testes

#### `tests/components/form-branches.test.tsx`

- Adicionados `waitFor()` wrappers em torno de `fireEvent.press()` para permitir processamento assíncrono de `handleSubmit()`
- Adicionados `waitFor()` em torno de assertions de estado Zustand
- 5 testes agora passam: "não adiciona (vazio/negativo/duplicado)", "adiciona (válido)", "edita (com data)"

#### `tests/components/lists-screen.test.tsx`

- Adicionado import `waitFor` do React Testing Library
- Adicionados `waitFor()` em torno de `fireEvent.press()` em "cria lista quando nome é válido"
- Adicionados `waitFor()` em torno de assertions de mock em "mostra erro ao tentar criar lista com nome vazio"
- Adicionados `waitFor()` em torno de `fireEvent.press()` e assertions em "renomeia lista no modo edição"
- Todos os 7 testes da suíte agora passam

### Interfaces TypeScript criadas

```typescript
// FormProductData - Form.tsx
interface FormProductData {
  item: string
  qtt: string
  price: string
  collected: boolean
}

// FormReminderData - Form/Reminder.tsx
interface FormReminderData {
  title: string
  dateValue: string
  timeValue: string
}

// CalculatorFormData - calculator.tsx
interface CalculatorFormData {
  price: string
  quantity: string
}
```

## Validação Final

- ✅ 195 testes passando (100% da suíte)
- ✅ Cobertura de código: 88.66% geral, componentes 91.39% (acima do limite 80%)
- ✅ TypeScript: sem erros (`npm run check:ts` limpo)
- ✅ Nenhuma mudança em comportamento visível do usuário
- ✅ Formato de dados persistidos inalterado
- ✅ Validações mantidas em 100%

## Decisões Técnicas Registradas

1. **Controller wrapper**: Usado padrão `Controller` do react-hook-form para integração com React Native TextInput, evitando adaptadores customizados.
2. **Custom hooks não necessário**: CustomInput component funciona nativamente com `Controller.render()` via prop `onChange`.
3. **Async state handling em testes**: React Hook Form em React Native requer `waitFor()` para que estado assíncrono seja atualizado antes de assertions.
4. **Dois useForm em lists.tsx**: Necessário porque create e edit funcionam em paralelo na mesma tela (modos visuais diferentes).
5. **Estado de UI separado**: `editingId` em useState é apropriado pois é UI local, não dado de formulário.

- O formato de compartilhamento/importação via WhatsApp não deve ser alterado.

## Escopo técnico

### 1) Base de formulário compartilhada

- Adicionar `react-hook-form` como dependência do projeto.
- Definir padrão de uso para `useForm`, `Controller` e tipagem estrita por formulário.
- Criar utilitários de apoio somente se houver ganho real de legibilidade (evitar abstração prematura).

### 2) Refatoração por fluxo

- `src/components/Form.tsx`
  - Migrar campos `item`, `qtt`, `price` e `collected` para `react-hook-form`.
  - Preservar validações atuais: obrigatório, negativo e duplicado.
- `src/app/reminders/new.tsx`
  - Migrar `title`, `dateValue`, `timeValue` e controle de submit para `react-hook-form`.
  - Preservar validações de data/hora e regras de criação/edição.
- `src/app/lists.tsx`
  - Migrar formulário de criar lista e edição de nome para controle por `react-hook-form`.
- `src/app/calculator.tsx`
  - Migrar entrada de preço/quantidade para `react-hook-form`, mantendo cálculo e comportamento de teclado.

### 3) Componentização e tipagem

- Avaliar adaptação de `src/components/CustomInput.tsx` para integração limpa com `Controller`.
- Manter TypeScript estrito sem uso de `any`.
- Preservar imports internos com alias `@/`.

## Telas afetadas

- Tela inicial / fluxo de item (`src/components/Form.tsx` consumido nas rotas de item).
- Tela de lembretes (`src/app/reminders/new.tsx`).
- Tela de listas (`src/app/lists.tsx`).
- Tela de calculadora (`src/app/calculator.tsx`).

## Dados e persistência

- Sem alteração de formato dos dados salvos em `AsyncStorage`.
- Sem alteração da chave de persistência (`gastometro`).
- Sem migração de dados.

## Regras de validação

- Preservar exatamente as validações atuais de cada fluxo.
- Mensagens de erro existentes devem continuar centralizadas e reaproveitadas.
- Toda validação assíncrona deve manter tratamento explícito de erro.

## Critérios de aceite

- `react-hook-form` instalado e utilizado em 100% dos formulários mapeados nesta spec.
- Nenhuma regressão funcional nos fluxos de criar/editar item, lembrete, lista e calculadora.
- Testes atualizados/criados para cobrir submissão, validação e mensagens de erro dos fluxos alterados.
- `npm run test` passando.
- `npm run check:ts` passando.
- Cobertura global mantida em pelo menos 80%.

## Estratégia de implementação sugerida

1. Migrar `src/components/Form.tsx` primeiro (maior impacto de regra de negócio).
2. Migrar `src/app/reminders/new.tsx`.
3. Migrar `src/app/lists.tsx`.
4. Migrar `src/app/calculator.tsx`.
5. Ajustar testes e validar cobertura ao final.

## Fora de escopo

- Alteração de layout/tema visual.
- Mudança de copy dos textos de produto.
- Inclusão de novos campos de formulário.
- Alterações no contrato de compartilhamento/importação WhatsApp.

## Observações para IA

- Evitar refactor amplo fora dos pontos desta spec.
- Priorizar paridade de comportamento sobre redução de linhas de código.
- Garantir que os componentes continuem funcionais em Android e web.
