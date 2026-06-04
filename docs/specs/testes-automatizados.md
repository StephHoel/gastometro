# Mini-spec: Suíte de testes automatizados

Status: em andamento

## Problema Inicial

O projeto ainda não possui script de teste automatizado configurado, mas o spec define que a estratégia deve incluir testes unitários, store/estado, componentes, integração e contrato/formato.

## Problema Atual

O projeto já possui script de teste automatizado configurado, e o foco agora é ampliar e operacionalizar a cobertura (incluindo exportação de relatório em CSV) seguindo a estratégia de testes unitários, store/estado, componentes, integração e contrato/formato.

## Objetivo

Configurar uma base de testes automatizados compatível com Expo/React Native e cobrir primeiro as regras mais sensíveis do domínio.

## Comportamento esperado

- Deve existir comando npm para rodar testes.
- Testes devem rodar localmente sem emulador no primeiro momento.
- Cobertura inicial deve priorizar funções puras, store e contrato do WhatsApp.
- Componentes e integração devem ser adicionados de forma incremental.

## Telas afetadas

- Nenhuma tela diretamente.
- Componentes serão cobertos em fases posteriores.

## Dados e persistência

- Mocks devem isolar AsyncStorage, Clipboard e Linking quando necessário.
- Testes não devem depender de dados reais do dispositivo.

## Regras de validação

- Testar `ParseToFloat`, `Multiply`, `Divide`, `SetCurrency`.
- Testar normalização de produto.
- Testar helpers de lista.
- Testar formato de compartilhamento/importação do WhatsApp.
- Testar comportamento de duplicados e negativos quando essas features forem implementadas.

## Critérios de aceite

- Adicionar script de teste no `package.json`.
- Rodar testes unitários no ambiente local.
- Ter mocks básicos para APIs nativas usadas nos testes.
- Documentar como executar os testes.
- Garantir que a suíte inicial passe.

## Cobertura atual

- Suíte configurada com `jest-expo` e comandos `npm run test`, `npm run test:watch`, `npm run test:coverage` e `npm run test:coverage:csv`.
- Cobertura ampla de utilitários de domínio (matemática, strings, números, ordenação e parser de importação).
- Cobertura de serviços críticos (`ProductService`, `ShareService`, `AlertService`, `ClipboardService`, `CartStoreService`).
- Cobertura de store Zustand e helper in-memory (`useCartStore`, `CartInMemory`).
- Cobertura inicial de componente e hook (`CustomInput`, `useInitAlert`).
- Execução local validada sem emulador.
- Exportação da tabela de cobertura para CSV em `docs/coverages/`, com nome no formato `YYYY-MM-DD_HH-MM.csv`.

### Resumo de cobertura mais recente (Jest)

- All files: 52.88% statements, 44.75% branches, 54.47% functions, 50.49% lines.
- Services: 96.07% statements.
- Stores e helpers: 100% statements.
- Utils/functions: 97.46% statements.

## Fora de escopo

- E2E com emulador.
- Regressão visual.
- Cobertura mínima obrigatória no primeiro PR.

## Observações para IA

- Avaliar `jest-expo` e `@testing-library/react-native` antes de adicionar dependências.
- Verificar compatibilidade com Expo 56.
- Se adicionar dependências de teste, seguir política de versionamento e rodar verificações aplicáveis.
