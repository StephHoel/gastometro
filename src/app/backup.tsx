import React, { useState } from 'react'
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native'

import Constants from 'expo-constants'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'

import { Page } from '@/components/Page'
import { TextWhite } from '@/components/TextWhite'

import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { BackupRestoreService } from '@/services/BackupRestoreService'
import { BackupService } from '@/services/BackupService'
import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'
import { useBillStore } from '@/stores/BillStore'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'

import {
  BackupConflict,
  ConflictChoices,
  BackupPayload
} from '@/interfaces/Backup'
import { CustomButton } from '@/components/Button'

export default function BackupScreen() {
  const [rawBackup, setRawBackup] = useState('')
  const [preview, setPreview] = useState<ReturnType<typeof BackupService.parse> | null>(null)
  const [conflicts, setConflicts] = useState<BackupConflict[]>([])
  const [choices, setChoices] = useState<ConflictChoices>({})
  const [pendingMerge, setPendingMerge] = useState<BackupPayload | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  function getLocalPayload(): BackupPayload {
    const cart = useCartStore.getState()
    const reminders = useReminderStore.getState()
    const bills = useBillStore.getState()
    const priceComparison = usePriceComparisonStore.getState()
    return {
      cart: { lists: cart.lists, activeListId: cart.activeListId, products: cart.products },
      reminders: reminders.reminders,
      bills: bills.bills,
      priceComparison: { places: priceComparison.places, entries: priceComparison.entries },
    }
  }

  async function exportBackup() {
    if (busy) return
    setBusy(true)
    try {
      const cart = useCartStore.getState()
      const reminders = useReminderStore.getState()
      const bills = useBillStore.getState()
      const priceComparison = usePriceComparisonStore.getState()
      const envelope = BackupService.createEnvelope({
        cart: { lists: cart.lists, activeListId: cart.activeListId, products: cart.products },
        reminders: reminders.reminders.map(({ notificationId: _notificationId, ...reminder }) => reminder),
        bills: bills.bills,
        priceComparison: { places: priceComparison.places, entries: priceComparison.entries },
      }, Constants.expoConfig?.version ?? 'desconhecida')
      const json = BackupService.stringify(envelope)
      const fileName = 'gastometro-backup-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json'
      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = fileName
        anchor.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        setMessage('Arquivo de backup gerado. Guarde-o em um local seguro.')
        return
      }
      if (!FileSystem.cacheDirectory) throw new Error('Diretório temporário indisponível.')
      const uri = FileSystem.cacheDirectory + fileName
      await FileSystem.writeAsStringAsync(uri, json, { encoding: FileSystem.EncodingType.UTF8 })
      await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Salvar backup do Gastômetro', UTI: 'public.json' })
      setMessage('Arquivo de backup preparado para compartilhamento. Guarde-o em um local seguro.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível gerar ou compartilhar o backup. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  async function selectBackupFile() {
    if (busy) return
    setBusy(true)
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/json', 'application/octet-stream'],
        copyToCacheDirectory: true,
        multiple: false,
      })
      if (result.canceled || !result.assets?.[0]) return
      const asset = result.assets[0]
      if (typeof asset.size === 'number' && asset.size > 10 * 1024 * 1024) {
        throw new Error('O arquivo de backup excede o limite de 10 MB.')
      }
      const raw = Platform.OS === 'web' && asset.file
        ? await asset.file.text()
        : await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 })
      setRawBackup(raw)
      setPreview(null)
      setConflicts([])
      setMessage('Arquivo selecionado. Valide o conteúdo para visualizar os dados antes da restauração.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível ler o arquivo selecionado. Verifique se ele está acessível e tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  function previewBackup() {
    try {
      const parsed = BackupService.parse(rawBackup)
      setPreview(parsed)
      setConflicts([])
      setChoices({})
      setPendingMerge(null)
      setMessage('Backup validado. Confira o resumo e escolha como deseja restaurar.')
    } catch (error) {
      setPreview(null)
      setMessage(error instanceof Error ? error.message : 'Não foi possível ler o backup.')
    }
  }

  async function applyPayload(payload: BackupPayload, resultSummary: string) {
    if (busy) return
    setBusy(true)
    try {
      await BackupRestoreService.apply(payload)
      let finalMessage = 'Restauração concluída. ' + resultSummary
      try {
        const notificationsReconciled = await ReminderOrchestrator.syncWithPermissions()
        if (!notificationsReconciled) {
          finalMessage = 'Os dados foram restaurados e persistidos, mas não foi possível confirmar a reconciliação de todas as notificações. Verifique as permissões e tente sincronizar novamente.'
        }
      } catch {
        finalMessage = 'Os dados foram restaurados e persistidos, mas a reconciliação das notificações falhou. Verifique as permissões e tente sincronizar novamente.'
      }
      setMessage(finalMessage)
      setPreview(null)
      setConflicts([])
      setPendingMerge(null)
      setRawBackup('')
    } catch (error) {
      setMessage(error instanceof Error
        ? error.message
        : 'Não foi possível restaurar o backup. Os dados anteriores foram mantidos ou a recuperação foi acionada.')
    } finally {
      setBusy(false)
    }
  }

  function confirmReplace() {
    if (!preview) return
    const confirmation = 'Todas as listas, produtos, lembretes, contas, locais e comparações atuais serão substituídos pelos dados do backup. Uma cópia dos quatro conjuntos de dados atuais será preservada antes da operação.'
    const summary = 'Restaurados: ' + preview.summary.lists + ' listas, ' + preview.summary.products + ' produtos, ' + preview.summary.reminders + ' lembretes, ' + preview.summary.bills + ' contas, ' + preview.summary.comparisonPlaces + ' locais e ' + preview.summary.comparisonEntries + ' comparações.'
    if (Platform.OS === 'web') {
      if (window.confirm('Substituir dados locais? ' + confirmation)) {
        void applyPayload(preview.envelope.payload, summary)
      }
      return
    }
    Alert.alert(
      'Substituir dados locais?',
      confirmation,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Substituir', style: 'destructive', onPress: () => void applyPayload(preview.envelope.payload, summary) },
      ],
    )
  }

  function prepareMerge() {
    if (!preview) return
    const result = BackupService.merge(getLocalPayload(), preview.envelope.payload)
    setPendingMerge(preview.envelope.payload)
    setConflicts(result.conflicts)
    setChoices({})
    if (result.conflicts.length === 0) {
      void applyPayload(result.payload, 'Mesclados: ' + result.merged.lists + ' listas, ' + result.merged.products + ' produtos, ' + result.merged.reminders + ' lembretes, ' + result.merged.bills + ' contas, ' + result.merged.comparisonPlaces + ' locais e ' + result.merged.comparisonEntries + ' comparações. Já existentes e idênticos ignorados: ' + result.ignored.lists + ' listas, ' + result.ignored.products + ' produtos, ' + result.ignored.reminders + ' lembretes, ' + result.ignored.bills + ' contas, ' + result.ignored.comparisonPlaces + ' locais e ' + result.ignored.comparisonEntries + ' comparações.')
      return
    }
    setMessage('Há conflitos entre os dados locais e o backup. Escolha qual versão manter em cada conflito.')
  }

  function finishMerge() {
    if (!pendingMerge) return
    const unresolved = conflicts.filter((conflict) => !choices[conflict.id])
    if (unresolved.length > 0) {
      setMessage('Escolha uma opção para cada conflito antes de concluir a mesclagem.')
      return
    }
    const current = getLocalPayload()
    const result = BackupService.merge(current, pendingMerge)
    const chosenFromBackup = conflicts.filter((conflict) => choices[conflict.id] === 'backup')
    const keptLocal = conflicts.filter((conflict) => choices[conflict.id] === 'local')
    const count = (items: BackupConflict[], type: BackupConflict['type']) => items.filter((item) => item.type === type).length
    const summary = 'Mesclados: ' + (result.merged.lists + count(chosenFromBackup, 'lista')) + ' listas, ' + (result.merged.products + count(chosenFromBackup, 'produto')) + ' produtos, ' + (result.merged.reminders + count(chosenFromBackup, 'lembrete')) + ' lembretes, ' + (result.merged.bills + count(chosenFromBackup, 'conta')) + ' contas, ' + (result.merged.comparisonPlaces + count(chosenFromBackup, 'local')) + ' locais e ' + (result.merged.comparisonEntries + count(chosenFromBackup, 'comparacao')) + ' comparações. Mantidos locais nos conflitos: ' + count(keptLocal, 'lista') + ' listas, ' + count(keptLocal, 'produto') + ' produtos, ' + count(keptLocal, 'lembrete') + ' lembretes, ' + count(keptLocal, 'conta') + ' contas, ' + count(keptLocal, 'local') + ' locais e ' + count(keptLocal, 'comparacao') + ' comparações. Registros idênticos ignorados: ' + result.ignored.lists + ' listas, ' + result.ignored.products + ' produtos, ' + result.ignored.reminders + ' lembretes, ' + result.ignored.bills + ' contas, ' + result.ignored.comparisonPlaces + ' locais e ' + result.ignored.comparisonEntries + ' comparações.'
    void applyPayload(BackupService.resolveConflicts(current, pendingMerge, choices), summary)
  }

  function renderConflict(conflict: BackupConflict) {
    const typeLabel = { lista: 'LISTA', produto: 'PRODUTO', lembrete: 'LEMBRETE', conta: 'CONTA', local: 'LOCAL', comparacao: 'COMPARAÇÃO' }[conflict.type]
    return (
      <View key={conflict.id} className="rounded-lg border border-slate-600 p-3 gap-2">
        <TextWhite className="font-bold">{typeLabel}: {conflict.description}</TextWhite>
        <Text className="text-slate-300 text-sm">Dados locais: {conflict.localValue}</Text>
        <Text className="text-slate-300 text-sm">Dados do backup: {conflict.backupValue}</Text>

        <View className="flex-row gap-2">
          <CustomButton
            type={choices[conflict.id] === 'local' ? "Success" : "Default"}
            accessibilityState={{ selected: choices[conflict.id] === 'local' }}
            disabled={busy}
            onPress={() => setChoices((current) => ({ ...current, [conflict.id]: 'local' }))}
          >
            <CustomButton.Text className={`text-3xl ${choices[conflict.id] !== 'local' ? '!text-white' : ''}`}>Manter local</CustomButton.Text>
          </CustomButton>

          <CustomButton
            type={choices[conflict.id] === 'backup' ? "Success" : "Default"}
            accessibilityState={{ selected: choices[conflict.id] === 'backup' }}
            onPress={() => setChoices((current) => ({ ...current, [conflict.id]: 'backup' }))}
            disabled={busy}
          >
            <CustomButton.Text className={`text-3xl ${choices[conflict.id] !== 'backup' ? '!text-white' : ''}`}>Usar backup</CustomButton.Text>
          </CustomButton>
        </View>
      </View>
    )
  }

  return (
    <Page>
      <ScrollView contentContainerClassName="px-8 pb-8 gap-4">
        <TextWhite className="text-xl font-bold">Backup e restauração</TextWhite>
        <TextWhite>Exporte listas, produtos, lembretes, contas e dados de comparação de preços para um arquivo JSON. O backup fica sob sua responsabilidade: guarde uma cópia em local seguro.</TextWhite>

        <CustomButton
          disabled={busy}
          onPress={() => void exportBackup()}
        >
          <CustomButton.Text>Gerar backup</CustomButton.Text>
        </CustomButton>

        <View className="h-px bg-slate-600 my-2" />
        <TextWhite className="text-lg font-bold">Restaurar backup</TextWhite>

        <TextWhite>Selecione um arquivo JSON exportado pelo Gastômetro. Os dados locais só serão alterados depois da validação e da confirmação.</TextWhite>

        <CustomButton
          type="Default"
          disabled={busy}
          onPress={() => void selectBackupFile()}
        >
          <CustomButton.Text className="!text-white text-3xl">Selecionar arquivo JSON</CustomButton.Text>
        </CustomButton>

        <TextInput
          accessibilityLabel="Conteúdo JSON do backup"
          multiline
          editable={false}
          value={rawBackup}
          onChangeText={(value) => {
            setRawBackup(value)
            setPreview(null)
            setConflicts([])
            setChoices({})
            setPendingMerge(null)
          }}
          placeholder="O conteúdo do arquivo selecionado aparecerá aqui..."
          placeholderTextColor="#94A3B8"
          className="min-h-40 rounded-lg border border-slate-500 bg-slate-800 mx-8 p-3 text-white cursor-not-allowed"
          textAlignVertical="top"
        />

        <CustomButton
          type="Default"
          disabled={busy || !rawBackup.trim()}
          onPress={previewBackup}
        >
          <CustomButton.Text className="!text-white text-3xl">Validar e visualizar</CustomButton.Text>
        </CustomButton>

        {preview && (
          <View className="rounded-lg border border-slate-600 p-3 gap-2">
            <TextWhite className="font-bold">Resumo do backup</TextWhite>
            <TextWhite>Exportado em: {new Date(preview.summary.exportedAt).toLocaleString('pt-BR')}</TextWhite>
            <TextWhite>
              Versão do arquivo: {preview.sourceVersion}
              {preview.sourceVersion !== preview.envelope.version ? ' (migrado para ' + preview.envelope.version + ')' : ''}
            </TextWhite>
            <TextWhite>Listas: {preview.summary.lists}</TextWhite>
            <TextWhite>Produtos: {preview.summary.products}</TextWhite>
            <TextWhite>Lembretes: {preview.summary.reminders}</TextWhite>
            <TextWhite>Contas: {preview.summary.bills}</TextWhite>
            <TextWhite>Locais de comparação: {preview.summary.comparisonPlaces}</TextWhite>
            <TextWhite>Comparações de preços: {preview.summary.comparisonEntries}</TextWhite>

            <CustomButton
              disabled={busy}
              onPress={confirmReplace}
            >
              <CustomButton.Text>Substituir dados locais</CustomButton.Text>
            </CustomButton>

            <CustomButton
              type="Default"
              disabled={busy}
              onPress={prepareMerge}
            >
              <CustomButton.Text className="!text-white text-3xl">Mesclar com dados locais</CustomButton.Text>
            </CustomButton>
          </View>
        )}

        {conflicts.length > 0 && (
          <View className="gap-3">
            <TextWhite className="text-lg font-bold">Conflitos encontrados ({conflicts.length})</TextWhite>

            <TextWhite>Para cada conflito, escolha qual versão será mantida. Locais com nomes equivalentes são tratados como o mesmo local e os preços vinculados preservam essa associação. Registros idênticos não são duplicados.</TextWhite>

            {conflicts.map(renderConflict)}

            <CustomButton
              disabled={busy}
              onPress={finishMerge}
            >
              <CustomButton.Text>Concluir mesclagem</CustomButton.Text>
            </CustomButton>
          </View>
        )}

        {message ? <TextWhite>{message}</TextWhite> : null}
      </ScrollView>
    </Page>
  )
}
