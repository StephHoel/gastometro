import { CustomAlert } from "@/components/CustomAlert";
import { AddIcon, BackIcon, DeleteIcon, ShareIcon } from "@/components/Icons";
import { titlePages } from "@/constants/pages";
import { whatsapp } from "@/constants/whatsapp";
import type { CurrentRoute } from "@/interfaces/CurrentRoute";
import { ClipboardService } from "@/services/ClipboardService";
import { ShareService } from "@/services/ShareService";
import { useCartStore } from "@/stores/CartStore";
import { ConvertToProductsList } from "@/utils/functions/ConvertToProductsList";
import { useRoute } from "@react-navigation/native";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export function Header() {
	const { AlertComponent, showAlert } = CustomAlert({});
	const route = useRoute<CurrentRoute>();
	const cartStore = useCartStore();

	function handleRemoveAll() {
		showAlert({
			title: "Remover Tudo",
			message: "Deseja remover todos os itens?",
			buttons: [
				{
					text: "Remover Tudo!",
					action: () => {
						cartStore.clear();
					},
				},
			],
		});
	}

	async function pasteOnList() {
		const clipboard = await ClipboardService.getClipboardContent();

		if (clipboard?.startsWith(whatsapp.title)) {
			const listToPaste = ConvertToProductsList(clipboard);

			showAlert({
				title: "Colar Lista",
				message: "",
				buttons: [
					{
						text: "Colar na Lista Existente",
						action: () => {
							listToPaste.map(cartStore.add);
						},
					},
					{
						text: "Colar em Nova Lista",
						action: () => {
							cartStore.replace(listToPaste);
						},
					},
				],
			});
		} else {
			showAlert({
				title: "Erro!",
				message:
					"A lista copiada não está no padrão. Copie a lista do Whatsapp sem editar!",
			});
		}
	}

	function handleShare() {
		const title = "Compartilhar Lista";
		const message =
			cartStore.products.length === 0
				? "Coloque pelo menos 1 item na sua lista para que ela possa ser compartilhada."
				: "";

		const buttons =
			cartStore.products.length === 0
				? [{ text: "OK", action: () => {} }]
				: [
						{
							text: "Enviar via WhatsApp",
							action: () => {
								ShareService.shareOnWhatsapp(cartStore);
							},
						},
						{
							text: "Colar Lista",
							action: pasteOnList,
						},
					];

		showAlert({ title, message, buttons });
	}

	return (
		<>
			{AlertComponent}
			<View className="pt-4 px-3 flex-row justify-between">
				<Text className="text-white text-2xl font-heading">
					{titlePages[route.name as keyof typeof titlePages]}
				</Text>

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
