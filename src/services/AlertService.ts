import { alertMethods } from "@/components/CustomAlert";
import type { ButtonProps } from "@/interfaces/ButtonProps";
import type { ProductProps } from "@/interfaces/ProductProps";

export const AlertService = {
  // showConfirmation(title: string, message: string, buttons: ButtonProps[]) {
  //   alertMethods.showAlert({ title, message, buttons });
  // },

  // showOptions(title: string, message: string, buttons: ButtonProps[]) {
  //   alertMethods.showAlert({ title, message, buttons });
  // },

  // showError(title: string, message: string) {
  //   alertMethods.showAlert({ title, message }); // Exibe o alerta de erro
  // },

  // disable() {
  //   alertMethods.hideAlert(); // Oculta o alerta
  // },

  removeItem(prod: ProductProps, action: () => void) {
    alertMethods.showAlert({
      title: "Remover item",
      message: `Deseja remover: ${prod.item}?`,
      buttons: [
        {
          text: "Remover",
          action: action,
        },
      ],
    });
  }
}
