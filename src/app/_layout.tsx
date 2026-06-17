import { Tabs, usePathname, useRouter } from "expo-router"

import { CalculatorIcon, HomeIcon, ListIcon } from "@/components/Icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { NotificationService } from '@/services/NotificationService'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { useCartStore } from '@/stores/CartStore'
import React, { useCallback, useEffect } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import type { NotificationResponse } from 'expo-notifications'
import "@/styles/global.css"
import { colors } from '@/constants/color'
import { TITLES } from '@/constants/titles'

export default function Layout() {
  const pathname = usePathname()
  const router = useRouter()
  const cartStore = useCartStore()

  const handleNotificationResponse = useCallback(
    async (response: NotificationResponse) => {
      try {
        const data = response.notification.request.content.data
        const listId = NotificationService.getListIdFromNotification(data)
        const reminderId = NotificationService.getReminderIdFromNotification(data)

        if (!listId) return

        const targetList = cartStore.lists.find((list) => list.id === listId)

        if (!targetList) {
          if (reminderId) {
            await ReminderOrchestrator.removeReminder(reminderId)
          }
          router.push('/')
          return
        }

        cartStore.setActiveList(targetList.id)
        router.push('/')
      } catch (error) {
        console.error('Falha ao tratar resposta de notificacao:', error)
      }
    },
    [cartStore, router],
  )

  useEffect(() => {
    if (Platform.OS !== 'web') return
    document.title = TITLES[pathname] ?? "Gastômetro"
  }, [pathname])

  useEffect(() => {
    if (Platform.OS === 'web') return

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    })
  }, [])

  useEffect(() => {
    if (Platform.OS === 'web') return

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      void handleNotificationResponse(response)
    })

    return () => {
      subscription.remove()
    }
  }, [handleNotificationResponse])

  useEffect(() => {
    let isMounted = true

    async function bootstrapReminders() {
      try {
        const listIds = cartStore.lists.map((list) => list.id)
        await ReminderOrchestrator.cleanupOrphans(listIds)
        await ReminderOrchestrator.syncWithPermissions()

        if (Platform.OS === 'web') return

        const lastResponse = await Notifications.getLastNotificationResponseAsync()
        if (!isMounted || !lastResponse) return

        await handleNotificationResponse(lastResponse)
      } catch (error) {
        console.error('Falha na inicializacao de lembretes:', error)
      }
    }

    void bootstrapReminders()

    return () => {
      isMounted = false
    }
  }, [cartStore.lists, handleNotificationResponse])

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
        <Tabs.Screen name="reminders/index" options={{ href: null }} />
        <Tabs.Screen name="reminders/[listId]" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  )
}
