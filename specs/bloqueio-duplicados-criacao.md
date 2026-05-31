# Mini-spec: Bloqueio de duplicados na criacao manual

Status: planejado

## Problema

O spec define que itens duplicados devem ser bloqueados no modo de criacao manual, mas permitidos na importacao/colagem.

## Objetivo

Impedir que o usuario crie manualmente um item duplicado na lista atual.

## Comportamento esperado

- Ao criar item, o app deve verificar se ja existe item com mesmo nome normalizado.
- Se existir duplicado, o app deve bloquear o salvamento e mostrar alerta.
- Ao editar item, o app deve permitir salvar o proprio item sem acusar duplicidade contra ele mesmo.
- Ao editar para o nome de outro item existente, o app deve bloquear.
- Importacao/colagem deve continuar permitindo duplicados.

## Telas afetadas

- Tela de adicionar item.
- Tela de editar item.
- Alertas e textos constantes.
- Store ou helper de lista, se a regra for centralizada.

## Dados e persistencia

- Nao requer novo campo.
- Deteccao deve operar sobre `ProductProps.item`.
- Se multiplas listas existirem no futuro, validar apenas na lista ativa.

## Regras de validacao

- Comparar nomes normalizados com trim e case-insensitive.
- Decidir se acentos devem ser considerados equivalentes antes de implementar.
- Duplicados vindos de importacao continuam permitidos.

## Criterios de aceite

- Bloquear criacao manual de item duplicado.
- Permitir criacao manual de item unico.
- Permitir editar item sem alterar nome.
- Bloquear edicao para nome ja existente em outro item.
- Preservar importacao de duplicados.

## Fora de escopo

- Resolver duplicados existentes.
- Unir duplicados automaticamente.
- Deteccao fuzzy.

## Observacoes para IA

- Esta regra deve ser implementada sem quebrar o fluxo de colar lista.
- Cobrir com teste de helper/store quando a suite existir.
