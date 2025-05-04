import { Loading } from "@/components/Loading";
import {
	Inter_700Bold as InterBold,
	Inter_500Medium as InterMedium,
	Inter_400Regular as InterRegular,
	Inter_600SemiBold as InterSemiBold,
	useFonts,
} from "@expo-google-fonts/inter";
import { Tabs } from "expo-router";

import { CalculatorIcon, HomeIcon } from "@/components/Icons";
import "@/styles/global.css";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Layout() {
	const [fontsLoaded] = useFonts({
		InterRegular,
		InterMedium,
		InterSemiBold,
		InterBold,
	});

	if (!fontsLoaded) {
		return <Loading />;
	}

	return (
		<SafeAreaView className="bg-slate-900 flex-1">
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarStyle: {
						backgroundColor: "#0f172a",
						borderColor: "transparent",
					},
					tabBarActiveTintColor: "#22d3ee",
					tabBarInactiveTintColor: "#94a3b8",
				}}
			>
				<Tabs.Screen
					name="index"
					options={{
						href: null,
						// title: "Início",
						// tabBarIcon: ({ color, size }) => (
						// 	<HomeIcon size={size} color={color} />
						// ),
					}}
				/>

				<Tabs.Screen
					name="calculator"
					options={{
						href: null,
						// title: "Calculadora",
						// tabBarIcon: ({ color, size }) => (
						// 	<CalculatorIcon size={size} color={color} />
						// ),
					}}
				/>

				<Tabs.Screen name="add" options={{ href: null }} />
				<Tabs.Screen name="edit/[id]" options={{ href: null }} />
			</Tabs>
		</SafeAreaView>
	);
}
