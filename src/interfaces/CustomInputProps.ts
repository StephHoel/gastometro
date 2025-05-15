import type { TextInput } from "react-native";

export interface CustomInputProps {
  nameField: "Item" | "Quantidade" | "Preço"
  selfRef: React.RefObject<TextInput>;
  placeholder: string;
  setItem: (value: string) => void;
  item: string;
  onSubmit: () => void;
  returnKeyType: "next" | "done";
  keyboardType?: "default" | "number-pad";
}