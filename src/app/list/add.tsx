import { ScrollView } from "react-native";

import { Form } from "@/components/Form";
import { Header } from "@/components/Header";
import { AddIcon } from "@/components/Icons";
import { text } from "@/constants/text";

export default function Add() {
	return (
		<ScrollView className="flex-1 bg-slate-900">
			<Header />

			<Form buttonTitle={text.buttons.add}>
				<AddIcon size={32} color="black" />
			</Form>
		</ScrollView>
	);
}
