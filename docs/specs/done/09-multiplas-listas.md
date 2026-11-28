# Mini-spec: Múltiplas listas

Número: 09
Status: implementado

## Problema

O app atualmente trabalha com uma única lista. Usuários podem precisar separar compras por mercado, data, evento ou categoria.

## Objetivo

Permitir que o usuário crie e gerencie múltiplas listas com títulos personalizados, mantendo o funcionamento offline-first.

## Comportamento esperado

- O usuário deve poder criar uma nova lista com título.
- O usuário deve poder alternar entre listas.
- O usuário deve poder editar o título de uma lista.
- O usuário deve poder remover uma lista com confirmação.
- Cada lista deve ter seus próprios itens, total geral e total de coletados.
- Compartilhamento e importação devem operar sobre a lista ativa.

## Telas afetadas

- Tela principal.
- Header.
- Fluxo de adicionar/editar item.
- Compartilhamento/importação.
- Possível tela de seleção ou gerenciamento de listas.

## Dados e persistência

- O modelo atual de `products` precisa evoluir para um modelo com listas.
- A mudança exige plano de migração dos dados atuais do AsyncStorage.
- A chave `gastometro` não deve mudar sem justificativa e migração.
- Dados existentes devem virar uma lista padrão na primeira migração.

## Regras de validação

- Título de lista vazio não deve ser aceito.
- Remover a última lista não é permitido.
- Nomes duplicados de listas são permitidos.

## Critérios de aceite

- Migrar lista atual para uma lista padrão sem perda de dados.
- Criar, renomear, alternar e remover listas.
- Adicionar item somente na lista ativa.
- Calcular total por lista.
- Compartilhar apenas a lista ativa.
- Importar lista para a lista ativa ou para nova lista, conforme fluxo definido na implementação.

## Decisões de implementação

- A migração de dados legados cria `Lista 1` como lista padrão inicial.
- O estado persistido evoluiu para `lists` e `activeListId`, mantendo a chave `gastometro`.
- Ao colar/importar com opção de nova lista, o app cria uma lista com nome padrão de importação.

## Fora de escopo

- Sincronização entre dispositivos.
- Compartilhamento colaborativo em tempo real.
- Backend/login.

## Observações para IA

- Esta é uma mudança com risco de quebra de dados persistidos; tratar como alteração potencialmente major se o formato não for retrocompatível.
- Pedir confirmação antes de alterar formato de storage.
