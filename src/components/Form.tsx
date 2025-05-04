import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";
import type { TextInput } from "react-native";
import { View } from "react-native";
import uuid from "react-native-uuid";

import { useCartStore } from "@/stores/CartStore";

import { CustomButton as Button } from "@/components/Button";
import { CustomAlert } from "@/components/CustomAlert";
import { CustomInput } from "@/components/CustomInput";
import { messages } from "@/constants/messages";
import type { ProductProps } from "@/interfaces/ProductProps";
import { ProductService } from "@/services/ProductService";
import { useRouter } from "expo-router";

interface FormProps extends PropsWithChildren {
	data?: ProductProps | null;
	buttonTitle: string;
}

export function Form({ data = null, buttonTitle, children }: FormProps) {
	const [item, setItem] = useState("");
	const [qtt, setQtt] = useState("");
	const [price, setPrice] = useState("");
	const [collected, setCollected] = useState(false);

	const cartStore = useCartStore();
	const navigation = useRouter();

	const inputRef1 = useRef<TextInput>(null);
	const inputRef2 = useRef<TextInput>(null);
	const inputRef3 = useRef<TextInput>(null);

	const { AlertComponent, showAlert } = CustomAlert({});

	function handleSubmit(): void {
		if (item === "") {
			showAlert({title: "Erro", message: messages.campos_nao_preenchidos});
		} else {
			const product = ProductService.createOrUpdateProduct({
				id: data?.id || uuid.v4().toString(),
				item,
				qtt,
				price,
				collected,
			});

			if (data !== null) cartStore.edit(product);
			else cartStore.add(product);

			navigation.push("/");

			setItem("");
			setQtt("");
			setPrice("");
			setCollected(false);
		}
	}

	useEffect(() => {
		if (data !== null) {
			setItem(data.item);
			setQtt(data.quantity);
			setPrice(data.price);
			setCollected(data.collected);
		}
	}, [data]);

	return (
		<View className="mt-4">
			{AlertComponent}

			<CustomInput
				placeholder="Item"
				selfRef={inputRef1}
				returnKeyType={"next"}
				setItem={setItem}
				item={item}
				onSubmit={() => inputRef2.current?.focus()}
			/>

			<CustomInput
				placeholder="1"
				selfRef={inputRef2}
				returnKeyType={"next"}
				keyboardType={"number-pad"}
				setItem={setQtt}
				item={qtt}
				onSubmit={() => inputRef3.current?.focus()}
			/>

			<CustomInput
				placeholder="1,30"
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
