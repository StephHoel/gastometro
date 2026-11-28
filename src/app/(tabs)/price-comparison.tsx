import { Card } from '@/components/Card'
import { Page } from '@/components/Page'
import { Row } from '@/components/Row'
import { TextWhite } from '@/components/TextWhite'
import { compareBasket, compareEntryPrices } from '@/services/PriceComparisonService'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'
import { SetCurrency } from '@/utils/functions/MathFunctions'
import React, { useMemo, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Delete } from '@/components/TouchableIcons'
import { SIZE } from '@/constants/size'
import { AlertService } from '@/services/AlertService'
import { useRouter } from 'expo-router'
import { ROUTES } from '@/constants/routes'

export default function PriceComparison() {
  const places = usePriceComparisonStore((state) => state.places)
  const entries = usePriceComparisonStore((state) => state.entries)

  const removePlace = usePriceComparisonStore((state) => state.removePlace)
  const removeEntry = usePriceComparisonStore((state) => state.removeEntry)

  const [entrySortBy, setEntrySortBy] = useState<'price' | 'name'>('price')
  const [basketSortBy, setBasketSortBy] = useState<'price' | 'name'>('price')

  const router = useRouter()

  const basket = useMemo(() => compareBasket(entries, places, basketSortBy), [entries, places, basketSortBy])
  const bestBasketPlaceId = basket
    .filter((place) => place.complete && place.total !== null)
    .sort((a, b) => (a.total ?? Infinity) - (b.total ?? Infinity))[0]?.placeId ?? null

  function formatDifference(value: number | null) {
    return value === null ? 'Não disponível' : SetCurrency(value)
  }

  function onDelete(placeId: string, placeName?: string) {
    AlertService.remove(() => {
      removePlace(placeId)
    }, placeName)
  }

  function onDeleteEntry(entryId: string, entryName?: string) {
    AlertService.remove(() => {
      removeEntry(entryId)
    }, entryName)
  }

  return (
    <Page>
      <ScrollView
        accessibilityLabel="Conteúdo da comparação de preços"
        focusable
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        <View className="px-4 pt-4 gap-4">

          <TextWhite accessibilityRole="header" className="text-xl font-bold">
            {places.length > 0 ? 'Lugares Cadastrados' : 'Nenhum lugar cadastrado ainda.'}
          </TextWhite>

          {places.length > 0 && <Card className="p-4 gap-3 border-0 bg-slate-800">
            {places.map((place, index) => (
              <Row
                key={place.id}
                className={`items-center justify-between gap-4 ${index > 0 ? 'pt-2 border-t border-slate-700' : ''}`}
              >
                <Delete action={() => onDelete(place.id, place.name)} size={24} accessibilityLabel={`Remover lugar ${place.name}`} accessibilityHint="Remove este lugar e os preços associados" />

                <TouchableOpacity
                  className="flex-1 min-h-11 justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
                  accessibilityRole="button"
                  accessibilityLabel={'Editar lugar ' + place.name}
                  accessibilityHint="Abre o formulário de edição do lugar"
                  onPress={() => router.push(ROUTES.PriceComparison.Market.Edit(place.id))}
                >
                  <TextWhite className="font-semibold text-sm">{place.name}</TextWhite>

                  {!!place.note && <Text className="text-xs text-slate-400">{place.note}</Text>}
                </TouchableOpacity>
              </Row>
            ))}
          </Card>
          }

          <View className="gap-2">
            <Row className="items-center justify-between gap-2">
              <TextWhite accessibilityRole="header" className="text-xl font-bold">
                {entries.length > 0 ? 'Itens para Comparar' : 'Nenhum item cadastrado ainda.'}
              </TextWhite>

              {entries.length > 0 &&
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={entrySortBy === "price" ? "Ordenar itens por nome" : "Ordenar itens por menor preço"}
                  accessibilityHint={`Ordenação atual: ${entrySortBy === "price" ? "menor preço" : "nome"}. Ative para alternar.`}
                  className="min-h-11 justify-center px-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
                  onPress={() => setEntrySortBy((current) => current === "price" ? "name" : "price")}
                >
                  <Text className="text-sm text-lime-400">Ordenar por {entrySortBy === "price" ? "nome" : "menor preço"}</Text>
                </TouchableOpacity>
              }
            </Row>

            {[...entries]
              .sort((a, b) => a.itemName.localeCompare(b.itemName))
              .map((entry) => {
                const result = compareEntryPrices(entry, places, entrySortBy)
                const highestPlaces = result.options
                  .filter((option) => option.price === result.highest?.price)
                  .map((option) => option.placeName)

                return (
                  <Card key={entry.id} className="p-4 gap-2 border-slate-700 bg-slate-800">
                    <Row className="items-center justify-between gap-2">

                      <Delete
                        accessibilityRole="button"
                        accessibilityLabel={'Remover comparação de ' + entry.itemName}
                        accessibilityHint="Remove este item e seus preços associados"
                        size={24}
                        action={() => onDeleteEntry(entry.id, entry.itemName)}
                      />

                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={'Editar comparação de ' + entry.itemName}
                        accessibilityHint="Abre o formulário para editar os preços deste item"
                        className="flex-1 min-h-11 justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
                        onPress={() => router.push(ROUTES.PriceComparison.Cart.Edit(entry.id))}
                      >
                        <TextWhite className="font-bold">{entry.itemName}</TextWhite>

                        {!!entry.quantityReference && <Text className="text-xs text-slate-400">{entry.quantityReference}</Text>}
                      </TouchableOpacity>
                    </Row>

                    {result.options.map((option) => (
                      <Row key={option.placeId} className="justify-between gap-2">
                        <Text className={option.price === result.lowest?.price ? 'text-lime-400 font-semibold' : 'text-slate-300'}>
                          {option.placeName}
                          {option.price === result.lowest?.price ? ' · Melhor preço' : ''}
                          {result.options.length > 1 && option.price === result.highest?.price ? ' · Maior preço' : ''}
                        </Text>

                        <Text className={option.price === result.lowest?.price ? 'text-lime-400 font-semibold' : 'text-slate-300'}>{SetCurrency(option.price)}</Text>
                      </Row>
                    ))}

                    <View className="border-t border-slate-700 pt-2 gap-1">
                      <TextWhite className="text-sm">
                        Maior preço: {result.highest ? `${highestPlaces.join(', ')} (${SetCurrency(result.highest.price)})` : 'Não disponível'}
                      </TextWhite>

                      <TextWhite className="text-sm">
                        Economia possível: {formatDifference(result.difference)}
                        {result.differencePercent === null ? '' : ' (' + result.differencePercent.toFixed(1).replace('.', ',') + '%)'}
                      </TextWhite>
                    </View>
                  </Card>
                )
              })}
          </View>

          <View className="gap-2">
            <Row className="items-center justify-between gap-2">
              <TextWhite accessibilityRole="header" className="text-xl font-bold">Comparação do carrinho completo</TextWhite>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={basketSortBy === "price" ? "Ordenar cesta por nome" : "Ordenar cesta por menor total"}
                accessibilityHint={`Ordenação atual: ${basketSortBy === "price" ? "menor total" : "nome"}. Ative para alternar.`}
                className="min-h-11 justify-center px-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
                onPress={() => setBasketSortBy((current) => current === "price" ? "name" : "price")}
              >
                <Text className="text-sm text-lime-400">Ordenar por {basketSortBy === "price" ? "nome" : "menor total"}</Text>
              </TouchableOpacity>
            </Row>

            <Text className="text-sm text-slate-400">
              O total só é calculado quando há preço para todos os itens naquele lugar. Preços ausentes não viram R$ 0,00.
            </Text>

            {(basket.length === 0 || entries.length === 0) &&
              <Card className="p-4">
                <Text className="text-slate-400">Adicione itens e preços para comparar a cesta.</Text>
              </Card>
            }

            {basket.map((place) => (
              <Card key={place.placeId} className="p-3 border-slate-700 bg-slate-800">
                <Row className="justify-between items-center gap-2">
                  <View className="flex-1">
                    <Text className={place.complete && place.placeId === bestBasketPlaceId ? 'font-bold text-lime-400' : 'font-semibold text-white'}>
                      {place.placeName}
                      {place.complete && place.placeId === bestBasketPlaceId ? ' · Menor total' : ''}
                    </Text>

                    <Text className="text-xs text-slate-400">
                      {place.complete ? 'Cesta completa' : 'Preço faltando para um ou mais itens'}
                    </Text>
                  </View>

                  <Text className={place.complete && place.placeId === bestBasketPlaceId ? 'font-bold text-lime-400' : 'text-white'}>
                    {place.complete && place.total !== null ? SetCurrency(place.total) : 'Incompleta'}
                  </Text>
                </Row>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </Page>
  )
}
