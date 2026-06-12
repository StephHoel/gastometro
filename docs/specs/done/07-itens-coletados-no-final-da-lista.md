# Mini-spec: Itens coletados no final da lista

Número: 07
Status: implementado

## Problema

Hoje os itens podem ficar misturados entre coletados e não coletados na lista principal, o que reduz a velocidade de leitura durante a compra.

## Objetivo

Exibir itens não coletados primeiro e mover itens coletados para o final da lista, com uma distinção visual clara entre os dois blocos.

## Comportamento esperado

- A lista deve renderizar primeiro os itens com `collected: false`.
- A lista deve renderizar no final os itens com `collected: true`.
- Deve existir uma distinção visual clara entre os blocos de não coletados e coletados.
- Ao marcar um item como coletado, ele deve migrar imediatamente para o bloco final.
- Ao desmarcar um item coletado, ele deve voltar imediatamente para o bloco inicial.
- Quando não houver itens coletados, o divisor não deve ser exibido.
- Quando todos os itens estiverem coletados, a lista deve manter consistência visual sem bloco vazio no topo.

## Decisões fechadas

- A divisão é apenas visual e não altera o formato persistido de `ProductProps`.
- O estado `collected` continua sendo a única fonte de verdade para posicionamento entre os blocos.
- O comportamento deve preservar o fluxo de edição e remoção já existente para qualquer item.

## Telas afetadas

- Tela principal.
- Componente de lista e seus itens.

## Dados e persistência

- Não deve criar novo campo no produto.
- Não deve alterar a chave de persistência `gastometro`.
- Não deve alterar o contrato de compartilhamento/importação via WhatsApp.

## Regras de validação

- O agrupamento por coletado deve ser aplicado apenas na exibição da lista.
- Dentro de cada bloco, manter a regra de ordenação alfabética vigente, salvo decisão explícita em outra mini-spec.
- A distinção visual deve ter contraste compatível com o tema escuro atual.

## Critérios de aceite

- Com itens mistos, a lista mostra primeiro não coletados e depois coletados.
- A distinção entre blocos aparece apenas quando ambos os grupos existem.
- Marcar item move para o bloco final sem exigir recarregamento da tela.
- Desmarcar item move para o bloco inicial sem exigir recarregamento da tela.
- Editar e remover continuam funcionando nos dois blocos.
- Total geral e total coletado permanecem corretos após as movimentações visuais.

## Fora de escopo

- Criar seção recolhível/expansível para coletados.
- Criar ordenação manual por arrastar e soltar.
- Alterar formato de exportação/importação da lista.

## Observações para IA

- Implementar agrupamento em função pura testável antes da renderização.
- Cobrir com testes de componente para validar ordem visual e presença/ausência do divisor.
- Cobrir com testes de store/helper caso a regra de ordenação seja centralizada fora da UI.

## Registro de implementação

- A lista passou a agrupar itens em dois blocos visuais, mantendo a ordenação alfabética dentro de cada bloco.
- A separação visual principal usa cabeçalhos de seção com label e contador de itens: "Não coletados" (topo) e "Coletados" (antes do bloco coletado).
- Cada cabeçalho é exibido de forma independente: "Não coletados" aparece quando há itens pendentes; "Coletados" aparece quando há itens marcados. Não há divisor central extra entre os blocos.
- O componente `src/components/ListSectionHeader.tsx` concentra o layout do cabeçalho de seção.
- A interface `src/interfaces/ListSectionHeaderProps.ts` define o contrato `{ label: string; count: number }`.
- A implementação usa função pura em `src/utils/functions/SortList.ts` (`SortProductsByCollected`) para separar os blocos sem alterar persistência.
- Testes de helper e componente foram adicionados para cobrir ordem visual e presença dos cabeçalhos.
