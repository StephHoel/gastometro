import { Card } from '@/components/Card'
import { CustomButton as Button } from '@/components/Button'
import { Page } from '@/components/Page'
import { Row } from '@/components/Row'
import { TextWhite } from '@/components/TextWhite'
import { COLORS } from '@/constants/color'
import type { PriceComparisonEntryProps } from '@/interfaces/PriceComparisonProps'
import {
  compareBasket,
  compareEntryPrices,
  validateComparisonEntry,
  validatePlace,
} from '@/services/PriceComparisonService'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'
import { SetCurrency } from '@/utils/functions/MathFunctions'
import React, { useMemo, useState } from 'react'
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native'

export default function PriceComparison() {
  const places = usePriceComparisonStore((state) => state.places)
  const entries = usePriceComparisonStore((state) => state.entries)
  const addPlace = usePriceComparisonStore((state) => state.addPlace)
  const updatePlace = usePriceComparisonStore((state) => state.updatePlace)
  const removePlace = usePriceComparisonStore((state) => state.removePlace)
  const addEntry = usePriceComparisonStore((state) => state.addEntry)
  const updateEntry = usePriceComparisonStore((state) => state.updateEntry)
  const removeEntry = usePriceComparisonStore((state) => state.removeEntry)

  const [placeName, setPlaceName] = useState('')
  const [placeNote, setPlaceNote] = useState('')
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null)
  const [itemName, setItemName] = useState('')
  const [quantityReference, setQuantityReference] = useState('')
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const basket = useMemo(() => compareBasket(entries, places), [entries, places])

  function resetPlaceForm() {
    setPlaceName('')
    setPlaceNote('')
    setEditingPlaceId(null)
    setError('')
  }

  function savePlace() {
    const validation = validatePlace(placeName)
    if (validation) {
      setError(validation)
      return
    }
    const saved = editingPlaceId
      ? updatePlace(editingPlaceId, { name: placeName, note: placeNote.trim() || undefined })
      : addPlace({ name: placeName, note: placeNote.trim() || undefined })
    if (!saved) {
      setError('Já existe um lugar com esse nome.')
      return
    }
    resetPlaceForm()
  }

  function startEditPlace(id: string) {
    const place = places.find((item) => item.id === id)
    if (!place) return
    setEditingPlaceId(id)
    setPlaceName(place.name)
    setPlaceNote(place.note ?? '')
    setError('')
  }

  function resetEntryForm() {
    setItemName('')
    setQuantityReference('')
    setPrices({})
    setEditingEntryId(null)
    setError('')
  }

  function saveEntry() {
    const pricesByPlace = places
      .filter((place) => (prices[place.id] ?? '').trim().length > 0)
      .map((place) => ({ placeId: place.id, price: prices[place.id].trim().replace(',', '.') }))
    const validation = validateComparisonEntry(itemName, pricesByPlace, places.map((place) => place.id))
    if (validation) {
      setError(validation)
      return
    }
    const payload = { itemName, quantityReference: quantityReference.trim() || undefined, pricesByPlace }
    const saved = editingEntryId
      ? updateEntry(editingEntryId, payload)
      : addEntry(payload)
    if (!saved) {
      setError('Não foi possível salvar a comparação.')
      return
    }
    resetEntryForm()
  }

  function startEditEntry(entry: PriceComparisonEntryProps) {
    setEditingEntryId(entry.id)
    setItemName(entry.itemName)
    setQuantityReference(entry.quantityReference ?? '')
    setPrices(Object.fromEntries(entry.pricesByPlace.map((price) => [price.placeId, price.price.replace('.', ',')])))
    setError('')
  }

  function formatDifference(value: number | null) {
    return value === null ? 'Não disponível' : SetCurrency(value)
  }

  return (
    <Page>
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 36 }}>
        <View className="px-4 pt-4 gap-4">
          <View className="gap-1">
            <TextWhite className="text-2xl font-bold">Comparação de preços</TextWhite>
            <TextWhite className="text-sm text-slate-400">Compare cada produto e descubra onde a cesta completa custa menos.</TextWhite>
          </View>

          <Card className="p-4 gap-3 border-0 bg-slate-800">
            <TextWhite className="text-lg font-bold">{editingPlaceId ? 'Editar lugar' : 'Cadastrar lugar'}</TextWhite>
            <TextInput
              className="rounded-lg bg-slate-700 px-3 py-3 text-white"
              placeholder="Nome do mercado ou loja"
              placeholderTextColor={COLORS.inactive}
              accessibilityLabel="Nome do lugar"
              value={placeName}
              onChangeText={setPlaceName}
              maxLength={60}
            />
            <TextInput
              className="rounded-lg bg-slate-700 px-3 py-3 text-white"
              placeholder="Observação (opcional)"
              placeholderTextColor={COLORS.inactive}
              accessibilityLabel="Observação do lugar"
              value={placeNote}
              onChangeText={setPlaceNote}
              maxLength={120}
            />
            <Row className="gap-2">
              <Button className="mx-0 flex-1" onPress={savePlace}>
                <Button.Text className="text-base">{editingPlaceId ? 'Salvar lugar' : 'Adicionar lugar'}</Button.Text>
              </Button>
              {editingPlaceId && <Button type="Normal" className="mx-0 flex-1" onPress={resetPlaceForm}><Button.Text className="text-base">Cancelar</Button.Text></Button>}
            </Row>
            {places.map((place) => (
              <Row key={place.id} className="items-center justify-between border-t border-slate-700 pt-2 gap-2">
                <View className="flex-1">
                  <TextWhite className="font-semibold">{place.name}</TextWhite>
                  {!!place.note && <TextWhite className="text-xs text-slate-400">{place.note}</TextWhite>}
                </View>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={'Editar ' + place.name} onPress={() => startEditPlace(place.id)}>
                  <TextWhite className="text-lime-400 text-sm">Editar</TextWhite>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={'Remover ' + place.name} onPress={() => removePlace(place.id)}>
                  <TextWhite className="text-red-400 text-sm">Remover</TextWhite>
                </TouchableOpacity>
              </Row>
            ))}
          </Card>

          <Card className="p-4 gap-3 border-0 bg-slate-800">
            <TextWhite className="text-lg font-bold">{editingEntryId ? 'Editar item comparado' : 'Adicionar item para comparar'}</TextWhite>
            <TextInput
              className="rounded-lg bg-slate-700 px-3 py-3 text-white"
              placeholder="Nome do produto"
              placeholderTextColor={COLORS.inactive}
              accessibilityLabel="Nome do item"
              value={itemName}
              onChangeText={setItemName}
              maxLength={80}
            />
            <TextInput
              className="rounded-lg bg-slate-700 px-3 py-3 text-white"
              placeholder="Referência de quantidade (opcional, ex.: 1 kg)"
              placeholderTextColor={COLORS.inactive}
              accessibilityLabel="Quantidade de referência"
              value={quantityReference}
              onChangeText={setQuantityReference}
              maxLength={40}
            />
            {places.length === 0 ? (
              <TextWhite className="text-sm text-slate-400">Cadastre ao menos um lugar para informar preços.</TextWhite>
            ) : places.map((place) => (
              <View key={place.id} className="gap-1">
                <TextWhite className="text-sm text-slate-300">{place.name}</TextWhite>
                <TextInput
                  className="rounded-lg bg-slate-700 px-3 py-3 text-white"
                  placeholder="Preço (ex.: 12,50)"
                  placeholderTextColor={COLORS.inactive}
                  accessibilityLabel={'Preço em ' + place.name}
                  keyboardType="decimal-pad"
                  value={prices[place.id] ?? ''}
                  onChangeText={(value) => setPrices((current) => ({ ...current, [place.id]: value.replace(/[^0-9.,-]/g, '') }))}
                />
              </View>
            ))}
            <Row className="gap-2">
              <Button className="mx-0 flex-1" onPress={saveEntry} disabled={places.length === 0}>
                <Button.Text className="text-base">{editingEntryId ? 'Salvar item' : 'Adicionar item'}</Button.Text>
              </Button>
              {editingEntryId && <Button type="Normal" className="mx-0 flex-1" onPress={resetEntryForm}><Button.Text className="text-base">Cancelar</Button.Text></Button>}
            </Row>
          </Card>

          {!!error && <TextWhite className="text-sm text-red-400">{error}</TextWhite>}

          <View className="gap-2">
            <TextWhite className="text-xl font-bold">Comparação por item</TextWhite>
            {entries.length === 0 ? (
              <Card className="p-4"><TextWhite className="text-slate-400">Nenhum item comparado ainda.</TextWhite></Card>
            ) : entries.map((entry) => {
              const result = compareEntryPrices(entry, places)
              return (
                <Card key={entry.id} className="p-4 gap-2 border-slate-700 bg-slate-800">
                  <Row className="items-start justify-between gap-2">
                    <View className="flex-1">
                      <TextWhite className="font-bold">{entry.itemName}</TextWhite>
                      {!!entry.quantityReference && <TextWhite className="text-xs text-slate-400">{entry.quantityReference}</TextWhite>}
                    </View>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={'Editar comparação de ' + entry.itemName} onPress={() => startEditEntry(entry)}>
                      <TextWhite className="text-lime-400 text-sm">Editar</TextWhite>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={'Remover comparação de ' + entry.itemName} onPress={() => removeEntry(entry.id)}>
                      <TextWhite className="text-red-400 text-sm">Remover</TextWhite>
                    </TouchableOpacity>
                  </Row>
                  {result.options.map((option, index) => (
                    <Row key={option.placeId} className="justify-between gap-2">
                      <TextWhite className={index === 0 ? 'text-lime-400 font-semibold' : 'text-slate-300'}>
                        {option.placeName}{index === 0 ? ' · Melhor preço' : ''}
                      </TextWhite>
                      <TextWhite className={index === 0 ? 'text-lime-400 font-semibold' : ''}>{SetCurrency(option.price)}</TextWhite>
                    </Row>
                  ))}
                  <View className="border-t border-slate-700 pt-2 gap-1">
                    <TextWhite className="text-sm">Maior preço: {formatDifference(result.highest?.price ?? null)}</TextWhite>
                    <TextWhite className="text-sm">Economia possível: {formatDifference(result.difference)}{result.differencePercent === null ? '' : ' (' + result.differencePercent.toFixed(1).replace('.', ',') + '%)'}</TextWhite>
                  </View>
                </Card>
              )
            })}
          </View>

          <View className="gap-2">
            <TextWhite className="text-xl font-bold">Comparação da cesta completa</TextWhite>
            <TextWhite className="text-sm text-slate-400">O total só é calculado quando há preço para todos os itens naquele lugar. Preços ausentes não viram R$ 0,00.</TextWhite>
            {basket.length === 0 || entries.length === 0 ? (
              <Card className="p-4"><TextWhite className="text-slate-400">Adicione itens e preços para comparar a cesta.</TextWhite></Card>
            ) : basket.map((place, index) => (
              <Card key={place.placeId} className="p-3 border-slate-700 bg-slate-800">
                <Row className="justify-between items-center gap-2">
                  <View className="flex-1">
                    <TextWhite className={place.complete && index === 0 ? 'font-bold text-lime-400' : 'font-semibold'}>
                      {place.placeName}{place.complete && index === 0 ? ' · Menor total' : ''}
                    </TextWhite>
                    <TextWhite className="text-xs text-slate-400">{place.complete ? 'Cesta completa' : 'Preço faltando para um ou mais itens'}</TextWhite>
                  </View>
                  <TextWhite className={place.complete && index === 0 ? 'font-bold text-lime-400' : ''}>
                    {place.complete && place.total !== null ? SetCurrency(place.total) : 'Incompleta'}
                  </TextWhite>
                </Row>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </Page>
  )
}
