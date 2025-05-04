import type { ButtonProps } from "@/interfaces/ButtonProps";
import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import type { ShowAlertProps } from "../interfaces/ShowAlertProps";

interface CustomAlertProps {
	initialVisible?: boolean;
}

let showAlert: ({ title, message, buttons }: ShowAlertProps) => void = () => {};

let hideAlert: () => void = () => {};

export function CustomAlert({ initialVisible = false }: CustomAlertProps) {
	const [isVisible, setIsVisible] = useState(initialVisible);
	const [title, setTitle] = useState("");
	const [message, setMessage] = useState("");
	const [buttons, setButtons] = useState<ButtonProps[]>([]);

	function internalHideAlert() {
		setIsVisible(false);
	};

	showAlert = ({ title, message, buttons = [] }: ShowAlertProps): void => {
		setTitle(title);
		setMessage(message);
		setButtons([
			...buttons,
			{ text: "Cancelar", action: internalHideAlert },
		]);
		setIsVisible(true);
	};

	hideAlert = internalHideAlert;

	return {
		AlertComponent: (
			<Modal
				transparent={true}
				animationType="fade"
				visible={isVisible}
				onRequestClose={internalHideAlert}
			>
				<View className={"flex-1 justify-center items-center bg-black/50"}>
					<View className={"w-3/4 p-5 bg-slate-700 rounded-xl items-center"}>
						<Text className={"text-xl text-white font-bold mb-3"}>{title}</Text>
						{message && (
							<Text className={"text-base text-white mb-5 text-center"}>
								{message}
							</Text>
						)}
						<View className={"w-full flex-col"}>
							{buttons.map((button, index) => (
								<TouchableOpacity
									key={index}
									className={`p-2 mb-2 rounded items-center ${
										button.text === "Cancelar" ? "bg-red-500" : "bg-slate-400"
									}`}
									onPress={() => {
										button.action();
										internalHideAlert();
									}}
								>
									<Text
										className={`font-bold ${
											button.text === "Cancelar"
												? "text-white"
												: "text-black/90"
										}`}
									>
										{button.text}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>
				</View>
			</Modal>
		),
		showAlert,
		hideAlert,
	};
}

export const alertMethods = {
	showAlert,
	hideAlert,
};
