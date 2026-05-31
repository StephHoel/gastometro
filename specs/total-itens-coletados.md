# Mini-spec: Total de itens coletados

Status: planejado

## Problema

O app mostra o total geral da lista, mas nao mostra quanto ja foi efetivamente coletado durante a compra.

## Objetivo

Exibir o total dos itens marcados como coletados ao lado do total geral.

## Comportamento esperado

- O total geral deve continuar visivel.
- O total de coletados deve aparecer ao lado do total geral.
- Ao marcar ou desmarcar um item, o total de coletados deve atualizar imediatamente.
- Itens nao coletados nao entram no total de coletados.

## Telas afetadas

- Tela principal.
- Possivelmente `Header` ou bloco de totais abaixo do header.
- Funcoes utilitarias de calculo.

## Dados e persistencia

- Nao requer novo campo persistido.
- Usa `ProductProps.collected` existente.
- Deve preservar o formato atual de produtos.

## Regras de validacao

- Produtos com quantidade ou preco vazios devem contribuir como `0`.
- Valores negativos nao devem ser aceitos quando a validacao de negativos estiver implementada.
- Moeda deve continuar em `pt-BR` e `BRL`.

## Criterios de aceite

- Lista vazia mostra total geral e total coletado como zero.
- Item nao coletado afeta apenas total geral.
- Item coletado afeta total geral e total coletado.
- Alternar checkbox recalcula o total de coletados.
- O layout funciona em telas pequenas sem sobreposicao.

## Fora de escopo

- Historico de gastos.
- Total por categoria.
- Relatorio de compras.

## Observacoes para IA

- Preferir criar funcao pura para reduzir produtos coletados.
- Cobrir com teste unitario quando a suite existir.
