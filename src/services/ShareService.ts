import { whatsapp } from "@/constants/whatsapp";
import type { StateProps } from "@/interfaces/StateProps";
import { SetCurrency } from "@/utils/functions/MathFunctions";
import { Linking } from "react-native";

export const ShareService = {
  shareOnWhatsapp(cartStore: StateProps) {
    Linking.openURL(`http://api.whatsapp.com/send?text=${GetWhatsappMessage(GetProductsFormated(cartStore), GetTotalValueFormated(cartStore))}`);
  }
}

function GetWhatsappMessage(products: string, total: string) {
  return (`${whatsapp.title}\n${whatsapp.subtitle}\n--\n${products.trim()}\n\n--\nValor Total: ${total}`).replaceAll('#', '%23').replaceAll('\n', '%0A')
}

function GetProductsFormated(cartStore: StateProps) {
  return cartStore.products
    .map(
      (product) =>
        `\n|| ${product.quantity}x ${product.item} | ${SetCurrency(Number.parseFloat(product.price))} | ${SetCurrency(Number.parseFloat(product.quantity) * Number.parseFloat(product.price))}`,
    )
    .join('')
}

export function GetTotalValueFormated(cartStore: StateProps) {
  return SetCurrency(
    cartStore.products.reduce(
      (total, product) =>
        total +
        Number.parseFloat(product.quantity) * Number.parseFloat(product.price),
      0,
    ),
  )
}


