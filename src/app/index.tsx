import { CustomAlert, type CustomAlertRef } from "@/components/CustomAlert";
import { Header } from "@/components/Header";
import { List } from "@/components/List";
import { AlertService } from "@/services/AlertService";
import { useCartStore } from "@/stores/CartStore";
import { ReduceProducts, SetCurrency } from "@/utils/functions/MathFunctions";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";

export default function Home() {
	const cartStore = useCartStore();
	const alertRef = useRef<CustomAlertRef>(null);

	useEffect(() => {
		if (alertRef.current) {
			AlertService.init(alertRef.current);
		}
	}, []);

	const total = ReduceProducts(cartStore);

	return (
		<>
			<CustomAlert ref={alertRef} />

			<View className="flex-1 bg-slate-900">
				<Header />
				<Text className="text-white text-center pt-2 pb-4">
					Total: {SetCurrency(total)}
				</Text>

				<List cartStore={cartStore} />
			</View>
		</>
	);
}
