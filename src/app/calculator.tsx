import { CustomButton as Button } from "@/components/Button";
import { CustomInput } from "@/components/CustomInput";
import { Header } from "@/components/Header";
import { text } from "@/constants/text";
import { AlertService } from "@/services/AlertService";
import { Divide, SetCurrency } from "@/utils/functions/MathFunctions";
import { useEffect, useRef, useState } from "react";
import { Keyboard, Text, TextInput, View } from "react-native";

export default function Calculator() {
	const [answer, setAnswer] = useState<number | null>(null);

	const [price, setPrice] = useState("");
	const [quantity, setQuantity] = useState("");
	const [unit, setUnit] = useState("");
		
	const inputRef1 = useRef<TextInput>(null);
	const inputRef2 = useRef<TextInput>(null);
	const inputRef3 = useRef<TextInput>(null);

	useEffect(() => {
		inputRef1.current?.focus()
	},[])
	
	function clear() {
		setPrice("")
		setQuantity("")
		setUnit("")
	}

	function handleToCalc() {
		Keyboard.dismiss();

		if (price === "" || quantity === "")
			return AlertService.ok("Erro", text.error.campos_nao_preenchidos)

		setAnswer(Divide(price, quantity));
	}

	function handleToClear() {
		Keyboard.dismiss();
		clear()
		setAnswer(null);
	}

	return (
		<View className="flex-1 bg-slate-900">
			<Header />

			<View className="mt-5 gap-5">
				<CustomInput
					nameField={"Preço"}
					selfRef={inputRef1}
					placeholder={"Preço da Embalagem"}
					setItem={setPrice}
					item={price}
					keyboardType="number-pad"
					onSubmit={() => inputRef2.current?.focus()}
					returnKeyType={"next"}
				/>

				<CustomInput
					nameField={"Quantidade"}
					selfRef={inputRef2}
					placeholder={"Quantidade na Embalagem"}
					setItem={setQuantity}
					item={quantity}
					keyboardType="number-pad"
					// onSubmit={() => inputRef3.current?.focus()}
					// returnKeyType={"next"}
					onSubmit={handleToCalc}
					returnKeyType={"done"}
				/>

				{/* <CustomInput
					nameField={"Unidade"}
					selfRef={inputRef3}
					placeholder={"Unidade de Medida (seletor)"}
					setItem={setUnit}
					item={unit}
					onSubmit={handleToCalc}
					returnKeyType={"done"}
				/> */}

				<View className="flex-1 flex-row justify-between">
					<Button type="Normal" onPress={handleToClear} className="flex-1 border mr-2">
						<Button.Text>Limpar</Button.Text>
					</Button>

					<Button onPress={handleToCalc} className="flex-1 border ml-2">
						<Button.Text>Calcular</Button.Text>
					</Button>
				</View>

				<View className="border border-white rounded-2xl mx-5 p-4 gap-2 text-white">
					<Text className="text-white">Preço por Unidade:</Text>
					<Text className="text-white">
						{answer == null ? "Resposta" : `${SetCurrency(answer)}`}
					</Text>
				</View>
			</View>
		</View>
	);
}
