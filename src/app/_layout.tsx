import React from "react"
import { Stack } from "expo-router"

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />

      <Stack.Screen name="list/add" />
      <Stack.Screen name="list/edit/[id]" />

      <Stack.Screen name="reminders/index" />
      <Stack.Screen name="reminders/[listId]" />
      <Stack.Screen name="reminders/[listId]/new" />
      <Stack.Screen name="reminders/[listId]/edit/[reminderId]" />

      <Stack.Screen name="price-comparison/market/add" />
      <Stack.Screen name="price-comparison/market/edit/[marketId]" />
      <Stack.Screen name="price-comparison/cart/add" />
      <Stack.Screen name="price-comparison/cart/edit/[cartId]" />

      <Stack.Screen name="backup" />
    </Stack>
  )
}
