# Mini-spec: Gestão de itens duplicados

Número: 06
Status: ativa

## Problema

Duplicados devem ser bloqueados na criação manual, mas continuam permitidos na importação/colagem. O usuário precisa de uma forma de revisar e resolver duplicados importados.

## Objetivo

Criar uma ação que mostre itens duplicados e permita unir itens ou alterar um deles.

## Comportamento esperado

- O app deve identificar possíveis duplicados pela combinação de nome normalizado e preço normalizado.
- Quando houver duplicados, uma ação deve permitir visualizar esses itens.
- O usuário deve poder unir duplicados.
- O usuário deve poder editar um dos itens para remover a duplicidade.
- O usuário deve poder ignorar duplicados sem obrigatoriedade de correção.

## Telas afetadas

- Tela principal.
- Header ou área de ações da lista.
- Tela/modal de resolução de duplicados.
- Fluxo de edição de item.

## Dados e persistência

- Não deve exigir novo campo persistido para detectar duplicados.
- União de itens deve alterar os produtos existentes conforme regra definida.
- Se houver múltiplas listas no futuro, a detecção deve considerar apenas a lista ativa.

## Regras de validação

- Comparação deve ignorar diferenças simples de maiúsculas/minúsculas e espaços nas extremidades do nome.
- Duplicidade deve considerar nome e preço após normalização numérica (ex.: `10`, `10.0` e `10,00` devem ser equivalentes).
- Regra de união aprovada:
  - se o preço for igual, a quantidade deve ser somada;
  - se a quantidade final após a soma não mudar em relação ao item mantido, manter o estado `collected` do item mantido;
  - se a quantidade final após a soma mudar, o estado final `collected` deve ser `false`.

## Critérios de aceite

- Identificar duplicados importados.
- Exibir lista de duplicados.
- Permitir editar um duplicado.
- Permitir unir duplicados conforme regra aprovada.
- Não bloquear importação por causa de duplicados.
- Não afetar itens não duplicados.

## Fora de escopo

- União automática sem confirmação.
- Detecção por sinônimos.
- Detecção fuzzy complexa.

## Observações para IA

- Esta feature depende da regra de bloqueio de duplicados na criação manual.
- Pedir confirmação da regra exata de união antes de implementar.

## Registro de implementação

- 2026-06-13: implementação iniciada; mini-spec movida de `planned/` para `active/`.
- 2026-06-13: regra de detecção de duplicados definida como nome + preço normalizados.
- 2026-06-13: regra de união definida para somar quantidade e ajustar `collected` conforme igualdade das quantidades.
- 2026-06-13: regra de união corrigida para ajustar `collected` com base na mudança da quantidade final em relação ao item mantido.
