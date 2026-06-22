import type { CustomAlertRef } from "@/interfaces/CustomAlertRef"
import type { ProductProps } from "@/interfaces/ProductProps"
import type { ShowAlertProps } from '@/interfaces/ShowAlertProps'
import type { StateProps } from "@/interfaces/StateProps"
import { alert } from "@/constants/alert"
import { whatsapp } from "@/constants/whatsapp"
import { ConvertToProductsList } from "@/utils/functions/ConvertToProductsList"
import { DuplicateProducts } from '@/utils/functions/DuplicateProducts'
import { ClipboardService } from "./ClipboardService"
import { ShareService } from "./ShareService"
import { ERROR } from '@/constants/text/error'
import { LISTS } from '@/constants/text/lists'
import { REMINDERS } from '@/constants/text/reminders'
import { ReminderOrchestrator } from './ReminderOrchestrator'

let alertRef: CustomAlertRef | null = null

export const AlertService = {
  init(ref: CustomAlertRef) {
    alertRef = ref
  },

  show(params: ShowAlertProps): boolean {
    if (!alertRef) return false
    alertRef.showAlert(params)
    return true
  },

  alert(title: string, message: string) {
    this.show({
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
          AlertService.ok(ERROR.alert_title, ERROR.invalid_list_format)
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
              action: () => cartStore.addList(LISTS.imported_name, listToPaste),
            },
          ],
        })
      } else {
        AlertService.ok(ERROR.alert_title, ERROR.invalid_list_format)
      }
    } catch (error) {
      console.error(ERROR.clipboard_paste_failure, error)
      AlertService.ok(ERROR.alert_title, ERROR.invalid_list_format)
    }
  },

  removeReminder(reminderId: string, redirect: () => void) {
    alertRef?.showAlert({
      title: REMINDERS.button.remove,
      message: REMINDERS.remove_message,
      buttons: [
        {
          text: REMINDERS.button.remove,
          action: async () => {
            await ReminderOrchestrator.removeReminder(reminderId)
            redirect()
          }
        },
      ],
    })
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
