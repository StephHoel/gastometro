import { alert } from "@/constants/alert"
import type { ButtonProps } from "@/interfaces/ButtonProps"
import React, { forwardRef, useImperativeHandle, useState } from "react"
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import type { ShowAlertProps } from "../interfaces/ShowAlertProps"
import { WhatsappIcon } from './Icons'
import { Row } from './Row'
import { TextWhite } from './TextWhite'

export interface CustomAlertRef {
  showAlert: (params: ShowAlertProps) => void
  hideAlert: () => void
}

export const CustomAlert = forwardRef<CustomAlertRef>((_, ref) => {
  const [isVisible, setIsVisible] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [buttons, setButtons] = useState<ButtonProps[]>([])

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
      <TouchableWithoutFeedback onPress={internalHideAlert}>
        <View className="flex-1 justify-center items-center bg-black/30">
          <TouchableWithoutFeedback>
            <View className="w-3/4 p-5 bg-slate-700 rounded-lg  items-center">
              <TextWhite className="text-xl font-bold mb-3">{title}</TextWhite>

              {message && (
                <TextWhite className="text-base mb-5 text-center">{message}</TextWhite>
              )}

              <View className="w-full flex-col px-4">
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`p-2 mb-2 rounded items-center ${button.text === "Cancelar" ? "bg-red-500" : "bg-slate-400"
                      }`}
                    onPress={() => {
                      button.action()
                      internalHideAlert()
                    }}
                  >
                    <Text
                      className={`font-bold ${button.text === "Cancelar"
                        ? "text-white"
                        : "text-black/90"
                        }`}
                    >
                      {button.text === alert.share.buttons.whatsapp ? (
                        <Row className="justify-center items-center gap-1">
                          <WhatsappIcon /> {button.text}
                        </Row>
                      ) : (
                        button.text
                      )}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
})
