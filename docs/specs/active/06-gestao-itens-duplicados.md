# Mini-spec: Gestão de itens duplicados

Número: 06
Status: ativa

## Problema

Duplicados devem ser tratados na importação/colagem.

## Objetivo

Criar uma função que una os itens duplicados com base na regra a ser definida.

## Comportamento esperado

- O app deve identificar possíveis duplicados pela combinação de nome normalizado e preço normalizado.
- A regra acima se aplica ao fluxo de revisão/união de duplicados importados, sem alterar a regra da criação manual (mini-spec 01).
- A regra deve ser aplicada antes de unir as listas, de forma que o item com mesmo nome e mesmo preço tenha sua quantidade somada para formar a quantidade final. Se a quantidade somada for maior do que a quantidade original, deve registrar o collected como false, caso contrário, mantém o collected igual.

## Telas afetadas

- Header ou área de ações da lista.

## Dados e persistência

- Não deve exigir novo campo persistido para detectar duplicados.
- União de itens deve alterar os produtos existentes conforme regra definida.
- Se houver múltiplas listas no futuro, a detecção deve considerar apenas a lista ativa.

## Regras de validação

- Comparação deve ignorar diferenças simples de maiúsculas/minúsculas e espaços nas extremidades do nome.
- Duplicidade deve considerar nome e preço após normalização numérica (ex.: `10`, `10.0` e `10,00` devem ser equivalentes).
- Regra de união aprovada:
  - se o preço for igual, a quantidade deve ser somada;
  - se a quantidade final após a soma não mudar em relação ao item original, manter o estado `collected` do item mantido;
  - se a quantidade final após a soma mudar, o estado final `collected` deve ser `false`.

## Critérios de aceite

- Identificar duplicados importados.
- Permitir unir duplicados conforme regra aprovada.
- Bloquear importação por causa de duplicados.
- Não afetar itens não duplicados.
- União automática sem confirmação.

## Fora de escopo

- Exibir lista de duplicados.
- Permitir editar um duplicado.
- Detecção por sinônimos.
- Detecção fuzzy complexa.

## Observações para IA

- Esta feature não depende da regra de bloqueio de duplicados na criação manual.
- Pedir confirmação da regra exata de união antes de implementar.

## Registro de implementação

- 2026-06-13: implementação iniciada; mini-spec movida de `planned/` para `active/`.
- 2026-06-13: regra de detecção de duplicados definida como nome + preço normalizados.
- 2026-06-13: regra de união definida para somar quantidade e ajustar `collected` conforme igualdade das quantidades.
- 2026-06-13: regra de união corrigida para ajustar `collected` com base na mudança da quantidade final em relação ao item mantido.
- 2026-06-13: escopo ajustado para manter bloqueio manual por nome (mini-spec 01) e usar nome + preço na revisão/união de duplicados.
- 2026-06-13: ao colar na lista existente, a comparação de duplicados (nome + preço) passou a ocorrer antes da união das listas.
