import { useCartStore } from "@/stores/CartStore";
import { titleMessage, titlePages } from "@/utils/constants";
import { ConvertToProductsList } from "@/utils/functions/ConvertToProductsList";
import { ShareOnWhatsapp } from "@/utils/functions/ShareOnWhatsapp";
import type { ButtonProps, CurrentRoute } from "@/utils/interfaces";
import { useRoute } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { Link } from "expo-router";
import { useState } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { CustomAlert } from "./CustomAlert";
import { AddIcon, BackIcon, DeleteIcon, ShareIcon } from "./Icons";

export function Header() {
	const [alertVisible, setAlertVisible] = useState(false);
	const [titleAlert, setTitleAlert] = useState("");
	const [messageAlert, setMessageAlert] = useState("");
	const [buttonsList, setButtonsList] = useState<ButtonProps[]>([]);

	const route = useRoute<CurrentRoute>();
	const cartStore = useCartStore();

	function showAlert(
		title: string,
		message: string,
		buttons: ButtonProps[] = [],
	) {
		setAlertVisible(true);
		setTitleAlert(title);
		setMessageAlert(message);

		buttons.push({ text: "Cancelar", action: () => disableAlert() });

		setButtonsList(buttons);
	}

	async function pasteOnList() {
		const clipboard = await Clipboard.getStringAsync();

		if (clipboard?.startsWith(titleMessage)) {
			const listToPaste = ConvertToProductsList(clipboard);

			return showAlert("Colar Lista", "", [
				{
					text: "Colar na Lista Existente",
					action: () => {
						listToPaste.map(cartStore.add);
						return disableAlert();
					},
				},
				{
					text: "Colar em Nova Lista",
					action: () => {
						cartStore.replace(listToPaste);
						return disableAlert();
					},
				},
			]);
		}

		return showAlert(
			"Erro!",
			"A lista copiada não está no padrão. Copie a lista do Whatsapp sem editar!",
		);
	}

	function handleShare() {
		const title = "Compartilhar Lista";
		let message = "";

		const pasteButton = {
			text: "Colar Lista",
			action: pasteOnList,
		};

		let buttons = [
			{
				text: "Enviar via WhatsApp",
				action: () => {
					const message = ShareOnWhatsapp(cartStore);
					Linking.openURL(`http://api.whatsapp.com/send?text=${message}`);
				},
			},
			pasteButton,
		];

		if (cartStore.products.length === 0) {
			message =
				"Coloque pelo menos 1 item na sua lista para que ela possa ser compartilhada.";

			buttons = [pasteButton];
		}

		return showAlert(title, message, buttons);
	}

	function disableAlert() {
		setAlertVisible(false);
	}

	function handleRemoveAll() {
		return showAlert("Remover Tudo", "Deseja remover todos os itens?", [
			{
				text: "Remover Tudo!",
				action: () => {
					cartStore.clear();
					disableAlert();
				},
			},
		]);
	}

	return (
		<>
			<View className="pt-4 px-3 flex-row justify-between">
				<Text className="text-white text-2xl font-heading">
					{titlePages[route.name as keyof typeof titlePages]}
				</Text>

				<CustomAlert
					visible={alertVisible}
					title={titleAlert}
					message={messageAlert}
					buttons={buttonsList}
				/>

				{route.name === "index" ? (
					<>
						{cartStore.products.length > 0 && (
							<TouchableOpacity activeOpacity={0.7} onPress={handleRemoveAll}>
								<DeleteIcon size={35} />
							</TouchableOpacity>
						)}

						<TouchableOpacity activeOpacity={0.7} onPress={handleShare}>
							<ShareIcon size={35} />
						</TouchableOpacity>

						<Link href="/add" asChild>
							<TouchableOpacity activeOpacity={0.7}>
								<AddIcon size={35} />
							</TouchableOpacity>
						</Link>
					</>
				) : (
					<Link href="/" asChild>
						<TouchableOpacity activeOpacity={0.7}>
							<BackIcon size={35} />
						</TouchableOpacity>
					</Link>
				)}
			</View>
			<View className="border-b border-white pt-3 mx-2" />
		</>
	);
}
