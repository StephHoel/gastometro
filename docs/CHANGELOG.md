# Changelog

## 1.4.7 - 2026-06-04

Ajustes internos e melhorias na documentação e suíte de testes automatizados.

## 1.4.6 - 2026-06-03

Correção

- Bloqueia a criação manual de itens duplicados na lista atual.
- Bloqueia a edição para um nome que já exista em outro item.
- Preserva a importação/colagem com duplicados permitidos.
- Adiciona registro da mini-spec de bloqueio de duplicados na criação manual.

## 1.4.5 - 2026-06-02

Correção

- Bloqueia valores negativos em quantidade e preço no formulário de adicionar/editar item.
- Bloqueia cálculo com valores negativos na calculadora.
- Adiciona mensagem de erro dedicada para valor negativo (`valor_negativo`).
- Refatora normalização numérica para utilitários compartilhados (entrada decimal e normalização de string numérica).
- Atualiza README, SPEC e mini-spec de validação de valores negativos para refletir a implementação.

## 1.4.4 - 2026-06-02

Refatoração

- Remove ordenação duplicada em render da lista e centraliza ordenação no helper do store.
- Atualiza assinatura de `SortProductsAlphabetically` para API explícita por parâmetro.
- Adiciona tratamento de erro no hook `useInitAlert`.
- Fortalece fluxo de colagem/importação com `try/catch` no `AlertService`.
- Torna parser de importação mais defensivo para linhas malformadas.

## 1.4.3 - 2026-05-17

Correção

## 1.4.2 - 2026-05-17

Correção da v1.4.1

## 1.4.0 - 2025-05-01

Criação de calculadora de preços
