import type { CustomAlertRef } from "@/interfaces/CustomAlertRef"
import { alert } from "@/constants/alert"
import { text } from "@/constants/text"
import { whatsapp } from "@/constants/whatsapp"
import type { ProductProps } from "@/interfaces/ProductProps"
import type { StateProps } from "@/interfaces/StateProps"
import { ConvertToProductsList } from "@/utils/functions/ConvertToProductsList"
import { DuplicateProducts } from '@/utils/functions/DuplicateProducts'
import { ClipboardService } from "./ClipboardService"
import { ShareService } from "./ShareService"

let alertRef: CustomAlertRef | null = null

export const AlertService = {
  init(ref: CustomAlertRef) {
    alertRef = ref
  },

  alert(title: string, message: string) {
    alertRef?.showAlert({
      title,
      message,
    })
  },

  ok(title: string, message: string) {
    alertRef?.showAlert({
      title,
      message,
      buttons: [{
        text: alert.share.buttons.ok,
        action: () => { },
      }]
    })
  },

  remove(action: () => void, prod?: ProductProps) {
    alertRef?.showAlert({
      title: prod === undefined ? alert.removeAll.title : alert.remove.title,
      message: prod === undefined
        ? alert.removeAll.message
        : alert.remove.message(prod.item),
      buttons: [
        {
          text:
            prod === undefined
              ? alert.removeAll.button.title
              : alert.remove.button.title,
          action: action,
        },
      ],
    })
  },

  shareEmpty() {
    alertRef?.showAlert({
      title: alert.share.title,
      message: alert.share.message,
      buttons: [
        {
          text: alert.share.buttons.ok,
          action: () => { },
        },
      ],
    })
  },

  share(cartStore: StateProps) {
    alertRef?.showAlert({
      title: alert.share.title,
      message: "",
      buttons: [
        {
          text: alert.share.buttons.whatsapp,
          action: () => ShareService.shareOnWhatsapp(cartStore),
        },
        {
          text: alert.share.buttons.paste,
          action: async () => await AlertService.paste(cartStore),
        },
      ],
    })
  },

  async paste(cartStore: StateProps) {
    try {
      const clipboard = await ClipboardService.getClipboardContent()

      if (clipboard?.startsWith(whatsapp.title)) {
        const listToPaste = ConvertToProductsList(clipboard)

        if (listToPaste.length === 0) {
          AlertService.ok(text.error.alert_title, text.error.invalid_list_format)
          return
        }

        alertRef?.showAlert({
          title: alert.paste.title,
          message: alert.paste.message,
          buttons: [
            {
              text: alert.paste.buttons.oldList,
              action: () => {
                mergeDuplicatesAndApply(cartStore, listToPaste)
              },
            },
            {
              text: alert.paste.buttons.newList,
              action: () => cartStore.addList(text.lists.imported_name, listToPaste),
            },
          ],
        })
      } else {
        AlertService.ok(text.error.alert_title, text.error.invalid_list_format)
      }
    } catch (error) {
      console.error('Falha ao colar lista do clipboard:', error)
      AlertService.ok(text.error.alert_title, text.error.invalid_list_format)
    }
  },
}

function mergeDuplicatesAndApply(cartStore: StateProps, importedProducts: ProductProps[]) {
  const mergedList = [...cartStore.products, ...importedProducts]
  const deduplicatedList = mergeDuplicateGroups(mergedList)
  cartStore.replace(deduplicatedList)
}

function mergeDuplicateGroups(products: ProductProps[]): ProductProps[] {
  const groups = DuplicateProducts.getGroups(products)

  if (groups.length === 0) return products

  const workingList = [...products]

  groups.forEach((group) => {
    const refreshedGroup = buildGroupFromCurrentList(workingList, group)
    const mergeResult = DuplicateProducts.mergeGroup(refreshedGroup)

    if (!mergeResult) return

    const removedIds = new Set(mergeResult.removedIds)
    const withoutRemoved = workingList.filter((product) => !removedIds.has(product.id))
    const mergedIndex = withoutRemoved.findIndex((product) => product.id === mergeResult.mergedProduct.id)

    if (mergedIndex >= 0) {
      withoutRemoved[mergedIndex] = mergeResult.mergedProduct
      workingList.splice(0, workingList.length, ...withoutRemoved)
    }
  })

  return workingList
}

function buildGroupFromCurrentList(
  products: ProductProps[],
  group: ReturnType<typeof DuplicateProducts.getGroups>[number],
) {
  const groupIds = new Set(group.products.map((product) => product.id))
  const refreshedProducts = products.filter((product) => groupIds.has(product.id))

  return {
    keyItem: group.keyItem,
    keyPrice: group.keyPrice,
    products: refreshedProducts,
  }
}
