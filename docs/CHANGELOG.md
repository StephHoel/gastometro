# Changelog

## 1.4.8 - 2026-06-07

Melhorias de infraestrutura, UX e qualidade com foco em Android moderno e estabilidade do app.

### Build e distribuição Android

- Ajuste da baseline para Android moderno (API 29+), com estratégia de build orientada a artefatos menores.
- Otimizações de configuração Android para reduzir peso de distribuição e melhorar performance de empacotamento.
- Refinamentos em scripts e propriedades de build para tornar o processo mais previsível em ambiente local e CI.
- Redução mensurável do APK de aproximadamente 102 MB para 22 MB (queda aproximada de 78%).

### Compartilhamento e regras de negócio

- Fluxo de compartilhamento via WhatsApp reforçado com deep link e fallback web.
- Tratamento de erro mais robusto nos fluxos relacionados ao compartilhamento.

### Interface e consistência visual

- Padronização de uso de constantes de cor em componentes.
- Ajustes visuais em ícones e alertas para melhorar consistência da interface.

### Qualidade, testes e manutenção

- Ajustes em testes para maior estabilidade de execução entre plataformas.
- Limpeza de dependência não utilizada e atualização de itens de suporte ao build.
- Atualizações em workflows para melhorar gatilhos e confiabilidade da automação.
- Validação manual concluída em Android API 29+ e Web, sem regressão funcional crítica nos fluxos principais.

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
