# Mini-spec: Notificacoes e lembretes

Status: planejado

## Problema

Usuarios podem esquecer de comprar itens recorrentes ou de revisar a lista antes de ir ao mercado.

## Objetivo

Permitir criar lembretes locais para revisar listas ou itens sem depender de login, backend ou conexao com internet.

## Comportamento esperado

- O usuario deve poder criar, editar e remover lembretes locais.
- O lembrete deve disparar uma notificacao no dispositivo no horario configurado.
- A notificacao deve abrir o app na lista relacionada quando isso for tecnicamente possivel.
- O app deve continuar funcionando quando permissoes de notificacao forem negadas.
- Permissoes devem ser solicitadas apenas no momento em que o usuario tentar ativar notificacoes.

## Telas afetadas

- Tela principal da lista.
- Tela futura de configuracao de lista ou item.
- Possivel tela/modal de configuracao de lembrete.

## Dados e persistencia

- Persistir lembretes localmente com AsyncStorage ou storage equivalente offline-first.
- Relacionar o lembrete a uma lista quando multiplas listas existirem.
- Antes de multiplas listas, permitir lembrete global da lista atual.

## Regras de validacao

- Horario/data do lembrete devem ser validos.
- Lembretes no passado nao devem ser aceitos sem confirmacao ou ajuste.
- O usuario deve conseguir remover lembretes mesmo sem permissao ativa de notificacao.

## Criterios de aceite

- Criar um lembrete local.
- Editar horario/data de um lembrete.
- Remover um lembrete.
- Negar permissao sem quebrar o app.
- Persistir lembretes apos reiniciar o app.

## Fora de escopo

- Sincronizacao em nuvem.
- Lembretes compartilhados entre usuarios.
- Backend de notificacoes push.

## Observacoes para IA

- Manter o app offline-first.
- Verificar compatibilidade Expo antes de adicionar biblioteca.
- Preservar foco Android; avaliar impacto futuro na versao web.
