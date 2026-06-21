import { Tabs, usePathname, useRouter } from "expo-router"

import { CalculatorIcon, HomeIcon, ListIcon } from "@/components/Icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { NotificationService } from '@/services/NotificationService'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { useCartStore } from '@/stores/CartStore'
import React, { useCallback, useEffect } from 'react'
import { Platform } from 'react-native'
import { addNotificationResponseReceivedListener, AndroidImportance, getLastNotificationResponse, setNotificationChannelAsync, setNotificationHandler, type NotificationResponse } from 'expo-notifications'
import "@/styles/global.css"
import { COLORS } from '@/constants/color'
import { TITLES } from '@/constants/titles'
import { ERROR } from '@/constants/text/error'

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
        console.error(ERROR.notification_response_failure, error)
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

    setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    })

    if (Platform.OS === 'android') {
      void setNotificationChannelAsync('default', {
        name: 'Lembretes',
        importance: AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: COLORS.active,
      })
    }
  }, [])

  useEffect(() => {
    if (Platform.OS === 'web') return

    let isMounted = true

    async function bootstrapNotificationOpen() {
      try {
        const lastResponse = getLastNotificationResponse()
        if (!isMounted || !lastResponse) return

        await handleNotificationResponse(lastResponse)
      } catch (error) {
        console.error(ERROR.reminder_bootstrap_failure, error)
      } finally {
        await NotificationService.clearDeliveredNotifications()
      }
    }

    void bootstrapNotificationOpen()

    const subscription = addNotificationResponseReceivedListener((response) => {
      void handleNotificationResponse(response)
    })

    return () => {
      isMounted = false
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

        if (!isMounted) return
      } catch (error) {
        console.error(ERROR.reminder_bootstrap_failure, error)
      }
    }

    void bootstrapReminders()

    return () => {
      isMounted = false
    }
  }, [cartStore.lists])

  return (
    <SafeAreaView className="bg-slate-900 flex-1" edges={['top']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.background,
            borderColor: "transparent",
          },
          tabBarActiveTintColor: COLORS.active,
          tabBarInactiveTintColor: COLORS.inactive,
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
        <Tabs.Screen name="reminders/[listId]/index" options={{ href: null }} />
        <Tabs.Screen name="reminders/[listId]/new" options={{ href: null }} />
        <Tabs.Screen name="reminders/[listId]/edit/[reminderId]" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  )
}
