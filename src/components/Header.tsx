import { CustomAlert } from "@/components/CustomAlert"
import type { CustomAlertRef } from "@/interfaces/CustomAlertRef"
import { Add } from "@/components/TouchableIcons"
import { titlePages } from "@/constants/pages"
import type { CurrentRoute } from "@/interfaces/CurrentRoute"
import { HeaderActions } from "@/components/HeaderActions"
import { useInitAlert } from '@/hooks/useInitAlert'
import { Row } from '@/components/Row'
import { useRoute } from "expo-router/react-navigation"
import { useRouter } from "expo-router"
import React, { useRef } from "react"
import { View } from "react-native"
import { TextWhite } from '@/components/TextWhite'
import { Divider } from '@/components/Divider'

export function Header({ activeListId }: { activeListId?: string }) {
  const route = useRoute<CurrentRoute>()
  const router = useRouter()
  const alertRef = useRef<CustomAlertRef | null>(null)

  useInitAlert(alertRef)

  return (
    <>
      <CustomAlert ref={alertRef} />

      <View className="pt-4 px-3 flex-row justify-between">
        <View className="flex-1" />

        <TextWhite className="text-2xl font-heading flex-1 text-center">
          {titlePages[route.name as keyof typeof titlePages]}
        </TextWhite>

        <View className="flex-1 flex-row">
          <Row className="gap-4 items-center" style={{ marginLeft: 'auto' }}>
            <HeaderActions routeName={route.name} activeListId={activeListId} />
          </Row>
        </View>
      </View>

      <Divider className="border-white pt-3 mx-2" />

      {route.name === "index" && <Add action={() => router.push("/list/add")} />}
    </>
  )
}
