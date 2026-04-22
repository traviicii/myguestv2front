import { useCallback, useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Alert, Keyboard, Platform } from 'react-native'

import { parseDateForPicker } from 'components/appointments/shared/datePicker'
import { useCreateClient } from 'components/data/queries'
import { useExpandablePanel } from 'components/ui/useExpandablePanel'
import { formatDateMMDDYYYY } from 'components/utils/date'
import { successHaptic, warningHaptic } from 'components/utils/haptics'

import {
  buildNewClientInitialForm,
  getNewClientRequiredScrollTarget,
  hasNewClientDraftContent,
  hasRequiredNewClientFields,
  type ClientType,
} from './newClientFormUtils'

type KeyboardField = 'firstName' | 'lastName' | 'email' | 'phone' | 'notes'
type FocusableField = { focus?: () => void } | null

const KEYBOARD_FIELDS: KeyboardField[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'notes',
]

export function useNewClientFormModel() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<any>(null)
  const scrollY = useRef(0)
  const createClient = useCreateClient()
  const requiredY = useRef<{ firstName?: number; lastName?: number; notes?: number }>({})
  const focusY = useRef<{ identity?: number; birthday?: number; notes?: number }>({})
  const defaultType: ClientType = 'Cut & Color'

  const [clientType, setClientType] = useState<ClientType>(defaultType)
  const [form, setForm] = useState(() => buildNewClientInitialForm())
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false)
  const [activeKeyboardField, setActiveKeyboardField] = useState<KeyboardField | null>(null)
  const birthdayPanel = useExpandablePanel(showBirthdayPicker, { hideDelayMs: 260 })
  const inputRefs = useRef<Record<KeyboardField, FocusableField>>({
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    notes: null,
  })

  const isDirty = useMemo(
    () =>
      hasNewClientDraftContent({
        clientType,
        defaultType,
        form,
      }),
    [clientType, defaultType, form]
  )

  const hasRequired = useMemo(() => hasRequiredNewClientFields(form), [form])
  const canSave = isDirty
  const showFirstNameError = attemptedSave && !form.firstName.trim()
  const showLastNameError = attemptedSave && !form.lastName.trim()
  const keyboardAccessoryId = 'new-client-keyboard-dismiss'
  const keyboardDismissMode = Platform.OS === 'ios' ? ('interactive' as const) : ('on-drag' as const)
  const birthdayDisplayValue = useMemo(
    () => (form.birthday ? formatDateMMDDYYYY(form.birthday) : ''),
    [form.birthday]
  )
  const birthdayPickerDate = useMemo(() => {
    const parsed = parseDateForPicker(birthdayDisplayValue)
    return parsed ?? new Date(1990, 0, 1)
  }, [birthdayDisplayValue])

  const scrollFocusedFieldIntoView = useCallback((targetY?: number, focusOffset?: number) => {
    if (typeof targetY !== 'number') return

    const nextScrollY = Math.max(
      0,
      targetY - (focusOffset ?? (Platform.OS === 'ios' ? 36 : 28))
    )
    if (Math.abs(scrollY.current - nextScrollY) < 12) {
      return
    }

    const delay = Platform.OS === 'ios' ? 140 : 80
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: nextScrollY,
        animated: true,
      })
    }, delay)
  }, [])

  const handleIdentityLayout = useCallback((y: number) => {
    focusY.current.identity = y
  }, [])

  const closeBirthdayPicker = useCallback(() => {
    setShowBirthdayPicker(false)
  }, [])

  const handleIdentityFocus = useCallback(() => {
    closeBirthdayPicker()
    scrollFocusedFieldIntoView(focusY.current.identity, Platform.OS === 'ios' ? 28 : 22)
  }, [closeBirthdayPicker, scrollFocusedFieldIntoView])

  const handleBirthdayLayout = useCallback((y: number) => {
    focusY.current.birthday = y
  }, [])

  const handleBirthdayFieldPress = useCallback(() => {
    Keyboard.dismiss()
    scrollFocusedFieldIntoView(focusY.current.birthday, Platform.OS === 'ios' ? 24 : 18)
    if (Platform.OS === 'android') {
      setShowBirthdayPicker(true)
      return
    }
    setShowBirthdayPicker((current) => !current)
  }, [scrollFocusedFieldIntoView])

  const handleBirthdayChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowBirthdayPicker(false)
      }
      if (!selectedDate) return

      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      setForm((prev) => ({ ...prev, birthday: `${year}-${month}-${day}` }))
    },
    []
  )

  const handleNotesLayout = useCallback((y: number) => {
    requiredY.current.notes = y
    focusY.current.notes = y
  }, [])

  const handleNotesFocus = useCallback(() => {
    closeBirthdayPicker()
    scrollFocusedFieldIntoView(focusY.current.notes)
  }, [closeBirthdayPicker, scrollFocusedFieldIntoView])

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollY.current = event.nativeEvent.contentOffset.y
  }, [])

  const handleScrollBeginDrag = useCallback(() => {
    Keyboard.dismiss()
    closeBirthdayPicker()
  }, [closeBirthdayPicker])

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
      setActiveKeyboardField(field)
      if (field === 'notes') {
        handleNotesFocus()
        return
      }
      handleIdentityFocus()
    },
    [handleIdentityFocus, handleNotesFocus]
  )

  const focusAdjacentKeyboardField = useCallback(
    (direction: 'previous' | 'next') => {
      if (!activeKeyboardField) return
      const currentIndex = KEYBOARD_FIELDS.indexOf(activeKeyboardField)
      if (currentIndex === -1) return
      const nextIndex =
        direction === 'previous' ? currentIndex - 1 : currentIndex + 1
      const targetField = KEYBOARD_FIELDS[nextIndex]
      if (!targetField) return
      focusKeyboardField(targetField)
    },
    [activeKeyboardField, focusKeyboardField]
  )

  const activeKeyboardFieldIndex = activeKeyboardField
    ? KEYBOARD_FIELDS.indexOf(activeKeyboardField)
    : -1
  const canGoToPreviousKeyboardField = activeKeyboardFieldIndex > 0
  const canGoToNextKeyboardField =
    activeKeyboardFieldIndex >= 0 && activeKeyboardFieldIndex < KEYBOARD_FIELDS.length - 1

  const handleSave = async () => {
    setAttemptedSave(true)
    if (!hasRequired) {
      void warningHaptic()
      const targetY = !form.firstName.trim() ? requiredY.current.firstName : requiredY.current.lastName
      const scrollTarget = getNewClientRequiredScrollTarget(targetY)
      if (scrollTarget !== null) {
        scrollRef.current?.scrollTo({ y: scrollTarget, animated: true })
      }
      const delay = scrollTarget !== null ? 350 : 0
      setTimeout(() => {
        setPulseKey((count) => count + 1)
      }, delay)
      return
    }

    try {
      await createClient.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        birthday: form.birthday,
        clientType,
        notes: form.notes,
      })

      void successHaptic()
      router.replace('/(tabs)/clients')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to save client right now. Please try again.'
      Alert.alert('Save Failed', message)
    }
  }

  return {
    birthdayDisplayValue,
    birthdayPanel,
    birthdayPickerDate,
    canSave,
    canGoToNextKeyboardField,
    canGoToPreviousKeyboardField,
    clientType,
    closeBirthdayPicker,
    createClient,
    focusAdjacentKeyboardField,
    form,
    insets,
    keyboardAccessoryId,
    keyboardDismissMode,
    pulseKey,
    requiredY,
    router,
    scrollRef,
    setClientType,
    setForm,
    showBirthdayPicker,
    showFirstNameError,
    showLastNameError,
    topInset: Math.max(insets.top + 8, 16),
    handleKeyboardFieldFocus,
    handleBirthdayChange,
    handleBirthdayFieldPress,
    handleBirthdayLayout,
    handleIdentityFocus,
    handleIdentityLayout,
    handleNotesFocus,
    handleNotesLayout,
    handleSave,
    handleScroll,
    onScrollBeginDrag: handleScrollBeginDrag,
    setInputRef,
  }
}

export type NewClientFormModel = ReturnType<typeof useNewClientFormModel>
