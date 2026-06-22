import { REMINDERS } from '@/constants/text/reminders'
import { AlertService } from '@/services/AlertService'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { ReminderService } from '@/services/ReminderService'
import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'
import { parseReminderDate } from '@/utils/functions/DateFunctions'
import { useCallback, useEffect, useRef } from 'react'
import { useFocusEffect } from 'expo-router'

export function useReminderPendingAlerts() {
  const cartStore = useCartStore()
  const reminderStore = useReminderStore()
  const queuedRef = useRef<string[]>([])
  const shownRef = useRef<Set<string>>(new Set())
  const showingRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleRetryFlush = useCallback((flush: () => void) => {
    if (retryTimeoutRef.current) return

    retryTimeoutRef.current = setTimeout(() => {
      retryTimeoutRef.current = null
      flush()
    }, 120)
  }, [])

  const flushQueue = useCallback(() => {
    if (showingRef.current) return

    const nextReminderId = queuedRef.current.shift()
    if (!nextReminderId) return

    const reminder = useReminderStore.getState().getById(nextReminderId)
    if (!reminder || !reminder.enabled || !ReminderService.isOverdue(reminder)) {
      shownRef.current.delete(nextReminderId)
      flushQueue()
      return
    }

    const list = useCartStore.getState().lists.find((candidate) => candidate.id === reminder.listId)
    const listName = list?.name ?? REMINDERS.unknown_list

    showingRef.current = true

    const shown = AlertService.show({
      title: REMINDERS.pending_alert_title,
      message: REMINDERS.pending_alert_message(reminder.title, listName),
      buttons: [
        {
          text: REMINDERS.disable_button,
          action: () => {
            void ReminderOrchestrator.disableReminder(reminder.id)
          },
        },
        {
          text: REMINDERS.button.remove,
          action: () => {
            void ReminderOrchestrator.removeReminder(reminder.id)
          },
        },
      ],
      onClose: () => {
        showingRef.current = false
        flushQueue()
      },
    })

    if (!shown) {
      showingRef.current = false
      queuedRef.current.unshift(nextReminderId)
      scheduleRetryFlush(flushQueue)
    }
  }, [scheduleRetryFlush])

  const enqueuePendingOverdues = useCallback(() => {
    const reminders = useReminderStore.getState().reminders

    const existingIds = new Set(reminders.map((reminder) => reminder.id))
    shownRef.current.forEach((id) => {
      if (!existingIds.has(id)) {
        shownRef.current.delete(id)
      }
    })

    reminders.forEach((reminder) => {
      if (!reminder.enabled || !ReminderService.isOverdue(reminder)) return
      if (shownRef.current.has(reminder.id)) return

      shownRef.current.add(reminder.id)
      queuedRef.current.push(reminder.id)
    })

    flushQueue()
  }, [flushQueue])

  const scheduleNextCheck = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    const now = Date.now()
    const nextTimestamp = useReminderStore
      .getState()
      .reminders
      .filter((reminder) => reminder.enabled)
      .map((reminder) => parseReminderDate(reminder.datetimeISO))
      .filter((candidate): candidate is Date => candidate !== null)
      .map((candidate) => candidate.getTime())
      .filter((timestamp) => timestamp > now)
      .sort((left, right) => left - right)[0]

    if (!nextTimestamp) return

    const delay = Math.max(0, nextTimestamp - now + 250)

    timeoutRef.current = setTimeout(() => {
      enqueuePendingOverdues()
      scheduleNextCheck()
    }, delay)
  }, [enqueuePendingOverdues])

  useFocusEffect(
    useCallback(() => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }

      shownRef.current.clear()
      queuedRef.current = []
      showingRef.current = false

      enqueuePendingOverdues()
      scheduleNextCheck()
    }, [enqueuePendingOverdues, scheduleNextCheck]),
  )

  useEffect(() => {
    enqueuePendingOverdues()
    scheduleNextCheck()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [enqueuePendingOverdues, scheduleNextCheck, reminderStore.reminders, cartStore.lists])
}
