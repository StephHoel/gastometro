import * as Clipboard from 'expo-clipboard'
import { Platform } from 'react-native'
import { ERROR } from '@/constants/text/error'

export const ClipboardService = {
  async getClipboardContent() {
    // Web: usar Clipboard API do navegador
    if (Platform.OS === 'web') {
      try {
        const text = await navigator.clipboard.readText()
        return text
      } catch (error) {
        console.warn(ERROR.clipboard_read_web_failure, error)
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
        console.warn(ERROR.clipboard_write_web_failure, error)
        return false
      }
    }

    // Native: usar expo-clipboard
    try {
      await Clipboard.setStringAsync(text)
      return true
    } catch (error) {
      console.warn(ERROR.clipboard_write_native_failure, error)
      return false
    }
  }
}
