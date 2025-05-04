import { CustomAlert } from "@/components/CustomAlert";
import { Header } from "@/components/Header";
import { List } from "@/components/List";
import { useCartStore } from "@/stores/CartStore";
import { ReduceProducts, SetCurrency } from "@/utils/functions/MathFunctions";
import { Text, View } from "react-native";

export default function Home() {
	const cartStore = useCartStore();
	const { AlertComponent, showAlert } = CustomAlert({});

	const total = ReduceProducts(cartStore);

	return (
		<>
			{AlertComponent}

			<View className="flex-1 bg-slate-900">
				<Header />
				<Text className="text-white text-center pt-2 pb-4">
					Total: {SetCurrency(total)}
				</Text>

				<List cartStore={cartStore} showAlert={showAlert} />
			</View>
		</>
	);
}
