import { Tabs } from "expo-router"

import { CalculatorIcon, HomeIcon } from "@/components/Icons"
import { SafeAreaView } from "react-native-safe-area-context"
import React from 'react'
import "@/styles/global.css"
import { colors } from '@/constants/color'

export default function Layout() {
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
          }}
        />

        <Tabs.Screen name="list/add" options={{ href: null }} />
        <Tabs.Screen name="list/edit/[id]" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  )
}
