# Mini-spec: Comparação de preços entre lugares

Número: 17
Status: implementada, aguardando validação manual

## Problema

Hoje o app ajuda a montar lista e calcular total/preço por unidade, mas não oferece uma forma estruturada de comparar o preço do mesmo item entre diferentes lugares (mercados, atacados, farmácias etc.). Isso dificulta decidir onde comprar com menor custo total.

## Objetivo

Adicionar uma funcionalidade offline-first para comparar preços do mesmo item entre lugares e destacar a melhor opção de compra sem alterar o fluxo principal da lista de compras.

## Comportamento esperado

- O usuário deve poder cadastrar lugares para comparação (nome e observação opcional).
- O usuário deve poder cadastrar um item de comparação e informar preço por lugar.
- O app deve calcular automaticamente menor preço, maior preço e diferença absoluta/percentual entre opções.
- O app deve permitir ordenar as ofertas por menor preço ou nome do lugar, e os totais da cesta por menor total ou nome do lugar.
- O app deve sinalizar visualmente a melhor oferta para cada item comparado.
- O usuário deve poder editar e remover comparações e lugares.

## Telas afetadas

- Nova rota/tela de comparação de preços entre lugares.
- Ajuste de navegação para acesso rápido à nova tela (atalho na home ou header actions).
- Componentes compartilhados de formulário, cards, lista e alerta.

## Dados e persistência

Modelo inicial sugerido:

```ts
interface PriceComparisonPlaceProps {
    id: string
    name: string
    note?: string
}

interface PriceComparisonEntryProps {
    id: string
    itemName: string
    quantityReference?: string
    pricesByPlace: Array<{
        placeId: string
        price: string
    }>
    createdAt: string
    updatedAt: string
}
```

- Persistir localmente em chave dedicada (não misturar com `gastometro` nem `gastometro-reminders`).
- Manter regras pt-BR para parse e exibição de moeda.
- Evitar alterar formato de dados já persistidos no app.

## Regras de validação

- Nome do lugar vazio deve ser bloqueado.
- Nome do item de comparação vazio deve ser bloqueado.
- Cada preço informado deve ser válido e não negativo. É permitido deixar um lugar sem preço para o item; nesse caso, a cesta daquele lugar fica incompleta.
- Valores negativos não devem ser aceitos.
- Duplicidade de lugar por nome normalizado deve ser bloqueada.

## Critérios de aceite

- Criar, editar e remover lugares de comparação.
- Criar, editar e remover item de comparação com preços por lugar.
- Exibir melhor oferta, pior oferta e diferença (R$ e %) por item comparado.
- Persistir dados após reiniciar o app, em armazenamento local independente.
- Não aceitar preços inválidos, negativos, referências a lugares inexistentes ou atualizações para identificadores inexistentes.
- Ao remover um lugar, remover também seus preços associados sem apagar os demais dados dos itens.
- Tratar preço zero como valor válido e preço ausente como dado indisponível, nunca como zero.
- Exibir a diferença percentual como proporção da maior oferta.
- Manter sem regressão o fluxo atual de lista, lembretes e calculadora.

## Decisões complementares

- A cesta só é considerada completa quando existe pelo menos um item cadastrado e todos os itens possuem preço válido naquele lugar.
- Um item pode ter preço em apenas parte dos lugares cadastrados. Isso permite comparar ofertas disponíveis sem inventar valores para os lugares sem cotação.
- A diferença percentual é calculada em relação ao maior preço; quando o maior preço é zero ou não há pelo menos duas ofertas válidas, o percentual fica indisponível.
- A ordenação altera apenas a apresentação. A identificação da menor e da maior oferta permanece baseada nos valores, independentemente da ordem exibida.

## Fora de escopo

- Integração com APIs externas de preço.
- Geolocalização automática de mercados.
- Histórico temporal avançado de preços com gráficos.
- Compartilhamento automático da comparação em WhatsApp.

## Observações para IA

- A decisão confirmada é oferecer comparação individual por item e visão consolidada da cesta completa.
- Lugares sem preço para todos os itens da cesta devem ser identificados como incompletos; preços ausentes nunca equivalem a zero.
- Priorizar modelagem desacoplada em `src/interfaces`, `src/stores` e `src/services`.
- Garantir cobertura de testes para regras de cálculo de menor preço e diferença percentual.


## Status da implementação

- [x] Cadastro, edição e remoção de lugares com nome normalizado e observação opcional.
- [x] Cadastro, edição e remoção de itens com preços parciais por lugar.
- [x] Persistência offline-first em chave exclusiva, sem alterar os dados de listas, contas ou lembretes.
- [x] Validação de preços não negativos, lugares existentes e identificadores válidos.
- [x] Comparação de menor e maior oferta, com identificação visual dos respectivos lugares, diferença absoluta e percentual relativo à maior oferta.
- [x] Tratamento de preço zero como válido e de preço ausente/inválido como indisponível.
- [x] Cesta completa somente quando todos os itens possuem preço válido no lugar.
- [x] Ordenação independente das ofertas por item e dos totais da cesta.
- [x] Acesso à tela pela navegação principal.
- [x] Testes unitários, de store e de tela cobrindo os critérios funcionais.
- [x] Concluir a execução de CI após as correções dos três testes identificados no workflow de 2026-11-22: 303 testes aprovados, cobertura de 96,57% em statements, 91,90% em branches, 96,21% em funções e 97,87% em linhas.
- [ ] Validação manual da funcionalidade antes de mover a mini-spec para `done/`.
