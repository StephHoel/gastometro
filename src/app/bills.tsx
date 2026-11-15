import { Card } from '@/components/Card'
import { CustomButton as Button } from '@/components/Button'
import { CheckboxIcon, EditIcon, TrashIcon } from '@/components/Icons'
import { Page } from '@/components/Page'
import { Row } from '@/components/Row'
import { TextWhite } from '@/components/TextWhite'
import { COLORS } from '@/constants/color'
import { SIZE } from '@/constants/size'
import type { CustomAlertRef } from '@/interfaces/CustomAlertRef'
import type { BillProps } from '@/interfaces/BillProps'
import { AlertService } from '@/services/AlertService'
import { formatBillAmount, isBillOverdue, validateBill } from '@/services/BillService'
import { useBillStore } from '@/stores/BillStore'
import { ParseToFloat, SetCurrency } from '@/utils/functions/MathFunctions'
import React, { useRef, useState } from 'react'
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import { useInitAlert } from '@/hooks/useInitAlert'

export default function Bills() {
  const alertRef = useRef<CustomAlertRef>(null)
  useInitAlert(alertRef)

  const bills = useBillStore((state) => state.bills)
  const addBill = useBillStore((state) => state.addBill)
  const updateBill = useBillStore((state) => state.updateBill)
  const setPaid = useBillStore((state) => state.setPaid)
  const removeBill = useBillStore((state) => state.removeBill)

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const pendingTotal = bills
    .filter((bill) => !bill.paid)
    .reduce((total, bill) => total + ParseToFloat(bill.amount), 0)
  const paidTotal = bills
    .filter((bill) => bill.paid)
    .reduce((total, bill) => total + ParseToFloat(bill.amount), 0)

  function resetForm() {
    setTitle('')
    setAmount('')
    setDueDate('')
    setEditingId(null)
  }

  function saveBill() {
    const error = validateBill(title, amount, dueDate)
    if (error) {
      AlertService.ok('Conta inválida', error)
      return
    }

    const payload = {
      title: title.trim(),
      amount: ParseToFloat(amount).toString(),
      dueDate: dueDate || undefined,
    }

    if (editingId) updateBill(editingId, payload)
    else addBill(payload)

    resetForm()
  }

  function editBill(bill: BillProps) {
    setEditingId(bill.id)
    setTitle(bill.title)
    setAmount(bill.amount.replace('.', ','))
    setDueDate(bill.dueDate ?? '')
  }

  function confirmRemove(bill: BillProps) {
    alertRef.current?.showAlert({
      title: 'Remover conta',
      message: `Deseja remover "${bill.title}"?`,
      buttons: [
        {
          text: 'Remover',
          action: () => removeBill(bill.id),
        },
      ],
    })
  }

  function renderInput(
    label: string,
    placeholder: string,
    value: string,
    onChangeText: (value: string) => void,
    accessibilityLabel: string,
    keyboardType: 'default' | 'decimal-pad' = 'default',
    maxLength?: number,
  ) {
    return (
      <View className="gap-1">
        <TextWhite className="text-sm text-slate-300">{label}</TextWhite>
        <Card className="px-3 py-1">
          <TextInput
            className="py-2 text-base text-white outline-none"
            placeholder={placeholder}
            placeholderTextColor={COLORS.inactive}
            value={value}
            onChangeText={onChangeText}
            accessibilityLabel={accessibilityLabel}
            keyboardType={keyboardType}
            maxLength={maxLength}
          />
        </Card>
      </View>
    )
  }

  return (
    <Page alertRef={alertRef}>
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="px-4 pt-4">
          <Row className="gap-3">
            <Card className="flex-1 p-3">
              <TextWhite className="text-xs text-slate-400">Total pendente</TextWhite>
              <TextWhite className="mt-1 text-lg font-bold text-lime-400">
                {SetCurrency(pendingTotal)}
              </TextWhite>
            </Card>
            <Card className="flex-1 p-3">
              <TextWhite className="text-xs text-slate-400">Total pago</TextWhite>
              <TextWhite className="mt-1 text-lg font-bold">
                {SetCurrency(paidTotal)}
              </TextWhite>
            </Card>
          </Row>
        </View>

        <View className="px-4 pt-5 gap-3">
          <TextWhite className="text-lg font-bold">
            {editingId ? 'Editar conta' : 'Nova conta'}
          </TextWhite>

          {renderInput(
            'Nome da conta',
            'Ex.: Energia elétrica',
            title,
            setTitle,
            'Nome da conta',
            'default',
            100,
          )}
          {renderInput(
            'Valor',
            'Ex.: 125,90',
            amount,
            (value) => setAmount(value.replace(/[^0-9.,-]/g, '')),
            'Valor da conta',
            'decimal-pad',
          )}
          {renderInput(
            'Vencimento (opcional)',
            'AAAA-MM-DD',
            dueDate,
            (value) => setDueDate(value.replace(/[^0-9-]/g, '').slice(0, 10)),
            'Data de vencimento',
            'default',
            10,
          )}

          <Button onPress={saveBill} className="mx-0 mt-1">
            <Button.Text className="text-xl">
              {editingId ? 'Salvar alterações' : 'Adicionar conta'}
            </Button.Text>
          </Button>

          {editingId && (
            <Button type="Normal" onPress={resetForm} className="mx-0">
              <Button.Text className="text-xl">Cancelar edição</Button.Text>
            </Button>
          )}
        </View>

        <View className="px-4 pt-6">
          <Row className="items-center justify-between mb-3">
            <TextWhite className="text-lg font-bold">Suas contas</TextWhite>
            <TextWhite className="text-xs text-slate-400">
              {bills.length} {bills.length === 1 ? 'conta' : 'contas'}
            </TextWhite>
          </Row>

          {bills.length === 0 ? (
            <Card className="p-5 items-center">
              <TextWhite className="text-center text-slate-400">
                Nenhuma conta cadastrada.
              </TextWhite>
            </Card>
          ) : (
            bills.map((bill) => {
              const overdue = isBillOverdue(bill)
              const secondaryTextClass = bill.paid
                ? 'text-slate-500 line-through'
                : 'text-slate-300'

              return (
                <Card
                  key={bill.id}
                  className={`mb-3 p-3 ${overdue ? 'border-red-400' : ''}`}
                >
                  <Row className="items-start gap-3">
                    <TouchableOpacity
                      onPress={() => setPaid(bill.id, !bill.paid)}
                      accessibilityRole="checkbox"
                      accessibilityLabel={bill.paid ? 'Marcar como pendente' : 'Marcar como paga'}
                      accessibilityState={{ checked: bill.paid }}
                      className="pt-1"
                    >
                      <CheckboxIcon checked={bill.paid} size={SIZE.iconActions} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => editBill(bill)}
                      className="flex-1 gap-1"
                      accessibilityRole="button"
                      accessibilityLabel={`Editar conta ${bill.title}`}
                    >
                      <TextWhite className={`font-bold ${bill.paid ? 'text-slate-500 line-through' : ''}`}>
                        {bill.title}
                      </TextWhite>
                      <TextWhite className={`text-sm ${secondaryTextClass}`}>
                        {formatBillAmount(bill.amount)}
                        {bill.paid ? ' · Paga' : ''}
                      </TextWhite>
                      {bill.dueDate && (
                        <TextWhite className={`text-xs ${overdue ? 'text-red-300' : secondaryTextClass}`}>
                          Vencimento: {bill.dueDate.split('-').reverse().join('/')}
                          {overdue ? ' · Vencida' : ''}
                        </TextWhite>
                      )}
                    </TouchableOpacity>

                    <Row className="items-center gap-3 pt-1">
                      <TouchableOpacity
                        onPress={() => editBill(bill)}
                        accessibilityRole="button"
                        accessibilityLabel={`Editar ${bill.title}`}
                        hitSlop={8}
                      >
                        <EditIcon size={SIZE.iconActions} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => confirmRemove(bill)}
                        accessibilityRole="button"
                        accessibilityLabel={`Remover ${bill.title}`}
                        hitSlop={8}
                      >
                        <TrashIcon size={SIZE.iconActions} />
                      </TouchableOpacity>
                    </Row>
                  </Row>
                </Card>
              )
            })
          )}
        </View>
      </ScrollView>
    </Page>
  )
}
