# Comparação de preços

A tela **Comparar** permite manter lugares e comparar preços de itens individualmente ou pelo total da cesta.

## Uso

1. Cadastre cada mercado ou loja, com observação opcional.
2. Informe o nome do item e o preço praticado em cada lugar disponível.
3. Consulte as ofertas ordenadas por menor preço ou nome do lugar. A melhor oferta aparece destacada.
4. Na seção de cesta completa, compare a soma dos itens entre os lugares.

A comparação da cesta só indica um lugar como mais barato quando há preço cadastrado para todos os itens naquele lugar. Itens sem preço são exibidos como indisponíveis e não entram como preço zero. O total parcial continua visível para facilitar a identificação das informações faltantes.

## Regras

- Os dados são armazenados localmente na chave `gastometro-price-comparisons`, separada das listas e dos lembretes.
- Nomes de lugares são únicos após remoção de espaços nas extremidades e normalização de maiúsculas/minúsculas.
- Preços vazios, não numéricos ou negativos são rejeitados.
- Remover um lugar também remove suas ofertas das comparações, sem apagar os itens comparados.
- A diferença percentual representa a economia em relação ao maior preço disponível para o item.
- Não há consulta a serviços externos nem sincronização em nuvem.
