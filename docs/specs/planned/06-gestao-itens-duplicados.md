# Mini-spec: Gestão de itens duplicados

Número: 06
Status: planejado

## Problema

Duplicados devem ser bloqueados na criação manual, mas continuam permitidos na importação/colagem. O usuário precisa de uma forma de revisar e resolver duplicados importados.

## Objetivo

Criar uma ação que mostre itens duplicados e permita unir itens ou alterar um deles.

## Comportamento esperado

- O app deve identificar possíveis duplicados pelo nome normalizado do item.
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

- Comparação deve ignorar diferenças simples de maiúsculas/minúsculas e espaços nas extremidades.
- Antes de implementar, decidir regra de união:
  - somar quantidades e manter preço de qual item?
  - manter coletado se qualquer item estiver coletado?
  - preservar ou remover item original?

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
