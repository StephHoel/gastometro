import * as Clipboard from 'expo-clipboard';

export const ClipboardService = {
  async getClipboardContent() {
    return await Clipboard.getStringAsync();
  }
}
