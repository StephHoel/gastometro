# Mini-spec: Backup e restauração local

Número: 20
Status: ativa

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

## Decisões de implementação

- A restauração oferece duas estratégias: substituir integralmente os dados locais ou mesclar o backup com os dados existentes.
- A mesclagem foi aprovada pelo usuário com resolução explícita de conflitos: cada conflito apresenta os valores locais e os valores do backup, e o usuário escolhe qual versão manter.
- Registros com o mesmo identificador e conteúdo idêntico são ignorados na mesclagem; identificadores duplicados ou estruturas inconsistentes dentro do próprio backup fazem o arquivo ser rejeitado.
- O backup usa envelope JSON versionado (formato `gastometro-backup`, versão 1), com data de exportação, versão do aplicativo e payload.
- A exportação gera um arquivo JSON para download na web e usa o compartilhamento de arquivos no Android. A importação usa o seletor de documentos nas duas plataformas.
- IDs de notificações nativas não são exportados. Os agendamentos são reconciliados após a restauração, conforme as permissões disponíveis.
- Antes de substituir ou mesclar, o estado bruto atual do carrinho e dos lembretes é preservado nas chaves `gastometro-backup-before-restore-cart` e `gastometro-backup-before-restore-reminders`.
- Backups acima de 10 MB, malformados, incompatíveis, com dados inválidos ou com lembretes vinculados a listas inexistentes são rejeitados antes de alterar os stores.
- O arquivo exportado não é enviado a servidor. O usuário continua responsável por armazenar sua cópia em local seguro.
