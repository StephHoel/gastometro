import { ButtonTouchableProps } from "@/interfaces/ButtonTouchableProps";
import type { PropsWithChildren } from "react";
import { Text, TouchableOpacity } from "react-native";

function Button({ children, type = "Success", ...rest }: ButtonTouchableProps) {
	let typeColor: string;

	switch (type) {
		case "Success":
			typeColor = "bg-lime-400";
			break;
		case "Fail":
			typeColor = "bg-red-600";
			break;
		default:
			typeColor = "bg-zinc-400";
			break;
	}

	return (
		<TouchableOpacity
			className={`h-12 ${typeColor} items-center justify-center flex-row mx-5 rounded-2xl`}
			activeOpacity={0.7}
			{...rest}
		>
			{children}
		</TouchableOpacity>
	);
}

function ButtonText({ children }: PropsWithChildren) {
	return (
		<Text className="text-black font-heading text-3xl mx-2">{children}</Text>
	);
}

function ButtonIcon({ children }: PropsWithChildren) {
	return children;
}

export const CustomButton = Object.assign(Button, {
	Text: ButtonText,
	Icon: ButtonIcon,
});
