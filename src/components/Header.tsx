import { CustomAlert, type CustomAlertRef } from "@/components/CustomAlert";
import { Add, Back, Delete, Share } from "@/components/TouchableIcons";
import { titlePages } from "@/constants/pages";
import type { CurrentRoute } from "@/interfaces/CurrentRoute";
import { AlertService } from "@/services/AlertService";
import { useCartStore } from "@/stores/CartStore";
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

	function buttonsByRouteName() {
		switch (route.name) {
			case "index":
				return (
					<>
						{cartStore.products.length > 0 && (
							<Delete
								action={() => AlertService.remove(() => cartStore.clear())}
							/>
						)}

						<Share
							action={async () => {
								if (cartStore.products.length === 0)
									await AlertService.paste(cartStore);
								else AlertService.share(cartStore);
							}}
						/>
					</>
				);
			default:
				return <Back action={() => navigator.push("/")} />;
		}
	}

	return (
		<>
			<CustomAlert ref={alertRef} />

			<View className="pt-4 px-3 flex-row justify-between">
				<Text className="text-white text-2xl font-heading">
					{titlePages[route.name as keyof typeof titlePages]}
				</Text>

				<View className="flex-row gap-4">{buttonsByRouteName()}</View>
			</View>
			<View className="border-b border-white pt-3 mx-2" />

			{route.name === "index" && <Add action={() => navigator.push("/list/add")} />}
		</>
	);
}
