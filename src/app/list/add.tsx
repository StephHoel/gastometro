import { Form } from "@/components/Form";
import { Header } from "@/components/Header";
import { AddIcon } from "@/components/Icons";
import { text } from "@/constants/text";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export default function Add() {
	return (
		<KeyboardAvoidingView
			className="flex-1 bg-slate-900"
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={100} // Ajuste conforme o header/nav bar
		>
			<ScrollView keyboardShouldPersistTaps="handled">
				<Header />

				<Form buttonTitle={text.buttons.add}>
					<AddIcon size={32} color="black" />
				</Form>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
