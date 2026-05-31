# Mini-spec: Suite de testes automatizados

Status: planejado

## Problema

O projeto ainda nao possui script de teste automatizado configurado, mas o spec define que a estrategia deve incluir testes unitarios, store/estado, componentes, integracao e contrato/formato.

## Objetivo

Configurar uma base de testes automatizados compativel com Expo/React Native e cobrir primeiro as regras mais sensiveis do dominio.

## Comportamento esperado

- Deve existir comando npm para rodar testes.
- Testes devem rodar localmente sem emulador no primeiro momento.
- Cobertura inicial deve priorizar funcoes puras, store e contrato do WhatsApp.
- Componentes e integracao devem ser adicionados de forma incremental.

## Telas afetadas

- Nenhuma tela diretamente.
- Componentes serao cobertos em fases posteriores.

## Dados e persistencia

- Mocks devem isolar AsyncStorage, Clipboard e Linking quando necessario.
- Testes nao devem depender de dados reais do dispositivo.

## Regras de validacao

- Testar `ParseToFloat`, `Multiply`, `Divide`, `SetCurrency`.
- Testar normalizacao de produto.
- Testar helpers de lista.
- Testar formato de compartilhamento/importacao do WhatsApp.
- Testar comportamento de duplicados e negativos quando essas features forem implementadas.

## Criterios de aceite

- Adicionar script de teste no `package.json`.
- Rodar testes unitarios no ambiente local.
- Ter mocks basicos para APIs nativas usadas nos testes.
- Documentar como executar os testes.
- Garantir que a suite inicial passe.

## Fora de escopo

- E2E com emulador.
- Regressao visual.
- Cobertura minima obrigatoria no primeiro PR.

## Observacoes para IA

- Avaliar `jest-expo` e `@testing-library/react-native` antes de adicionar dependencias.
- Verificar compatibilidade com Expo 56.
- Se adicionar dependencias de teste, seguir politica de versionamento e rodar verificacoes aplicaveis.
