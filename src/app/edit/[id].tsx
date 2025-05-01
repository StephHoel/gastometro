import { useLocalSearchParams, useNavigation } from "expo-router";
import { ScrollView } from "react-native";

import { useCartStore } from "@/stores/CartStore";

import Feather from "@expo/vector-icons/Feather";

import { Form } from "@/components/Form";
import { Header } from "@/components/Header";

export default function Edit() {
	const { id } = useLocalSearchParams();
	const cartStore = useCartStore();
	const prod = cartStore.get(id.toString());
	const navigate = useNavigation();

	if (prod === undefined) {
		return navigate.goBack();
	}

	return (
		<ScrollView className="flex-1 bg-slate-900">
			<Header />

			<Form data={prod} buttonTitle={"Editar Item"}>
				<Feather name="edit-2" size={20} />
			</Form>
		</ScrollView>
	);
}
