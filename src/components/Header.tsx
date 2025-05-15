import { CustomAlert, type CustomAlertRef } from "@/components/CustomAlert";
import { Add, Back, Delete, Share } from "@/components/TouchableIcons";
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
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";

export function Header() {
	const route = useRoute<CurrentRoute>();
	const cartStore = useCartStore();
	const navigator = useRouter();
	const alertRef = useRef<CustomAlertRef>(null);

	useEffect(() => {
		if (alertRef.current) {
			AlertService.init(alertRef.current);
		}
	}, []);

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

	function handleShare(): void {
		if (cartStore.products.length === 0) AlertService.shareEmpty();
		else
			AlertService.share(
				() => ShareService.shareOnWhatsapp(cartStore),
				pasteOnList,
			);
	}

	return (
		<>
			<CustomAlert ref={alertRef} />
			
			<View className="pt-4 px-3 flex-row justify-between">
				<Text className="text-white text-2xl font-heading">
					{titlePages[route.name as keyof typeof titlePages]}
				</Text>

				{route.name === "index" ? (
					<>
						{cartStore.products.length > 0 && (
							<Delete action={() => AlertService.remove(cartStore.clear())} />
						)}

						<Share action={handleShare} />

						<Add action={() => navigator.push("/add")} />

						{/* <Link href="/add" asChild>
							<TouchableOpacity activeOpacity={0.7}>
								<AddIcon size={35} />
							</TouchableOpacity>
						</Link> */}
					</>
				) : (
					<Back action={() => navigator.push("/")} />
				)}
			</View>
			<View className="border-b border-white pt-3 mx-2" />
		</>
	);
}
