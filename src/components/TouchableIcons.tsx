import { AddIcon, BackIcon, DeleteIcon, ShareIcon } from "@/components/Icons";
import type { IconProps } from "@/interfaces/IconProps";
import { TouchableOpacity, View } from "react-native";

export function Add({ action }: IconProps) {
	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={action}
			className="absolute bottom-6 right-6 z-50"
		>
			<View className="bg-lime-400 rounded-full w-14 h-14 items-center justify-center">
				<AddIcon size={35} color="black" />
			</View>
		</TouchableOpacity>
	);
}

export function Delete({ action }: IconProps) {
	return (
		<TouchableOpacity activeOpacity={0.7} onPress={action}>
			<DeleteIcon size={35} />
		</TouchableOpacity>
	);
}

export function Share({ action }: IconProps) {
	return (
		<TouchableOpacity activeOpacity={0.7} onPress={action}>
			<ShareIcon size={35} />
		</TouchableOpacity>
	);
}

export function Back({ action }: IconProps) {
	return (
		<TouchableOpacity activeOpacity={0.7} onPress={action}>
			<BackIcon size={35} />
		</TouchableOpacity>
	);
}
