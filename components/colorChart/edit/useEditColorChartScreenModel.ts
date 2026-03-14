import { useEffect, useMemo, useState } from 'react'
import { Keyboard, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useToastController } from '@tamagui/toast'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useThemePrefs } from 'components/ThemePrefs'
import { createColorChartFormState, isColorChartDirty } from 'components/colorChart/form'
import {
  type ColorChartFormState,
  type ColorChartPicklistFieldKey,
} from 'components/colorChart/config'
import {
  useClients,
  useColorAnalysisByClient,
  useColorAnalysisForClient,
  useUpsertColorAnalysisForClient,
} from 'components/data/queries'

import {
  buildOtherInputState,
  normalizeFormState,
  type OtherInputState,
} from './modelUtils'

export function useEditColorChartScreenModel() {
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const toast = useToastController()
  const upsertColorChart = useUpsertColorAnalysisForClient()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: colorAnalysisByClient = {} } = useColorAnalysisByClient()

  const client = clients.find((item) => item.id === id)
  const clientId = client?.id
  const { data: colorAnalysisForClient } = useColorAnalysisForClient(clientId)
  const colorAnalysis = client
    ? colorAnalysisForClient ?? colorAnalysisByClient[client.id]
    : undefined

  const sourceForm = useMemo(
    () => createColorChartFormState(colorAnalysis),
    [colorAnalysis]
  )
  const initialState = useMemo(() => normalizeFormState(sourceForm), [sourceForm])

  const [form, setForm] = useState<ColorChartFormState>(() => initialState)
  const [initialSnapshot, setInitialSnapshot] = useState<ColorChartFormState>(
    () => initialState
  )
  const [otherInputs, setOtherInputs] = useState<OtherInputState>(() =>
    buildOtherInputState(initialState)
  )
  const isBootstrapping = clientsLoading && !clients.length

  useEffect(() => {
    setForm(initialState)
    setInitialSnapshot(initialState)
    setOtherInputs(buildOtherInputState(initialState))
  }, [client?.id, initialState])

  const isDirty = useMemo(
    () => isColorChartDirty(form, initialSnapshot),
    [form, initialSnapshot]
  )

  const keyboardAccessoryId = 'color-chart-edit-keyboard-dismiss'
  const keyboardDismissMode = Platform.OS === 'ios' ? 'interactive' : 'on-drag'

  const handleBack = () => router.back()

  const setField = (field: keyof ColorChartFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const selectPicklistOption = (
    field: ColorChartPicklistFieldKey,
    option: string
  ) => {
    setField(field, option)
    setOtherInputs((prev) => ({ ...prev, [field]: false }))
  }

  const enableOtherInput = (field: ColorChartPicklistFieldKey) => {
    setOtherInputs((prev) => ({ ...prev, [field]: true }))
    if (form[field]) {
      setField(field, '')
    }
  }

  const dismissKeyboard = () => Keyboard.dismiss()

  const handleSave = async () => {
    if (!isDirty || !client) return

    const nextBaseline = normalizeFormState(form)
    try {
      await upsertColorChart.mutateAsync({
        clientId: client.id,
        input: nextBaseline,
      })
      setForm(nextBaseline)
      setInitialSnapshot(nextBaseline)
      setOtherInputs(buildOtherInputState(nextBaseline))
      toast.show('Saved', {
        message: 'Color chart updated.',
      })
      router.back()
    } catch (error) {
      toast.show('Save failed', {
        message:
          error instanceof Error
            ? error.message
            : 'Unable to save color chart. Please try again.',
      })
    }
  }

  return {
    client,
    dismissKeyboard,
    form,
    handleBack,
    handleSave,
    isBootstrapping,
    isDirty,
    isGlass,
    keyboardAccessoryId,
    keyboardDismissMode,
    otherInputs,
    selectPicklistOption,
    setField,
    enableOtherInput,
    topInset,
    upsertColorChart,
  }
}

export type EditColorChartScreenModel = ReturnType<typeof useEditColorChartScreenModel>
