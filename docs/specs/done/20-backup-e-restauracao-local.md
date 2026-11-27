# Mini-spec: Backup e restauração local

Número: 20
Status: concluída

## Problema

O aplicativo mantém dados de domínio somente no armazenamento local do dispositivo ou do navegador. Não há sincronização entre Android e web, nem um fluxo nativo de exportação e restauração. Limpar os dados do aplicativo/navegador, trocar de dispositivo ou perder o aparelho pode causar perda definitiva das informações.

O backup inicial contemplava apenas listas, produtos e lembretes. Isso deixava de fora dois conjuntos importantes de dados mantidos pelo próprio aplicativo: as contas cadastradas na área `/bills` e os locais e registros da comparação de preços. Um arquivo apresentado como backup completo precisa preservar esses dados também.

## Objetivo

Permitir que o usuário exporte todos os dados locais de domínio do Gastômetro para um arquivo e restaure esse arquivo em outra instalação, mantendo a abordagem offline-first e sem introduzir backend, sincronização ou conta obrigatória.

O escopo funcional do backup deve contemplar:
- listas de compras, produtos, quantidades, preços e estado de coleta;
- lembretes vinculados às listas e, quando aplicável, aos produtos;
- contas cadastradas na área `/bills`, incluindo valor, vencimento e estado de pagamento;
- locais cadastrados para comparação de preços;
- registros de comparação, incluindo item, referência de quantidade, preços por local e datas de criação/atualização.

O aplicativo não possui credenciais de acesso ou autenticação. Portanto, não existe dado de login a exportar. A palavra "contas" nesta spec refere-se exclusivamente aos registros de contas da funcionalidade `/bills`.

## Comportamento esperado

- O usuário pode gerar um arquivo de backup sob demanda.
- O backup inclui todos os conjuntos de dados descritos no objetivo, além de metadados mínimos de formato, versão e data de exportação.
- O arquivo deve possuir formato versionado e legível por ferramentas comuns, preferencialmente JSON.
- O usuário pode selecionar um arquivo de backup e visualizar um resumo antes de restaurar.
- A restauração deve oferecer duas estratégias explícitas: substituir integralmente os dados locais ou mesclar os dados do arquivo com os dados locais.
- A operação só deve modificar os dados após confirmação explícita do usuário.
- Na mesclagem, conflitos devem ser apresentados com os valores locais e do backup, permitindo ao usuário escolher qual versão manter.
- Registros idênticos devem ser ignorados, sem duplicação.
- O resultado deve informar quantos registros de cada conjunto foram restaurados, mesclados, ignorados ou entraram em conflito.
- O fluxo deve funcionar em Android e web, respeitando as APIs disponíveis em cada plataforma.

## Dados incluídos e persistência

O envelope do backup deve conter um payload com os seguintes conjuntos:

| Conjunto | Dados exportados | Persistência atual |
|---|---|---|
| Listas e produtos | Listas, IDs, nomes, produtos, quantidades, preços e estado de coleta | `gastometro` |
| Lembretes | Identificador, título, data/hora, estado, referência à lista, referência opcional ao produto e datas de criação/atualização | `gastometro-reminders` |
| Contas (`/bills`) | ID, título, valor, vencimento opcional e estado de pagamento | `gastometro-bills` |
| Locais de comparação | ID, nome e observação opcional | `gastometro-price-comparisons` |
| Comparações de preços | ID, nome do item, referência de quantidade opcional, preços por local (ID do local e valor) e datas de criação/atualização | `gastometro-price-comparisons` |

Regras adicionais:
- O payload deve preservar IDs e referências existentes, sem gerar novos identificadores durante exportação ou restauração.
- Os preços registrados nos produtos das listas e os preços registrados na comparação por estabelecimento são informações distintas; ambos devem ser exportados.
- Locais e registros de comparação devem ser tratados como um conjunto relacionado. Todo `placeId` usado por um preço deve apontar para um local existente no mesmo payload.
- A remoção de um local pode afetar preços associados aos registros de comparação. A validação do backup deve respeitar a mesma integridade referencial.
- Contas de `/bills` são registros de domínio, não credenciais. Não há senhas, tokens ou dados de autenticação para exportar.
- Não exportar identificadores de notificações nativas como se fossem portáveis; os agendamentos devem ser reconstruídos na restauração quando houver permissão.
- Não incluir informações do dispositivo ou conteúdo externo desnecessário.
- A restauração deve passar pela estratégia de validação e migração da mini-spec 19.

## Formato e compatibilidade

- Manter envelope JSON com identificador de formato, versão do schema, data de exportação, versão do aplicativo e payload.
- A ampliação do payload deve introduzir uma nova versão do schema do backup.
- A nova versão deve aceitar backups da versão anterior já produzida pela implementação da Spec 20, migrando-os sem perda: listas/produtos e lembretes devem ser preservados e as coleções de contas, locais e comparações devem ser inicializadas vazias.
- Versões futuras ou desconhecidas devem ser rejeitadas com mensagem compreensível, sem alterar dados locais.
- A migração de versão deve ocorrer durante a leitura/validação, antes da pré-visualização e de qualquer gravação nos stores.

## Regras de validação

- Validar versão do formato, estrutura, tipos, limites e referências de todos os conjuntos antes de alterar qualquer store.
- Rejeitar arquivos truncados, malformados ou de versão incompatível com mensagem compreensível.
- Rejeitar IDs duplicados dentro de cada coleção e referências para registros inexistentes, incluindo preços associados a locais inexistentes e lembretes vinculados a listas/produtos inexistentes.
- Validar os campos obrigatórios e opcionais conforme as interfaces atuais de cada domínio.
- Não aceitar estruturas inconsistentes dentro do próprio backup sem uma política explícita de resolução.
- Nunca sobrescrever os dados atuais sem confirmação.
- Não agendar notificações nativas antes de concluir a gravação consistente de todos os dados restaurados.
- Tratar falhas de leitura, escrita, compartilhamento, permissões e rollback sem deixar os stores parcialmente restaurados.

## Regras de mesclagem e conflitos

A mesclagem deve abranger todas as coleções e preservar as relações entre elas.

- **Listas:** identificar pelo ID. Mesmo ID e mesmo conteúdo relevante são ignorados; mesmo ID com nome diferente gera conflito.
- **Produtos:** identificar pelo ID. Comparar também conteúdo e lista associada. Produto idêntico na mesma lista é ignorado; conteúdo diferente ou associação a outra lista gera conflito.
- **Lembretes:** identificar pelo ID. Conteúdo idêntico é ignorado; divergências geram conflito. As referências à lista e ao produto devem continuar válidas após a resolução.
- **Contas:** identificar pelo ID. Registros idênticos são ignorados; divergências em título, valor, vencimento ou estado de pagamento geram conflito.
- **Locais de comparação:** identificar pelo ID. Registros idênticos são ignorados; divergências em nome ou observação geram conflito.
- **Registros de comparação:** identificar pelo ID. Comparar item, referência de quantidade, preços por local e datas relevantes. Divergências geram conflito.
- A mesclagem de locais deve ocorrer antes da mesclagem dos registros de comparação, para que os preços possam validar suas referências.
- Se um conflito de local for resolvido mantendo a versão local, os registros de comparação importados devem continuar apontando para o ID correspondente, desde que esse ID permaneça válido.
- A escolha da versão do backup para um conflito não pode criar referências órfãs. A resolução deve validar novamente o payload completo antes da persistência.
- A escolha local ou do backup deve ser explícita para cada conflito; não escolher silenciosamente uma versão.
- Os totais de mesclados, ignorados e conflitantes devem ser discriminados por coleção.

## Persistência atômica e recuperação

- Substituição e mesclagem devem persistir os quatro stores envolvidos: carrinho/listas, lembretes, contas e comparação de preços.
- A operação deve ser tratada como uma única transação lógica. Se a gravação de qualquer store falhar, todos os valores brutos anteriores e os estados em memória devem ser restaurados.
- As cópias locais de recuperação devem contemplar todas as chaves persistidas afetadas pela restauração.
- Não considerar a restauração concluída enquanto todos os stores não estiverem consistentes.
- A reconciliação de notificações deve ocorrer somente após a persistência consistente. Falhas na reconciliação devem ser reportadas sem descartar os dados restaurados.
- Bloquear restaurações concorrentes e impedir ações conflitantes na interface durante leitura, exportação ou restauração.

## Telas e arquivos afetados

- Área de configurações/gerenciamento de dados e tela de backup.
- Componentes de confirmação, pré-visualização, resumo e resolução de conflitos.
- Serviços de exportação, leitura, validação, migração, mesclagem e restauração.
- Stores de carrinho/listas, lembretes, contas e comparação de preços.
- Interfaces/tipos do envelope, payload, resumo e conflitos.
- Constantes de textos e testes unitários, de integração e de interação da interface.

## Critérios de aceite

- Exportar um backup válido contendo listas, produtos, lembretes, contas de `/bills`, locais de comparação e registros de comparação de preços.
- Restaurar backup em uma instalação limpa e recuperar todos os conjuntos de dados e suas relações.
- Restaurar backup em uma instalação com dados existentes, usando a estratégia escolhida e confirmada.
- Mesclar dados com IDs coincidentes e divergentes em todas as coleções, apresentando conflitos e respeitando as escolhas do usuário.
- Garantir que preços de comparação permaneçam associados aos locais corretos após substituição, mesclagem e resolução de conflitos.
- Pré-visualizar data, versão e quantidade de registros por conjunto antes da confirmação.
- Migrar backups da versão anterior para o novo schema sem perder listas/produtos ou lembretes, inicializando os novos conjuntos vazios.
- Arquivo inválido, incompatível ou com referências inválidas não altera nenhum dado existente.
- Falha de gravação em qualquer store provoca rollback de todos os stores envolvidos.
- Lembretes restaurados mantêm referências válidas e têm agendamentos nativos reconciliados conforme permissões.
- Testes cobrem exportação, leitura, migração, validação, substituição, mesclagem, conflitos, integridade referencial, concorrência e falhas/rollback em todos os stores.
- Documentar onde o arquivo é salvo/compartilhado e os limites de segurança e privacidade.

## Fora de escopo

- Sincronização automática entre dispositivos.
- Armazenamento remoto ou serviço de nuvem.
- Backup automático em segundo plano.
- Exportação de credenciais de acesso: o aplicativo não possui autenticação.
- Criptografia com senha na primeira versão, salvo decisão de produto específica.

## Decisões de implementação já registradas

- A restauração oferece duas estratégias: substituir integralmente os dados locais ou mesclar o backup com os dados existentes.
- A mesclagem foi aprovada pelo usuário com resolução explícita de conflitos: cada conflito apresenta os valores locais e os valores do backup, e o usuário escolhe qual versão manter.
- Registros com o mesmo identificador e conteúdo idêntico são ignorados na mesclagem; identificadores duplicados ou estruturas inconsistentes dentro do próprio backup devem fazer o arquivo ser rejeitado.
- O envelope original usa formato `gastometro-backup`, versão 1, com data de exportação, versão do aplicativo e payload. A ampliação deve introduzir a versão 2 e manter compatibilidade de leitura com a versão 1.
- A exportação gera um arquivo JSON para download na web e usa o compartilhamento de arquivos no Android. A importação usa o seletor de documentos nas duas plataformas.
- IDs de notificações nativas não são exportados. Os agendamentos são reconciliados após a restauração, conforme as permissões disponíveis.
- O limite de tamanho é de 10 MB, calculado em bytes UTF-8 na exportação e na importação.
- O arquivo exportado não é enviado a servidor. O usuário continua responsável por armazenar sua cópia em local seguro.

## Acompanhamento da implementação

A implementação ampliada está na PR 71 e contempla os quatro stores: carrinho/listas, lembretes, contas e comparação de preços. O envelope v2 exporta e valida as seis coleções, e a leitura migra backups v1 preservando listas/produtos e lembretes e inicializando as coleções introduzidas na v2 vazias.

A revisão complementar identificou e corrigiu duas lacunas de integridade: lembretes com `itemId` agora precisam apontar para um produto da mesma lista, e a resolução de conflitos valida novamente as referências dos lembretes e dos preços antes de retornar o payload para persistência. A pré-visualização também distingue a versão original do arquivo da versão interna após migração.

Os testes de restauração agora simulam falhas de gravação em cada uma das quatro chaves persistidas e verificam a recuperação dos valores anteriores e dos estados em memória.

A validação manual Android/Web foi concluída pelo responsável do produto. A cobertura complementar da interface inclui exportação por download e importação via arquivo na Web, resolução dos seis tipos de conflito, cancelamento da confirmação Web e bloqueio de operações concorrentes. O E2E Web usa dados sintéticos não vazios nas seis coleções: verifica o conteúdo exportado, os valores exatos das seis contagens na pré-visualização, o cancelamento da substituição, a restauração em instalação limpa e os campos persistidos nas quatro chaves, incluindo quantidades, preços, estado de coleta/pagamento, metadados e referências. O cenário repete a mesclagem do mesmo arquivo e confirma que os registros permanecem únicos e inalterados. No workflow 46021328819, no commit b122f3c43c3326921d6bc4b800cced26435b843e, o E2E passou nas três execuções. A dependência do job de build Android em relação ao job E2E também foi validada: o build só iniciou depois da aprovação do E2E. TypeScript, Jest (456 testes em 65 suítes), Expo Doctor, verificação de versão e CodeQL foram aprovados. O build Android Release foi cancelado durante `assembleRelease`, sem APK confirmado. A validação manual Android/Web foi concluída pelo responsável do produto.

A implementação atual contempla:
- gravação coordenada dos quatro stores (carrinho/listas, lembretes, contas e comparação de preços), com preservação dos valores brutos e tentativa de rollback em caso de falha;
- cálculo do limite de 10 MB usando bytes UTF-8 na exportação e na importação, além da verificação antecipada do tamanho informado pelo seletor de arquivos;
- serialização das operações de restauração para rejeitar tentativas simultâneas;
- cobertura da interface para exportação nativa, arquivo acima do limite, cancelamento do seletor, JSON inválido, falha de persistência e falhas de reconciliação de notificações;
- descarte de `notificationId` recebido em arquivos externos;
- invalidação da pré-visualização quando o JSON editável é alterado;
- bloqueio de operações simultâneas na tela durante exportação, leitura e restauração;
- testes adicionais para arquivos multibyte, IDs de notificações externos e referências de produtos inexistentes.

A spec foi concluída após a validação manual Android/Web informada pelo responsável do produto. O workflow 46021328819 aprovou TypeScript, Jest, Expo Doctor, verificação de versão, CodeQL e as três execuções E2E Web. O job Android iniciou após o E2E, mas foi cancelado durante `assembleRelease`; portanto, não há confirmação de APK gerado por essa execução. Esse resultado de CI permanece registrado como limitação da execução, sem reabrir o escopo funcional validado manualmente. O E2E web valida roteamento SPA, comparação de preços e um fluxo funcional de backup com dados sintéticos nas seis coleções; ele não substitui a validação manual Android/Web. O arquivo exportado não possui criptografia nem proteção por senha; na Web o download é controlado pelo navegador e no Android o arquivo é temporário no cache até ser compartilhado. Compartilhar não garante que o usuário tenha armazenado uma cópia permanente. As cópias de recuperação locais servem para rollback e não substituem um backup externo.


## Revisão técnica e contrato de dados

A revisão do código da branch identificou os seguintes contratos atuais. Estes tipos são a fonte de verdade para a implementação; não devem ser substituídos por campos presumidos:

| Store | Chave AsyncStorage | Estrutura de domínio |
|---|---|---|
| `useCartStore` | `gastometro` | `lists`, `activeListId` e `products`; cada lista contém seus produtos |
| `useReminderStore` | `gastometro-reminders` | `reminders` |
| `useBillStore` | `gastometro-bills` | `bills: BillProps[]` |
| `usePriceComparisonStore` | `gastometro-price-comparisons` | `places: PriceComparisonPlaceProps[]` e `entries: PriceComparisonEntryProps[]` |

Tipos específicos:
- `BillProps`: `id: string`, `title: string`, `amount: string`, `dueDate?: string` e `paid: boolean`.
- `PriceComparisonPlaceProps`: `id: string`, `name: string` e `note?: string`.
- `PriceComparisonEntryProps`: `id: string`, `itemName: string`, `quantityReference?: string`, `pricesByPlace: { placeId: string; price: string }[]`, `createdAt: string` e `updatedAt: string`.

O payload da versão 2 deve manter o formato já existente e acrescentar:
- `bills: BillProps[]`;
- `priceComparison: { places: PriceComparisonPlaceProps[]; entries: PriceComparisonEntryProps[] }`.

Não renomear nem remodelar os campos existentes dos domínios. Valores monetários de contas e comparação são strings no modelo atual e devem ser preservados exatamente, sem conversão para ponto flutuante durante exportação, mesclagem ou restauração.

Validações específicas:
- Contas: IDs únicos; `title` e `amount` devem respeitar os tipos e as regras de domínio atuais; `paid` deve ser booleano; `dueDate`, quando presente, deve ser string válida conforme o formato usado pela tela de contas.
- Locais: IDs únicos; nomes devem respeitar `validatePlace` e não pode haver nomes duplicados após a mesma normalização usada pelo store (remoção de diacríticos, trim e comparação sem distinção de maiúsculas/minúsculas em pt-BR).
- Comparações: IDs únicos; `itemName` não pode ser vazio; `pricesByPlace` não pode repetir `placeId`; cada referência deve apontar para um local existente; cada preço deve ser string não vazia e passar por `parseComparisonPrice`, com resultado finito e não negativo.
- Datas `createdAt` e `updatedAt` devem ser datas válidas. Não inventar datas nem normalizar valores monetários durante o parse.
- Não exportar métodos/actions dos stores, apenas dados serializáveis.

A pré-visualização deve mostrar contagens separadas para listas, produtos, lembretes, contas, locais de comparação e registros de comparação. O resumo final da restauração/mesclagem deve informar totais por coleção, inclusive ignorados e conflitos.

## Etapas de implementação e validação

As cinco etapas de implementação do escopo ampliado foram executadas na PR 71. As cinco etapas abaixo foram implementadas e revisadas. Os critérios funcionais e a validação manual Android/Web foram considerados concluídos.

### Etapa 1: contrato v2, exportação, leitura e migração (implementada)

- Ampliar `BackupPayload`, `BackupEnvelope` e `BackupSummary` com contas e comparação de preços.
- Atualizar `BACKUP_VERSION` para 2.
- Exportar snapshots de `useBillStore` e `usePriceComparisonStore` junto aos dados atuais.
- Atualizar `createEnvelope` para serializar somente dados portáveis dos quatro stores.
- Atualizar `parse` para validar o schema v2 e todos os campos, IDs, valores, datas e referências.
- Implementar migração explícita de backups v1 para v2: preservar carrinho/listas e lembretes e inicializar `bills`, `priceComparison.places` e `priceComparison.entries` como arrays vazios.
- Rejeitar versões futuras, coleções ausentes no schema v2, duplicidades e referências inválidas sem tocar nos dados locais.
- Adicionar testes unitários de exportação, parse, limites, migração v1→v2 e validações positivas/negativas para os novos domínios.

Critério de saída: backup novo exporta todos os seis grupos de registros e backups v1 continuam importáveis sem perda.

### Etapa 2: mesclagem e resolução de conflitos para os novos domínios (implementada)

- Ampliar `BackupConflict`, `MergeResult` e `ConflictChoices` para contas, locais e registros de comparação.
- Mesclar contas por ID; conteúdo idêntico é ignorado e divergências geram conflito.
- Mesclar locais por ID; além de conflito por divergência de conteúdo, detectar colisão de nomes normalizados entre IDs diferentes, pois o store não permite locais duplicados por nome.
- Mesclar registros de comparação por ID, comparando item, quantidade, preços e datas relevantes.
- Mesclar locais antes dos registros de comparação e garantir que toda referência `placeId` continue válida.
- Fazer a resolução de conflitos operar sobre o payload completo, sem descartar silenciosamente registros nem criar referências órfãs.
- Manter a escolha explícita local/backup por conflito e os totais por coleção.
- Adicionar testes para IDs coincidentes, dados idênticos, divergências, colisões de nome, conflitos em locais usados por preços e combinações de escolhas.

Critério de saída: mesclagem determinística e íntegra para todas as coleções, com todos os conflitos resolvidos explicitamente.

### Etapa 3: restauração coordenada e rollback dos quatro stores (implementada)

- Expandir `BackupRestoreService` para ler, preservar, gravar e reverter as quatro chaves: `gastometro`, `gastometro-reminders`, `gastometro-bills` e `gastometro-price-comparisons`.
- Criar cópias de recuperação separadas para bills e comparação de preços, mantendo as cópias já existentes para carrinho e lembretes.
- Capturar os quatro estados em memória antes da operação e atualizar os quatro stores somente após a persistência coordenada.
- Se qualquer leitura, gravação ou atualização necessária falhar, restaurar os valores brutos anteriores e os quatro estados em memória. Se o rollback falhar, apresentar orientação explícita para não limpar os dados e preservar as cópias de recuperação.
- Garantir que a serialização de restauração continue impedindo operações concorrentes.
- Não sobrescrever dados locais antes de validar o payload e confirmar a operação.
- Adicionar testes de sucesso e falha em cada ponto da operação, incluindo falha em cada chave, ausência prévia de uma chave, rollback parcial e falha do próprio rollback.

Critério de saída: substituição e mesclagem persistem os quatro stores como uma única operação lógica, sem estado parcial silencioso.

### Etapa 4: interface, confirmação e relatórios completos (implementada)

- Atualizar `src/app/backup.tsx` para incluir os dois novos stores em `getLocalPayload` e na exportação.
- Atualizar a confirmação de substituição para citar listas, produtos, lembretes, contas, locais e comparações, sem texto antigo que sugira substituir somente três grupos.
- Exibir no preview as seis contagens e a versão do backup.
- Exibir conflitos de contas, locais e comparações com valores locais e do backup, permitindo escolha explícita.
- Atualizar os resumos de substituição e mesclagem com totais por coleção.
- Manter estados de carregamento, bloqueio de ações e mensagens de erro consistentes.
- Adicionar testes de interação para exportação completa, preview, substituição, mesclagem sem conflito, cada tipo de conflito, escolhas incompletas, cancelamento e falha de persistência.

Critério de saída: interface não omite dados nem apresenta mensagens/resumos incompletos em nenhum fluxo.

### Etapa 5: documentação e validação final (concluída)

- Atualizar README, changelog e documentação técnica que descrevam o backup, refletindo o schema v2 e os quatro stores.
- Registrar compatibilidade com backups v1, limite de 10 MB, ausência de criptografia e limites do compartilhamento de arquivos.
- Executar TypeScript, suíte de testes com cobertura, Expo Doctor, verificações de versão, E2E existente e builds Android/Web aplicáveis.
- Validar manualmente exportação e restauração em Android e Web, incluindo instalação limpa, dados locais existentes, backup v1, mesclagem com conflitos e cancelamento.
- Conferir que o arquivo exportado contém os dados reais dos quatro stores e que os dados restaurados aparecem nas respectivas telas.
- Manter a PR sem merge até a validação manual ser concluída e o responsável do produto autorizar o merge.

Critério de saída: documentação sincronizada, verificações automatizadas relevantes aprovadas e validação manual Android/Web concluída. A mini-spec foi movida para `done` em 27/11/2026.

### Revisão complementar: gate de build e integridade E2E (implementada; E2E e verificações de qualidade aprovados)

A revisão da implementação identificou que o job `build` não dependia do job `web-routing-e2e`. Com isso, o APK poderia ser gerado mesmo quando a validação E2E falhasse. O workflow foi ajustado para exigir a conclusão bem-sucedida do E2E antes de iniciar o build Android.

O E2E de backup também foi fortalecido para:
- conferir os valores exatos das seis contagens na pré-visualização;
- verificar os campos completos dos registros restaurados nas quatro chaves persistidas, incluindo quantidades, estado de coleta, valor e estado de pagamento, metadados de comparação e referências;
- repetir a mesclagem do mesmo backup e confirmar que todos os registros permanecem únicos e inalterados.

No workflow 46021328819, no commit b122f3c43c3326921d6bc4b800cced26435b843e, TypeScript, 456 testes em 65 suítes, Expo Doctor, verificação de versão e CodeQL foram aprovados. O E2E Web passou nas três execuções, incluindo as novas asserções de integridade e mesclagem idempotente. O job Build and Release iniciou somente após o sucesso do E2E. Na consulta final do workflow, o passo `Build Android release` estava cancelado durante `assembleRelease`, sem APK confirmado. A cobertura Jest registrada nessa execução foi de 91,81% em statements, 86,00% em branches, 90,00% em funções e 93,38% em linhas.

## Observações de arquitetura para a implementação

- A tela de backup lê diretamente os quatro stores e exporta somente seus dados serializáveis.
- `BackupRestoreService.apply` coordena as quatro chaves persistidas e os quatro estados Zustand, com cópias de recuperação e rollback. Os testes cobrem falhas simuladas em cada chave.
- O store de comparação remove um local e também remove os preços vinculados a ele. Por isso, a validação e a resolução de conflitos precisam tratar `places` e `entries` em conjunto.
- A interface de contas armazena `amount` como string; o store de comparação também armazena `price` como string. Preservar a representação original evita arredondamentos ou perda de precisão.
- A restauração de lembretes continua exigindo a reconciliação pós-persistência pelo `ReminderOrchestrator`; não exportar `notificationId`.


## Conclusão

A Spec 20 foi concluída em 27/11/2026 e movida para `docs/specs/done/`. O responsável pelo produto informou que a validação manual Android/Web foi concluída. A implementação cobre exportação e restauração JSON v2 dos quatro stores, migração v1, substituição, mesclagem com resolução explícita de conflitos, integridade referencial, rollback e reconciliação de lembretes. As verificações automatizadas registradas no workflow `46021328819` aprovaram TypeScript, 456 testes em 65 suítes, Expo Doctor, verificação de versão, CodeQL e E2E Web nas três execuções. O build Android foi iniciado após o E2E, mas cancelado durante `assembleRelease`; não registrar esse job como build aprovado. A PR 71 permanece aberta e sem merge, aguardando autorização específica para essa ação.
