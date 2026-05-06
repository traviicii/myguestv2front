import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Keyboard, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  useAppointmentHistory,
  useClients,
  useCreateAppointmentLog,
  useCreateService,
  useServices,
} from 'components/data/queries'
import { useFollowUpsStore } from 'components/state/followUpsStore'
import { normalizeServiceName } from 'components/utils/services'
import { useDebouncedValue } from 'components/utils/useDebouncedValue'

import {
  FOLLOW_UP_WEEKS,
  addWeeks,
  buildQuickLogFollowUpMessage,
  buildTodayLabel,
  filterQuickLogClients,
  findLastAppointmentForClient,
  parseQuickLogDateInput,
  resolveQuickLogDefaultFollowUpDate,
  resolveQuickLogNextServiceId,
  type FollowUpChannel,
} from './modelUtils'

type KeyboardField =
  | 'searchText'
  | 'date'
  | 'newServiceName'
  | 'price'
  | 'notes'
  | 'followUpDate'
  | 'followUpMessage'

type FocusableField = { focus?: () => void } | null

const FOCUS_SCROLL_TOLERANCE = 24
const IOS_KEYBOARD_SETTLE_DELAY_MS = 72
const ANDROID_KEYBOARD_SETTLE_DELAY_MS = 48

export function useQuickLogScreenModel() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data: clients = [] } = useClients()
  const { data: serviceOptions = [] } = useServices('true')
  const { data: appointmentHistory = [] } = useAppointmentHistory()
  const createAppointmentLog = useCreateAppointmentLog()
  const createService = useCreateService()
  const addFollowUp = useFollowUpsStore((state) => state.addFollowUp)

  const scrollRef = useRef<any>(null)
  const scrollY = useRef(0)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyboardVisible = useRef(false)
  const inputRefs = useRef<Record<KeyboardField, FocusableField>>({
    searchText: null,
    date: null,
    newServiceName: null,
    price: null,
    notes: null,
    followUpDate: null,
    followUpMessage: null,
  })
  const fieldY = useRef<Partial<Record<KeyboardField, number>>>({})
  const activeField = useRef<KeyboardField | null>(null)
  const previousClientIdRef = useRef<string | null>(null)

  const [searchText, setSearchText] = useState('')
  const debouncedSearchText = useDebouncedValue(searchText, 200)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [newServiceName, setNewServiceName] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(buildTodayLabel())
  const [followUpChannel, setFollowUpChannel] = useState<FollowUpChannel>('sms')
  const [followUpMessage, setFollowUpMessage] = useState('')
  const [hasEditedMessage, setHasEditedMessage] = useState(false)
  const [followUpDate, setFollowUpDate] = useState(() =>
    resolveQuickLogDefaultFollowUpDate(buildTodayLabel())
  )
  const [hasEditedFollowUpDate, setHasEditedFollowUpDate] = useState(false)
  const [activeKeyboardField, setActiveKeyboardField] = useState<KeyboardField | null>(null)

  const filteredClients = useMemo(
    () => filterQuickLogClients(clients, searchText, debouncedSearchText),
    [clients, debouncedSearchText, searchText]
  )

  const selectedClient = clients.find((client) => client.id === selectedClientId) || null
  const primaryService = serviceOptions.find((item) => item.id === selectedServiceId)
  const lastAppointment = useMemo(
    () => findLastAppointmentForClient(appointmentHistory, selectedClientId),
    [appointmentHistory, selectedClientId]
  )

  const defaultFollowUpDate = useMemo(
    () => resolveQuickLogDefaultFollowUpDate(date),
    [date]
  )

  const keyboardAccessoryId = 'quick-log-keyboard-dismiss'
  const keyboardDismissMode =
    Platform.OS === 'ios'
      ? ('interactive' as const)
      : ('on-drag' as const)

  const visibleKeyboardFields = useMemo(
    () =>
      selectedClient
        ? (['date', 'newServiceName', 'price', 'notes', 'followUpDate', 'followUpMessage'] as KeyboardField[])
        : (['searchText'] as KeyboardField[]),
    [selectedClient]
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

  const getFocusOffset = useCallback((field: KeyboardField) => {
    if (field === 'searchText') {
      return Platform.OS === 'ios' ? 54 : 46
    }
    if (field === 'followUpMessage') {
      return Platform.OS === 'ios' ? 104 : 90
    }
    if (field === 'notes') {
      return Platform.OS === 'ios' ? 78 : 66
    }
    return Platform.OS === 'ios' ? 72 : 60
  }, [])

  const scrollFocusedFieldIntoView = useCallback(
    (field: KeyboardField, options?: { delayMs?: number }) => {
      const targetY = fieldY.current[field]
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
    [clearPendingScroll, getFocusOffset]
  )

  const setInputRef = useCallback(
    (field: KeyboardField) => (instance: FocusableField) => {
      inputRefs.current[field] = instance
    },
    []
  )

  const focusKeyboardField = useCallback((field: KeyboardField) => {
    inputRefs.current[field]?.focus?.()
  }, [])

  const handleKeyboardFieldLayout = useCallback((field: KeyboardField, y: number) => {
    fieldY.current[field] = y
  }, [])

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
        setFocusedKeyboardField(null)
        Keyboard.dismiss()
        return
      }

      focusAdjacentKeyboardField('next')
    },
    [focusAdjacentKeyboardField, setFocusedKeyboardField, visibleKeyboardFields]
  )

  const getKeyboardReturnKeyType = useCallback(
    (field: KeyboardField) =>
      visibleKeyboardFields[visibleKeyboardFields.length - 1] === field ? 'done' : 'next',
    [visibleKeyboardFields]
  )

  useEffect(() => {
    const currentClientId = selectedClientId ?? null
    const clientChanged = currentClientId !== previousClientIdRef.current
    previousClientIdRef.current = currentClientId

    if (!selectedClient) {
      setFollowUpMessage('')
      setHasEditedMessage(false)
      return
    }

    if (clientChanged) {
      setFollowUpMessage(buildQuickLogFollowUpMessage(selectedClient.name, followUpChannel))
      setHasEditedMessage(false)
      return
    }

    if (!hasEditedMessage) {
      setFollowUpMessage(buildQuickLogFollowUpMessage(selectedClient.name, followUpChannel))
    }
  }, [followUpChannel, hasEditedMessage, selectedClient, selectedClientId])

  useEffect(() => {
    if (hasEditedFollowUpDate) return
    setFollowUpDate(defaultFollowUpDate)
  }, [defaultFollowUpDate, hasEditedFollowUpDate])

  useEffect(() => {
    if (!selectedClientId || !lastAppointment) return
    if (!selectedServiceId) {
      const nextServiceId = resolveQuickLogNextServiceId(lastAppointment, serviceOptions)
      if (nextServiceId) {
        setSelectedServiceId(nextServiceId)
      }
    }
    if (!price && lastAppointment.price) {
      setPrice(String(lastAppointment.price))
    }
  }, [lastAppointment, price, selectedClientId, selectedServiceId, serviceOptions])

  useEffect(() => {
    setFocusedKeyboardField(null)
    clearPendingScroll()
  }, [clearPendingScroll, selectedClientId, setFocusedKeyboardField])

  useEffect(
    () => () => {
      clearPendingScroll()
    },
    [clearPendingScroll]
  )

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

  const resetForm = () => {
    const nextToday = buildTodayLabel()
    setSelectedClientId(null)
    setSelectedServiceId(null)
    setNewServiceName('')
    setPrice('')
    setNotes('')
    setDate(nextToday)
    setFollowUpChannel('sms')
    setFollowUpMessage('')
    setHasEditedMessage(false)
    setFollowUpDate(resolveQuickLogDefaultFollowUpDate(nextToday))
    setHasEditedFollowUpDate(false)
    setFocusedKeyboardField(null)
    clearPendingScroll()
  }

  const handleSelectClient = useCallback(
    (clientId: string) => {
      setFocusedKeyboardField(null)
      Keyboard.dismiss()
      clearPendingScroll()
      setSelectedClientId(clientId)
    },
    [clearPendingScroll, setFocusedKeyboardField]
  )

  const handleSaveNewService = async () => {
    const normalized = normalizeServiceName(newServiceName)
    if (!normalized) return
    try {
      const service = await createService.mutateAsync({ name: normalized })
      setSelectedServiceId(service.id)
      setNewServiceName('')
      setFocusedKeyboardField(null)
      Keyboard.dismiss()
    } catch {
      // no-op
    }
  }

  const handleSave = async (withFollowUp: boolean) => {
    if (!selectedClient) return
    const numericPrice = price.trim() ? Number(price) : null

    try {
      await createAppointmentLog.mutateAsync({
        clientId: selectedClient.id,
        serviceIds: selectedServiceId ? [selectedServiceId] : [],
        serviceType: primaryService ? normalizeServiceName(primaryService.name) : null,
        notes,
        price: Number.isNaN(numericPrice) ? null : numericPrice,
        date,
      })

      if (withFollowUp) {
        const parsedDue = parseQuickLogDateInput(followUpDate)
        const baseDate = parseQuickLogDateInput(date) ?? new Date()
        const dueDate = parsedDue ?? addWeeks(baseDate, FOLLOW_UP_WEEKS)

        addFollowUp({
          clientId: selectedClient.id,
          dueAt: dueDate.toISOString(),
          channel: followUpChannel,
          message:
            followUpMessage || buildQuickLogFollowUpMessage(selectedClient.name, followUpChannel),
        })
      }

      router.back()
      resetForm()
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error instanceof Error
          ? error.message
          : 'Unable to save quick log right now. Please try again.'
      )
    }
  }

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollY.current = event.nativeEvent.contentOffset.y
  }, [])

  const handleScrollBeginDrag = useCallback(() => {
    setFocusedKeyboardField(null)
    Keyboard.dismiss()
    clearPendingScroll()
  }, [clearPendingScroll, setFocusedKeyboardField])

  const activeKeyboardFieldIndex = activeKeyboardField
    ? visibleKeyboardFields.indexOf(activeKeyboardField)
    : -1
  const canGoToPreviousKeyboardField = activeKeyboardFieldIndex > 0
  const canGoToNextKeyboardField =
    activeKeyboardFieldIndex >= 0 && activeKeyboardFieldIndex < visibleKeyboardFields.length - 1

  return {
    canGoToNextKeyboardField,
    canGoToPreviousKeyboardField,
    contentPaddingBottom: Math.max(40, insets.bottom + 40),
    date,
    filteredClients,
    focusAdjacentKeyboardField,
    followUpChannel,
    followUpDate,
    followUpMessage,
    getKeyboardReturnKeyType,
    handleKeyboardFieldFocus,
    handleKeyboardFieldLayout,
    handleKeyboardFieldSubmit,
    handleSave,
    handleSaveNewService,
    handleScroll,
    handleScrollBeginDrag,
    handleSelectClient,
    hasSelectedClient: Boolean(selectedClient),
    keyboardAccessoryId,
    keyboardDismissMode,
    newServiceName,
    notes,
    price,
    scrollRef,
    searchText,
    selectedClient,
    selectedServiceId,
    serviceOptions,
    setDate,
    setFollowUpChannel,
    setFollowUpDate: (value: string) => {
      setHasEditedFollowUpDate(true)
      setFollowUpDate(value)
    },
    setFollowUpMessage: (value: string) => {
      setHasEditedMessage(true)
      setFollowUpMessage(value)
    },
    setInputRef,
    setNewServiceName,
    setNotes,
    setPrice,
    setSearchText,
    setSelectedServiceId,
    topPadding: Math.max(insets.top + 16, 24),
  }
}

export type QuickLogScreenModel = ReturnType<typeof useQuickLogScreenModel>
