import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";

import { useCartStore } from "@/stores/CartStore";

import { Form } from "@/components/Form";
import { Header } from "@/components/Header";

import { EditIcon } from "@/components/Icons";
import { text } from "@/constants/text";

export default function Edit() {
	const { id } = useLocalSearchParams();
	const cartStore = useCartStore();
	const prod = cartStore.get(id.toString());

	return (
		<ScrollView className="flex-1 bg-slate-900">
			<Header />

			<Form data={prod} buttonTitle={text.buttons.edit}>
				<EditIcon color="black" />
			</Form>
		</ScrollView>
	);
}
