import { Page } from '@/components/Page'
import { TextWhite } from '@/components/TextWhite'
import { COLORS } from '@/constants/color'
import type { BillProps } from '@/interfaces/BillProps'
import { formatBillAmount, isBillOverdue, validateBill } from '@/services/BillService'
import { useBillStore } from '@/stores/BillStore'
import { ParseToFloat, SetCurrency } from '@/utils/functions/MathFunctions'
import React, { useState } from 'react'
import { Alert, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'

export default function Bills() {
  const bills = useBillStore((state) => state.bills)
  const addBill = useBillStore((state) => state.addBill)
  const updateBill = useBillStore((state) => state.updateBill)
  const setPaid = useBillStore((state) => state.setPaid)
  const removeBill = useBillStore((state) => state.removeBill)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const pendingTotal = bills.filter((bill) => !bill.paid).reduce((total, bill) => total + ParseToFloat(bill.amount), 0)
  const paidTotal = bills.filter((bill) => bill.paid).reduce((total, bill) => total + ParseToFloat(bill.amount), 0)

  function resetForm() {
    setTitle('')
    setAmount('')
    setDueDate('')
    setEditingId(null)
  }

  function saveBill() {
    const error = validateBill(title, amount, dueDate)
    if (error) {
      Alert.alert('Conta inválida', error)
      return
    }

    const payload = { title: title.trim(), amount: ParseToFloat(amount).toString(), dueDate: dueDate || undefined }
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
    Alert.alert('Remover conta', `Deseja remover "${bill.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removeBill(bill.id) },
    ])
  }

  return (
    <Page>
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-row justify-around px-3 py-4">
          <View className="items-center">
            <TextWhite className="text-slate-400 text-sm">Pendente</TextWhite>
            <TextWhite className="text-lime-400 font-bold">{SetCurrency(pendingTotal)}</TextWhite>
          </View>
          <View className="items-center">
            <TextWhite className="text-slate-400 text-sm">Pago</TextWhite>
            <TextWhite className="text-white font-bold">{SetCurrency(paidTotal)}</TextWhite>
          </View>
        </View>

        <View className="mx-4 mb-5 rounded-xl bg-slate-800 p-4 gap-3">
          <TextWhite className="font-bold">{editingId ? 'Editar conta' : 'Nova conta'}</TextWhite>
          <TextInput
            className="rounded-lg bg-slate-700 px-3 py-3 text-white"
            placeholder="Nome da conta"
            placeholderTextColor={COLORS.inactive}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            accessibilityLabel="Nome da conta"
          />
          <TextInput
            className="rounded-lg bg-slate-700 px-3 py-3 text-white"
            placeholder="Valor (ex.: 125,90)"
            placeholderTextColor={COLORS.inactive}
            value={amount}
            onChangeText={(value) => setAmount(value.replace(/[^0-9.,-]/g, ''))}
            keyboardType="decimal-pad"
            accessibilityLabel="Valor da conta"
          />
          <TextInput
            className="rounded-lg bg-slate-700 px-3 py-3 text-white"
            placeholder="Vencimento (AAAA-MM-DD, opcional)"
            placeholderTextColor={COLORS.inactive}
            value={dueDate}
            onChangeText={(value) => setDueDate(value.replace(/[^0-9-]/g, '').slice(0, 10))}
            maxLength={10}
            accessibilityLabel="Data de vencimento"
          />
          <TouchableOpacity className="h-11 items-center justify-center rounded-lg bg-lime-400" onPress={saveBill} accessibilityRole="button">
            <TextWhite className="font-bold text-slate-900">{editingId ? 'Salvar alterações' : 'Adicionar conta'}</TextWhite>
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity className="items-center py-2" onPress={resetForm}>
              <TextWhite className="text-slate-300">Cancelar edição</TextWhite>
            </TouchableOpacity>
          )}
        </View>

        <TextWhite className="px-4 pb-2 text-lg font-bold">Suas contas</TextWhite>
        {bills.length === 0 ? (
          <TextWhite className="px-4 py-6 text-center text-slate-400">Nenhuma conta cadastrada.</TextWhite>
        ) : bills.map((bill) => {
          const overdue = isBillOverdue(bill)
          return (
            <View key={bill.id} className={`mx-4 mb-3 rounded-xl border p-3 ${overdue ? 'border-red-500 bg-red-950/30' : 'border-slate-700 bg-slate-800'}`}>
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1">
                  <TextWhite className={bill.paid ? 'text-slate-400 line-through font-semibold' : 'font-semibold'}>{bill.title}</TextWhite>
                  <TextWhite className="mt-1 text-slate-300">{formatBillAmount(bill.amount)}</TextWhite>
                  {bill.dueDate && <TextWhite className={`mt-1 text-xs ${overdue ? 'text-red-300' : 'text-slate-400'}`}>Vencimento: {bill.dueDate.split('-').reverse().join('/')}{overdue ? ' · Vencida' : ''}</TextWhite>}
                  {bill.paid && <TextWhite className="mt-1 text-xs text-lime-400">Paga</TextWhite>}
                </View>
                <View className="gap-2">
                  <TouchableOpacity onPress={() => setPaid(bill.id, !bill.paid)} className="rounded-md bg-lime-400 px-3 py-2">
                    <TextWhite className="text-xs font-bold text-slate-900">{bill.paid ? 'Reabrir' : 'Marcar paga'}</TextWhite>
                  </TouchableOpacity>
                  <View className="flex-row justify-end gap-3">
                    <TouchableOpacity onPress={() => editBill(bill)} accessibilityLabel={`Editar ${bill.title}`}>
                      <TextWhite className="text-xs text-sky-300">Editar</TextWhite>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmRemove(bill)} accessibilityLabel={`Remover ${bill.title}`}>
                      <TextWhite className="text-xs text-red-300">Remover</TextWhite>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )
        })}
      </ScrollView>
    </Page>
  )
}
