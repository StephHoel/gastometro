# Mini-spec: Contas a pagar

Número: 11
Status: implementado

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

- Nova rota `src/app/bills.tsx`, integrada como aba Contas no app shell.
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

- Persistir localmente em chave isolada `gastometro-bills`, via Zustand persist + AsyncStorage.
- Não misturar `BillProps` com `ProductProps`.
- Usar regras pt-BR para moeda.

## Regras de validação

- Título vazio deve ser bloqueado.
- Valor vazio não deve ser aceito.
- Valores negativos não devem ser aceitos. Valor zero é permitido.
- Data inválida não deve ser aceita.

## Critérios de aceite

- Criar, editar, remover e marcar conta como paga.
- Exibir totais de contas pagas e pendentes.
- Persistir dados após reiniciar o app.
- Manter contas em estado e armazenamento separados de listas e produtos.
- Manter lista de compras funcionando sem regressão.

## Fora de escopo

- Pagamento real.
- Integração bancária.
- Boletos, Pix ou leitura automática.
- Backend/login.

## Decisões de implementação

- A funcionalidade integra o app shell existente como uma nova aba chamada Contas.
- O domínio possui interface, store e chave de persistência próprios (`gastometro-bills`).
- A data é informada no formato `AAAA-MM-DD`; é opcional e validada como data real.
- A tela permite reabrir uma conta paga, além de marcar como paga.
