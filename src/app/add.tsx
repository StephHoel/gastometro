import { ScrollView } from "react-native";

import { Form } from "@/components/Form";
import { Header } from "@/components/Header";
import { AddIcon } from "@/components/Icons";

export default function Add() {
	return (
		<ScrollView className="flex-1 bg-slate-900">
			<Header />

			<Form buttonTitle={"Adicionar Item"}>
				<AddIcon color="black" />
			</Form>
		</ScrollView>
	);
}
