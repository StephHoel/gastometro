# Mini-spec: Integridade e migração de dados locais

Número: 19
Status: planejado

## Problema

O Gastômetro depende de persistência local para listas, produtos e lembretes. O estado persistido evolui junto com os modelos TypeScript, mas as garantias de migração e validação são limitadas.

Em `CartStore`, a migração trata a versão zero e converte qualquer outro estado com type assertion, sem validar sua estrutura. Em `ReminderStore`, existe versão de persistência, mas não há função de migração. Uma alteração futura de modelo pode, portanto, carregar dados incompatíveis como se fossem válidos.

O estado do carrinho também mantém `products` como espelho da lista ativa, além de `lists[].products`, criando uma invariante que precisa ser preservada.

## Objetivo

Definir uma estratégia explícita de versionamento, validação, migração e recuperação para os dados locais, preservando listas e lembretes de instalações existentes.

## Comportamento esperado

- Cada store persistida deve ter um schema versionado e migrações explícitas entre versões.
- O estado carregado deve ser validado antes de ser disponibilizado para as telas.
- Migrações devem ser determinísticas, idempotentes e testáveis.
- O estado do carrinho deve garantir que `activeListId` corresponda a uma lista existente.
- O espelho `products` deve corresponder aos produtos da lista ativa ou ser removido em uma mudança arquitetural aprovada.
- Registros inválidos ou parcialmente corrompidos devem ser tratados de forma controlada, sem falhar silenciosamente nem apagar todos os dados sem aviso.
- A aplicação deve informar quando não conseguir recuperar dados e orientar o usuário sobre as opções disponíveis.
- Dados legados válidos devem continuar acessíveis após atualização.

## Telas e arquivos afetados

- `src/stores/CartStore.ts`
- `src/stores/ReminderStore.ts`
- `src/interfaces/StateProps.ts`
- `src/interfaces/ReminderStateProps.ts`
- Serviços ou helpers de validação/migração.
- Inicialização do app e apresentação de erros recuperáveis.

## Dados e persistência

- Preservar as chaves atuais `gastometro` e `gastometro-reminders`, salvo decisão explícita de migração.
- Registrar a versão do schema de cada store.
- Definir comportamento para campos opcionais ausentes, campos desconhecidos, IDs duplicados e referências de lista inválidas.
- Não modificar o formato de compartilhamento/importação via WhatsApp.
- Se houver necessidade de alterar o formato persistido, criar migração de leitura e escrita compatível com dados já instalados.

## Regras de validação

- Validar tipos, campos obrigatórios e estruturas aninhadas antes de confiar nos dados.
- Rejeitar ou reparar apenas os registros inválidos quando isso for seguro e determinístico.
- Garantir unicidade de IDs de listas, produtos e lembretes.
- Garantir que cada lembrete referencie uma lista existente; referências inválidas devem seguir uma política explícita de recuperação/limpeza.
- Não substituir dados persistidos por estado inicial vazio em caso de erro sem antes preservar o conteúdo bruto recuperável ou informar o usuário.

## Critérios de aceite

- Testes cobrem migração da versão legada do carrinho para o schema atual.
- Testes cobrem hidratação de estado atual válido, campos opcionais ausentes, dados malformados e versões desconhecidas.
- Testes garantem consistência entre `activeListId`, `lists` e `products`.
- Testes cobrem migração e validação de lembretes.
- Uma falha de migração não causa perda silenciosa de dados.
- A inicialização continua funcional em Android e web.
- O comportamento de instalações existentes é preservado.

## Fora de escopo

- Sincronização em nuvem.
- Login ou identidade de usuário.
- Alteração do modelo de domínio por razões exclusivamente estéticas.
- Backup/exportação de dados, tratado em mini-spec própria.

## Observações para IA

- Antes de remover o campo `products` do estado persistido, avaliar compatibilidade com instalações existentes e definir migração.
- Não usar type assertion como substituto de validação de runtime.
- Evitar adicionar biblioteca de schema sem justificar custo, tamanho e compatibilidade com Expo.
