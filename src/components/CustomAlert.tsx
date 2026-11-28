import { alert } from "@/constants/alert"
import { INPUTS } from '@/constants/text/inputs'
import type { ButtonProps } from "@/interfaces/ButtonProps"
import type { CustomAlertRef } from "@/interfaces/CustomAlertRef"
import React, { ForwardedRef, useImperativeHandle, useState } from "react"
import { Modal, Pressable, Text, TouchableOpacity, useWindowDimensions, View } from "react-native"
import type { ShowAlertProps } from "@/interfaces/ShowAlertProps"
import { WhatsappIcon } from './Icons'
import { Row } from './Row'
import { TextWhite } from './TextWhite'

export function CustomAlert({ ref }: { ref: ForwardedRef<CustomAlertRef> }) {
  const { width } = useWindowDimensions()
  const [isVisible, setIsVisible] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [buttons, setButtons] = useState<ButtonProps[]>([])
  const [onClose, setOnClose] = useState<(() => void) | undefined>(undefined)

  const alertWidth = width >= 1024 ? "50%" : "75%"

  function internalHideAlert() {
    setIsVisible(false)
    if (onClose) {
      onClose()
    }
    setOnClose(undefined)
  }

  useImperativeHandle(ref, () => ({
    showAlert({ title, message, buttons = [], onClose }: ShowAlertProps) {
      const hasSingleOk =
        buttons.length === 1 && buttons[0].text === alert.share.buttons.ok

      setTitle(title)
      setMessage(message)

      setButtons(
        hasSingleOk
          ? buttons
          : [...buttons, { text: INPUTS.buttons.cancel, action: internalHideAlert }],
      )
      setOnClose(() => onClose)

      setIsVisible(true)
    },
    hideAlert: internalHideAlert,
  }))

  return (
    <Modal
      role="dialog"
      accessibilityLabel={title}
      testID="custom-alert-dialog"
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={internalHideAlert}
    >
      <Pressable
        accessible={false}
        className="flex-1 justify-center items-center bg-black/30"
        onPress={internalHideAlert}
      >
        <View
          className="p-5 bg-slate-700 rounded-lg items-center"
          style={{ width: alertWidth }}
        >
          <TextWhite accessibilityRole="header" className="text-xl font-bold mb-3" style={{ color: "#FFFFFF", backgroundColor: "#334155" }}>{title}</TextWhite>

          {!!message && (
            <TextWhite accessibilityRole="alert" accessibilityLiveRegion="assertive" className="text-base mb-5 text-center" style={{ color: "#FFFFFF", backgroundColor: "#334155" }}>{message}</TextWhite>
          )}

          <View className="w-full flex-col px-4">
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={{ backgroundColor: button.text === INPUTS.buttons.cancel ? "#dc2626" : "#94a3b8" }}
                accessibilityRole="button"
                accessibilityLabel={button.text}
                className={`min-h-11 p-2 mb-2 rounded items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400 
                  ${button.text === INPUTS.buttons.cancel
                    ? "bg-red-600"
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
                    <Text className="font-bold" style={{ color: "#000000", backgroundColor: "#94a3b8" }}>{button.text}</Text>
                  </Row>
                ) : (
                  <Text
                    className="font-bold"
                    style={{
                      color: button.text === INPUTS.buttons.cancel ? "#FFFFFF" : "#000000",
                      backgroundColor: button.text === INPUTS.buttons.cancel ? "#dc2626" : "#94a3b8",
                    }}
                  >
                    {button.text}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  )
}
