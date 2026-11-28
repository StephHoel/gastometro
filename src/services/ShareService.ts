import { ERROR } from '@/constants/text/error'
import { whatsapp } from "@/constants/whatsapp"
import type { StateProps } from "@/interfaces/StateProps"
import { SetCurrency, Multiply, ReduceProducts, ParseToFloat } from "@/utils/functions/MathFunctions"
import { Linking, Alert, Platform } from "react-native"

export const ShareService = {
  async shareOnWhatsapp(cartStore: StateProps) {
    const message = GetWhatsappMessage(GetProductsFormated(cartStore), GetTotalValueFormated(cartStore))
    const encodedMessage = encodeURIComponent(message)
    const whatsappDeepLink = `whatsapp://send?text=${encodedMessage}`
    const whatsappWebLink = `https://wa.me/?text=${encodedMessage}`

    if (Platform.OS === 'web') {
      try {
        await Linking.openURL(whatsappWebLink)
      } catch (webLinkError) {
        console.error(ERROR.whatsapp_open_failure_message, webLinkError)
        Alert.alert(ERROR.whatsapp_unavailable, ERROR.whatsapp_open_error)
      }
      return
    }

    try {
      await Linking.openURL(whatsappDeepLink)
    } catch (deepLinkError) {
      console.warn(ERROR.whatsapp_deep_link_error, deepLinkError)

      try {
        await Linking.openURL(whatsappWebLink)
      } catch (webLinkError) {
        console.error(ERROR.whatsapp_open_failure_message, webLinkError)
        Alert.alert(ERROR.whatsapp_unavailable, ERROR.whatsapp_open_error)
      }
    }
  }
}

function GetWhatsappMessage(products: string, total: string) {
  return `${whatsapp.title}\n${whatsapp.subtitle}\n--\n${products.trim()}\n\n--\nValor Total: ${total}`
}

function GetProductsFormated(cartStore: StateProps) {
  return cartStore.products
    .map((product) =>
      `\n|| ${product.quantity}x ${product.item} | ${SetCurrency(ParseToFloat(product.price))} | ${SetCurrency(Multiply(product.quantity, product.price))}`,
    )
    .join('')
}

export function GetTotalValueFormated(cartStore: StateProps) {
  return SetCurrency(ReduceProducts(cartStore))
}