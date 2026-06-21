import { CustomAlert } from "@/components/CustomAlert"
import type { CustomAlertRef } from "@/interfaces/CustomAlertRef"
import { Add, Back, Delete, Notification, Share } from "@/components/TouchableIcons"
import { titlePages } from "@/constants/pages"
import type { CurrentRoute } from "@/interfaces/CurrentRoute"
import { AlertService } from "@/services/AlertService"
import { useInitAlert } from '@/hooks/useInitAlert'
import { Row } from '@/components/Row'
import { useCartStore } from "@/stores/CartStore"
import { useRoute } from "expo-router/react-navigation"
import { useRouter } from "expo-router"
import React, { useRef } from "react"
import { View } from "react-native"
import { TextWhite } from '@/components/TextWhite'
import { Divider } from '@/components/Divider'

export function Header({ activeListId }: { activeListId?: string }) {
  const route = useRoute<CurrentRoute>()
  const cartStore = useCartStore()
  const navigator = useRouter()
  const alertRef = useRef<CustomAlertRef | null>(null)

  useInitAlert(alertRef)

  function buttonsByRouteName() {
    switch (route.name) {
      case "index":
        return (
          <>
            <Notification action={() => {
              if (activeListId)
                navigator.push(`/reminders/${activeListId}`)
              else
                navigator.push('/reminders')
            }} />

            {cartStore.products.length > 0 && (
              <Delete
                action={() => AlertService.remove(() => cartStore.clear())}
              />
            )}

            <Share
              action={async () => {
                if (cartStore.products.length === 0)
                  await AlertService.paste(cartStore)
                else AlertService.share(cartStore)
              }}
            />
          </>
        )

      case "calculator":
        return null
      default:
        return <Back action={() => navigator.push("/")} />
    }
  }

  return (
    <>
      <CustomAlert ref={alertRef} />

      <View className="pt-4 px-3 flex-row justify-between">
        <View className="flex-1" />

        <TextWhite className="text-2xl font-heading flex-1 text-center">
          {titlePages[route.name as keyof typeof titlePages]}
        </TextWhite>

        <View className="flex-1 flex-row">
          <Row className="gap-4 items-center" style={{ marginLeft: 'auto' }}>{buttonsByRouteName()}</Row>
        </View>
      </View>

      <Divider className="border-white pt-3 mx-2" />

      {route.name === "index" && <Add action={() => navigator.push("/list/add")} />}
    </>
  )
}
