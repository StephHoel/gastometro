# Mini-spec: Contas a pagar

Número: 11
Status: planejado

## Problema

O README menciona controle de contas a pagar como expansão do app, mas ainda não há fluxo nem modelo de dados definido.

## Objetivo

Adicionar uma área offline-first para registrar contas a pagar sem misturar esses dados com a lista de compras.

## Comportamento esperado

- O usuário deve poder criar, editar, marcar como paga e remover uma conta.
- O usuário deve visualizar total pendente e total pago.
- Contas devem ter data de vencimento opcional.
- Contas vencidas devem ter destaque visual.

## Telas afetadas

- Nova rota/tela de contas a pagar.
- Navegação ou atalho a partir da tela principal.
- Componentes compartilhados de formulário, lista, alerta e moeda.

## Dados e persistência

Modelo inicial sugerido:

```ts
interface BillProps {
    id: string
    title: string
    amount: string
    dueDate?: string
    paid: boolean
}
```

- Persistir localmente.
- Não misturar `BillProps` com `ProductProps`.
- Usar regras pt-BR para moeda.

## Regras de validação

- Título vazio deve ser bloqueado.
- Valor vazio não deve ser aceito.
- Valores negativos não devem ser aceitos.
- Data inválida não deve ser aceita.

## Critérios de aceite

- Criar, editar, remover e marcar conta como paga.
- Exibir totais de contas pagas e pendentes.
- Persistir dados após reiniciar o app.
- Manter lista de compras funcionando sem regressão.

## Fora de escopo

- Pagamento real.
- Integração bancária.
- Boletos, Pix ou leitura automática.
- Backend/login.

## Observações para IA

- Confirmar se esta feature deve ficar no mesmo app shell ou em uma seção separada antes de implementar.
- Evitar reaproveitar componentes de produto quando isso acoplar domínios diferentes.
