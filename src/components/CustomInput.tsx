import type { CustomInputProps } from "@/interfaces/CustomInputProps";
import { Text, TextInput, View } from "react-native";
import colors from "tailwindcss/colors";

export function CustomInput({
	nameField,
	placeholder,
	selfRef,
	returnKeyType,
	setItem,
	item,
	onSubmit,
	keyboardType = "default",
}: CustomInputProps) {
	function handleChangeText(text: string) {
		if (nameField === "Quantidade" || nameField === "Preço") {
			let filtered = text.replace(/[^0-9.,]/g, "");
			const sep = filtered.includes(",")
				? ","
				: filtered.includes(".")
					? "."
					: "";
			const [intPart, ...rest] = filtered.split(/[.,]/);
			let decimalPart = rest.join("");

			if (sep) {
				const maxDecimals = nameField === "Preço" ? 2 : 3;
				decimalPart = decimalPart.slice(0, maxDecimals);
				filtered = intPart + sep + decimalPart;
			} else {
				filtered = intPart;
			}
			setItem(filtered);
		} else {
			setItem(text);
		}
	}

	return (
		<View className="border border-white rounded-2xl mx-5 py-1 text-white flex-row">
			<Text className="text-white p-2">{nameField}:</Text>

			<TextInput
				className={"text-white flex-1 py-2 mr-3 outline-none"}
				placeholderTextColor={colors.slate[400]}
				placeholder={placeholder}
				onChangeText={handleChangeText}
				value={item}
				ref={selfRef}
				keyboardType={keyboardType}
				onSubmitEditing={onSubmit}
				returnKeyType={returnKeyType}
			/>
		</View>
	);
}
