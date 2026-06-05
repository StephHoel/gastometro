import { Tabs } from "expo-router"

import { CalculatorIcon, HomeIcon } from "@/components/Icons"
import { SafeAreaView } from "react-native-safe-area-context"
import React from 'react'
import "@/styles/global.css"

export default function Layout() {
  return (
    <SafeAreaView className="bg-slate-900 flex-1" edges={['top']}>
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
            // href: null,
            title: "Início",
            tabBarIcon: ({ color, size }) => (
              <HomeIcon size={size} color={color.toString()} />
            ),
          }}
        />

        <Tabs.Screen
          name="calculator"
          options={{
            // href: null,
            title: "Calculadora",
            tabBarIcon: ({ color, size }) => (
              <CalculatorIcon size={size} color={color.toString()} />
            ),
          }}
        />

        <Tabs.Screen name="list/add" options={{ href: null }} />
        <Tabs.Screen name="list/edit/[id]" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  )
}
