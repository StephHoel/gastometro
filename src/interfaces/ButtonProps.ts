import { PropsWithChildren } from "react";

export interface ButtonProps {
  text: string; // Button label
  action: () => void; // Action to execute on button click
}


export interface ButtonTextProps extends PropsWithChildren {
  className?: string
}