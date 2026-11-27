import React from 'react'
import { Alert, Platform } from 'react-native'
import * as Sharing from 'expo-sharing'
import Constants from 'expo-constants'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'

import BackupScreen from '@/app/backup'
import { BackupConflict, BackupPayload } from '@/interfaces/Backup'
import { BackupRestoreService } from '@/services/BackupRestoreService'
import { BackupService } from '@/services/BackupService'
import { MAX_BACKUP_SIZE } from '@/constants/backup'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'
import { useBillStore } from '@/stores/BillStore'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}))

jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: { UTF8: 'utf8' },
  cacheDirectory: '/cache/',
  writeAsStringAsync: jest.fn(),
}))

jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }))
jest.mock('expo-constants', () => ({ expoConfig: { version: '1.11.0' } }))


const rawBackup = '{"backup":true}'

const payload: BackupPayload = {
  cart: { lists: [], activeListId: '', products: [] },
  reminders: [],
  bills: [],
  priceComparison: { places: [], entries: [] },
}

const conflict: BackupConflict = {
  id: 'lista:list-1',
  type: 'lista',
  description: 'A lista local e a lista do backup possuem o mesmo identificador.',
  localValue: 'Lista local',
  backupValue: 'Lista do backup',
}

describe('BackupScreen', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.mocked(DocumentPicker.getDocumentAsync).mockReset()
    jest.mocked(FileSystem.readAsStringAsync).mockReset()
    jest.mocked(FileSystem.writeAsStringAsync).mockReset().mockResolvedValue()
    jest.mocked(Sharing.shareAsync).mockReset().mockResolvedValue()

    useCartStore.setState({ lists: [], activeListId: '', products: [] })
    useReminderStore.setState({ reminders: [] })
    useBillStore.setState({ bills: [] })
    usePriceComparisonStore.setState({ places: [], entries: [] })

    jest.spyOn(BackupService, 'parse').mockReturnValue({
      envelope: BackupService.createEnvelope(payload, '1.11.0'),
      summary: {
        exportedAt: '2026-11-26T10:00:00.000Z',
        lists: 0,
        products: 0,
        reminders: 0,
        bills: 0,
        comparisonPlaces: 0,
        comparisonEntries: 0,
      },
      sourceVersion: 2,
    })
    jest.spyOn(BackupRestoreService, 'apply').mockResolvedValue()
    jest.spyOn(ReminderOrchestrator, 'syncWithPermissions').mockResolvedValue(true)

    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
      canceled: false,
      assets: [{
        name: 'backup.json',
        uri: 'file:///backup.json',
        size: rawBackup.length,
        lastModified: Date.now(),
        mimeType: 'application/json',
      }],
    })
    jest.mocked(FileSystem.readAsStringAsync).mockResolvedValue(rawBackup)
  })

  async function renderWithValidatedBackup() {
    const screen = await render(<BackupScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar arquivo JSON' }))
    await waitFor(() => expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith(
      'file:///backup.json',
      { encoding: 'utf8' },
    ))

    await fireEvent.press(screen.getByRole('button', { name: 'Validar e visualizar' }))
    await waitFor(() => expect(screen.getByText('Resumo do backup')).toBeTruthy())

    return screen
  }

  it('renderiza o estado inicial sem inserir texto vazio dentro de uma View', async () => {
    const screen = await render(<BackupScreen />)

    expect(screen.getByText('Backup e restauração')).toBeTruthy()
    expect(screen.getByText('Selecionar arquivo JSON')).toBeTruthy()
  })

  it('solicita confirmação e restaura os dados ao substituir os dados locais', async () => {
    const apply = jest.mocked(BackupRestoreService.apply)
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Substituir')?.onPress?.()
    })
    const screen = await renderWithValidatedBackup()

    await fireEvent.press(screen.getByRole('button', { name: 'Substituir dados locais' }))

    expect(alert).toHaveBeenCalledWith(
      'Substituir dados locais?',
      expect.stringContaining('listas, produtos, lembretes, contas, locais e comparações'),
      expect.any(Array),
    )
    await waitFor(() => expect(apply).toHaveBeenCalledWith(payload))
    expect(await screen.findByText(/Restauração concluída/)).toBeTruthy()
  })

  it('inicia a mesclagem e restaura diretamente quando não há conflitos', async () => {
    const apply = jest.mocked(BackupRestoreService.apply)
    jest.spyOn(BackupService, 'merge').mockReturnValue({
      payload,
      conflicts: [],
      merged: { lists: 1, products: 2, reminders: 3, bills: 0, comparisonPlaces: 0, comparisonEntries: 0 },
      ignored: { lists: 0, products: 0, reminders: 0, bills: 0, comparisonPlaces: 0, comparisonEntries: 0 },
    })
    const screen = await renderWithValidatedBackup()

    await fireEvent.press(screen.getByRole('button', { name: 'Mesclar com dados locais' }))

    await waitFor(() => expect(apply).toHaveBeenCalledWith(payload))
    expect(await screen.findByText(/Mesclados: 1 listas, 2 produtos, 3 lembretes, 0 contas, 0 locais e 0 comparações/)).toBeTruthy()
  })

  it('impede concluir a mesclagem enquanto houver conflitos sem resolução', async () => {
    const apply = jest.mocked(BackupRestoreService.apply)
    jest.spyOn(BackupService, 'merge').mockReturnValue({
      payload,
      conflicts: [conflict],
      merged: { lists: 0, products: 0, reminders: 0, bills: 0, comparisonPlaces: 0, comparisonEntries: 0 },
      ignored: { lists: 0, products: 0, reminders: 0, bills: 0, comparisonPlaces: 0, comparisonEntries: 0 },
    })
    const screen = await renderWithValidatedBackup()

    await fireEvent.press(screen.getByRole('button', { name: 'Mesclar com dados locais' }))
    expect(await screen.findByText('Conflitos encontrados (1)')).toBeTruthy()

    await fireEvent.press(screen.getByRole('button', { name: 'Concluir mesclagem' }))

    expect(await screen.findByText(/Escolha uma opção para cada conflito antes de concluir a mesclagem/)).toBeTruthy()
    expect(apply).not.toHaveBeenCalled()
  })

  it('exibe conflitos, permite selecionar a versão do backup e conclui a mesclagem', async () => {
    const apply = jest.mocked(BackupRestoreService.apply)
    const merge = jest.spyOn(BackupService, 'merge').mockReturnValue({
      payload,
      conflicts: [conflict],
      merged: { lists: 0, products: 0, reminders: 0, bills: 0, comparisonPlaces: 0, comparisonEntries: 0 },
      ignored: { lists: 0, products: 0, reminders: 0, bills: 0, comparisonPlaces: 0, comparisonEntries: 0 },
    })
    const resolve = jest.spyOn(BackupService, 'resolveConflicts').mockReturnValue(payload)
    const screen = await renderWithValidatedBackup()

    await fireEvent.press(screen.getByRole('button', { name: 'Mesclar com dados locais' }))
    expect(await screen.findByText('Conflitos encontrados (1)')).toBeTruthy()
    expect(screen.getByText(/Dados locais: Lista local/)).toBeTruthy()
    expect(screen.getByText(/Dados do backup: Lista do backup/)).toBeTruthy()

    await fireEvent.press(screen.getByRole('button', { name: 'Usar backup' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Concluir mesclagem' }))

    await waitFor(() => expect(resolve).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      { 'lista:list-1': 'backup' },
    ))
    await waitFor(() => expect(apply).toHaveBeenCalledWith(payload))
    expect(merge).toHaveBeenCalledTimes(2)
    expect(await screen.findByText(/Restauração concluída/)).toBeTruthy()
  })

  it('não apresenta nós de texto inválidos ao renderizar os controles de conflito', async () => {
    jest.spyOn(BackupService, 'merge').mockReturnValue({
      payload,
      conflicts: [conflict],
      merged: { lists: 0, products: 0, reminders: 0, bills: 0, comparisonPlaces: 0, comparisonEntries: 0 },
      ignored: { lists: 0, products: 0, reminders: 0, bills: 0, comparisonPlaces: 0, comparisonEntries: 0 },
    })

    const screen = await renderWithValidatedBackup()
    await fireEvent.press(screen.getByRole('button', { name: 'Mesclar com dados locais' }))

    expect(await screen.findByText('Conflitos encontrados (1)')).toBeTruthy()
    expect(screen.getByText('Manter local')).toBeTruthy()
    expect(screen.getByText('Usar backup')).toBeTruthy()
  })
  it('gera o arquivo e abre o compartilhamento na plataforma nativa', async () => {
    const screen = await render(<BackupScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Gerar backup' }))

    await waitFor(() => expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
      expect.stringMatching(/^\/cache\/gastometro-backup-.*\.json$/),
      expect.any(String),
      { encoding: 'utf8' },
    ))
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      expect.stringMatching(/^\/cache\/gastometro-backup-.*\.json$/),
      expect.objectContaining({ mimeType: 'application/json' }),
    )
    expect(await screen.findByText(/preparado para compartilhamento/)).toBeTruthy()
    expect(Constants.expoConfig?.version).toBe('1.11.0')
  })

  it('não grava nem compartilha um backup que excede o limite', async () => {
    jest.spyOn(BackupService, 'stringify').mockImplementation(() => {
      throw new Error('O backup gerado excede o limite de 10 MB.')
    })
    const screen = await render(<BackupScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Gerar backup' }))

    expect(FileSystem.writeAsStringAsync).not.toHaveBeenCalled()
    expect(Sharing.shareAsync).not.toHaveBeenCalled()
    expect(await screen.findByText(/backup gerado excede o limite de 10 MB/)).toBeTruthy()
  })

  it('rejeita arquivo acima de 10 MB antes de tentar lê-lo', async () => {
    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValueOnce({
      canceled: false,
      assets: [{
        name: 'backup-grande.json',
        uri: 'file:///backup-grande.json',
        size: MAX_BACKUP_SIZE + 1,
        lastModified: Date.now(),
        mimeType: 'application/json',
      }],
    })
    const screen = await render(<BackupScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar arquivo JSON' }))

    expect(FileSystem.readAsStringAsync).not.toHaveBeenCalled()
    expect(await screen.findByText(/excede o limite de 10 MB/)).toBeTruthy()
  })

  it('não tenta ler arquivo quando o seletor é cancelado', async () => {
    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValueOnce({ canceled: true, assets: null })
    const screen = await render(<BackupScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar arquivo JSON' }))

    expect(FileSystem.readAsStringAsync).not.toHaveBeenCalled()
    expect(screen.queryByText('Resumo do backup')).toBeNull()
  })

  it('exibe erro de validação quando o JSON selecionado é inválido', async () => {
    jest.spyOn(BackupService, 'parse').mockImplementation(() => {
      throw new Error('O arquivo não contém um JSON válido.')
    })
    const screen = await render(<BackupScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar arquivo JSON' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Validar e visualizar' }))

    expect(await screen.findByText(/JSON válido/)).toBeTruthy()
    expect(screen.queryByText('Resumo do backup')).toBeNull()
  })

  it('informa falha de persistência e não tenta reconciliar notificações', async () => {
    jest.mocked(BackupRestoreService.apply).mockRejectedValueOnce(new Error('Falha de persistência'))
    const sync = jest.mocked(ReminderOrchestrator.syncWithPermissions)
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Substituir')?.onPress?.()
    })
    const screen = await renderWithValidatedBackup()

    await fireEvent.press(screen.getByRole('button', { name: 'Substituir dados locais' }))

    expect(alert).toHaveBeenCalled()
    expect(await screen.findByText(/Falha de persistência/)).toBeTruthy()
    expect(sync).not.toHaveBeenCalled()
  })

  it('informa quando a reconciliação de notificações retorna falha após persistir os dados', async () => {
    jest.mocked(ReminderOrchestrator.syncWithPermissions).mockResolvedValueOnce(false)
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Substituir')?.onPress?.()
    })
    const screen = await renderWithValidatedBackup()

    await fireEvent.press(screen.getByRole('button', { name: 'Substituir dados locais' }))

    expect(alert).toHaveBeenCalled()
    expect(await screen.findByText(/não foi possível confirmar a reconciliação/)).toBeTruthy()
  })

  it('informa quando a reconciliação de notificações lança uma exceção', async () => {
    jest.mocked(ReminderOrchestrator.syncWithPermissions).mockRejectedValueOnce(new Error('Falha no agendamento'))
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Substituir')?.onPress?.()
    })
    const screen = await renderWithValidatedBackup()

    await fireEvent.press(screen.getByRole('button', { name: 'Substituir dados locais' }))

    expect(alert).toHaveBeenCalled()
    expect(await screen.findByText(/reconciliação das notificações falhou/)).toBeTruthy()
  })


  it('exporta contas, locais e registros de comparação junto com os demais dados', async () => {
    useBillStore.setState({ bills: [{ id: 'bill-1', title: 'Internet', amount: '99,90', paid: false }] })
    usePriceComparisonStore.setState({
      places: [{ id: 'place-1', name: 'Mercado' }],
      entries: [{
        id: 'entry-1', itemName: 'Arroz', pricesByPlace: [{ placeId: 'place-1', price: '10,00' }],
        createdAt: '2026-11-01T10:00:00.000Z', updatedAt: '2026-11-01T10:00:00.000Z',
      }],
    })
    const screen = await render(<BackupScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Gerar backup' }))
    await waitFor(() => expect(FileSystem.writeAsStringAsync).toHaveBeenCalled())
    const json = JSON.parse(jest.mocked(FileSystem.writeAsStringAsync).mock.calls[0][1] as string)
    expect(json.version).toBe(2)
    expect(json.payload.bills[0].amount).toBe('99,90')
    expect(json.payload.priceComparison.places[0].name).toBe('Mercado')
    expect(json.payload.priceComparison.entries[0].pricesByPlace[0].price).toBe('10,00')
  })

  it('exibe a versão de origem e as seis contagens na pré-visualização', async () => {
    jest.spyOn(BackupService, 'parse').mockReturnValue({
      envelope: BackupService.createEnvelope({
        ...payload,
        bills: [{ id: 'bill-1', title: 'Internet', amount: '99,90', paid: false }],
        priceComparison: {
          places: [{ id: 'place-1', name: 'Mercado' }],
          entries: [{ id: 'entry-1', itemName: 'Arroz', pricesByPlace: [{ placeId: 'place-1', price: '10,00' }], createdAt: '2026-11-01T10:00:00.000Z', updatedAt: '2026-11-01T10:00:00.000Z' }],
        },
      }, '1.11.0'),
      summary: { exportedAt: '2026-11-26T10:00:00.000Z', lists: 1, products: 2, reminders: 3, bills: 4, comparisonPlaces: 5, comparisonEntries: 6 },
      sourceVersion: 2,
    })
    const screen = await renderWithValidatedBackup()
    expect(screen.getByText('Versão do arquivo: 2')).toBeTruthy()
    expect(screen.getByText('Contas: 4')).toBeTruthy()
    expect(screen.getByText('Locais de comparação: 5')).toBeTruthy()
    expect(screen.getByText('Comparações de preços: 6')).toBeTruthy()
  })


  it('exporta backup no navegador e dispara o download do JSON', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'web')
    useBillStore.setState({ bills: [{ id: 'bill-web', title: 'Internet', amount: '99,90', paid: false }] })
    usePriceComparisonStore.setState({
      places: [{ id: 'place-web', name: 'Mercado Web' }],
      entries: [{ id: 'entry-web', itemName: 'Arroz', pricesByPlace: [{ placeId: 'place-web', price: '10,00' }], createdAt: '2026-11-01T10:00:00.000Z', updatedAt: '2026-11-01T10:00:00.000Z' }],
    })
    const anchor = { href: '', download: '', click: jest.fn() }
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { createElement: jest.fn().mockReturnValue(anchor) },
    })
    const createObjectURL = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:backup')
    const revokeObjectURL = jest.spyOn(URL, 'revokeObjectURL')
    const screen = await render(<BackupScreen />)

    try {
      await fireEvent.press(screen.getByRole('button', { name: 'Gerar backup' }))

      await waitFor(() => expect(anchor.click).toHaveBeenCalledTimes(1))
      expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      const exported = JSON.parse(await (createObjectURL.mock.calls[0][0] as Blob).text())
      expect(exported.payload.cart.lists).toEqual([])
      expect(exported.payload.cart.products).toEqual([])
      expect(exported.payload.reminders).toEqual([])
      expect(exported.payload.bills[0].id).toBe('bill-web')
      expect(exported.payload.priceComparison.places[0].id).toBe('place-web')
      expect(exported.payload.priceComparison.entries[0].id).toBe('entry-web')
      expect(anchor.href).toBe('blob:backup')
      expect(anchor.download).toMatch(/^gastometro-backup-.*\.json$/)
      expect(await screen.findByText(/Arquivo de backup gerado/)).toBeTruthy()
      await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:backup'), { timeout: 2000 })
    } finally {
      if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument)
      else Reflect.deleteProperty(globalThis, 'document')
      platform.restore()
    }
  })

  it('importa backup no navegador usando o conteúdo do arquivo selecionado', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'web')
    const readFile = jest.fn().mockResolvedValue(rawBackup)
    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValueOnce({
      canceled: false,
      assets: [{
        name: 'backup.json',
        uri: 'blob:backup',
        size: rawBackup.length,
        lastModified: Date.now(),
        mimeType: 'application/json',
        file: { text: readFile } as unknown as File,
      }],
    } as never)
    const screen = await render(<BackupScreen />)

    try {
      await fireEvent.press(screen.getByRole('button', { name: 'Selecionar arquivo JSON' }))

      await waitFor(() => expect(readFile).toHaveBeenCalledTimes(1))
      expect(FileSystem.readAsStringAsync).not.toHaveBeenCalled()
      expect(await screen.findByText(/Arquivo selecionado/)).toBeTruthy()

      await fireEvent.press(screen.getByRole('button', { name: 'Validar e visualizar' }))
      expect(await screen.findByText('Resumo do backup')).toBeTruthy()
    } finally {
      platform.restore()
    }
  })


  it('informa falha ao gerar download no navegador', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'web')
    const createObjectURL = jest.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      throw new Error('Falha ao criar arquivo para download')
    })
    const screen = await render(<BackupScreen />)

    try {
      await fireEvent.press(screen.getByRole('button', { name: 'Gerar backup' }))
      expect(createObjectURL).toHaveBeenCalled()
      expect(await screen.findByText('Falha ao criar arquivo para download')).toBeTruthy()
    } finally {
      platform.restore()
    }
  })

  it('informa falha ao ler o arquivo selecionado no navegador', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'web')
    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValueOnce({
      canceled: false,
      assets: [{
        name: 'backup.json',
        uri: 'blob:backup',
        size: rawBackup.length,
        lastModified: Date.now(),
        mimeType: 'application/json',
        file: { text: jest.fn().mockRejectedValue(new Error('Falha ao ler arquivo web')) } as unknown as File,
      }],
    } as never)
    const screen = await render(<BackupScreen />)

    try {
      await fireEvent.press(screen.getByRole('button', { name: 'Selecionar arquivo JSON' }))
      expect(await screen.findByText('Falha ao ler arquivo web')).toBeTruthy()
      expect(FileSystem.readAsStringAsync).not.toHaveBeenCalled()
    } finally {
      platform.restore()
    }
  })

  it('apresenta e resolve conflitos dos seis tipos de coleção', async () => {
    const conflicts: BackupConflict[] = [
      { ...conflict },
      { id: 'produto:p1', type: 'produto', description: 'Produto divergente', localValue: 'Arroz local', backupValue: 'Arroz backup' },
      { id: 'lembrete:r1', type: 'lembrete', description: 'Lembrete divergente', localValue: 'Lembrete local', backupValue: 'Lembrete backup' },
      { id: 'conta:b1', type: 'conta', description: 'Conta divergente', localValue: 'Conta local', backupValue: 'Conta backup' },
      { id: 'local:p1', type: 'local', description: 'Local divergente', localValue: 'Mercado local', backupValue: 'Mercado backup' },
      { id: 'comparacao:c1', type: 'comparacao', description: 'Comparação divergente', localValue: 'Preço local', backupValue: 'Preço backup' },
    ]
    const apply = jest.mocked(BackupRestoreService.apply)
    jest.spyOn(BackupService, 'merge').mockReturnValue({
      payload,
      conflicts,
      merged: { lists: 0, products: 0, reminders: 0, bills: 0, comparisonPlaces: 0, comparisonEntries: 0 },
      ignored: { lists: 0, products: 0, reminders: 0, bills: 0, comparisonPlaces: 0, comparisonEntries: 0 },
    })
    const resolve = jest.spyOn(BackupService, 'resolveConflicts').mockReturnValue(payload)
    const screen = await renderWithValidatedBackup()

    await fireEvent.press(screen.getByRole('button', { name: 'Mesclar com dados locais' }))

    expect(await screen.findByText('Conflitos encontrados (6)')).toBeTruthy()
    expect(screen.getByText(/LISTA:/)).toBeTruthy()
    expect(screen.getByText(/PRODUTO:/)).toBeTruthy()
    expect(screen.getByText(/LEMBRETE:/)).toBeTruthy()
    expect(screen.getByText(/CONTA:/)).toBeTruthy()
    expect(screen.getByText(/LOCAL:/)).toBeTruthy()
    expect(screen.getByText(/COMPARAÇÃO:/)).toBeTruthy()

    for (const button of screen.getAllByRole('button', { name: 'Manter local' })) {
      await fireEvent.press(button)
    }
    await fireEvent.press(screen.getAllByRole('button', { name: 'Usar backup' })[3])
    await fireEvent.press(screen.getByRole('button', { name: 'Concluir mesclagem' }))

    await waitFor(() => expect(resolve).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      {
        'lista:list-1': 'local',
        'produto:p1': 'local',
        'lembrete:r1': 'local',
        'conta:b1': 'backup',
        'local:p1': 'local',
        'comparacao:c1': 'local',
      },
    ))
    await waitFor(() => expect(apply).toHaveBeenCalledWith(payload))
  })


  it('mantém os dados locais quando a confirmação de substituição é cancelada na web', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'web')
    const screen = await renderWithValidatedBackup()
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
    const confirm = jest.fn().mockReturnValue(false)
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { confirm },
    })
    const apply = jest.mocked(BackupRestoreService.apply)

    try {
      await fireEvent.press(screen.getByRole('button', { name: 'Substituir dados locais' }))

      expect(confirm).toHaveBeenCalledWith(expect.stringContaining('Todas as listas'))
      expect(apply).not.toHaveBeenCalled()
      expect(screen.getByText('Resumo do backup')).toBeTruthy()
    } finally {
      if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
      else Reflect.deleteProperty(globalThis, 'window')
      platform.restore()
    }
  })

  it('impede iniciar outra operação enquanto a seleção de arquivo está pendente', async () => {
    let finishPicker!: (result: { canceled: true; assets: null }) => void
    jest.mocked(DocumentPicker.getDocumentAsync).mockReturnValueOnce(
      new Promise((resolve) => { finishPicker = resolve as (result: { canceled: true; assets: null }) => void }),
    )
    const createEnvelope = jest.spyOn(BackupService, 'createEnvelope')
    const screen = await render(<BackupScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar arquivo JSON' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Gerar backup' }))

    expect(createEnvelope).not.toHaveBeenCalled()
    expect(FileSystem.writeAsStringAsync).not.toHaveBeenCalled()
    expect(Sharing.shareAsync).not.toHaveBeenCalled()

    await act(async () => {
      finishPicker({ canceled: true, assets: null })
      await Promise.resolve()
    })
  })


  it('mantém os dados locais quando a confirmação de substituição é cancelada no Android', async () => {
    const apply = jest.mocked(BackupRestoreService.apply)
    const confirmationButtons: { current: NonNullable<Parameters<typeof Alert.alert>[2]> } = { current: [] }
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      confirmationButtons.current = buttons ?? []
    })
    const screen = await renderWithValidatedBackup()

    await fireEvent.press(screen.getByRole('button', { name: 'Substituir dados locais' }))

    expect(alert).toHaveBeenCalledWith(
      'Substituir dados locais?',
      expect.any(String),
      expect.any(Array),
    )
    expect(confirmationButtons.current[0]).toMatchObject({ text: 'Cancelar', style: 'cancel' })
    confirmationButtons.current[0]?.onPress?.()
    expect(apply).not.toHaveBeenCalled()
    expect(screen.getByText('Resumo do backup')).toBeTruthy()
  })

  it('impede iniciar exportação enquanto a restauração está pendente', async () => {
    let finishRestore!: () => void
    jest.mocked(BackupRestoreService.apply).mockReturnValueOnce(
      new Promise((resolve) => { finishRestore = resolve }),
    )
    const createEnvelope = jest.spyOn(BackupService, 'createEnvelope')
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Substituir')?.onPress?.()
    })
    const screen = await renderWithValidatedBackup()

    await fireEvent.press(screen.getByRole('button', { name: 'Substituir dados locais' }))
    expect(alert).toHaveBeenCalled()
    await waitFor(() => expect(BackupRestoreService.apply).toHaveBeenCalledWith(payload))

    await fireEvent.press(screen.getByRole('button', { name: 'Gerar backup' }))
    expect(createEnvelope).not.toHaveBeenCalled()
    expect(FileSystem.writeAsStringAsync).not.toHaveBeenCalled()

    await act(async () => {
      finishRestore()
      await Promise.resolve()
    })
    expect(await screen.findByText(/Restauração concluída/)).toBeTruthy()
  })

})
