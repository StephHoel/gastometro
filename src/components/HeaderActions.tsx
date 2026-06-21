import { Back, Delete, Notification, Share } from "@/components/TouchableIcons"
import { getListIdParam } from '@/hooks/getParams'
import { HeaderActionsProps } from '@/interfaces/HeaderActionsProps'
import { AlertService } from "@/services/AlertService"
import { useCartStore } from "@/stores/CartStore"
import { useRouter } from "expo-router"
import React from "react"

export function HeaderActions({ routeName, activeListId }: HeaderActionsProps) {
  const cartStore = useCartStore()
  const router = useRouter()

  function notificationActions() {
    if (activeListId)
      router.push(`/reminders/${activeListId}`)
    else
      router.push('/reminders')
  }

  async function shareActions() {
    if (cartStore.products.length === 0)
      await AlertService.paste(cartStore)
    else AlertService.share(cartStore)
  }

  function indexActions() {
    return (
      <>
        <Notification action={notificationActions} />

        {cartStore.products.length > 0 && (
          <Delete
            action={() => AlertService.remove(() => cartStore.clear())}
          />
        )}

        <Share
          action={async () => shareActions}
        />
      </>
    )
  }

  switch (routeName) {
    case "index":
      return indexActions()

    case "reminders/[listId]/edit/[reminderId]":
    case "reminders/[listId]/new":
      const listId = getListIdParam()
      return <Back action={() => router.push(`/reminders/${listId}`)} />

    case "calculator":
      return null

    default:
      return <Back action={() => router.push("/")} />
  }
}