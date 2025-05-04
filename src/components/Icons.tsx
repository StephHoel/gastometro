import type { IconsProps } from "@/interfaces/IconsProps";
import IonIcons from "@expo/vector-icons/Ionicons";

export function AddIcon({ size = 24, color = "white" }: IconsProps) {
	return <IonIcons name="add-circle-outline" size={size} color={color} />;
}

export function BackIcon({ size = 24, color = "white" }: IconsProps) {
	return <IonIcons name="arrow-back" size={size} color={color} />;
}

export function CalculatorIcon({ size = 24, color = "white" }: IconsProps) {
	return <IonIcons name="calculator" size={size} color={color} />;
}

export function CheckboxIcon({ checked, size = 24 }: IconsProps) {
	return (
		<IonIcons
			name={checked ? "checkbox" : "square"}
			color={checked ? "#22c55e" : "white"}
			size={size}
		/>
	);
}

export function DeleteIcon({ size = 24, color = "white" }: IconsProps) {
	return <IonIcons name="trash-outline" size={size} color={color} />;
}

export function EditIcon({ size = 24, color = "white" }: IconsProps) {
	return <IonIcons name="pencil" size={size} color={color} />;
}

export function HomeIcon({ size = 24, color = "white" }: IconsProps) {
	return <IonIcons name="home" size={size} color={color} />;
}

export function ShareIcon({ size = 24, color = "white" }: IconsProps) {
	return <IonIcons name="share-social-outline" size={size} color={color} />;
}
