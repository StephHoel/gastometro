import type { PropsWithChildren } from "react";
import type { ProductProps } from "./ProductProps";

export interface FormProps extends PropsWithChildren {
  data?: ProductProps;
  buttonTitle: string;
}