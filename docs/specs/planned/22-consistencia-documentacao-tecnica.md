# Mini-spec: Consistência e validação da documentação técnica

Número: 22
Status: planejado

## Problema

Há divergências entre a documentação e os arquivos que definem a configuração real do projeto. Exemplos encontrados na `main` analisada:

- `README.md` e `docs/SPEC.md` descrevem Expo 56 e React Native 0.85, enquanto `package.json` declara Expo 57 e React Native 0.86.3.
- O badge de release do README informa v1.7.3, enquanto `package.json` declara v1.7.4.
- O badge de quantidade de testes e alguns resumos da documentação não possuem uma fonte automatizada e podem ficar desatualizados.
- A mini-spec ativa de testes ainda cita compatibilidade com Expo 56.

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
