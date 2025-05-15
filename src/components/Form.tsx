import { useEffect, useRef, useState } from "react";
import type { TextInput } from "react-native";
import { View } from "react-native";
import uuid from "react-native-uuid";

import { useCartStore } from "@/stores/CartStore";

import { CustomButton as Button } from "@/components/Button";
import { CustomAlert, type CustomAlertRef } from "@/components/CustomAlert";
import { CustomInput } from "@/components/CustomInput";
import { text } from "@/constants/text";
import type { FormProps } from "@/interfaces/FormProps";
import { AlertService } from "@/services/AlertService";
import { ProductService } from "@/services/ProductService";
import { useRouter } from "expo-router";

export function Form({ data = undefined, buttonTitle, children }: FormProps) {
	const [item, setItem] = useState("");
	const [qtt, setQtt] = useState("");
	const [price, setPrice] = useState("");
	const [collected, setCollected] = useState(false);

	const cartStore = useCartStore();
	const navigation = useRouter();

	const inputRef1 = useRef<TextInput>(null);
	const inputRef2 = useRef<TextInput>(null);
	const inputRef3 = useRef<TextInput>(null);
	const alertRef = useRef<CustomAlertRef>(null);

	useEffect(() => {
		if (alertRef.current) {
			AlertService.init(alertRef.current);
		}
	}, []);

	function handleSubmit(): void {
		if (item === "") {
			AlertService.alert("Erro", text.error.campos_nao_preenchidos);
		} else {
			const product = ProductService.createOrUpdateProduct({
				id: data?.id || uuid.v4().toString(),
				item,
				qtt,
				price,
				collected,
			});

			if (data !== undefined) cartStore.edit(product);
			else cartStore.add(product);

			navigation.push("/");

			setItem("");
			setQtt("");
			setPrice("");
			setCollected(false);
		}
	}

	useEffect(() => {
		if (data !== undefined) {
			setItem(data.item);
			setQtt(data.quantity);
			setPrice(data.price);
			setCollected(data.collected);
		}
	}, [data]);

	return (
		<View className="my-5 gap-5">
			<CustomAlert ref={alertRef} />

			<CustomInput
				nameField="Item"
				placeholder={text.input.placeholder.item}
				selfRef={inputRef1}
				returnKeyType={"next"}
				setItem={setItem}
				item={item}
				onSubmit={() => inputRef2.current?.focus()}
			/>

			<CustomInput
				nameField="Quantidade"
				placeholder={text.input.placeholder.quantity}
				selfRef={inputRef2}
				returnKeyType={"next"}
				keyboardType={"number-pad"}
				setItem={setQtt}
				item={qtt}
				onSubmit={() => inputRef3.current?.focus()}
			/>

			<CustomInput
				nameField="Preço"
				placeholder={text.input.placeholder.price}
				selfRef={inputRef3}
				returnKeyType={"done"}
				keyboardType={"number-pad"}
				setItem={setPrice}
				item={price}
				onSubmit={handleSubmit}
			/>

			<Button onPress={handleSubmit}>
				<Button.Icon>{children}</Button.Icon>
				<Button.Text>{buttonTitle}</Button.Text>
			</Button>
		</View>
	);
}
