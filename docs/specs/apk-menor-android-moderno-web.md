# Mini-spec: APK menor com foco em Android moderno e web

Status: planejado

## Problema

O APK atual pode ficar maior do que o necessário para o escopo do projeto. O objetivo agora é reduzir o tamanho do artefato de distribuição, aceitando compatibilidade apenas com versões mais novas do Android e mantendo suporte web.

## Objetivo

Diminuir o tamanho final de instalação/distribuição no Android por meio de ajustes de build e compatibilidade, sem quebrar os fluxos principais do app nem a versão web.

## Comportamento esperado

- O app deve continuar funcional no Android dentro da nova faixa mínima de versão suportada.
- O processo de build deve gerar artefatos menores que o baseline atual.
- A versão web deve continuar funcionando com os fluxos principais já existentes.
- A UX principal (lista, total, edição, calculadora e compartilhamento quando suportado) deve ser preservada.

## Telas afetadas

- Nenhuma tela específica por regra de negócio.
- Configurações de build Android (Gradle/Expo) e pipeline de release.
- Fluxo web para validação de compatibilidade após ajustes de build.

## Dados e persistência

- Não alterar formato dos dados persistidos no AsyncStorage.
- Não alterar chave de persistência (`gastometro`).
- Não exigir migração de dados para esta entrega.

## Regras de validação

- Definir e documentar a nova baseline de Android suportado (API mínima).
- Validar que o app instala e abre em ao menos um dispositivo/emulador dentro da nova baseline.
- Validar que a build web continua gerando e executando sem regressão evidente.
- Comparar tamanho do artefato final com o baseline anterior e registrar o ganho.

## Critérios de aceite

- Baseline de compatibilidade Android atualizada e documentada.
- Build Android com redução mensurável de tamanho em relação ao baseline.
- Fluxos principais validados manualmente no Android suportado.
- Fluxos principais validados manualmente na web.
- README/docs atualizados com os novos requisitos de compatibilidade e processo de build.

## Fora de escopo

- Suporte a Android legado fora da nova baseline definida.
- Mudanças de arquitetura de produto.
- Refatoração ampla de UI.
- Introdução de backend/login.

## Riscos e trade-offs

- Aumentar a versão mínima do Android reduz alcance de dispositivos antigos.
- Algumas otimizações podem mudar formato de distribuição (ex.: preferência por AAB e splits por ABI) e exigir ajuste no processo de teste local.
- Dependências nativas podem impor limites técnicos para redução adicional de tamanho.

## Observações para IA

- Confirmar com o usuário qual será a baseline mínima de Android (ex.: API 29+ ou API 30+) antes de implementar.
- Medir baseline de tamanho antes de alterar configurações para evitar comparação imprecisa.
- Priorizar ganhos de build/configuração antes de considerar troca de bibliotecas.
- Preservar foco em Android e compatibilidade web do projeto.
