# Mini-spec: Total de itens coletados

Status: planejado

## Problema

O app mostra o total geral da lista, mas não mostra quanto já foi efetivamente coletado durante a compra.

## Objetivo

Exibir o total dos itens marcados como coletados ao lado do total geral.

## Comportamento esperado

- O total geral deve continuar visível.
- O total de coletados deve aparecer ao lado do total geral no formato visual `Total Geral | Total Coletado`.
- Ao marcar ou desmarcar um item, o total de coletados deve atualizar imediatamente.
- Itens não coletados não entram no total de coletados.

## Decisões fechadas

- Rótulo definido: `Total Coletado`.
- Layout definido: `Total Geral | Total Coletado`.
- Destaque visual do total coletado deve seguir o mesmo estilo do total geral.
- Compartilhamento via WhatsApp permanece fora de escopo nesta entrega.

## Telas afetadas

- Tela principal.
- Possivelmente `Header` ou bloco de totais abaixo do header.
- Funções utilitárias de cálculo.

## Dados e persistência

- Não requer novo campo persistido.
- Usa `ProductProps.collected` existente.
- Deve preservar o formato atual de produtos.

## Regras de validação

- Produtos com quantidade ou preço vazios devem contribuir como `0`.
- Valores negativos não devem ser aceitos quando a validação de negativos estiver implementada.
- Moeda deve continuar em `pt-BR` e `BRL`.

## Critérios de aceite

- Lista vazia mostra `Total Geral` e `Total Coletado` como `R$ 0,00`.
- Item não coletado entra apenas em `Total Geral`.
- Item coletado entra em `Total Geral` e `Total Coletado`.
- Marcar e desmarcar item atualiza imediatamente o `Total Coletado`.
- Em telas pequenas, o layout não pode apresentar sobreposição.

## Fora de escopo

- Histórico de gastos.
- Total por categoria.
- Relatório de compras.
- Alteração no formato de compartilhamento via WhatsApp.

## Observações para IA

- Preferir criar função pura para reduzir produtos coletados.
- Cobrir com teste unitário quando a suíte existir.
