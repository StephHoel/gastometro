# Mini-spec: Refactor — dead code e duplicação de código

Número: 12
Status: implementado

## Problema

Varredura identificou quatro categorias de problemas no código-fonte atual:

1. **Código duplicado** — bloco de renderização de item de lista repetido em `List.tsx`.
2. **Função exportada não utilizada** — `get` em `CartInMemory.ts` nunca é chamada pelo `CartStore`.
3. **Campo não utilizado em interface** — prop `showAlert` em `ListProps` nunca é consumida.
4. **Arquivo sem uso no app** — `src/utils/products.ts` não é importado por nenhum arquivo de produção.
5. **Interface inline em componente** — `CustomAlertRef` declarada dentro de `CustomAlert.tsx` e exportada de lá, em vez de residir em `src/interfaces/`.

## Objetivo

Eliminar os pontos levantados sem alterar comportamento observável do app nem formato de dados persistidos.

## Itens de trabalho

### 1. Extrair componente `ListItem` de `List.tsx`

- Arquivo: [src/components/List.tsx](../../../src/components/List.tsx) — linhas 29–97
- Os dois blocos `map` (para `notCollected` e `collected`) são estruturalmente idênticos.
- Extrair um componente interno `ListItem` que receba `prod`, `index`, `total` e as callbacks `onToggle`, `onDelete`.
- Manter a lógica de `Divider` condicional dentro do componente.
- Nenhuma prop do componente `List` deve mudar.

### 2. Remover função `get` de `CartInMemory`

- Arquivo: [src/stores/helpers/CartInMemory.ts](../../../src/stores/helpers/CartInMemory.ts) — linhas 26–31
- A função `get` é exportada mas nunca chamada via `CartInMemory.get`.
- O `CartStore` implementa `get` com `.find()` diretamente sem delegar ao helper.
- Remover a função do helper.
- Verificar se há testes cobrindo `CartInMemory.get` diretamente e removê-los ou adaptá-los.

### 3. Remover campo `showAlert` de `ListProps`

- Arquivo: [src/interfaces/ListProps.ts](../../../src/interfaces/ListProps.ts) — linha 6
- A prop `showAlert?: (showAlert: ShowAlertProps) => void` nunca é desestruturada nem usada.
- Remover o campo e o import de `ShowAlertProps` que se torna órfão.

### 4. Remover ou mover `src/utils/products.ts`

- Arquivo: [src/utils/products.ts](../../../src/utils/products.ts)
- O array `PRODUCTS` não é importado em nenhum arquivo de produção.
- Está excluído explicitamente do gate de cobertura em `jest.config.js`.
- Avaliar se é usado como fixture de teste (não encontrado em `tests/**`).
- Se não houver uso em testes, remover o arquivo e a exclusão correspondente no `jest.config.js`.
- Se houver intenção de manter como fixture, mover para `tests/setup/` e atualizar imports se houver algum.

### 5. Mover `CustomAlertRef` para `src/interfaces/`

- Arquivo origem: [src/components/CustomAlert.tsx](../../../src/components/CustomAlert.tsx) — linhas 17–20
- Criar [src/interfaces/CustomAlertRef.ts](../../../src/interfaces/CustomAlertRef.ts) com a interface.
- Atualizar todos os imports que usam `type CustomAlertRef` de `CustomAlert.tsx`:
  - `src/services/AlertService.ts`
  - `src/components/Header.tsx`
  - `src/components/Form.tsx`
  - `src/app/index.tsx`
- Manter re-export de tipo em `CustomAlert.tsx` (`export type { CustomAlertRef }`) apenas se necessário para não quebrar importações de teste.

## Telas afetadas

- Nenhuma tela deve ter comportamento visual ou funcional alterado.

## Dados e persistência

- Nenhuma alteração em dados persistidos, chave de storage ou formato de payload.

## Critérios de aceite

- Suite de testes passa sem regressão (`npm run test`).
- Cobertura global permanece igual ou superior ao baseline atual.
- Nenhuma referência a `CartInMemory.get` permanece no código de produção.
- Nenhuma referência a `showAlert` permanece em `ListProps` ou nos consumidores de `List`.
- `src/utils/products.ts` removido (ou movido com justificativa) e `jest.config.js` atualizado.
- `CustomAlertRef` reside em `src/interfaces/CustomAlertRef.ts` e todos os imports apontam para lá.
- Bloco de renderização de item de lista aparece uma única vez no código (componente `ListItem`).

## Fora de escopo

- Refatoração de outros componentes ou serviços além dos listados.
- Mudanças de estilo visual.
- Adição de novas funcionalidades.
- Alteração de comportamento dos alertas ou do store.

## Observações para IA

- Executar testes após cada item para garantir que nenhuma regressão foi introduzida.
- Não alterar a API pública do `useCartStore` (métodos `add`, `edit`, `remove`, `replace`, `get`, `clear`).
- A remoção de `CartInMemory.get` não afeta o método `get` do store; são implementações separadas.
- Ao mover `CustomAlertRef`, usar `import type` em todos os arquivos consumidores conforme padrão do projeto.

## Registro de implementação

- O bloco duplicado de renderização em `src/components/List.tsx` foi extraído para `src/components/List/ListItem.tsx`, com interface dedicada em `src/interfaces/ListItemProps.ts`.
- A função não utilizada `get` foi removida de `src/stores/helpers/CartInMemory.ts` e os testes do helper foram ajustados para refletir a API vigente.
- O campo não utilizado `showAlert` foi removido de `src/interfaces/ListProps.ts`.
- O arquivo sem uso `src/utils/products.ts` foi removido e `jest.config.js` foi atualizado para remover a exclusão específica desse arquivo.
- A interface `CustomAlertRef` foi movida para `src/interfaces/CustomAlertRef.ts`, com atualização de imports em `CustomAlert.tsx`, `AlertService.ts`, `Header.tsx`, `Form.tsx` e `app/index.tsx`.
- A cobertura foi ampliada com novos testes de componentes/lista e ajustes em testes existentes, mantendo o gate global mínimo do projeto.
