import React, { useState } from 'react'
import { Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import Constants from 'expo-constants'
import { Page } from '@/components/Page'
import { TextWhite } from '@/components/TextWhite'
import { BackupService, type BackupConflict, type BackupPayload, type ConflictChoices } from '@/services/BackupService'
import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'

const buttonClass = 'rounded-lg px-4 py-3 items-center bg-lime-400'
const secondaryClass = 'rounded-lg px-4 py-3 items-center border border-slate-500'

export default function BackupScreen() {
  const [rawBackup, setRawBackup] = useState('')
  const [preview, setPreview] = useState<ReturnType<typeof BackupService.parse> | null>(null)
  const [conflicts, setConflicts] = useState<BackupConflict[]>([])
  const [choices, setChoices] = useState<ConflictChoices>({})
  const [pendingMerge, setPendingMerge] = useState<BackupPayload | null>(null)
  const [message, setMessage] = useState('')

  function getLocalPayload(): BackupPayload {
    const cart = useCartStore.getState()
    const reminders = useReminderStore.getState()
    return {
      cart: { lists: cart.lists, activeListId: cart.activeListId, products: cart.products },
      reminders: reminders.reminders,
    }
  }

  async function exportBackup() {
    try {
      const cart = useCartStore.getState()
      const reminders = useReminderStore.getState()
      const envelope = BackupService.createEnvelope({
        cart: { lists: cart.lists, activeListId: cart.activeListId, products: cart.products },
        reminders: reminders.reminders.map(({ notificationId: _notificationId, ...reminder }) => reminder),
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
    } catch {
      setMessage('Não foi possível gerar ou compartilhar o backup. Tente novamente.')
    }
  }

  async function selectBackupFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/json', 'application/octet-stream'],
        copyToCacheDirectory: true,
        multiple: false,
      })
      if (result.canceled || !result.assets?.[0]) return
      const asset = result.assets[0]
      const raw = Platform.OS === 'web' && asset.file
        ? await asset.file.text()
        : await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 })
      setRawBackup(raw)
      setPreview(null)
      setConflicts([])
      setMessage('Arquivo selecionado. Valide o conteúdo para visualizar os dados antes da restauração.')
    } catch {
      setMessage('Não foi possível ler o arquivo selecionado. Verifique se ele está acessível e tente novamente.')
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
    try {
      await BackupService.preserveCurrentData()
      useCartStore.setState({
        lists: payload.cart.lists,
        activeListId: payload.cart.activeListId,
        products: payload.cart.products,
      })
      useReminderStore.setState({ reminders: payload.reminders.map((reminder) => ({ ...reminder })) })
      setMessage('Restauração concluída. ' + resultSummary)
      try {
        await ReminderOrchestrator.syncWithPermissions()
      } catch {
        setMessage('Os dados foram restaurados, mas não foi possível reconciliar as notificações. Verifique as permissões de notificação.')
      }
      setPreview(null)
      setConflicts([])
      setPendingMerge(null)
      setRawBackup('')
    } catch {
      setMessage('Não foi possível preservar os dados locais antes da restauração. Nenhum dado foi substituído.')
    }
  }

  function confirmReplace() {
    if (!preview) return
    const confirmation = 'Todas as listas, produtos e lembretes atuais serão substituídos pelos dados do backup. Uma cópia dos dados atuais será preservada antes da operação.'
    const summary = 'Restaurados: ' + preview.summary.lists + ' listas, ' + preview.summary.products + ' produtos e ' + preview.summary.reminders + ' lembretes.'
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
      void applyPayload(result.payload, 'Mesclados: ' + result.merged.lists + ' listas, ' + result.merged.products + ' produtos e ' + result.merged.reminders + ' lembretes. Já existentes e idênticos ignorados: ' + result.ignored.lists + ' listas, ' + result.ignored.products + ' produtos e ' + result.ignored.reminders + ' lembretes.')
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
    const summary = 'Mesclados: ' + (result.merged.lists + count(chosenFromBackup, 'lista')) + ' listas, ' + (result.merged.products + count(chosenFromBackup, 'produto')) + ' produtos e ' + (result.merged.reminders + count(chosenFromBackup, 'lembrete')) + ' lembretes. Mantidos locais nos conflitos: ' + count(keptLocal, 'lista') + ' listas, ' + count(keptLocal, 'produto') + ' produtos e ' + count(keptLocal, 'lembrete') + ' lembretes. Registros idênticos ignorados: ' + result.ignored.lists + ' listas, ' + result.ignored.products + ' produtos e ' + result.ignored.reminders + ' lembretes.'
    void applyPayload(BackupService.resolveConflicts(current, pendingMerge, choices), summary)
  }

  function renderConflict(conflict: BackupConflict) {
    return (
      <View key={conflict.id} className="rounded-lg border border-slate-600 p-3 gap-2">
        <Text className="text-white font-bold">{conflict.type.toUpperCase()}: {conflict.description}</Text>
        <Text className="text-slate-300 text-sm">Dados locais: {conflict.localValue}</Text>
        <Text className="text-slate-300 text-sm">Dados do backup: {conflict.backupValue}</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: choices[conflict.id] === 'local' }}
            className={choices[conflict.id] === 'local' ? buttonClass : secondaryClass}
            onPress={() => setChoices((current) => ({ ...current, [conflict.id]: 'local' }))}
          >
            <Text className="text-slate-900 font-bold">Manter local</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: choices[conflict.id] === 'backup' }}
            className={choices[conflict.id] === 'backup' ? buttonClass : secondaryClass}
            onPress={() => setChoices((current) => ({ ...current, [conflict.id]: 'backup' }))}
          >
            <Text className="text-slate-900 font-bold">Usar backup</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <Page>
      <ScrollView contentContainerClassName="px-4 pb-8 gap-4">
        <TextWhite className="text-xl font-bold">Backup e restauração</TextWhite>
        <TextWhite>Exporte listas, produtos e lembretes para um arquivo JSON. O backup fica sob sua responsabilidade: guarde uma cópia em local seguro.</TextWhite>

        <TouchableOpacity accessibilityRole="button" className={buttonClass} onPress={() => void exportBackup()}>
          <Text className="text-slate-900 font-bold">Gerar backup</Text>
        </TouchableOpacity>

        <View className="h-px bg-slate-600 my-2" />
        <TextWhite className="text-lg font-bold">Restaurar backup</TextWhite>
        <TextWhite>Selecione um arquivo JSON exportado pelo Gastômetro. Os dados locais só serão alterados depois da validação e da confirmação.</TextWhite>
        <TouchableOpacity accessibilityRole="button" className={secondaryClass} onPress={() => void selectBackupFile()}>
          <Text className="text-white font-bold">Selecionar arquivo JSON</Text>
        </TouchableOpacity>
        <TextInput
          accessibilityLabel="Conteúdo JSON do backup"
          multiline
          value={rawBackup}
          onChangeText={setRawBackup}
          placeholder="O conteúdo do arquivo selecionado aparecerá aqui..."
          placeholderTextColor="#94A3B8"
          className="min-h-40 rounded-lg border border-slate-500 bg-slate-800 p-3 text-white"
          textAlignVertical="top"
        />
        <TouchableOpacity accessibilityRole="button" className={secondaryClass} onPress={previewBackup}>
          <Text className="text-white font-bold">Validar e visualizar</Text>
        </TouchableOpacity>

        {preview && (
          <View className="rounded-lg border border-slate-600 p-3 gap-2">
            <TextWhite className="font-bold">Resumo do backup</TextWhite>
            <TextWhite>Exportado em: {new Date(preview.summary.exportedAt).toLocaleString('pt-BR')}</TextWhite>
            <TextWhite>Listas: {preview.summary.lists}</TextWhite>
            <TextWhite>Produtos: {preview.summary.products}</TextWhite>
            <TextWhite>Lembretes: {preview.summary.reminders}</TextWhite>
            <TouchableOpacity accessibilityRole="button" className={buttonClass} onPress={confirmReplace}>
              <Text className="text-slate-900 font-bold">Substituir dados locais</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" className={secondaryClass} onPress={prepareMerge}>
              <Text className="text-white font-bold">Mesclar com dados locais</Text>
            </TouchableOpacity>
          </View>
        )}

        {conflicts.length > 0 && (
          <View className="gap-3">
            <TextWhite className="text-lg font-bold">Conflitos encontrados ({conflicts.length})</TextWhite>
            <TextWhite>Para cada registro com o mesmo identificador e conteúdo diferente, escolha qual versão será mantida. Registros idênticos não são duplicados.</TextWhite>
            {conflicts.map(renderConflict)}
            <TouchableOpacity accessibilityRole="button" className={buttonClass} onPress={finishMerge}>
              <Text className="text-slate-900 font-bold">Concluir mesclagem</Text>
            </TouchableOpacity>
          </View>
        )}

        {message ? <TextWhite>{message}</TextWhite> : null}
      </ScrollView>
    </Page>
  )
}
