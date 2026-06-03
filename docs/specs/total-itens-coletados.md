# Mini-spec: Total de itens coletados

Status: planejado

## Problema

O app mostra o total geral da lista, mas não mostra quanto já foi efetivamente coletado durante a compra.

## Objetivo

Exibir o total dos itens marcados como coletados ao lado do total geral.

## Comportamento esperado

- O total geral deve continuar visível.
- O total de coletados deve aparecer ao lado do total geral.
- Ao marcar ou desmarcar um item, o total de coletados deve atualizar imediatamente.
- Itens não coletados não entram no total de coletados.

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

- Lista vazia mostra total geral e total coletado como zero.
- Item não coletado afeta apenas total geral.
- Item coletado afeta total geral e total coletado.
- Alternar checkbox recalcula o total de coletados.
- O layout funciona em telas pequenas sem sobreposição.

## Fora de escopo

- Histórico de gastos.
- Total por categoria.
- Relatório de compras.

## Observações para IA

- Preferir criar função pura para reduzir produtos coletados.
- Cobrir com teste unitário quando a suíte existir.
