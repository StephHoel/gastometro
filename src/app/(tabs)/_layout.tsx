import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context"
import { Tabs, usePathname, useRouter } from "expo-router"

import {
  addNotificationResponseReceivedListener,
  AndroidImportance,
  clearLastNotificationResponse,
  getLastNotificationResponse,
  setNotificationChannelAsync,
  setNotificationHandler,
  type NotificationResponse,
} from 'expo-notifications'

import { CalculatorIcon, HomeIcon, ListIcon } from "@/components/Icons"

import { PersistenceRecoveryService } from '@/services/PersistenceRecoveryService'
import { NotificationService } from '@/services/NotificationService'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { ServiceWorkerService } from '@/services/ServiceWorkerService'

import { getListIdsSignature, getReminderSyncSignature } from '@/utils/functions/ReminderSyncKey'
import { updateWebTitle } from '@/utils/functions/UpdateWebTitle'
import { isAndroid, isNative, isWeb } from '@/utils/platform'

import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'

import { COLORS } from '@/constants/color'
import { ERROR } from '@/constants/text/error'
import { ROUTES } from '@/constants/routes'

import "@/styles/global.css"

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
  const previousReminderSyncRef = useRef<Map<string, string> | null>(null)
  const bootstrapCompletedRef = useRef(false)
  const previousListIdsKeyRef = useRef<string | null>(null)
  const listIdsKeyRef = useRef(listIdsKey)
  listIdsKeyRef.current = listIdsKey

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
            router.replace(ROUTES.Index)
          }
          return
        }

        if (activeListId !== targetList.id) {
          setActiveList(targetList.id)
        }

        if (pathname !== '/') {
          router.replace(ROUTES.Index)
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
    const unsubscribe = useReminderStore.persist.onFinishHydration(() => setRemindersHydrated(true))
    return unsubscribe
  }, [])

  useEffect(() => { updateWebTitle(pathname) }, [pathname])

  useEffect(() => {
    if (isNative) return

    const redirect = window.sessionStorage.getItem('redirect')
    if (!redirect) return

    window.sessionStorage.removeItem('redirect')

    const redirectUrl = new URL(redirect, window.location.origin)
    window.history.replaceState(
      window.history.state,
      '',
      redirectUrl.pathname + redirectUrl.search + redirectUrl.hash,
    )
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [])

  useEffect(() => {
    if (isWeb) {
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

    if (isAndroid) {
      void setNotificationChannelAsync('default', {
        name: 'Lembretes',
        importance: AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: COLORS.active,
      })
    }
  }, [])

  useEffect(() => {
    if (isWeb || !cartHydrated) return

    let isMounted = true

    async function bootstrapNotificationOpen() {
      try {
        const lastResponse = getLastNotificationResponse()
        if (!isMounted || !lastResponse) return

        await handleNotificationResponseRef.current(lastResponse)
        clearLastNotificationResponse()
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
    const currentReminderSync = new Map<string, string>(
      reminders.map((reminder): [string, string] => [
        reminder.id,
        JSON.stringify([
          reminder.id,
          reminder.title,
          reminder.datetimeISO,
          reminder.enabled,
          reminder.listId,
        ]),
      ]),
    )
    const previousReminderSync = previousReminderSyncRef.current
    const previousListIdsKey = previousListIdsKeyRef.current
    const isInitialBootstrap = !bootstrapCompletedRef.current
    const listsChanged = previousListIdsKey !== null && previousListIdsKey !== listIdsKey
    const changedReminderIds = new Set<string>()

    if (!isInitialBootstrap && !listsChanged && previousReminderSync) {
      for (const [reminderId, signature] of currentReminderSync) {
        if (previousReminderSync.get(reminderId) !== signature) {
          changedReminderIds.add(reminderId)
        }
      }
      for (const reminderId of previousReminderSync.keys()) {
        if (!currentReminderSync.has(reminderId)) {
          changedReminderIds.add(reminderId)
        }
      }
    }

    previousReminderSyncRef.current = currentReminderSync
    previousListIdsKeyRef.current = listIdsKey

    async function synchronizeReminders() {
      try {
        if (isInitialBootstrap || listsChanged) {
          const listIds = listIdsKey ? listIdsKey.split('|') : []
          const cleanupCompleted = await ReminderOrchestrator.cleanupOrphans(listIds)
          if (!isMounted || !cleanupCompleted) return
          await ReminderOrchestrator.syncWithPermissions()
          if (isMounted) bootstrapCompletedRef.current = true
          return
        }

        if (changedReminderIds.size > 0) {
          await Promise.all(
            [...changedReminderIds].map((reminderId) =>
              ReminderOrchestrator.syncReminder(reminderId),
            ),
          )
        }
      } catch (error) {
        console.error(ERROR.reminder_bootstrap_failure, error)
      }
    }

    void synchronizeReminders()

    return () => {
      isMounted = false
    }
  }, [listIdsKey, remindersSignature, remindersHydrated, cartHydrated])

  useEffect(() => {
    if (!remindersHydrated || !cartHydrated || isWeb) return

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void ReminderOrchestrator.syncWithPermissions()
      }
    })

    return () => subscription.remove()
  }, [remindersHydrated, cartHydrated])

  useEffect(() => {
    if (!remindersHydrated || isWeb) return

    let isMounted = true
    let syncInProgress = false
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || syncInProgress) return

      syncInProgress = true
      void (async () => {
        try {
          const listIds = listIdsKeyRef.current ? listIdsKeyRef.current.split('|') : []
          const cleanupCompleted = await ReminderOrchestrator.cleanupOrphans(listIds)
          if (isMounted && cleanupCompleted) {
            await ReminderOrchestrator.syncWithPermissions()
            bootstrapCompletedRef.current = true
          }
        } catch (error) {
          console.error(ERROR.reminder_bootstrap_failure, error)
        } finally {
          syncInProgress = false
        }
      })()
    })

    return () => {
      isMounted = false
      subscription.remove()
    }
  }, [remindersHydrated])

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
          listeners={{
            focus: () => updateWebTitle('/'),
          }}
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
          listeners={{
            focus: () => updateWebTitle('/lists'),
          }}
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
          listeners={{
            focus: () => updateWebTitle('/bills'),
          }}
          options={{
            title: "Contas",
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size - 4, fontWeight: "bold" }}>R$</Text>
            ),
            headerTitle: "Contas a pagar",
          }}
        />

        <Tabs.Screen
          name="price-comparison"
          listeners={{
            focus: () => updateWebTitle('/price-comparison'),
          }}
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
          listeners={{
            focus: () => updateWebTitle('/calculator'),
          }}
          options={{
            title: "Calculadora",
            tabBarIcon: ({ color, size }) => (
              <CalculatorIcon size={size} color={color as string} />
            ),
            headerTitle: "Calculadora",
          }}
        />
      </Tabs>
    </SafeAreaView>
  )
}
