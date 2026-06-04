jest.mock('expo-clipboard', () => ({
  getStringAsync: jest.fn(),
}))

import * as Clipboard from 'expo-clipboard'
import { ClipboardService } from '@/services/ClipboardService'

describe('ClipboardService', () => {
  it('deve retornar conteúdo do clipboard', async () => {
    const getStringAsyncSpy = Clipboard.getStringAsync as jest.MockedFunction<typeof Clipboard.getStringAsync>
    getStringAsyncSpy.mockResolvedValue('lista copiada')

    const result = await ClipboardService.getClipboardContent()

    expect(result).toBe('lista copiada')
    expect(getStringAsyncSpy).toHaveBeenCalledTimes(1)
  })
})
