import { whatsapp } from "@/constants/whatsapp"
import type { StateProps } from "@/interfaces/StateProps"
import { SetCurrency, Multiply, ReduceProducts } from "@/utils/functions/MathFunctions"
import { Linking, Alert } from "react-native"

export const ShareService = {
    async shareOnWhatsapp(cartStore: StateProps) {
        const message = GetWhatsappMessage(GetProductsFormated(cartStore), GetTotalValueFormated(cartStore))
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`

        try {
            const canOpen = await Linking.canOpenURL(url)
            if (!canOpen) {
                Alert.alert('WhatsApp não disponível', 'Não foi possível abrir o WhatsApp no dispositivo.')
                return
            }
            await Linking.openURL(url)
        } catch (err) {
            console.error('Erro ao abrir WhatsApp:', err)
            Alert.alert('Erro', 'Ocorreu um erro ao tentar compartilhar pelo WhatsApp.')
        }
    }
}

function GetWhatsappMessage(products: string, total: string) {
    return `${whatsapp.title}\n${whatsapp.subtitle}\n--\n${products.trim()}\n\n--\nValor Total: ${total}`
}

function GetProductsFormated(cartStore: StateProps) {
    return cartStore.products
        .map(
                (product) =>
                `\n|| ${product.quantity}x ${product.item} | ${SetCurrency(Multiply(product.price, 1))} | ${SetCurrency(Multiply(product.quantity, product.price))}`,
        )
        .join('')
}

export function GetTotalValueFormated(cartStore: StateProps) {
    return SetCurrency(ReduceProducts(cartStore))
}