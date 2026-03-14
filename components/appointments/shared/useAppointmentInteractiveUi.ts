import { useState } from 'react'
import { Keyboard, Platform } from 'react-native'

import { useExpandablePanel } from 'components/ui/useExpandablePanel'

export function useAppointmentInteractiveUi() {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showServicePicker, setShowServicePicker] = useState(false)

  const datePanel = useExpandablePanel(showDatePicker, { hideDelayMs: 260 })
  const servicePanel = useExpandablePanel(showServicePicker, { hideDelayMs: 220 })

  const closePickers = () => {
    setShowDatePicker(false)
    setShowServicePicker(false)
  }

  const closeServicePicker = () => setShowServicePicker(false)

  const dismissInteractiveUI = () => {
    Keyboard.dismiss()
    closePickers()
  }

  const handleDateFieldPress = () => {
    Keyboard.dismiss()
    setShowServicePicker(false)
    if (Platform.OS === 'android') {
      setShowDatePicker(true)
      return
    }
    setShowDatePicker((current) => !current)
  }

  const handleServiceFieldPress = () => {
    Keyboard.dismiss()
    setShowDatePicker(false)
    setShowServicePicker((current) => !current)
  }

  return {
    closePickers,
    closeServicePicker,
    datePanel,
    dismissInteractiveUI,
    handleDateFieldPress,
    handleServiceFieldPress,
    servicePanel,
    setShowDatePicker,
    setShowServicePicker,
    showDatePicker,
    showServicePicker,
  }
}

export type AppointmentInteractiveUiState = ReturnType<typeof useAppointmentInteractiveUi>
