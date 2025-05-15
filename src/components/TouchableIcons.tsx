import { AddIcon, BackIcon, DeleteIcon, ShareIcon } from "@/components/Icons";
import type { IconProps } from "@/interfaces/IconProps";
import { TouchableOpacity } from "react-native";

export function Add({ action }: IconProps) {
	return (
		<TouchableOpacity activeOpacity={0.7} onPress={action}>
			<AddIcon size={35} />
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
