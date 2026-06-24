# Mini-spec: Comparação de preços entre lugares

Número: 17
Status: planejado

## Problema

Hoje o app ajuda a montar lista e calcular total/preço por unidade, mas não oferece uma forma estruturada de comparar o preço do mesmo item entre diferentes lugares (mercados, atacados, farmácias etc.). Isso dificulta decidir onde comprar com menor custo total.

## Objetivo

Adicionar uma funcionalidade offline-first para comparar preços do mesmo item entre lugares e destacar a melhor opção de compra sem alterar o fluxo principal da lista de compras.

## Comportamento esperado

- O usuário deve poder cadastrar lugares para comparação (nome e observação opcional).
- O usuário deve poder cadastrar um item de comparação e informar preço por lugar.
- O app deve calcular automaticamente menor preço, maior preço e diferença absoluta/percentual entre opções.
- O app deve permitir ordenar os resultados por menor preço e por nome do lugar.
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
- Preço vazio não deve ser aceito para um lugar selecionado.
- Valores negativos não devem ser aceitos.
- Duplicidade de lugar por nome normalizado deve ser bloqueada.

## Critérios de aceite

- Criar, editar e remover lugares de comparação.
- Criar, editar e remover item de comparação com preços por lugar.
- Exibir melhor oferta, pior oferta e diferença (R$ e %) por item comparado.
- Persistir dados após reiniciar o app.
- Manter sem regressão o fluxo atual de lista, lembretes e calculadora.

## Fora de escopo

- Integração com APIs externas de preço.
- Geolocalização automática de mercados.
- Histórico temporal avançado de preços com gráficos.
- Compartilhamento automático da comparação em WhatsApp.

## Observações para IA

- Confirmar com o usuário se a comparação é por item avulso ou se haverá visão consolidada por cesta de compras completa.
- Priorizar modelagem desacoplada em `src/interfaces`, `src/stores` e `src/services`.
- Garantir cobertura de testes para regras de cálculo de menor preço e diferença percentual.
