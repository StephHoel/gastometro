import { alertMethods } from "@/components/CustomAlert";
import { alert } from "@/constants/alert";
import type { ProductProps } from "@/interfaces/ProductProps";

export const AlertService = {
  alert(title: string, message: string) {
    alertMethods.showAlert({
      title: title,
      message: message,
    });
  },

  remove(prod: ProductProps | undefined, action: () => void) {
    alertMethods.showAlert({
      title: prod === undefined ? alert.removeAll.title : alert.remove.title,
      message: prod === undefined ? alert.removeAll.message : alert.remove.message(prod.item),
      buttons: [
        {
          text: prod === undefined ? alert.removeAll.button.title : alert.remove.button.title,
          action: action,
        },
      ],
    });
  },

  shareEmpty() {
    alertMethods.showAlert({
      title: alert.share.title,
      message: alert.share.message,
      buttons: [
        {
          text: alert.share.buttons.ok,
          action: () => { }
        },
      ],
    });
  },

  share(actionWhatsapp: () => void, actionPaste: () => void) {
    alertMethods.showAlert({
      title: alert.share.title,
      message: "",
      buttons: [
        {
          text: alert.share.buttons.whatsapp,
          action: actionWhatsapp
        },
        {
          text: alert.share.buttons.paste,
          action: actionPaste,
        },
      ],
    });
  },

  paste(actionList: () => void, actionNewList: () => void) {
    alertMethods.showAlert({
      title: alert.paste.title,
      message: alert.paste.message,
      buttons: [
        {
          text: alert.paste.buttons.oldList,
          action: actionList
        },
        {
          text: alert.paste.buttons.newList,
          action: actionNewList,
        },
      ],
    });
  },


}
