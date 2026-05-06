import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useToastController } from '@tamagui/toast'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useThemePrefs } from 'components/ThemePrefs'
import { createColorChartFormState, isColorChartDirty } from 'components/colorChart/form'
import {
  COLOR_CHART_GROUPS,
  type ColorChartFieldKey,
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
  isPicklistField,
  normalizeFormState,
  type OtherInputState,
} from './modelUtils'

type KeyboardField = ColorChartFieldKey
type FocusableField = { focus?: () => void } | null
type ColorChartGroupId = (typeof COLOR_CHART_GROUPS)[number]['id']

const FOCUS_SCROLL_TOLERANCE = 24
const IOS_KEYBOARD_SETTLE_DELAY_MS = 72
const ANDROID_KEYBOARD_SETTLE_DELAY_MS = 48

const FIELD_GROUP_MAP = COLOR_CHART_GROUPS.reduce(
  (acc, group) => {
    group.fields.forEach((field) => {
      acc[field] = group.id
    })
    return acc
  },
  {} as Record<ColorChartFieldKey, ColorChartGroupId>
)

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

  const scrollRef = useRef<any>(null)
  const scrollY = useRef(0)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyboardVisible = useRef(false)
  const inputRefs = useRef<Record<KeyboardField, FocusableField>>({
    porosity: null,
    hair_texture: null,
    elasticity: null,
    scalp_condition: null,
    natural_level: null,
    desired_level: null,
    contrib_pigment: null,
    gray_front: null,
    gray_sides: null,
    gray_back: null,
    skin_depth: null,
    skin_tone: null,
    eye_color: null,
  })
  const sectionY = useRef<Partial<Record<ColorChartGroupId, number>>>({})
  const cardY = useRef<Partial<Record<ColorChartGroupId, number>>>({})
  const fieldY = useRef<Partial<Record<KeyboardField, number>>>({})
  const activeField = useRef<KeyboardField | null>(null)
  const pendingAutoFocusField = useRef<KeyboardField | null>(null)

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
  const [activeKeyboardField, setActiveKeyboardField] = useState<KeyboardField | null>(null)
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
  const contentBottomPadding = Math.max(48, insets.bottom + 48)

  const visibleKeyboardFields = useMemo(
    () =>
      COLOR_CHART_GROUPS.flatMap((group) =>
        group.fields.filter((field) =>
          isPicklistField(field) ? otherInputs[field] : true
        )
      ) as KeyboardField[],
    [otherInputs]
  )

  const clearPendingScroll = useCallback(() => {
    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = null
    }
  }, [])

  const setFocusedKeyboardField = useCallback((field: KeyboardField | null) => {
    activeField.current = field
    setActiveKeyboardField(field)
  }, [])

  const resolveFieldTarget = useCallback((field: KeyboardField) => {
    const groupId = FIELD_GROUP_MAP[field]
    const absoluteSectionY = sectionY.current[groupId]
    const absoluteCardY = cardY.current[groupId]
    const relativeFieldY = fieldY.current[field]

    if (
      typeof absoluteSectionY !== 'number' ||
      typeof absoluteCardY !== 'number' ||
      typeof relativeFieldY !== 'number'
    ) {
      return undefined
    }

    return absoluteSectionY + absoluteCardY + relativeFieldY
  }, [])

  const getFocusOffset = useCallback((field: KeyboardField) => {
    if (field === 'gray_front' || field === 'gray_sides' || field === 'gray_back') {
      return Platform.OS === 'ios' ? 84 : 72
    }

    return Platform.OS === 'ios' ? 76 : 64
  }, [])

  const scrollFocusedFieldIntoView = useCallback(
    (field: KeyboardField, options?: { delayMs?: number }) => {
      const targetY = resolveFieldTarget(field)
      if (typeof targetY !== 'number') return

      clearPendingScroll()
      const delay =
        options?.delayMs ??
        (keyboardVisible.current
          ? Platform.OS === 'ios'
            ? 12
            : 20
          : Platform.OS === 'ios'
            ? 72
            : 36)

      scrollTimeoutRef.current = setTimeout(() => {
        const nextScrollY = Math.max(0, targetY - getFocusOffset(field))

        if (Math.abs(scrollY.current - nextScrollY) < FOCUS_SCROLL_TOLERANCE) {
          scrollTimeoutRef.current = null
          return
        }

        scrollRef.current?.scrollTo({
          y: nextScrollY,
          animated: true,
        })
        scrollTimeoutRef.current = null
      }, delay)
    },
    [clearPendingScroll, getFocusOffset, resolveFieldTarget]
  )

  const focusKeyboardField = useCallback((field: KeyboardField) => {
    inputRefs.current[field]?.focus?.()
  }, [])

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
    if (activeField.current === field) {
      setFocusedKeyboardField(null)
      Keyboard.dismiss()
      clearPendingScroll()
    }
  }

  const enableOtherInput = (field: ColorChartPicklistFieldKey) => {
    pendingAutoFocusField.current = field
    setOtherInputs((prev) => ({ ...prev, [field]: true }))
    if (form[field]) {
      setField(field, '')
    }
  }

  const dismissKeyboard = useCallback(() => {
    setFocusedKeyboardField(null)
    Keyboard.dismiss()
    clearPendingScroll()
  }, [clearPendingScroll, setFocusedKeyboardField])

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

  const handleGroupSectionLayout = useCallback((groupId: ColorChartGroupId, y: number) => {
    sectionY.current[groupId] = y
  }, [])

  const handleGroupCardLayout = useCallback((groupId: ColorChartGroupId, y: number) => {
    cardY.current[groupId] = y
  }, [])

  const handleKeyboardFieldLayout = useCallback((field: KeyboardField, y: number) => {
    fieldY.current[field] = y
  }, [])

  const setInputRef = useCallback(
    (field: KeyboardField) => (instance: FocusableField) => {
      inputRefs.current[field] = instance
    },
    []
  )

  const handleKeyboardFieldFocus = useCallback(
    (field: KeyboardField) => {
      setFocusedKeyboardField(field)
      if (keyboardVisible.current) {
        scrollFocusedFieldIntoView(field, { delayMs: 20 })
      }
    },
    [scrollFocusedFieldIntoView, setFocusedKeyboardField]
  )

  const focusAdjacentKeyboardField = useCallback(
    (direction: 'previous' | 'next') => {
      const currentField = activeField.current ?? activeKeyboardField
      if (!currentField) return

      const currentIndex = visibleKeyboardFields.indexOf(currentField)
      if (currentIndex === -1) return

      const nextIndex = direction === 'previous' ? currentIndex - 1 : currentIndex + 1
      const targetField = visibleKeyboardFields[nextIndex]
      if (!targetField) return

      setFocusedKeyboardField(targetField)
      setTimeout(() => {
        focusKeyboardField(targetField)
        if (keyboardVisible.current) {
          scrollFocusedFieldIntoView(targetField, { delayMs: 20 })
        }
      }, 0)
    },
    [activeKeyboardField, focusKeyboardField, scrollFocusedFieldIntoView, setFocusedKeyboardField, visibleKeyboardFields]
  )

  const handleKeyboardFieldSubmit = useCallback(
    (field: KeyboardField) => {
      const currentIndex = visibleKeyboardFields.indexOf(field)
      if (currentIndex === -1) return

      if (currentIndex >= visibleKeyboardFields.length - 1) {
        dismissKeyboard()
        return
      }

      focusAdjacentKeyboardField('next')
    },
    [dismissKeyboard, focusAdjacentKeyboardField, visibleKeyboardFields]
  )

  const getKeyboardReturnKeyType = useCallback(
    (field: KeyboardField) =>
      visibleKeyboardFields[visibleKeyboardFields.length - 1] === field ? 'done' : 'next',
    [visibleKeyboardFields]
  )

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollY.current = event.nativeEvent.contentOffset.y
  }, [])

  useEffect(
    () => () => {
      clearPendingScroll()
    },
    [clearPendingScroll]
  )

  useEffect(() => {
    const pendingField = pendingAutoFocusField.current
    if (!pendingField || !isPicklistField(pendingField) || !otherInputs[pendingField]) return

    const timer = setTimeout(() => {
      focusKeyboardField(pendingField)
      pendingAutoFocusField.current = null
    }, 0)

    return () => clearTimeout(timer)
  }, [focusKeyboardField, otherInputs])

  useEffect(() => {
    const handleKeyboardShow = () => {
      keyboardVisible.current = true
      if (activeField.current) {
        scrollFocusedFieldIntoView(activeField.current, {
          delayMs: Platform.OS === 'ios'
            ? IOS_KEYBOARD_SETTLE_DELAY_MS
            : ANDROID_KEYBOARD_SETTLE_DELAY_MS,
        })
      }
    }

    const handleKeyboardHide = () => {
      keyboardVisible.current = false
      setFocusedKeyboardField(null)
      clearPendingScroll()
    }

    const showSub = Keyboard.addListener('keyboardDidShow', handleKeyboardShow)
    const hideSub = Keyboard.addListener('keyboardDidHide', handleKeyboardHide)

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [clearPendingScroll, scrollFocusedFieldIntoView, setFocusedKeyboardField])

  const activeKeyboardFieldIndex = activeKeyboardField
    ? visibleKeyboardFields.indexOf(activeKeyboardField)
    : -1
  const canGoToPreviousKeyboardField = activeKeyboardFieldIndex > 0
  const canGoToNextKeyboardField =
    activeKeyboardFieldIndex >= 0 && activeKeyboardFieldIndex < visibleKeyboardFields.length - 1

  return {
    canGoToNextKeyboardField,
    canGoToPreviousKeyboardField,
    client,
    contentBottomPadding,
    dismissKeyboard,
    enableOtherInput,
    focusAdjacentKeyboardField,
    form,
    getKeyboardReturnKeyType,
    handleBack,
    handleGroupCardLayout,
    handleGroupSectionLayout,
    handleKeyboardFieldFocus,
    handleKeyboardFieldLayout,
    handleKeyboardFieldSubmit,
    handleSave,
    handleScroll,
    isBootstrapping,
    isDirty,
    isGlass,
    keyboardAccessoryId,
    keyboardDismissMode,
    otherInputs,
    selectPicklistOption,
    scrollRef,
    setField,
    setInputRef,
    topInset,
    upsertColorChart,
  }
}

export type EditColorChartScreenModel = ReturnType<typeof useEditColorChartScreenModel>
