# Mini-spec: Integridade e migração de dados locais

Número: 19
Status: implementado

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

## Validação realizada

- CI da PR 69: 62 suítes e 398 testes aprovados.
- Type-check (`npm run check:ts`): aprovado.
- `expo prebuild`: concluído.
- Build Android: não concluído. O Gradle falhou ao resolver `org.gradle.toolchains.foojay-resolver-convention:1.0.0` nos repositórios configurados. A falha ocorreu na resolução do plugin, após a etapa de testes e o prebuild; não representa falha dos testes da spec.
- A validação manual de atualização em instalação existente e a inicialização em dispositivo Android/web não foram registradas como concluídas nesta PR.

## Decisões de implementação

- Campos desconhecidos são descartados durante a normalização, mas qualquer ocorrência marca o estado como reparado para que o conteúdo bruto seja preservado antes da gravação normalizada.
- Campos opcionais ausentes recebem os valores padrão definidos pelo normalizador; campos opcionais presentes com tipos inválidos são removidos e contabilizados como reparo.

- Os stores `gastometro` e `gastometro-reminders` passam a usar schema versão 3, com migração explícita das versões anteriores.
- A cópia anterior é preservada nas chaves `gastometro-recovery-cart` e `gastometro-recovery-reminders` antes de qualquer reparo que descarte ou normalize registros.
- Escritas e remoções nas chaves principais ficam bloqueadas enquanto uma cópia de recuperação está pendente; escritas concorrentes são enfileiradas e liberadas somente após a cópia ser concluída.
- Campos desconhecidos são descartados durante a normalização, mas sinalizam reparo para preservar o conteúdo bruto antes da gravação normalizada.
- Campos opcionais ausentes recebem valores padrão; campos opcionais inválidos são removidos sem descartar o registro quando isso é seguro.
- Referências `listId` inválidas são preservadas em cópia e removidas da coleção ativa somente após a cópia e a confirmação do cancelamento das notificações. Referências `itemId` antigas são mantidas como informação opcional e não provocam descarte do lembrete.
- IDs duplicados são normalizados de forma determinística no carrinho; lembretes duplicados ou inválidos são preservados na cópia e ignorados na coleção ativa.
- O campo `products` continua existindo como espelho da lista ativa e é reconstruído a partir de `lists` durante a hidratação.
- A limpeza de lembretes sem lista correspondente só ocorre depois da hidratação dos dois stores e após a cópia de recuperação ser gravada com sucesso.
- Estruturas irrecuperáveis e versões futuras não são sobrescritas silenciosamente; a aplicação exibe um aviso e preserva o conteúdo original quando possível.
