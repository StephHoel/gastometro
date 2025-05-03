import { Header } from "@/components/Header";
import { CheckboxIcon, DeleteIcon, EditIcon } from "@/components/Icons";
import { useCartStore } from "@/stores/CartStore";
import { FormatCurrency } from "@/utils/functions/FormatCurrency";
import { Multiply } from "@/utils/functions/MathFunctions";
import { FormatTextLine } from "@/utils/functions/StringFunctions";
import type { ProductProps } from "@/utils/interfaces";
import { Link } from "expo-router";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
	const cartStore = useCartStore();

	const total = cartStore.products.reduce(
		(acc: number, currentItem: ProductProps) =>
			acc + Multiply(currentItem.quantity, currentItem.price),
		0,
	);

	function handleRemove(prod: ProductProps): void {
		Alert.alert("Remover item", `Deseja remover: ${prod.item}?`, [
			{
				text: "Cancelar",
			},
			{
				text: "Remover",
				onPress: () => cartStore.remove(prod.id),
			},
		]);
	}

	function toggleCollected(prod: ProductProps): void {
		prod.collected = !prod.collected;
		cartStore.edit(prod);
	}

	return (
		<View className="flex-1 bg-slate-900">
			<Header />

			<Text className="text-white text-center pt-2 pb-4">
				Total: {FormatCurrency(total)}
			</Text>

			<ScrollView>
				{cartStore.products.map((prod: ProductProps, i: number) => (
					<View className="px-4 pt-2 pb-5" key={prod.id}>
						<View className="flex-row gap-2 items-center">
							<TouchableOpacity onPress={() => handleRemove(prod)}>
								<DeleteIcon />
							</TouchableOpacity>

							<Link href={`/edit/${prod.id}`} asChild>
								<TouchableOpacity>
									<EditIcon />
								</TouchableOpacity>
							</Link>

							<TouchableOpacity
								className="flex-row items-center space-x-2"
								onPress={() => toggleCollected(prod)}
							>
								<CheckboxIcon checked={prod.collected} />
							</TouchableOpacity>

							<Text
								className={`pl-2 mr-14 text-xl 
                    ${prod.collected ? " line-through text-gray-600 " : " text-white "}`}
							>
								{FormatTextLine(prod)}
							</Text>
						</View>
						{i !== cartStore.products.length - 1 && (
							<View className="border-b border-gray-500 pt-2" />
						)}
					</View>
				))}
			</ScrollView>
		</View>
	);
}
