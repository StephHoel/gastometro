import type { CustomAlertRef } from "@/interfaces/CustomAlertRef"
import { TextWhite } from "@/components/TextWhite"
import { COLORS } from "@/constants/color"
import { AlertService } from "@/services/AlertService"
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { useCartStore } from "@/stores/CartStore"
import { useReminderStore } from '@/stores/ReminderStore'
import { useInitAlert } from "@/hooks/useInitAlert"
import { useRouter } from "expo-router"
import React, { useRef, useState } from "react"
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { AddIcon, EditIcon, NotificationIcon, TrashIcon } from "@/components/Icons"
import { Row } from "@/components/Row"
import { ERROR } from '@/constants/text/error'
import { LISTS } from '@/constants/text/lists'
import { INPUTS } from '@/constants/text/inputs'
import { Page } from '@/components/Page'
import { SIZE } from '@/constants/size'
import { useForm } from "react-hook-form"
import { CreateListForm } from '@/interfaces/Form/CreateListForm'
import { EditListForm } from '@/interfaces/Form/EditListForm'
import { ROUTES } from '@/constants/routes'

export default function Lists() {
  const cartStore = useCartStore()
  const reminderStore = useReminderStore()
  const router = useRouter()
  const alertRef = useRef<CustomAlertRef>(null)
  useInitAlert(alertRef)

  const { watch: watchCreate, reset: resetCreate, setValue: setCreateValue } = useForm<CreateListForm>({
    defaultValues: {
      newListName: "",
    },
  })

  const { handleSubmit: handleEditSubmit, watch: watchEdit, reset: resetEdit, setValue: setEditValue } = useForm<EditListForm>({
    defaultValues: {
      editingName: "",
    },
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const newListName = watchCreate("newListName")
  const editingName = watchEdit("editingName")

  function onCreateList(data: CreateListForm) {
    const trimmed = data.newListName.trim()
    if (!trimmed) {
      AlertService.ok(ERROR.alert_title, ERROR.empty_list_name)
      return
    }
    cartStore.addList(trimmed)
    resetCreate()
  }

  function handleCreateList() {
    onCreateList({ newListName })
  }

  function handleSelectList(listId: string) {
    cartStore.setActiveList(listId)
    router.push(ROUTES.Index)
  }

  function handleStartEdit(listId: string, currentName: string) {
    setEditingId(listId)
    setEditValue("editingName", currentName)
  }

  function onSaveEdit(data: EditListForm) {
    const trimmed = data.editingName.trim()
    if (!trimmed) {
      AlertService.ok(ERROR.alert_title, ERROR.empty_list_name)
      return
    }
    if (editingId) {
      cartStore.renameList(editingId, trimmed)
      setEditingId(null)
      resetEdit()
    }
  }

  function handleCancelEdit() {
    setEditingId(null)
    resetEdit()
  }

  function handleRemoveList(listId: string, listName: string) {
    if (cartStore.lists.length <= 1) {
      AlertService.ok(ERROR.alert_title, ERROR.cannot_remove_last_list)
      return
    }

    const impactedReminders = reminderStore.getByListId(listId).length

    alertRef.current?.showAlert({
      title: LISTS.confirm_remove_title,
      message: LISTS.confirm_remove_message(listName, impactedReminders),
      buttons: [
        {
          text: LISTS.confirm_remove_button,
          action: async () => {
            await ReminderOrchestrator.removeByListId(listId)
            cartStore.removeList(listId)
          },
        },
      ],
    })
  }

  return (
    <Page alertRef={alertRef}>
      {/* Criar nova lista */}
      <Row className="mx-4 mt-4 gap-2">
        <TextInput
          className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-base"
          placeholder={INPUTS.placeholder.list_name}
          accessibilityLabel="Nome da nova lista"
          accessibilityHint="Digite um nome para criar uma lista de compras"
          placeholderTextColor={COLORS.inactive}
          value={newListName}
          onChangeText={(text) => setCreateValue("newListName", text)}
          onSubmitEditing={handleCreateList}
          returnKeyType="done"
          maxLength={60}
        />
        <TouchableOpacity
          className="min-w-11 min-h-11 bg-lime-400 rounded-lg px-3 py-2 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Criar lista"
          onPress={handleCreateList}
        >
          <AddIcon size={SIZE.iconButton} color={COLORS.black} />
        </TouchableOpacity>
      </Row>

      {cartStore.lists.length === 0 && (
        <TextWhite className="text-center mt-6 text-slate-400">
          {LISTS.empty_hint}
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
            <View className={`mx-4 mb-3 min-h-14 rounded-lg p-3 ${isActive ? "bg-slate-600" : "bg-slate-800"}`}>
              <Row className="justify-between items-center gap-2">
                {isEditing ? (
                  <TextInput
                    className="flex-1 bg-slate-700 text-white rounded px-2 py-1 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
                    accessibilityLabel={`Nome da lista ${item.name}`}
                    accessibilityHint="Edite o nome e salve as alterações"
                    value={editingName}
                    onChangeText={(text) => setEditValue("editingName", text)}
                    onSubmitEditing={() => handleEditSubmit(onSaveEdit)()}
                    returnKeyType="done"
                    autoFocus
                    maxLength={60}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => handleSelectList(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Selecionar lista ${item.name}`}
                    accessibilityState={{ selected: isActive }}
                    className="flex-1 min-h-11 justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
                  >
                    <TextWhite className="text-base font-semibold">
                      {item.name}
                      {isActive && (
                        <Text className="text-lime-400 text-xs">
                          {" "}({LISTS.active_label})
                        </Text>
                      )}
                    </TextWhite>
                    <TextWhite className="text-slate-400 text-xs mt-0.5">
                      {item.products.length}{" "}
                      {item.products.length === 1 ? "item" : "itens"}
                    </TextWhite>
                  </TouchableOpacity>
                )}

                <Row className="gap-3 items-center">
                  {isEditing ? (
                    <>
                      <TouchableOpacity
                        onPress={() => handleEditSubmit(onSaveEdit)()}
                        className="min-w-11 min-h-11 bg-lime-400 rounded px-3 py-2 justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`Salvar nome da lista ${item.name}`}
                      >
                        <Text className="text-black font-bold text-xs">
                          {LISTS.rename_save}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCancelEdit}
                        className="min-w-11 min-h-11 bg-slate-500 rounded px-3 py-2 justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`Cancelar edição da lista ${item.name}`}
                      >
                        <Text className="text-white text-xs">
                          {LISTS.rename_cancel}
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => router.push(ROUTES.Reminder.Id(item.id))}
                        activeOpacity={0.7}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Abrir lembretes da lista ${item.name}`}
                        className="min-w-11 min-h-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
                      >
                        <NotificationIcon size={SIZE.iconActions} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleStartEdit(item.id, item.name)}
                        activeOpacity={0.7}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Renomear lista ${item.name}`}
                        className="min-w-11 min-h-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
                      >
                        <EditIcon size={SIZE.iconActions} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveList(item.id, item.name)}
                        activeOpacity={0.7}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Remover lista ${item.name}`}
                        className="min-w-11 min-h-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
                      >
                        <TrashIcon size={SIZE.iconActions} />
                      </TouchableOpacity>
                    </>
                  )}
                </Row>
              </Row>
            </View>
          )
        }}
      />
    </Page>
  )
}
