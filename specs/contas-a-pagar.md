# Mini-spec: Contas a pagar

Status: planejado

## Problema

O README menciona controle de contas a pagar como expansao do app, mas ainda nao ha fluxo nem modelo de dados definido.

## Objetivo

Adicionar uma area offline-first para registrar contas a pagar sem misturar esses dados com a lista de compras.

## Comportamento esperado

- O usuario deve poder criar, editar, marcar como paga e remover uma conta.
- O usuario deve visualizar total pendente e total pago.
- Contas devem ter data de vencimento opcional.
- Contas vencidas devem ter destaque visual.

## Telas afetadas

- Nova rota/tela de contas a pagar.
- Navegacao ou atalho a partir da tela principal.
- Componentes compartilhados de formulario, lista, alerta e moeda.

## Dados e persistencia

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
- Nao misturar `BillProps` com `ProductProps`.
- Usar regras pt-BR para moeda.

## Regras de validacao

- Titulo vazio deve ser bloqueado.
- Valor vazio nao deve ser aceito.
- Valores negativos nao devem ser aceitos.
- Data invalida nao deve ser aceita.

## Criterios de aceite

- Criar, editar, remover e marcar conta como paga.
- Exibir totais de contas pagas e pendentes.
- Persistir dados apos reiniciar o app.
- Manter lista de compras funcionando sem regressao.

## Fora de escopo

- Pagamento real.
- Integracao bancaria.
- Boletos, Pix ou leitura automatica.
- Backend/login.

## Observacoes para IA

- Confirmar se esta feature deve ficar no mesmo app shell ou em uma secao separada antes de implementar.
- Evitar reaproveitar componentes de produto quando isso acoplar dominios diferentes.
