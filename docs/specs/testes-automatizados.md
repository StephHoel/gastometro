# Mini-spec: Suíte de testes automatizados

Status: ativa (evolução contínua)

## Problema Inicial

O projeto ainda não possui script de teste automatizado configurado, mas o spec define que a estratégia deve incluir testes unitários, store/estado, componentes, integração e contrato/formato.

## Problema Atual

O projeto já possui suíte automatizada configurada e funcionando com gate de cobertura global. O foco agora é ampliar cobertura de componentes e fluxos de tela, mantendo estabilidade dos testes de domínio, store, serviços e contrato/formato.

## Objetivo

Manter e evoluir a suíte de testes automatizados compatível com Expo/React Native, preservando o gate de cobertura global e reduzindo riscos de regressão nos fluxos críticos.

## Comportamento esperado

- Deve existir comando npm para rodar testes.
- Testes devem rodar localmente sem emulador no primeiro momento.
- Deve existir comando de cobertura com gate global de 80% para código runtime.
- Deve existir comando para exportar cobertura em CSV para `docs/coverages/`.
- Cobertura deve priorizar funções puras, store, serviços e contrato do WhatsApp.
- Componentes e integração devem seguir evolução incremental.

## Telas afetadas

- Nenhuma regra de negócio de tela foi alterada por esta mini-spec.
- Fluxos de `src/app` e componentes de lista/formulário fazem parte da evolução contínua de cobertura.

## Dados e persistência

- Mocks devem isolar AsyncStorage, Clipboard e Linking quando necessário.
- Testes não devem depender de dados reais do dispositivo.

## Regras de validação

- Testar `ParseToFloat`, `Multiply`, `Divide`, `SetCurrency`.
- Testar normalização de produto.
- Testar helpers de lista.
- Testar formato de compartilhamento/importação do WhatsApp.
- Testar bloqueio de duplicados na criação manual.
- Testar bloqueio de valores negativos nos fluxos manuais.
- Testar descarte de linhas malformadas/negativas na importação.

## Critérios de aceite

- Manter os scripts de teste e cobertura no `package.json`.
- Garantir execução local da suíte sem emulador.
- Manter mocks para APIs nativas usadas em testes.
- Manter documentação de execução e cobertura no `README.md` e `docs/coverages/README.md`.
- Garantir suíte verde e gate de cobertura global em 80%.

## Cobertura atual

- Suíte configurada com `jest-expo` e comandos `npm run test`, `npm run test:watch`, `npm run test:coverage` e `npm run test:coverage:csv`.
- Cobertura ampla de utilitários de domínio (matemática, strings, números, ordenação e parser de importação).
- Cobertura de serviços críticos (`ProductService`, `ShareService`, `AlertService`, `ClipboardService`, `CartStoreService`).
- Cobertura de store Zustand e helper in-memory (`useCartStore`, `CartInMemory`).
- Cobertura de componentes, telas de rota e hook (`CustomInput`, `Form`, `Header`, `List`, `src/app/index`, `src/app/list/add`, `src/app/list/edit/[id]`, `useInitAlert`).
- Execução local validada sem emulador.
- Exportação da tabela de cobertura para CSV em `docs/coverages/`, com nome no formato `YYYY-MM-DD_HH-MM.csv`.
- O Jest trava abaixo de 80% de cobertura global do código runtime.

### Resumo de cobertura mais recente (Jest)

- Execução de referência em 2026-06-04 com `npm run test:coverage -- --runInBand`.
- 19 suítes passadas, 62 testes passados.
- Consulte o relatório CSV versionado mais recente em `docs/coverages/` para validar os percentuais vigentes, não nesta mini-spec.

## Fora de escopo

- E2E com emulador.
- Regressão visual.
- Alterar regra global de cobertura (80%) sem aprovação explícita.

## Observações para IA

- Avaliar `jest-expo` e `@testing-library/react-native` antes de adicionar dependências.
- Verificar compatibilidade com Expo 56.
- Se adicionar dependências de teste, seguir política de versionamento e rodar verificações aplicáveis.
- Priorizar novos testes em componentes com menor cobertura atual (`Button`, `Form`, `Header`, `List`) e fluxos de integração de tela.
