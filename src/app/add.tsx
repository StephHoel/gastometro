import { Feather } from "@expo/vector-icons";
import { ScrollView } from "react-native";

import { Form } from "@/components/Form";
import { Header } from "@/components/Header";

export default function Add() {
	return (
		<ScrollView className="flex-1 bg-slate-900">
			<Header />

			<Form buttonTitle={"Adicionar Item"}>
				<Feather name="plus-circle" size={20} />
			</Form>
		</ScrollView>
	);
}
