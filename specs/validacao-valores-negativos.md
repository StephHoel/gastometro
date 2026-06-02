# Mini-spec: Validacao de valores negativos

Status: implementado

## Problema

O spec define que valores negativos nao devem ser aceitos, mas o parser numerico atual permite sinal negativo.

## Objetivo

Bloquear valores negativos em quantidade, preco e calculadora, preservando o suporte a virgula e ponto.

## Comportamento esperado

- Quantidade negativa nao deve ser salva.
- Preco negativo nao deve ser salvo.
- Calculadora nao deve calcular com preco ou quantidade negativos.
- O usuario deve receber mensagem clara de erro.
- Valores vazios continuam aceitos em produtos e tratados como `0` ou `0.00`.

## Telas afetadas

- Formulario de adicionar item.
- Formulario de editar item.
- Calculadora.
- Possivelmente textos de erro em `src/constants/text.ts`.

## Dados e persistencia

- Nao requer migracao.
- Dados antigos negativos, se existirem, precisam de decisao antes de saneamento automatico.

## Regras de validacao

- `-1`, `-1,50`, `-1.50` e formatos equivalentes devem ser invalidos.
- `0`, `0.00`, `0,00` devem ser validos.
- Campo vazio deve seguir regra existente: quantidade `0`, preco `0.00`.

## Criterios de aceite

- Bloquear criacao de produto com quantidade negativa.
- Bloquear criacao de produto com preco negativo.
- Bloquear edicao que transforme valor em negativo.
- Bloquear calculadora com valores negativos.
- Manter conversao pt-BR funcionando.

## Fora de escopo

- Migracao de dados antigos.
- Mascaras monetarias.
- Validacao de limite maximo de valor.

## Observacoes para IA

- Preferir funcoes puras de validacao reaproveitaveis.
- Cobrir parser e validacao com testes unitarios quando a suite existir.

## Registro de implementacao

- Formulario de adicionar/editar bloqueia quantidade e preco com sinal negativo.
- Calculadora bloqueia preco e quantidade com sinal negativo.
- Mensagem de erro dedicada adicionada em `src/constants/text.ts` (`valor_negativo`).
- Conversao pt-BR e regra de campos vazios foram preservadas.
