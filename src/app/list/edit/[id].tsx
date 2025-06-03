import { useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

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
		<KeyboardAvoidingView
			className="flex-1 bg-slate-900"
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={100} // Ajuste conforme o header/nav bar
		>
			<ScrollView keyboardShouldPersistTaps="handled">
				<Header />

				<Form data={prod} buttonTitle={text.buttons.edit}>
					<EditIcon size={32} color="black" />
				</Form>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
