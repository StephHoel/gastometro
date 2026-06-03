# Mini-spec: Bloqueio de duplicados na criação manual

Status: implementado

## Problema

O spec define que itens duplicados devem ser bloqueados no modo de criação manual, mas permitidos na importação/colagem.

## Objetivo

Impedir que o usuário crie manualmente um item duplicado na lista atual.

## Comportamento esperado

- Ao criar item, o app deve verificar se já existe item com mesmo nome normalizado.
- Se existir duplicado, o app deve bloquear o salvamento e mostrar alerta.
- Ao editar item, o app deve permitir salvar o próprio item sem acusar duplicidade contra ele mesmo.
- Ao editar para o nome de outro item existente, o app deve bloquear.
- Importação/colagem deve continuar permitindo duplicados.

## Telas afetadas

- Tela de adicionar item.
- Tela de editar item.
- Alertas e textos constantes.
- Store ou helper de lista, se a regra for centralizada.

## Dados e persistência

- Não requer novo campo.
- Detecção deve operar sobre `ProductProps.item`.
- Se múltiplas listas existirem no futuro, validar apenas na lista ativa.

## Regras de validação

- Comparar nomes normalizados com trim, colapso dos espaços internos e case-insensitive.
- Decidir se acentos devem ser considerados equivalentes antes de implementar.
- Duplicados vindos de importação continuam permitidos.

## Critérios de aceite

- Bloquear criação manual de item duplicado.
- Permitir criação manual de item único.
- Permitir editar item sem alterar nome.
- Bloquear edição para nome já existente em outro item.
- Preservar importação de duplicados.

## Fora de escopo

- Resolver duplicados existentes.
- Unir duplicados automaticamente.
- Detecção fuzzy.

## Observações para IA

- Esta regra deve ser implementada sem quebrar o fluxo de colar lista.
- Cobrir com teste de helper/store quando a suíte existir.

## Registro de implementação

- Criação manual valida duplicidade por nome normalizado (`trim` + colapso de espaços internos + case-insensitive).
- Edição valida duplicidade ignorando o próprio item e bloqueia renomeação para um item já existente.
- Mensagem de erro dedicada adicionada em `src/constants/text.ts` (`item_duplicado`).
- Fluxo de importação/colar permanece permitindo itens duplicados.
