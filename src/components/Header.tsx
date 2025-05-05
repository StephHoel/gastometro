import { CustomAlert } from "@/components/CustomAlert";
import { AddIcon, BackIcon, DeleteIcon, ShareIcon } from "@/components/Icons";
import { titlePages } from "@/constants/pages";
import { text } from "@/constants/text";
import { whatsapp } from "@/constants/whatsapp";
import type { CurrentRoute } from "@/interfaces/CurrentRoute";
import { AlertService } from "@/services/AlertService";
import { ClipboardService } from "@/services/ClipboardService";
import { ShareService } from "@/services/ShareService";
import { useCartStore } from "@/stores/CartStore";
import { ConvertToProductsList } from "@/utils/functions/ConvertToProductsList";
import { useRoute } from "@react-navigation/native";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export function Header() {
	const { AlertComponent } = CustomAlert({});
	const route = useRoute<CurrentRoute>();
	const cartStore = useCartStore();

	async function pasteOnList() {
		const clipboard = await ClipboardService.getClipboardContent();

		if (clipboard?.startsWith(whatsapp.title)) {
			const listToPaste = ConvertToProductsList(clipboard);

			AlertService.paste(
				() => listToPaste.map(cartStore.add),
				cartStore.replace(listToPaste),
			);
		} else {
			AlertService.alert(text.error.alert_title, text.error.lista_fora_padrao);
		}
	}

	function handleShare() {
		if (cartStore.products.length === 0) AlertService.shareEmpty();
		else
			AlertService.share(
				() => ShareService.shareOnWhatsapp(cartStore),
				pasteOnList,
			);
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
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={() =>
									AlertService.remove(undefined, cartStore.clear())
								}
							>
								<DeleteIcon size={35} />
							</TouchableOpacity>
						)}

						<TouchableOpacity activeOpacity={0.7} onPress={() => handleShare}>
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
