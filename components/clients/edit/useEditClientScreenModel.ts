import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Keyboard, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { parseDateForPicker } from 'components/appointments/shared/datePicker'
import type { ClientType } from 'components/data/models'
import { useClients, useDeleteClient, useUpdateClient } from 'components/data/queries'
import { useThemePrefs } from 'components/ThemePrefs'
import { useExpandablePanel } from 'components/ui/useExpandablePanel'
import { formatDateMMDDYYYY } from 'components/utils/date'
import { successHaptic, warningHaptic } from 'components/utils/haptics'
import { formatPhoneForInput } from 'components/utils/phone'

const normalizeType = (value: string, fallback: ClientType) => {
  const trimmed = value.trim()
  if (trimmed === 'Cut' || trimmed === 'Color' || trimmed === 'Cut & Color') {
    return trimmed
  }
  return fallback
}

const splitDisplayName = (value: string) => {
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (!normalized) return { firstName: '', lastName: '' }
  const [firstName, ...rest] = normalized.split(' ')
  return {
    firstName,
    lastName: rest.join(' ').trim(),
  }
}

type EditClientForm = {
  birthday: string
  email: string
  firstName: string
  lastName: string
  notes: string
  phone: string
  type: ClientType
}

type ScrollTarget = {
  scrollTo: (options: { animated: boolean; y: number }) => void
}

type KeyboardField = 'firstName' | 'lastName' | 'email' | 'phone' | 'notes'
type FocusTarget = KeyboardField | 'birthday'
type FocusableField = { focus?: () => void } | null

type SectionKey = 'name' | 'notes'

const KEYBOARD_FIELDS: KeyboardField[] = ['firstName', 'lastName', 'email', 'phone', 'notes']
const FOCUS_SCROLL_TOLERANCE = 24

export function useEditClientScreenModel() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const deleteClient = useDeleteClient()
  const updateClient = useUpdateClient()
  const scrollRef = useRef<ScrollTarget | null>(null)
  const scrollY = useRef(0)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyboardVisible = useRef(false)
  const inputRefs = useRef<Record<KeyboardField, FocusableField>>({
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    notes: null,
  })
  const requiredY = useRef<{ firstName?: number; lastName?: number }>({})
  const sectionY = useRef<Partial<Record<SectionKey, number>>>({})
  const groupY = useRef<Partial<Record<SectionKey, number>>>({})
  const focusY = useRef<Partial<Record<FocusTarget, number>>>({})
  const activeField = useRef<KeyboardField | null>(null)

  const client = useMemo(() => clients.find((item) => item.id === id), [clients, id])

  const initialForm = useMemo<EditClientForm>(() => {
    const displayNameParts = splitDisplayName(client?.name ?? '')

    return {
      firstName: client?.firstName ?? displayNameParts.firstName,
      lastName: client?.lastName ?? displayNameParts.lastName,
      email: client?.email ?? '',
      phone: formatPhoneForInput(client?.phone ?? ''),
      birthday: client?.birthday ?? '',
      type: client?.type ?? 'Cut',
      notes: client?.notes ?? '',
    }
  }, [client])

  const [form, setForm] = useState(initialForm)
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false)
  const [activeKeyboardField, setActiveKeyboardField] = useState<KeyboardField | null>(null)
  const birthdayPanel = useExpandablePanel(showBirthdayPicker, { hideDelayMs: 260 })

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

  const isDirty = useMemo(
    () =>
      form.firstName !== initialForm.firstName ||
      form.lastName !== initialForm.lastName ||
      form.email !== initialForm.email ||
      form.phone !== initialForm.phone ||
      form.birthday !== initialForm.birthday ||
      form.type !== initialForm.type ||
      form.notes !== initialForm.notes,
    [form, initialForm]
  )

  const hasRequired = Boolean(form.firstName.trim() && form.lastName.trim())
  const canSave = isDirty && !deleteClient.isPending && !updateClient.isPending
  const showFirstNameError = attemptedSave && !form.firstName.trim()
  const showLastNameError = attemptedSave && !form.lastName.trim()
  const keyboardAccessoryId = 'client-edit-keyboard-dismiss'
  const keyboardDismissMode: 'interactive' | 'on-drag' =
    Platform.OS === 'ios' ? 'interactive' : 'on-drag'
  const isBootstrapping = clientsLoading && !clients.length
  const isMissingClient = !isBootstrapping && !client
  const contentBottomPadding = 40 + insets.bottom
  const birthdayDisplayValue = useMemo(
    () => (form.birthday ? formatDateMMDDYYYY(form.birthday) : ''),
    [form.birthday]
  )
  const birthdayPickerDate = useMemo(() => {
    const parsed = parseDateForPicker(birthdayDisplayValue)
    return parsed ?? new Date(1990, 0, 1)
  }, [birthdayDisplayValue])

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

  const closeBirthdayPicker = useCallback(() => {
    setShowBirthdayPicker(false)
  }, [])

  const resolveSectionForField = useCallback((field: FocusTarget): SectionKey => {
    if (field === 'notes') return 'notes'
    return 'name'
  }, [])

  const resolveFieldTarget = useCallback(
    (field: FocusTarget) => {
      const fieldY = focusY.current[field]
      if (typeof fieldY !== 'number') return undefined

      const section = resolveSectionForField(field)
      const sectionOffset = sectionY.current[section]
      const groupOffset = groupY.current[section]
      if (typeof sectionOffset !== 'number' || typeof groupOffset !== 'number') {
        return undefined
      }

      return sectionOffset + groupOffset + fieldY
    },
    [resolveSectionForField]
  )

  const getFocusOffset = useCallback((field: FocusTarget) => {
    if (field === 'firstName' || field === 'lastName') {
      return Platform.OS === 'ios' ? 36 : 28
    }
    if (field === 'notes') {
      return Platform.OS === 'ios' ? 96 : 82
    }
    if (field === 'birthday') {
      return Platform.OS === 'ios' ? 132 : 108
    }
    return Platform.OS === 'ios' ? 76 : 64
  }, [])

  const scrollFocusedFieldIntoView = useCallback(
    (field: FocusTarget, options?: { delayMs?: number }) => {
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

  const updateField = useCallback(<K extends keyof EditClientForm>(field: K, value: EditClientForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleSectionLayout = useCallback((section: SectionKey, y: number) => {
    sectionY.current[section] = y
  }, [])

  const handleGroupLayout = useCallback((section: SectionKey, y: number) => {
    groupY.current[section] = y
  }, [])

  const handleKeyboardFieldLayout = useCallback((field: FocusTarget, y: number) => {
    focusY.current[field] = y
    if (field === 'firstName') {
      requiredY.current.firstName = y
    }
    if (field === 'lastName') {
      requiredY.current.lastName = y
    }
  }, [])

  const handleBirthdayLayout = useCallback((y: number) => {
    focusY.current.birthday = y
  }, [])

  const handleBirthdayFieldPress = useCallback(() => {
    Keyboard.dismiss()
    setFocusedKeyboardField(null)
    scrollFocusedFieldIntoView('birthday')
    if (Platform.OS === 'android') {
      setShowBirthdayPicker(true)
      return
    }
    setShowBirthdayPicker((current) => !current)
  }, [scrollFocusedFieldIntoView, setFocusedKeyboardField])

  const handleBirthdayChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowBirthdayPicker(false)
      }
      if (!selectedDate) return
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      updateField('birthday', `${year}-${month}-${day}`)
    },
    [updateField]
  )

  const handleClearBirthday = useCallback(() => {
    closeBirthdayPicker()
    updateField('birthday', '')
  }, [closeBirthdayPicker, updateField])

  const setInputRef = useCallback(
    (field: KeyboardField) => (instance: FocusableField) => {
      inputRefs.current[field] = instance
    },
    []
  )

  const focusKeyboardField = useCallback((field: KeyboardField) => {
    inputRefs.current[field]?.focus?.()
  }, [])

  const handleKeyboardFieldFocus = useCallback(
    (field: KeyboardField) => {
      closeBirthdayPicker()
      setFocusedKeyboardField(field)
      if (keyboardVisible.current) {
        scrollFocusedFieldIntoView(field, { delayMs: 20 })
      }
    },
    [closeBirthdayPicker, scrollFocusedFieldIntoView, setFocusedKeyboardField]
  )

  const focusAdjacentKeyboardField = useCallback(
    (direction: 'previous' | 'next') => {
      const currentField = activeField.current ?? activeKeyboardField
      if (!currentField) return

      const currentIndex = KEYBOARD_FIELDS.indexOf(currentField)
      if (currentIndex === -1) return

      const nextIndex = direction === 'previous' ? currentIndex - 1 : currentIndex + 1
      const targetField = KEYBOARD_FIELDS[nextIndex]
      if (!targetField) return

      setFocusedKeyboardField(targetField)
      setTimeout(() => {
        focusKeyboardField(targetField)
        if (keyboardVisible.current) {
          scrollFocusedFieldIntoView(targetField, { delayMs: 20 })
        }
      }, 0)
    },
    [activeKeyboardField, focusKeyboardField, scrollFocusedFieldIntoView, setFocusedKeyboardField]
  )

  const pulseNameError = useCallback((delayMs: number) => {
    setTimeout(() => {
      setPulseKey((count) => count + 1)
    }, delayMs)
  }, [])

  const handleSave = useCallback(async () => {
    setAttemptedSave(true)
    if (!hasRequired || !isDirty) {
      if (!hasRequired) {
        void warningHaptic()
        const targetY = resolveFieldTarget(
          !form.firstName.trim() ? 'firstName' : 'lastName'
        )
        if (typeof targetY === 'number') {
          scrollRef.current?.scrollTo({
            y: Math.max(0, targetY - 12),
            animated: true,
          })
          pulseNameError(350)
        } else {
          pulseNameError(0)
        }
      }
      return
    }

    if (!client) return

    try {
      await updateClient.mutateAsync({
        clientId: client.id,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        birthday: form.birthday,
        clientType: normalizeType(form.type, client.type),
        notes: form.notes,
      })
      void successHaptic()
      router.back()
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error instanceof Error
          ? error.message
          : 'Unable to save this client right now. Please try again.'
      )
    }
  }, [client, form, hasRequired, isDirty, pulseNameError, resolveFieldTarget, router, updateClient])

  const confirmDelete = useCallback(() => {
    if (!client || deleteClient.isPending) return

    Alert.alert(
      'Delete Client?',
      'This will permanently remove the client, appointment logs, and color chart data for this client.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                void warningHaptic()
                await deleteClient.mutateAsync(client.id)
                void successHaptic()
                router.replace('/(tabs)/clients')
              } catch (error) {
                Alert.alert(
                  'Delete Failed',
                  error instanceof Error
                    ? error.message
                    : 'Unable to delete this client right now. Please try again.'
                )
              }
            })()
          },
        },
      ]
    )
  }, [client, deleteClient, router])

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollY.current = event.nativeEvent.contentOffset.y
  }, [])

  const handleScrollBeginDrag = useCallback(() => {
    setFocusedKeyboardField(null)
    Keyboard.dismiss()
    closeBirthdayPicker()
  }, [closeBirthdayPicker, setFocusedKeyboardField])

  useEffect(() => {
    const handleKeyboardShow = () => {
      keyboardVisible.current = true
      if (activeField.current) {
        scrollFocusedFieldIntoView(activeField.current, {
          delayMs: Platform.OS === 'ios' ? 72 : 48,
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
      clearPendingScroll()
    }
  }, [clearPendingScroll, scrollFocusedFieldIntoView, setFocusedKeyboardField])

  const activeKeyboardFieldIndex = activeKeyboardField
    ? KEYBOARD_FIELDS.indexOf(activeKeyboardField)
    : -1
  const canGoToPreviousKeyboardField = activeKeyboardFieldIndex > 0
  const canGoToNextKeyboardField =
    activeKeyboardFieldIndex >= 0 && activeKeyboardFieldIndex < KEYBOARD_FIELDS.length - 1

  return {
    birthdayDisplayValue,
    birthdayPanel,
    birthdayPickerDate,
    canGoToNextKeyboardField,
    canGoToPreviousKeyboardField,
    canSave,
    client,
    closeBirthdayPicker,
    confirmDelete,
    contentBottomPadding,
    focusAdjacentKeyboardField,
    form,
    handleBack,
    handleBirthdayChange,
    handleClearBirthday,
    handleBirthdayFieldPress,
    handleBirthdayLayout,
    handleGroupLayout,
    handleKeyboardFieldFocus,
    handleKeyboardFieldLayout,
    handleSave,
    handleScroll,
    handleScrollBeginDrag,
    handleSectionLayout,
    isBootstrapping,
    isGlass,
    isMissingClient,
    isSaving: updateClient.isPending,
    isDeleting: deleteClient.isPending,
    keyboardAccessoryId,
    keyboardDismissMode,
    pulseKey,
    scrollRef,
    setForm,
    setInputRef,
    showBirthdayPicker,
    showFirstNameError,
    showLastNameError,
    topInset,
    updateField,
  }
}

export type EditClientScreenModel = ReturnType<typeof useEditClientScreenModel>
