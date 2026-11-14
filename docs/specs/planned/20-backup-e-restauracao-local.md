# Mini-spec: Backup e restauração local

Número: 20
Status: planejado

## Problema

O aplicativo mantém listas, produtos e lembretes somente no armazenamento local do dispositivo ou do navegador. Não há sincronização entre Android e web, nem um fluxo nativo de exportação e restauração. Limpar os dados do aplicativo/navegador, trocar de dispositivo ou perder o aparelho pode causar perda definitiva das informações.

## Objetivo

Permitir que o usuário exporte seus dados para um arquivo local e restaure esse arquivo em uma instalação do Gastômetro, mantendo a abordagem offline-first e sem introduzir backend ou conta obrigatória.

## Comportamento esperado

- O usuário pode gerar um arquivo de backup sob demanda.
- O backup inclui listas, produtos e lembretes, além de metadados mínimos de versão e data de exportação.
- O arquivo deve possuir formato versionado e legível por ferramentas comuns, preferencialmente JSON.
- O usuário pode selecionar um arquivo de backup e visualizar um resumo antes de restaurar.
- A restauração deve oferecer uma estratégia explícita: substituir os dados locais ou mesclar os dados, se a mesclagem puder ser definida sem ambiguidade.
- A operação só deve modificar os dados após confirmação explícita do usuário.
- O resultado deve informar quantas listas, produtos e lembretes foram restaurados, mesclados ou ignorados.
- O fluxo deve funcionar em Android e web, respeitando as APIs disponíveis em cada plataforma.

## Telas e arquivos afetados

- Nova área de configurações/gerenciamento de dados.
- Componentes de confirmação e resumo de importação.
- Novos serviços de exportação, leitura, validação e restauração.
- Stores de carrinho e lembretes.
- Constantes de textos e testes.

## Dados e persistência

- Definir envelope de backup com identificador de formato, versão do schema, data de exportação e payload.
- Incluir nomes e IDs das listas, produtos e lembretes.
- Não exportar identificadores de notificações nativas como se fossem portáveis; os agendamentos devem ser reconstruídos na restauração quando houver permissão.
- Não incluir tokens, dados de conta, informações do dispositivo ou conteúdo externo desnecessário.
- Preservar regras atuais de moeda, quantidade, nomes e referências entre lembretes e listas.
- A restauração deve passar pela estratégia de validação e migração da mini-spec 19.

## Regras de validação

- Validar versão do formato, estrutura, tipos, limites e referências antes de alterar qualquer store.
- Rejeitar arquivos truncados, malformados ou de versão incompatível com mensagem compreensível.
- Não aceitar IDs duplicados dentro do mesmo conjunto restaurado sem uma política explícita de resolução.
- Nunca sobrescrever os dados atuais sem confirmação.
- Não agendar notificações nativas antes de concluir a gravação consistente dos dados restaurados.
- Tratar falhas de leitura, escrita, compartilhamento e permissões sem deixar o estado parcialmente restaurado.

## Critérios de aceite

- Exportar um backup válido contendo listas, produtos e lembretes.
- Restaurar backup em uma instalação limpa e recuperar os dados esperados.
- Restaurar backup em uma instalação com dados existentes seguindo a estratégia escolhida e confirmada.
- Pré-visualizar o conteúdo e a data do backup antes da confirmação.
- Arquivo inválido ou incompatível não altera dados existentes.
- Lembretes restaurados mantêm suas referências às listas e têm agendamentos nativos reconciliados conforme permissões.
- Testes cobrem exportação, leitura, validação, substituição, mesclagem (se aprovada) e falhas.
- Documentar onde o arquivo é salvo/compartilhado e os limites de segurança e privacidade.

## Fora de escopo

- Sincronização automática entre dispositivos.
- Armazenamento remoto ou serviço de nuvem.
- Backup automático em segundo plano.
- Criptografia com senha na primeira versão, salvo decisão de produto específica.

## Observações para IA

- Definir com o usuário se a primeira versão deve oferecer somente substituição ou também mesclagem; não inferir uma política de conflito.
- Considerar o limite de armazenamento e a experiência de seleção de arquivos no Android e nos navegadores.
- Não prometer proteção contra perda do arquivo exportado: o usuário é responsável por armazená-lo em local seguro.
