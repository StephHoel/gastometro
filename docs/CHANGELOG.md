# Changelog

## 1.4.11 - 2026-06-13

Refatoração da spec 12: redução de código duplicado, remoção de código não utilizado e ampliação de cobertura de testes

## 1.4.10 - 2026-06-12

Exibe itens coletados no final da lista, separados dos não coletados por cabeçalhos de seção com contador.

### Funcionalidade

- Itens não coletados aparecem primeiro; itens coletados aparecem no final.
- Cabeçalhos de seção "Não coletados" e "Coletados" com contador de itens separam visualmente os dois blocos.
- Marcar ou desmarcar item move-o imediatamente para o bloco correto, sem recarregar a tela.

### Qualidade

- Função pura `SortProductsByCollected` em `src/utils/functions/SortList.ts` para agrupamento testável.
- Novo componente `ListSectionHeader` com interface `ListSectionHeaderProps`.
- Testes adicionados para cobertura de ordem visual e presença dos cabeçalhos.
- Script `npm run new-version` atualizado para aceitar argumentos opcionais (`tipo` e texto do changelog), com suporte a execução não-interativa.

### Documentação

- Mini-spec 07 movida para `docs/specs/done/` com status `implementado`.
- `docs/SPEC.md` e `docs/specs/README.md` atualizados.
- Regra adicionada nas instruções do Copilot: nunca executar `git commit` sem pedido explícito do usuário.

## 1.4.9 - 2026-06-07

Implementação da visualização de total de itens coletados na tela principal, com atualização de documentação e cobertura de testes.

### Funcionalidade

- Exibe `Total Geral | Total Coletado` na tela principal.
- Atualiza o total coletado imediatamente ao marcar ou desmarcar itens.
- Mantém formato monetário `pt-BR` com `BRL` e regras atuais de cálculo.

### Qualidade

- Adiciona função pura para cálculo de total coletado.
- Expande testes unitários de matemática para cobrir total de coletados.
- Adiciona teste de componente para validar exibição dos dois totais na Home.

### Documentação

- Atualiza mini-spec `docs/specs/done/03-total-itens-coletados.md` para `Status: implementado`.
- Atualiza README e SPEC para refletir que o total coletado não é mais item planejado.

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

