# Mini-spec: Consistência e validação da documentação técnica

Número: 22
Status: ativa

## Problema

Há divergências entre a documentação e os arquivos que definem a configuração real do projeto. Exemplos encontrados na `main` analisada:

- `README.md` e `docs/SPEC.md` descrevem Expo 56 e React Native 0.85, enquanto `package.json` declara Expo SDK 58 e React Native 0.88.1.
- O badge de release deve acompanhar `package.json` e `app.config.js`; a versão já está alinhada na implementação desta mini-spec.
- Os badges de quantidade de testes (195) e percentual de cobertura (90.08%) no README não possuem fonte automatizada e podem ficar desatualizados.
- A mini-spec ativa de testes ainda cita compatibilidade com Expo 56 e mantém um resumo de testes de junho de 2026 descrito como o mais recente.

Essas divergências dificultam decisões técnicas, onboarding e diagnóstico de compatibilidade.

## Objetivo

Estabelecer uma fonte de verdade para metadados técnicos e um processo leve para manter README, guia principal, mini-specs e informações de release coerentes com a configuração efetiva do repositório.

## Comportamento esperado

- A documentação da stack deve refletir as dependências e versões efetivamente configuradas.
- A versão do app exibida no README deve corresponder à versão de release definida pelo projeto.
- Informações voláteis, como quantidade de testes e percentual de cobertura, não devem ser mantidas manualmente em múltiplos locais.
- Deve existir uma verificação automatizada para detectar divergências objetivas entre arquivos de configuração e documentação.
- O processo deve indicar qual arquivo é a fonte de verdade para cada metadado.
- Alterações de stack devem exigir atualização da documentação técnica correspondente.

## Arquivos e áreas afetadas

- `README.md`
- `docs/SPEC.md`
- `docs/specs/active/05-testes-automatizados.md`
- `docs/CHANGELOG.md`
- `package.json`
- `app.config.js`
- Scripts de validação e workflow de CI.

## Dados e persistência

- Não altera dados do aplicativo.
- `package.json` e `app.config.js` continuam sendo fontes de versão do app, conforme a política de release atual.
- As dependências declaradas e o lockfile devem ser usados para identificar a stack instalada.
- Não duplicar números de execução de testes em documentação estática, salvo quando identificados como histórico com data.

## Regras de validação

- Não inferir a versão do Expo somente pelo número do React Native ou vice-versa.
- Validar a consistência entre `package.json` e `app.config.js`.
- Não transformar a documentação em cópia integral de `package.json`; manter apenas informações úteis para usuários e contribuidores.
- Verificações automatizadas devem ser determinísticas e não depender de serviços externos.
- Atualização de dependências deve continuar seguindo a política de atualização coordenada do stack Expo.

## Critérios de aceite

- README e guia principal descrevem as versões atuais de Expo, React Native, React e Node.
- A versão do badge ou informação de release não diverge da versão configurada.
- Referências antigas a versões da stack são corrigidas ou identificadas como histórico.
- Dados voláteis de testes/cobertura possuem uma única fonte ou são apresentados com data e contexto.
- Existe um comando automatizado de verificação documental e ele é executado em CI.
- A falha da verificação apresenta arquivo/campo divergente e instrução objetiva de correção.
- A documentação de desenvolvimento explica como atualizar a stack sem deixar metadados contraditórios.

## Fora de escopo

- Reescrever toda a documentação histórica.
- Automatizar a geração integral do README.
- Alterar a política de versionamento ou release.
- Atualizar dependências apenas para fazer a documentação coincidir com versões antigas.

## Observações para IA

- Corrigir a documentação para refletir a configuração real, não fazer downgrade de dependências para coincidir com textos desatualizados.
- Diferenciar informação atual de registros históricos em changelog e relatórios datados.
- Manter o conteúdo em pt-BR.


## Decisões de implementação

- `package.json` é a fonte das versões declaradas de dependências; `package-lock.json` registra as versões resolvidas para instalação reproduzível.
- `package.json` e `app.config.js` devem manter a mesma versão do aplicativo. O badge do README e o primeiro título de versão do changelog devem acompanhar essa versão.
- `.nvmrc` é a fonte da versão recomendada do Node.js; o campo `engines` em `package.json` define a faixa compatível.
- README e `docs/SPEC.md` mantêm resumos úteis da stack, mas suas versões são verificadas automaticamente contra as fontes de configuração.
- Contagens e percentuais voláteis não são exibidos em badges estáticos. Relatórios de cobertura são gerados por `npm run test:coverage` e `npm run test:coverage:csv`; números históricos só permanecem quando têm data e são identificados como históricos.
- O comando `npm run check:docs` verifica versão, stack, badges, changelog e contagem de mini-specs. A verificação é executada no workflow Expo Doctor em pull requests.
- Referências históricas em changelog não são reescritas; divergências em documentos operacionais atuais devem ser corrigidas.
