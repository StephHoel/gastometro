# Mini-spec: Validação de valores negativos

Status: implementado

## Problema

O spec define que valores negativos não devem ser aceitos, mas o parser numérico atual permite sinal negativo.

## Objetivo

Bloquear valores negativos em quantidade, preço e calculadora, preservando o suporte a vírgula e ponto.

## Comportamento esperado

- Quantidade negativa não deve ser salva.
- Preço negativo não deve ser salvo.
- Calculadora não deve calcular com preço ou quantidade negativos.
- O usuário deve receber mensagem clara de erro.
- Valores vazios continuam aceitos em produtos e tratados como `0` ou `0.00`.

## Telas afetadas

- Formulário de adicionar item.
- Formulário de editar item.
- Calculadora.
- Possivelmente textos de erro em `src/constants/text.ts`.

## Dados e persistência

- Não requer migração.
- Dados antigos negativos, se existirem, precisam de decisão antes de saneamento automático.

## Regras de validação

- `-1`, `-1,50`, `-1.50` e formatos equivalentes devem ser inválidos.
- `0`, `0.00`, `0,00` devem ser válidos.
- Campo vazio deve seguir regra existente: quantidade `0`, preço `0.00`.

## Critérios de aceite

- Bloquear criação de produto com quantidade negativa.
- Bloquear criação de produto com preço negativo.
- Bloquear edição que transforme valor em negativo.
- Bloquear calculadora com valores negativos.
- Manter conversão pt-BR funcionando.

## Fora de escopo

- Migração de dados antigos.
- Máscaras monetárias.
- Validação de limite máximo de valor.

## Observações para IA

- Preferir funções puras de validação reaproveitáveis.
- Cobrir parser e validação com testes unitários quando a suíte existir.

## Registro de implementação

- Formulário de adicionar/editar bloqueia quantidade e preço com sinal negativo.
- Calculadora bloqueia preço e quantidade com sinal negativo.
- Mensagem de erro dedicada adicionada em `src/constants/text.ts` (`valor_negativo`).
- Conversão pt-BR e regra de campos vazios foram preservadas.
