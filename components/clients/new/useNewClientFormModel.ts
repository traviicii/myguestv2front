import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Alert, Keyboard, Platform } from 'react-native'

import { parseDateForPicker } from 'components/appointments/shared/datePicker'
import { useClientGroups, useCreateClient, useCreateClientGroup } from 'components/data/queries'
import { useExpandablePanel } from 'components/ui/useExpandablePanel'
import {
  buildLegacyClientTypeFromGroups,
  normalizeClientGroupName,
} from 'components/utils/clientGroups'
import { formatDateMMDDYYYY } from 'components/utils/date'
import { selectionHaptic, successHaptic, warningHaptic } from 'components/utils/haptics'

import {
  buildNewClientInitialForm,
  getNewClientRequiredScrollTarget,
  hasNewClientDraftContent,
  hasRequiredNewClientFields,
} from './newClientFormUtils'

type KeyboardField = 'firstName' | 'lastName' | 'email' | 'phone' | 'notes'
type FocusTarget = KeyboardField | 'birthday'
type FocusableField = { focus?: () => void } | null

const FOCUS_SCROLL_TOLERANCE = 24
const IOS_KEYBOARD_SETTLE_DELAY_MS = 72
const ANDROID_KEYBOARD_SETTLE_DELAY_MS = 48

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
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyboardVisible = useRef(false)
  const createClient = useCreateClient()
  const createClientGroup = useCreateClientGroup()
  const { data: clientGroups = [] } = useClientGroups('true')
  const requiredY = useRef<{ firstName?: number; lastName?: number; notes?: number }>({})
  const sectionY = useRef<{ identity?: number; notes?: number }>({})
  const groupY = useRef<{ identity?: number; notes?: number }>({})
  const focusY = useRef<Partial<Record<FocusTarget, number>>>({})
  const activeField = useRef<KeyboardField | null>(null)
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([])
  const [groupDraft, setGroupDraft] = useState('')
  const [groupCreateError, setGroupCreateError] = useState<string | null>(null)
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
        form,
        selectedGroupIds,
      }),
    [form, selectedGroupIds]
  )

  const selectedGroups = useMemo(
    () => clientGroups.filter((group) => selectedGroupIds.includes(group.id)),
    [clientGroups, selectedGroupIds]
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

  const closeBirthdayPicker = useCallback(() => {
    setShowBirthdayPicker(false)
  }, [])

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

  const resolveFieldTarget = useCallback((field: FocusTarget) => {
    const fieldY = focusY.current[field]
    if (typeof fieldY !== 'number') return undefined

    if (field === 'notes') {
      if (
        typeof sectionY.current.notes !== 'number' ||
        typeof groupY.current.notes !== 'number'
      ) {
        return undefined
      }

      return sectionY.current.notes + groupY.current.notes + fieldY
    }

    if (
      typeof sectionY.current.identity !== 'number' ||
      typeof groupY.current.identity !== 'number'
    ) {
      return undefined
    }

    return sectionY.current.identity + groupY.current.identity + fieldY
  }, [])

  const getFocusOffset = useCallback((field: FocusTarget) => {
    if (field === 'firstName' || field === 'lastName') {
      return Platform.OS === 'ios' ? 32 : 24
    }

    if (field === 'notes') {
      return Platform.OS === 'ios' ? 96 : 82
    }

    if (field === 'birthday') {
      return Platform.OS === 'ios' ? 92 : 76
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

  const handleIdentitySectionLayout = useCallback((y: number) => {
    sectionY.current.identity = y
  }, [])

  const handleIdentityLayout = useCallback((y: number) => {
    groupY.current.identity = y
  }, [])

  const handleKeyboardFieldLayout = useCallback((field: FocusTarget, y: number) => {
    focusY.current[field] = y
  }, [])

  const handleNotesSectionLayout = useCallback((y: number) => {
    sectionY.current.notes = y
  }, [])

  const handleNotesGroupLayout = useCallback((y: number) => {
    groupY.current.notes = y
  }, [])

  const handleIdentityFocus = useCallback(() => {
    closeBirthdayPicker()
    const targetField = activeField.current ?? 'firstName'
    if (keyboardVisible.current) {
      scrollFocusedFieldIntoView(targetField, { delayMs: 20 })
    }
  }, [closeBirthdayPicker, scrollFocusedFieldIntoView])

  const handleBirthdayLayout = useCallback((y: number) => {
    focusY.current.birthday = y
  }, [])

  const handleBirthdayFieldPress = useCallback(() => {
    Keyboard.dismiss()
    scrollFocusedFieldIntoView('birthday')
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
    if (keyboardVisible.current) {
      scrollFocusedFieldIntoView('notes', { delayMs: 20 })
    }
  }, [closeBirthdayPicker, scrollFocusedFieldIntoView])

  const toggleClientGroup = useCallback((groupId: number) => {
    setSelectedGroupIds((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId]
    )
  }, [])

  const handleCreateClientGroup = useCallback(async () => {
    const name = normalizeClientGroupName(groupDraft)
    if (!name || createClientGroup.isPending) return

    const normalizedName = name.toLowerCase()
    const existing = clientGroups.find(
      (group) => group.normalizedName === normalizedName || group.name.toLowerCase() === normalizedName
    )
    if (existing) {
      setSelectedGroupIds((current) =>
        current.includes(existing.id) ? current : [...current, existing.id]
      )
      setGroupDraft('')
      setGroupCreateError(null)
      void selectionHaptic()
      return
    }

    try {
      const group = await createClientGroup.mutateAsync({ name })
      setSelectedGroupIds((current) =>
        current.includes(group.id) ? current : [...current, group.id]
      )
      setGroupDraft('')
      setGroupCreateError(null)
      void successHaptic()
    } catch (error) {
      setGroupCreateError(
        error instanceof Error
          ? error.message
          : 'Unable to create this group right now.'
      )
    }
  }, [clientGroups, createClientGroup, groupDraft])

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollY.current = event.nativeEvent.contentOffset.y
  }, [])

  const handleScrollBeginDrag = useCallback(() => {
    setFocusedKeyboardField(null)
    Keyboard.dismiss()
    closeBirthdayPicker()
  }, [closeBirthdayPicker, setFocusedKeyboardField])

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
      setFocusedKeyboardField(field)
      if (field === 'notes') {
        handleNotesFocus()
        return
      }
      handleIdentityFocus()
    },
    [handleIdentityFocus, handleNotesFocus, setFocusedKeyboardField]
  )

  const focusAdjacentKeyboardField = useCallback(
    (direction: 'previous' | 'next') => {
      const currentField = activeField.current ?? activeKeyboardField
      if (!currentField) return
      const currentIndex = KEYBOARD_FIELDS.indexOf(currentField)
      if (currentIndex === -1) return
      const nextIndex =
        direction === 'previous' ? currentIndex - 1 : currentIndex + 1
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
      clearPendingScroll()
    }
  }, [clearPendingScroll, scrollFocusedFieldIntoView, setFocusedKeyboardField])

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
      const targetY = resolveFieldTarget(
        !form.firstName.trim() ? 'firstName' : 'lastName'
      )
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
        clientType: buildLegacyClientTypeFromGroups(selectedGroups) ?? undefined,
        groupIds: selectedGroupIds,
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
    clientGroups,
    closeBirthdayPicker,
    createClientGroup,
    createClient,
    focusAdjacentKeyboardField,
    form,
    groupCreateError,
    groupDraft,
    insets,
    keyboardAccessoryId,
    keyboardDismissMode,
    pulseKey,
    requiredY,
    router,
    scrollRef,
    selectedGroupIds,
    setForm,
    setGroupDraft,
    showBirthdayPicker,
    showFirstNameError,
    showLastNameError,
    topInset: Math.max(insets.top + 8, 16),
    handleKeyboardFieldFocus,
    handleBirthdayChange,
    handleBirthdayFieldPress,
    handleBirthdayLayout,
    handleIdentitySectionLayout,
    handleIdentityFocus,
    handleIdentityLayout,
    handleKeyboardFieldLayout,
    handleNotesFocus,
    handleNotesGroupLayout,
    handleNotesLayout,
    handleNotesSectionLayout,
    handleSave,
    handleScroll,
    handleCreateClientGroup,
    onScrollBeginDrag: handleScrollBeginDrag,
    setInputRef,
    toggleClientGroup,
  }
}

export type NewClientFormModel = ReturnType<typeof useNewClientFormModel>
