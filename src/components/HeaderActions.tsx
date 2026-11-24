import { Back, Cart, Delete, Market, Notification, Share } from "@/components/TouchableIcons"
import { useListIdParam } from '@/hooks/useParams'
import { HeaderActionsProps } from '@/interfaces/HeaderActionsProps'
import { AlertService } from "@/services/AlertService"
import { useCartStore } from "@/stores/CartStore"
import { useRouter } from "expo-router"
import React from "react"

export function HeaderActions({ routeName, activeListId }: HeaderActionsProps) {
  const cartStore = useCartStore()
  const router = useRouter()
  const listId = useListIdParam()

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
          action={shareActions}
        />
      </>
    )
  }

  function priceComparisonActions() {
    return (
      <>
        <Market action={() => router.push("/price-comparison/market/add")} />
        <Cart action={() => router.push("/price-comparison/cart/add")} />
      </>
    )
  }

  switch (routeName) {
    case "index": return indexActions()
    case "price-comparison": return priceComparisonActions()

    case "price-comparison/market/add":
    case "price-comparison/cart/add":
    case "price-comparison/market/edit/[marketId]":
    case "price-comparison/cart/edit/[cartId]":
      return <Back action={() => router.push(`/price-comparison`)} />

    case "calculator": return null

    case "reminders/[listId]/edit/[reminderId]":
    case "reminders/[listId]/new":
      return <Back action={() => router.push(`/reminders/${listId}`)} />

    default:
      return <Back action={() => router.push("/")} />
  }
}