import { PropsWithChildren } from "react";
import { TouchableOpacityProps } from "react-native";

export interface ButtonTouchableProps extends TouchableOpacityProps, PropsWithChildren {
  type?: "Success" | "Fail" | "Normal";
};