import { Tabs, usePathname, useRouter } from "expo-router"

import { CalculatorIcon, HomeIcon, ListIcon } from "@/components/Icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { NotificationService } from '@/services/NotificationService'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { ServiceWorkerService } from '@/services/ServiceWorkerService'
import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'
import { getListIdsSignature, getReminderSyncSignature } from '@/utils/functions/ReminderSyncKey'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, Platform, Text, TouchableOpacity, View } from 'react-native'
import { addNotificationResponseReceivedListener, AndroidImportance, clearLastNotificationResponseAsync, getLastNotificationResponseAsync, setNotificationChannelAsync, setNotificationHandler, type NotificationResponse } from 'expo-notifications'
import "@/styles/global.css"
import { COLORS } from '@/constants/color'
import { TITLES } from '@/constants/titles'
import { ERROR } from '@/constants/text/error'
import { PersistenceRecoveryService } from '@/services/PersistenceRecoveryService'

export default function Layout() {
  const pathname = usePathname()
  const router = useRouter()
  const lists = useCartStore((state) => state.lists)
  const activeListId = useCartStore((state) => state.activeListId)
  const setActiveList = useCartStore((state) => state.setActiveList)
  const reminders = useReminderStore((state) => state.reminders)
  const [remindersHydrated, setRemindersHydrated] = useState(useReminderStore.persist.hasHydrated())
  const [cartHydrated, setCartHydrated] = useState(useCartStore.persist.hasHydrated())
  const [recoveryNotice, setRecoveryNotice] = useState(PersistenceRecoveryService.getMessage())
  const listIdsKey = getListIdsSignature(lists)
  const remindersSignature = getReminderSyncSignature(reminders)
  const handledNotificationKeysRef = useRef(new Set<string>())

  const handleNotificationResponse = useCallback(
    async (response: NotificationResponse) => {
      try {
        const responseKey = `${response.notification.request.identifier}:${response.actionIdentifier}`
        if (handledNotificationKeysRef.current.has(responseKey)) return

        handledNotificationKeysRef.current.add(responseKey)

        const data = response.notification.request.content.data
        const listId = NotificationService.getListIdFromNotification(data)
        const reminderId = NotificationService.getReminderIdFromNotification(data)

        if (!listId) return

        const targetList = lists.find((list) => list.id === listId)

        if (!targetList) {
          if (reminderId) {
            await ReminderOrchestrator.removeReminder(reminderId)
          }
          if (pathname !== '/') {
            router.replace('/')
          }
          return
        }

        if (activeListId !== targetList.id) {
          setActiveList(targetList.id)
        }

        if (pathname !== '/') {
          router.replace('/')
        }
      } catch (error) {
        console.error(ERROR.notification_response_failure, error)
      }
    },
    [activeListId, lists, pathname, router, setActiveList],
  )

  const handleNotificationResponseRef = useRef<(response: NotificationResponse) => Promise<void>>(async () => undefined)
  handleNotificationResponseRef.current = handleNotificationResponse

  useEffect(() => PersistenceRecoveryService.subscribe(setRecoveryNotice), [])

  useEffect(() => {
    const unsubscribe = useCartStore.persist.onFinishHydration(() => setCartHydrated(true))
    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = useReminderStore.persist.onFinishHydration(() => setRemindersHydrated(true))
    return unsubscribe
  }, [])

  useEffect(() => {
    if (Platform.OS !== 'web') return
    document.title = TITLES[pathname] ?? "Gastômetro"
  }, [pathname])

  useEffect(() => {
    if (Platform.OS === 'web') {
      void ServiceWorkerService.register()
      return
    }

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
    if (Platform.OS === 'web' || !cartHydrated) return

    let isMounted = true

    async function bootstrapNotificationOpen() {
      try {
        const lastResponse = await getLastNotificationResponseAsync()
        if (!isMounted || !lastResponse) return

        await handleNotificationResponseRef.current(lastResponse)
        await clearLastNotificationResponseAsync()
      } catch (error) {
        console.error(ERROR.reminder_bootstrap_failure, error)
      } finally {
        await NotificationService.clearDeliveredNotifications()
      }
    }

    void bootstrapNotificationOpen()

    const subscription = addNotificationResponseReceivedListener((response) => {
      void handleNotificationResponseRef.current(response)
    })

    return () => {
      isMounted = false
      subscription.remove()
    }
  }, [cartHydrated])

  useEffect(() => {
    if (!remindersHydrated || !cartHydrated) return

    let isMounted = true

    async function bootstrapReminders() {
      try {
        const listIds = listIdsKey ? listIdsKey.split('|') : []
        const cleanupCompleted = await ReminderOrchestrator.cleanupOrphans(listIds)
        if (!isMounted || !cleanupCompleted) return
        await ReminderOrchestrator.syncWithPermissions()
      } catch (error) {
        console.error(ERROR.reminder_bootstrap_failure, error)
      }
    }

    void bootstrapReminders()

    return () => {
      isMounted = false
    }
  }, [listIdsKey, remindersSignature, remindersHydrated, cartHydrated])

  useEffect(() => {
    if (!remindersHydrated || !cartHydrated || Platform.OS === 'web') return

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void ReminderOrchestrator.syncWithPermissions()
      }
    })

    return () => subscription.remove()
  }, [remindersHydrated, cartHydrated])

  return (
    <SafeAreaView className="bg-slate-900 flex-1" edges={['top']}>
      {recoveryNotice && (
        <View className="bg-amber-900 px-4 py-3 gap-2">
          <Text className="text-white text-sm">{recoveryNotice}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar aviso de recuperação" onPress={() => PersistenceRecoveryService.dismiss()}>
            <Text className="text-amber-200 font-bold text-right">Fechar aviso</Text>
          </TouchableOpacity>
        </View>
      )}
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
            title: "Listas",
            tabBarIcon: ({ color, size }) => (
              <ListIcon size={size} color={color as string} />
            ),
            headerTitle: "Listas",
          }}
        />

        <Tabs.Screen
          name="bills"
          options={{
            title: "Contas",
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size-4, fontWeight: "bold" }}>R$</Text>
            ),
            headerTitle: "Contas a pagar",
          }}
        />

        <Tabs.Screen
          name="price-comparison"
          options={{
            title: "Preços",
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size - 4, fontWeight: "bold" }}>$</Text>
            ),
            headerTitle: "Comparação de preços",
          }}
        />

        <Tabs.Screen
          name="calculator"
          options={{
            title: "Calculadora",
            tabBarIcon: ({ color, size }) => (
              <CalculatorIcon size={size} color={color as string} />
            ),
            headerTitle: "Calculadora",
          }}
        />

        <Tabs.Screen name="backup" options={{ title: "Dados", tabBarButton: () => null }} />
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
