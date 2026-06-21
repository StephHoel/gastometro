# Mini-spec: Refatoração de formulários para react-hook-form

Número: 16
Status: planejado

## Problema

Os formulários do app são controlados manualmente com `useState`, validações imperativas e lógica distribuída por tela/componente. Isso aumenta repetição de código, dificulta reaproveitamento de regras e torna os testes de validação/interação mais custosos de manter.

Diagnóstico atual do repositório:

- Não há uso de `react-hook-form` no código-fonte atual.
- A dependência não está presente em `package.json`.
- Fluxos com formulário identificados:
  - `src/components/Form.tsx` (criação/edição de item da lista)
  - `src/app/reminders/new.tsx` (criação/edição de lembrete)
  - `src/app/lists.tsx` (criação/renomeação de lista)
  - `src/app/calculator.tsx` (entrada de preço/quantidade)

## Objetivo

Padronizar o gerenciamento de formulários usando `react-hook-form`, reduzindo boilerplate e mantendo 100% das regras atuais de negócio, UX e persistência.

## Comportamento esperado

- Todos os fluxos de formulário acima devem usar `react-hook-form` como mecanismo de estado e submissão.
- Validações existentes devem continuar com o mesmo resultado funcional e mesmas mensagens ao usuário.
- Fluxos de foco, submit por teclado e botões devem manter o comportamento atual.
- O formato dos dados persistidos deve permanecer inalterado.
- Regras pt-BR (moeda e parsing com vírgula/ponto) devem permanecer inalteradas.
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
