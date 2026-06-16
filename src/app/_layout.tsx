import { Tabs, usePathname } from "expo-router"

import { CalculatorIcon, HomeIcon, ListIcon } from "@/components/Icons"
import { SafeAreaView } from "react-native-safe-area-context"
import React, { useEffect } from 'react'
import { Platform } from 'react-native'
import "@/styles/global.css"
import { colors } from '@/constants/color'

export default function Layout() {
  const pathname = usePathname()

  useEffect(() => {
    if (Platform.OS !== 'web') return

    const titles: Record<string, string> = {
      "/": "Gastômetro",
      "/calculator": "Calculadora",
    }

    document.title = titles[pathname] ?? "Gastômetro"
  }, [pathname])

  return (
    <SafeAreaView className="bg-slate-900 flex-1" edges={['top']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderColor: "transparent",
          },
          tabBarActiveTintColor: colors.active,
          tabBarInactiveTintColor: colors.inactive,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            // href: null,
            title: "Início",
            tabBarIcon: ({ color, size }) => (
              <HomeIcon size={size} color={color as string} />
            ),
            headerTitle: "Início",
          }}
        />

        <Tabs.Screen 
          name="lists"
          options={{ 
            // href: null,
            title: "Listas",
            tabBarIcon: ({ color, size }) => (
              <ListIcon size={size} color={color as string} />
            ),
            headerTitle: "Listas", 
          }} 
        />

        <Tabs.Screen
          name="calculator"
          options={{
            // href: null,
            title: "Calculadora",
            tabBarIcon: ({ color, size }) => (
              <CalculatorIcon size={size} color={color as string} />
            ),
            headerTitle: "Calculadora",
          }}
        />

        <Tabs.Screen name="list/add" options={{ href: null }} />
        <Tabs.Screen name="list/edit/[id]" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  )
}
