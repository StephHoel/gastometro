# Mini-spec: Suíte de testes automatizados

Status: planejado

## Problema

O projeto ainda não possui script de teste automatizado configurado, mas o spec define que a estratégia deve incluir testes unitários, store/estado, componentes, integração e contrato/formato.

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

## Fora de escopo

- E2E com emulador.
- Regressão visual.
- Cobertura mínima obrigatória no primeiro PR.

## Observações para IA

- Avaliar `jest-expo` e `@testing-library/react-native` antes de adicionar dependências.
- Verificar compatibilidade com Expo 56.
- Se adicionar dependências de teste, seguir política de versionamento e rodar verificações aplicáveis.
