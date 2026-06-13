# Mini-spec: União de itens duplicados da importação de lista

Número: 06
Status: implementado

## Problema

Duplicados são permitidos na importação/colagem, mas hoje geram ambiguidade para o usuário quando entram na lista existente sem revisão orientada.

## Objetivo

Implementar união automática de duplicados importados antes de concluir a união com a lista atual.

## Comportamento esperado

- O app deve identificar possíveis duplicados pela combinação de nome normalizado e preço normalizado.
- A regra acima se aplica ao fluxo de união automática de duplicados importados, sem alterar a regra da criação manual (mini-spec 01).
- Ao escolher colar/importar na lista existente, a comparação de duplicados deve ocorrer antes da união final das listas.
- Quando houver duplicado, o app deve aplicar automaticamente a regra de união aprovada antes da confirmação final.
- Regra de união aprovada: se nome e preço normalizados forem equivalentes, a quantidade deve ser somada.
- Regra de `collected` na união aprovada:
  - se a quantidade final após a soma mudar em relação ao item mantido, o estado final deve ser `false`;
  - se a quantidade final não mudar, o estado `collected` do item mantido deve ser preservado.

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
- Unir duplicados automaticamente conforme regra aprovada.
- Não bloquear a importação inteira por causa de duplicados.
- Não afetar itens não duplicados.
- Concluir importação com a união automática aplicada aos duplicados.

## Fora de escopo

- Detecção por sinônimos.
- Detecção fuzzy complexa.
- Migração de dados persistidos antigos.

## Observações para IA

- Esta feature não depende da regra de bloqueio de duplicados na criação manual.
- Preservar compatibilidade com o formato atual de importação via WhatsApp.

## Registro de implementação

- 2026-06-13: implementação iniciada; mini-spec movida de `planned/` para `active/`.
- 2026-06-13: regra de detecção de duplicados definida como nome + preço normalizados.
- 2026-06-13: regra de união definida para somar quantidade e ajustar `collected` conforme igualdade das quantidades.
- 2026-06-13: regra de união corrigida para ajustar `collected` com base na mudança da quantidade final em relação ao item mantido.
- 2026-06-13: escopo ajustado para manter bloqueio manual por nome (mini-spec 01) e usar nome + preço na revisão/união de duplicados.
- 2026-06-13: ao colar na lista existente, a comparação de duplicados (nome + preço) passou a ocorrer antes da união das listas.
- 2026-06-13: mini-spec revisada para alinhar critérios de aceite com o `docs/SPEC.md` (importação permitida com revisão para unir ou editar duplicados).
- 2026-06-13: implementação concluída com revisão de duplicados no fluxo de colar na lista existente, permitindo decisão por grupo entre unir itens ou editar depois.
- 2026-06-13: ajuste de comportamento para união automática dos duplicados pelo app, sem exigir ação adicional do usuário.
