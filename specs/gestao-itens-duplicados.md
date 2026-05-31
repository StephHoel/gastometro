# Mini-spec: Gestao de itens duplicados

Status: planejado

## Problema

Duplicados devem ser bloqueados na criacao manual, mas continuam permitidos na importacao/colagem. O usuario precisa de uma forma de revisar e resolver duplicados importados.

## Objetivo

Criar uma acao que mostre itens duplicados e permita unir itens ou alterar um deles.

## Comportamento esperado

- O app deve identificar possiveis duplicados pelo nome normalizado do item.
- Quando houver duplicados, uma acao deve permitir visualizar esses itens.
- O usuario deve poder unir duplicados.
- O usuario deve poder editar um dos itens para remover a duplicidade.
- O usuario deve poder ignorar duplicados sem obrigatoriedade de correcao.

## Telas afetadas

- Tela principal.
- Header ou area de acoes da lista.
- Tela/modal de resolucao de duplicados.
- Fluxo de edicao de item.

## Dados e persistencia

- Nao deve exigir novo campo persistido para detectar duplicados.
- Uniao de itens deve alterar os produtos existentes conforme regra definida.
- Se houver multiplas listas no futuro, a deteccao deve considerar apenas a lista ativa.

## Regras de validacao

- Comparacao deve ignorar diferencas simples de maiusculas/minusculas e espacos nas extremidades.
- Antes de implementar, decidir regra de uniao:
  - somar quantidades e manter preco de qual item?
  - manter coletado se qualquer item estiver coletado?
  - preservar ou remover item original?

## Criterios de aceite

- Identificar duplicados importados.
- Exibir lista de duplicados.
- Permitir editar um duplicado.
- Permitir unir duplicados conforme regra aprovada.
- Nao bloquear importacao por causa de duplicados.
- Nao afetar itens nao duplicados.

## Fora de escopo

- Uniao automatica sem confirmacao.
- Deteccao por sinonimos.
- Deteccao fuzzy complexa.

## Observacoes para IA

- Esta feature depende da regra de bloqueio de duplicados na criacao manual.
- Pedir confirmacao da regra exata de uniao antes de implementar.
