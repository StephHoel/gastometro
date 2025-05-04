import type { ShowAlertProps } from "@/interfaces/ShowAlertProps";
import type { StateProps } from "@/interfaces/StateProps";

export interface ListProps{
  cartStore: StateProps,
  showAlert: (showAlert: ShowAlertProps) => void
}