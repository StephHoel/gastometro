import React, { useMemo, useState } from 'react'
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native'
import { Page } from '@/components/Page'
import { TextWhite } from '@/components/TextWhite'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'
import { PriceComparisonService } from '@/services/PriceComparisonService'

const fieldClass = 'rounded-lg bg-slate-700 px-3 py-2 text-white'
const buttonClass = 'rounded-lg bg-lime-400 px-3 py-2'

export default function PriceComparison() {
  const store = usePriceComparisonStore()
  const [placeName, setPlaceName] = useState('')
  const [placeNote, setPlaceNote] = useState('')
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null)
  const [itemName, setItemName] = useState('')
  const [quantityReference, setQuantityReference] = useState('')
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<'price' | 'name'>('price')

  const basket = useMemo(() => PriceComparisonService.compareBasket(store.entries, store.places), [store.entries, store.places])

  function savePlace() {
    const saved = editingPlaceId
      ? store.updatePlace(editingPlaceId, placeName, placeNote)
      : store.addPlace(placeName, placeNote)
    if (!saved) {
      Alert.alert('Não foi possível salvar', 'Informe um nome válido e não repetido para o lugar.')
      return
    }
    setPlaceName('')
    setPlaceNote('')
    setEditingPlaceId(null)
  }

  function startEditPlace(placeId: string) {
    const place = store.places.find((item) => item.id === placeId)
    if (!place) return
    setEditingPlaceId(place.id)
    setPlaceName(place.name)
    setPlaceNote(place.note ?? '')
  }

  function saveEntry() {
    const pricesByPlace = store.places.filter((place) => prices[place.id]?.trim()).map((place) => ({ placeId: place.id, price: prices[place.id] }))
    const saved = editingEntryId
      ? store.updateEntry(editingEntryId, itemName, pricesByPlace, quantityReference)
      : store.addEntry(itemName, pricesByPlace, quantityReference)
    if (!saved) {
      Alert.alert('Não foi possível salvar', 'Informe o item e ao menos um preço válido para um lugar cadastrado.')
      return
    }
    setItemName('')
    setQuantityReference('')
    setPrices({})
    setEditingEntryId(null)
  }

  function startEditEntry(entryId: string) {
    const entry = store.entries.find((item) => item.id === entryId)
    if (!entry) return
    setEditingEntryId(entry.id)
    setItemName(entry.itemName)
    setQuantityReference(entry.quantityReference ?? '')
    setPrices(Object.fromEntries(entry.pricesByPlace.map((price) => [price.placeId, price.price])))
  }

  return (
    <Page>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mx-4 mt-3 gap-2">
          <TextWhite className="text-xl font-bold">Lugares</TextWhite>
          <TextInput accessibilityLabel="Nome do lugar" placeholder="Nome do mercado ou loja" placeholderTextColor="#94A3B8" className={fieldClass} value={placeName} onChangeText={setPlaceName} />
          <TextInput accessibilityLabel="Observação do lugar" placeholder="Observação (opcional)" placeholderTextColor="#94A3B8" className={fieldClass} value={placeNote} onChangeText={setPlaceNote} />
          <Pressable accessibilityRole="button" className={buttonClass} onPress={savePlace}><TextWhite className="text-black font-bold text-center">{editingPlaceId ? 'Salvar lugar' : 'Adicionar lugar'}</TextWhite></Pressable>
          {store.places.map((place) => (
            <View key={place.id} className="rounded-lg bg-slate-800 p-3 gap-2">
              <TextWhite className="font-semibold">{place.name}</TextWhite>
              {!!place.note && <TextWhite className="text-slate-300 text-sm">{place.note}</TextWhite>}
              <View className="flex-row gap-4">
                <Pressable accessibilityRole="button" accessibilityLabel={'Editar lugar ' + place.name} onPress={() => startEditPlace(place.id)}><TextWhite className="text-lime-300">Editar</TextWhite></Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={'Remover lugar ' + place.name} onPress={() => Alert.alert('Remover lugar?', 'Os preços deste lugar serão removidos das comparações.', [{ text: 'Cancelar' }, { text: 'Remover', onPress: () => store.removePlace(place.id) }])}><TextWhite className="text-red-400">Remover</TextWhite></Pressable>
              </View>
            </View>
          ))}
        </View>

        <View className="mx-4 mt-6 gap-2">
          <TextWhite className="text-xl font-bold">Comparar item</TextWhite>
          <TextInput accessibilityLabel="Nome do item" placeholder="Nome do item" placeholderTextColor="#94A3B8" className={fieldClass} value={itemName} onChangeText={setItemName} />
          <TextInput accessibilityLabel="Quantidade de referência" placeholder="Quantidade/unidade de referência (opcional)" placeholderTextColor="#94A3B8" className={fieldClass} value={quantityReference} onChangeText={setQuantityReference} />
          {store.places.map((place) => (
            <View key={place.id} className="gap-1">
              <TextWhite>{place.name} (R$)</TextWhite>
              <TextInput accessibilityLabel={'Preço em ' + place.name} placeholder="Preço" placeholderTextColor="#94A3B8" keyboardType="decimal-pad" className={fieldClass} value={prices[place.id] ?? ''} onChangeText={(value) => setPrices((current) => ({ ...current, [place.id]: value }))} />
            </View>
          ))}
          <Pressable accessibilityRole="button" className={buttonClass} onPress={saveEntry}><TextWhite className="text-black font-bold text-center">{editingEntryId ? 'Salvar comparação' : 'Adicionar comparação'}</TextWhite></Pressable>
          {store.entries.map((entry) => {
            const result = PriceComparisonService.compareItem(entry, store.places)
            const orderedOffers = [...result.offers].sort((a, b) => sortMode === 'price' ? a.price - b.price : a.placeName.localeCompare(b.placeName, 'pt-BR'))
            return (
              <View key={entry.id} className="rounded-lg bg-slate-800 p-3 gap-2">
                <TextWhite className="font-bold">{entry.itemName}{entry.quantityReference ? ' · ' + entry.quantityReference : ''}</TextWhite>
                {orderedOffers.map((offer) => <TextWhite key={offer.placeId} className={result.bestPlaceIds.includes(offer.placeId) ? 'text-lime-300' : 'text-white'}>{offer.placeName}: {offer.formattedPrice}{result.bestPlaceIds.includes(offer.placeId) ? ' · melhor preço' : ''}</TextWhite>)}
                <TextWhite>Diferença: R$ {result.difference.toFixed(2).replace('.', ',')} {result.differencePercent === null ? '' : '(' + result.differencePercent.toFixed(1).replace('.', ',') + '%)'}</TextWhite>
                <View className="flex-row gap-4">
                  <Pressable accessibilityRole="button" accessibilityLabel={'Editar comparação ' + entry.itemName} onPress={() => startEditEntry(entry.id)}><TextWhite className="text-lime-300">Editar</TextWhite></Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={'Remover comparação ' + entry.itemName} onPress={() => store.removeEntry(entry.id)}><TextWhite className="text-red-400">Remover</TextWhite></Pressable>
                </View>
              </View>
            )
          })}
          <Pressable accessibilityRole="button" onPress={() => setSortMode((current) => current === 'price' ? 'name' : 'price')}><TextWhite className="text-lime-300">Ordenar por: {sortMode === 'price' ? 'menor preço' : 'nome do lugar'} · alternar</TextWhite></Pressable>
        </View>

        <View className="mx-4 mt-6 gap-2">
          <TextWhite className="text-xl font-bold">Comparação da cesta completa</TextWhite>
          {basket.totalsByPlace.map((total) => (
            <View key={total.placeId} className="rounded-lg bg-slate-800 p-3">
              <TextWhite className={basket.cheapestPlaceIds.includes(total.placeId) ? 'font-bold text-lime-300' : 'font-bold'}>{total.placeName}{basket.cheapestPlaceIds.includes(total.placeId) ? ' · cesta mais barata' : ''}</TextWhite>
              <TextWhite>{total.formattedTotal} · {total.comparedItems} itens com preço · {total.unavailableItems} indisponíveis</TextWhite>
            </View>
          ))}
          {store.entries.length > 0 && basket.cheapestPlaceIds.length === 0 && <TextWhite className="text-amber-300">Não há lugar com preço informado para todos os itens. Itens sem preço não são considerados gratuitos.</TextWhite>}
        </View>
      </ScrollView>
    </Page>
  )
}
