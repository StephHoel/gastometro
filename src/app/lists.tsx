import { CustomAlert } from "@/components/CustomAlert"
import type { CustomAlertRef } from "@/interfaces/CustomAlertRef"
import { Header } from "@/components/Header"
import { Screen } from "@/components/Screen"
import { TextWhite } from "@/components/TextWhite"
import { colors } from "@/constants/color"
import { text } from "@/constants/text"
import { AlertService } from "@/services/AlertService"
import { useCartStore } from "@/stores/CartStore"
import { useInitAlert } from "@/hooks/useInitAlert"
import { useRouter } from "expo-router"
import React, { useRef, useState } from "react"
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { AddIcon, EditIcon, TrashIcon } from "@/components/Icons"
import { Row } from "@/components/Row"

export default function Lists() {
  const cartStore = useCartStore()
  const router = useRouter()
  const alertRef = useRef<CustomAlertRef>(null)
  useInitAlert(alertRef)

  const [newListName, setNewListName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  function handleCreateList() {
    const trimmed = newListName.trim()
    if (!trimmed) {
      AlertService.ok(text.error.alert_title, text.error.empty_list_name)
      return
    }
    cartStore.addList(trimmed)
    setNewListName("")
  }

  function handleSelectList(listId: string) {
    cartStore.setActiveList(listId)
    router.push("/")
  }

  function handleStartEdit(listId: string, currentName: string) {
    setEditingId(listId)
    setEditingName(currentName)
  }

  function handleSaveEdit(listId: string) {
    const trimmed = editingName.trim()
    if (!trimmed) {
      AlertService.ok(text.error.alert_title, text.error.empty_list_name)
      return
    }
    cartStore.renameList(listId, trimmed)
    setEditingId(null)
    setEditingName("")
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditingName("")
  }

  function handleRemoveList(listId: string, listName: string) {
    if (cartStore.lists.length <= 1) {
      AlertService.ok(text.error.alert_title, text.error.cannot_remove_last_list)
      return
    }

    alertRef.current?.showAlert({
      title: text.lists.confirm_remove_title,
      message: text.lists.confirm_remove_message(listName),
      buttons: [
        {
          text: text.lists.confirm_remove_button,
          action: () => cartStore.removeList(listId),
        },
      ],
    })
  }

  return (
    <>
      <CustomAlert ref={alertRef} />

      <Screen>
        <Header />

        {/* Criar nova lista */}
        <Row className="mx-4 mt-4 gap-2">
          <TextInput
            className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-base"
            placeholder={text.input.placeholder.list_name}
            placeholderTextColor={colors.inactive}
            value={newListName}
            onChangeText={setNewListName}
            onSubmitEditing={handleCreateList}
            returnKeyType="done"
            maxLength={60}
          />
          <TouchableOpacity
            className="bg-lime-400 rounded-lg px-3 py-2 items-center justify-center"
            activeOpacity={0.7}
            onPress={handleCreateList}
          >
            <AddIcon size={26} color={colors.black} />
          </TouchableOpacity>
        </Row>

        {cartStore.lists.length === 0 && (
          <TextWhite className="text-center mt-6 text-slate-400">
            {text.lists.empty_hint}
          </TextWhite>
        )}

        <FlatList
          data={cartStore.lists}
          keyExtractor={(item) => item.id}
          className="mt-4"
          renderItem={({ item }) => {
            const isActive = item.id === cartStore.activeListId
            const isEditing = editingId === item.id

            return (
              <Pressable
                onPress={() => {
                  if (!isEditing) handleSelectList(item.id)
                }}
                className={`mx-4 mb-3 rounded-lg p-3 ${isActive ? "bg-slate-600" : "bg-slate-800"}`}
              >
                <Row className="justify-between items-center gap-2">
                  {isEditing ? (
                    <TextInput
                      className="flex-1 bg-slate-700 text-white rounded px-2 py-1 text-base"
                      value={editingName}
                      onChangeText={setEditingName}
                      onSubmitEditing={() => handleSaveEdit(item.id)}
                      returnKeyType="done"
                      autoFocus
                      maxLength={60}
                    />
                  ) : (
                    <View className="flex-1">
                      <TextWhite className="text-base font-semibold">
                        {item.name}
                        {isActive && (
                          <Text className="text-lime-400 text-xs">
                            {" "}({text.lists.active_label})
                          </Text>
                        )}
                      </TextWhite>
                      <TextWhite className="text-slate-400 text-xs mt-0.5">
                        {item.products.length}{" "}
                        {item.products.length === 1 ? "item" : "itens"}
                      </TextWhite>
                    </View>
                  )}

                  <Row className="gap-3 items-center">
                    {isEditing ? (
                      <>
                        <TouchableOpacity
                          onPress={() => handleSaveEdit(item.id)}
                          className="bg-lime-400 rounded px-2 py-1"
                          activeOpacity={0.7}
                        >
                          <Text className="text-black font-bold text-xs">
                            {text.lists.rename_save}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleCancelEdit}
                          className="bg-slate-500 rounded px-2 py-1"
                          activeOpacity={0.7}
                        >
                          <Text className="text-white text-xs">
                            {text.lists.rename_cancel}
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          onPress={() => handleStartEdit(item.id, item.name)}
                          activeOpacity={0.7}
                          hitSlop={8}
                        >
                          <EditIcon size={22} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRemoveList(item.id, item.name)}
                          activeOpacity={0.7}
                          hitSlop={8}
                        >
                          <TrashIcon size={22} />
                        </TouchableOpacity>
                      </>
                    )}
                  </Row>
                </Row>
              </Pressable>
            )
          }}
        />
      </Screen>
    </>
  )
}
