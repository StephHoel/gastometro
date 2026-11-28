import React from "react"
import { Text, View } from "react-native"
import { Link } from "expo-router"

import { Screen } from "@/components/Screen"
import { ROUTES } from '@/constants/routes'

export default function NotFound() {
  return (
    <Screen className="items-center justify-center px-6">
      <View className="items-center gap-4">
        <Text className="text-center text-2xl font-bold text-white">
          Página não encontrada
        </Text>
        <Text className="text-center text-base text-slate-300">
          O endereço acessado não corresponde a uma página do Gastômetro.
        </Text>
        <Link href={ROUTES.Index} className="rounded-lg bg-lime-400 px-5 py-3 font-semibold text-slate-900">
          Voltar ao início
        </Link>
      </View>
    </Screen>
  )
}
