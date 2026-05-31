# Mini-spec: Multiplas listas

Status: planejado

## Problema

O app atualmente trabalha com uma unica lista. Usuarios podem precisar separar compras por mercado, data, evento ou categoria.

## Objetivo

Permitir que o usuario crie e gerencie multiplas listas com titulos personalizados, mantendo o funcionamento offline-first.

## Comportamento esperado

- O usuario deve poder criar uma nova lista com titulo.
- O usuario deve poder alternar entre listas.
- O usuario deve poder editar o titulo de uma lista.
- O usuario deve poder remover uma lista com confirmacao.
- Cada lista deve ter seus proprios itens, total geral e total de coletados.
- Compartilhamento e importacao devem operar sobre a lista ativa.

## Telas afetadas

- Tela principal.
- Header.
- Fluxo de adicionar/editar item.
- Compartilhamento/importacao.
- Possivel tela de selecao ou gerenciamento de listas.

## Dados e persistencia

- O modelo atual de `products` precisa evoluir para um modelo com listas.
- A mudanca exige plano de migracao dos dados atuais do AsyncStorage.
- A chave `gastometro` nao deve mudar sem justificativa e migracao.
- Dados existentes devem virar uma lista padrao na primeira migracao.

## Regras de validacao

- Titulo de lista vazio nao deve ser aceito.
- Remover a ultima lista deve criar ou manter uma lista padrao, conforme decisao de UX.
- Nomes duplicados de listas precisam de regra definida antes da implementacao.

## Criterios de aceite

- Migrar lista atual para uma lista padrao sem perda de dados.
- Criar, renomear, alternar e remover listas.
- Adicionar item somente na lista ativa.
- Calcular total por lista.
- Compartilhar apenas a lista ativa.
- Importar lista para a lista ativa ou para nova lista, conforme fluxo definido na implementacao.

## Fora de escopo

- Sincronizacao entre dispositivos.
- Compartilhamento colaborativo em tempo real.
- Backend/login.

## Observacoes para IA

- Esta e uma mudanca com risco de quebra de dados persistidos; tratar como alteracao potencialmente major se o formato nao for retrocompativel.
- Pedir confirmacao antes de alterar formato de storage.
