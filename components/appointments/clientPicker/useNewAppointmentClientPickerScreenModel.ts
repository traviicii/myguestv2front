import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useThemePrefs } from 'components/ThemePrefs'
import { useAppointmentHistoryLite, useClients } from 'components/data/queries'
import { useStudioStore } from 'components/state/studioStore'
import { deriveLastVisitByClient } from 'components/utils/clientDerived'
import { useDebouncedValue } from 'components/utils/useDebouncedValue'

import {
  filterAppointmentPickerClients,
  formatAppointmentPickerLastVisitLabel,
} from './modelUtils'

export function useNewAppointmentClientPickerScreenModel() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { aesthetic } = useThemePrefs()
  const appSettings = useStudioStore((state) => state.appSettings)
  const { data: clients = [] } = useClients()
  const { data: appointmentHistory = [] } = useAppointmentHistoryLite()

  const [searchText, setSearchText] = useState('')
  const debouncedSearchText = useDebouncedValue(searchText, 200)
  const searchInputRef = useRef<any>(null)

  const topInset = Math.max(insets.top + 8, 16)
  const isCyberpunk = aesthetic === 'cyberpunk'
  const isGlass = aesthetic === 'glass'
  const controlRadius = isCyberpunk ? 0 : isGlass ? 20 : 10
  const effectiveSearchText = searchText.trim() ? debouncedSearchText : searchText

  const filteredClients = useMemo(
    () => filterAppointmentPickerClients(clients, effectiveSearchText),
    [clients, effectiveSearchText]
  )
  const derivedLastVisitByClient = useMemo(
    () => deriveLastVisitByClient(appointmentHistory),
    [appointmentHistory]
  )

  const handleBack = () => router.back()

  const handleClearSearch = () => {
    if (!searchText) return
    setSearchText('')
    requestAnimationFrame(() => {
      searchInputRef.current?.focus?.()
    })
  }

  const formatLastVisitLabel = (value: string) =>
    formatAppointmentPickerLastVisitLabel(value, appSettings)

  return {
    controlRadius,
    filteredClients,
    formatLastVisitLabel,
    handleBack,
    handleClearSearch,
    isGlass,
    searchInputRef,
    searchText,
    setSearchText,
    topInset,
    derivedLastVisitByClient,
  }
}

export type NewAppointmentClientPickerScreenModel = ReturnType<
  typeof useNewAppointmentClientPickerScreenModel
>
