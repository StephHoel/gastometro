# Mini-spec: Notificações e lembretes

Status: planejado

## Problema

Usuários podem esquecer de comprar itens recorrentes ou de revisar a lista antes de ir ao mercado.

## Objetivo

Permitir criar lembretes locais para revisar listas ou itens sem depender de login, backend ou conexão com internet.

## Comportamento esperado

- O usuário deve poder criar, editar e remover lembretes locais.
- O lembrete deve disparar uma notificação no dispositivo no horário configurado.
- A notificação deve abrir o app na lista relacionada quando isso for tecnicamente possível.
- O app deve continuar funcionando quando permissões de notificação forem negadas.
- Permissões devem ser solicitadas apenas no momento em que o usuário tentar ativar notificações.

## Telas afetadas

- Tela principal da lista.
- Tela futura de configuração de lista ou item.
- Possível tela/modal de configuração de lembrete.

## Dados e persistência

- Persistir lembretes localmente com AsyncStorage ou storage equivalente offline-first.
- Relacionar o lembrete a uma lista quando múltiplas listas existirem.
- Antes de múltiplas listas, permitir lembrete global da lista atual.

## Regras de validação

- Horário/data do lembrete devem ser válidos.
- Lembretes no passado não devem ser aceitos sem confirmação ou ajuste.
- O usuário deve conseguir remover lembretes mesmo sem permissão ativa de notificação.

## Critérios de aceite

- Criar um lembrete local.
- Editar horário/data de um lembrete.
- Remover um lembrete.
- Negar permissão sem quebrar o app.
- Persistir lembretes após reiniciar o app.

## Fora de escopo

- Sincronização em nuvem.
- Lembretes compartilhados entre usuários.
- Backend de notificações push.

## Observações para IA

- Manter o app offline-first.
- Verificar compatibilidade Expo antes de adicionar biblioteca.
- Preservar foco Android; avaliar impacto futuro na versão web.
