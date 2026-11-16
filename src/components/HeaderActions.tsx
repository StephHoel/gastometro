import { Back, Delete, Notification, Share } from "@/components/TouchableIcons"
import { useListIdParam } from '@/hooks/useParams'
import { HeaderActionsProps } from '@/interfaces/HeaderActionsProps'
import { AlertService } from "@/services/AlertService"
import { useCartStore } from "@/stores/CartStore"
import { useRouter } from "expo-router"
import React from "react"
import { Text, TouchableOpacity } from "react-native"

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
        <Notification action={notificationActions} accessibilityLabel={activeListId ? "Abrir lembretes da lista ativa" : "Abrir central de lembretes"} />

        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Abrir backup e restauração" onPress={() => router.push("/backup")} className="min-w-11 min-h-11 px-2 py-1 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400">
          <Text className="text-lime-400 font-semibold">Backup</Text>
        </TouchableOpacity>

        {cartStore.products.length > 0 && (
          <Delete
            action={() => AlertService.remove(() => cartStore.clear())}
            accessibilityLabel="Limpar itens da lista ativa"
          />
        )}

        <Share action={shareActions} accessibilityLabel="Compartilhar lista atual" />
      </>
    )
  }

  switch (routeName) {
    case "index":
      return indexActions()

    case "reminders/[listId]/edit/[reminderId]":
    case "reminders/[listId]/new":
      return <Back action={() => router.push(`/reminders/${listId}`)} accessibilityLabel="Voltar para a lista de lembretes" />

    case "calculator":
      return null

    default:
      return <Back action={() => router.push("/")} accessibilityLabel="Voltar para a tela inicial" />
  }
}