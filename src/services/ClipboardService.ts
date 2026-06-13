import * as Clipboard from 'expo-clipboard'
import { Platform } from 'react-native'

export const ClipboardService = {
  async getClipboardContent() {
    // Web: usar Clipboard API do navegador
    if (Platform.OS === 'web') {
      try {
        const text = await navigator.clipboard.readText()
        return text
      } catch (error) {
        console.warn('Erro ao ler clipboard na web:', error)
        return ''
      }
    }

    // Native: usar expo-clipboard
    return await Clipboard.getStringAsync()
  },

  async setClipboardContent(text: string) {
    // Web: usar Clipboard API do navegador
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (error) {
        console.warn('Erro ao escrever no clipboard na web:', error)
        return false
      }
    }

    // Native: usar expo-clipboard
    await Clipboard.setStringAsync(text)
    return true
  }
}
