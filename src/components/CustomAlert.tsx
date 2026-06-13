import { alert } from "@/constants/alert"
import type { ButtonProps } from "@/interfaces/ButtonProps"
import type { CustomAlertRef } from "@/interfaces/CustomAlertRef"
import React, { forwardRef, useImperativeHandle, useState } from "react"
import { Modal, Pressable, Text, TouchableOpacity, useWindowDimensions, View } from "react-native"
import type { ShowAlertProps } from "@/interfaces/ShowAlertProps"
import { WhatsappIcon } from './Icons'
import { Row } from './Row'
import { TextWhite } from './TextWhite'

export const CustomAlert = forwardRef<CustomAlertRef>((_, ref) => {
  const { width } = useWindowDimensions()
  const [isVisible, setIsVisible] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [buttons, setButtons] = useState<ButtonProps[]>([])

  const alertWidth = width >= 1024 ? "50%" : "75%"

  function internalHideAlert() {
    setIsVisible(false)
  }

  useImperativeHandle(ref, () => ({
    showAlert({ title, message, buttons = [] }: ShowAlertProps) {
      const hasSingleOk =
        buttons.length === 1 && buttons[0].text === alert.share.buttons.ok

      setTitle(title)
      setMessage(message)

      setButtons(
        hasSingleOk
          ? buttons
          : [...buttons, { text: "Cancelar", action: internalHideAlert }],
      )

      setIsVisible(true)
    },
    hideAlert: internalHideAlert,
  }))

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={internalHideAlert}
    >
      <Pressable
        className="flex-1 justify-center items-center bg-black/30"
        onPress={internalHideAlert}
      >
        <Pressable className="p-5 bg-slate-700 rounded-lg items-center" style={{ width: alertWidth }}>
          <TextWhite className="text-xl font-bold mb-3">{title}</TextWhite>

          {!!message && (
            <TextWhite className="text-base mb-5 text-center">{message}</TextWhite>
          )}

          <View className="w-full flex-col px-4">
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                className={`p-2 mb-2 rounded items-center 
                  ${button.text === "Cancelar"
                    ? "bg-red-500"
                    : "bg-slate-400"}
                  `}
                onPress={() => {
                  button.action()
                  internalHideAlert()
                }}
              >
                {button.text === alert.share.buttons.whatsapp ? (
                  <Row className="justify-center items-center gap-1">
                    <WhatsappIcon />
                    <Text className="font-bold text-black/90">{button.text}</Text>
                  </Row>
                ) : (
                  <Text
                    className={`font-bold 
                    ${button.text === "Cancelar"
                        ? "text-white"
                        : "text-black/90"
                      }`}
                  >
                    {button.text}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
})
