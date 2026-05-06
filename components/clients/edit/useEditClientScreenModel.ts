import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Keyboard, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { ClientType } from 'components/data/models'
import { useClients, useDeleteClient, useUpdateClient } from 'components/data/queries'
import { useThemePrefs } from 'components/ThemePrefs'
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
  email: string
  name: string
  notes: string
  phone: string
  type: ClientType
}

type ScrollTarget = {
  scrollTo: (options: { animated: boolean; y: number }) => void
}

type KeyboardField = 'name' | 'email' | 'phone' | 'notes'
type FocusableField = { focus?: () => void } | null

type SectionKey = 'name' | 'contact' | 'notes'

const KEYBOARD_FIELDS: KeyboardField[] = ['name', 'email', 'phone', 'notes']
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
    name: null,
    email: null,
    phone: null,
    notes: null,
  })
  const requiredY = useRef<{ name?: number }>({})
  const sectionY = useRef<Partial<Record<SectionKey, number>>>({})
  const groupY = useRef<Partial<Record<SectionKey, number>>>({})
  const focusY = useRef<Partial<Record<KeyboardField, number>>>({})
  const activeField = useRef<KeyboardField | null>(null)

  const client = useMemo(() => clients.find((item) => item.id === id), [clients, id])

  const initialForm = useMemo<EditClientForm>(
    () => ({
      name: client?.name ?? '',
      email: client?.email ?? '',
      phone: formatPhoneForInput(client?.phone ?? ''),
      type: client?.type ?? 'Cut',
      notes: client?.notes ?? '',
    }),
    [client]
  )

  const [form, setForm] = useState(initialForm)
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const [activeKeyboardField, setActiveKeyboardField] = useState<KeyboardField | null>(null)

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

  const isDirty = useMemo(
    () =>
      form.name !== initialForm.name ||
      form.email !== initialForm.email ||
      form.phone !== initialForm.phone ||
      form.type !== initialForm.type ||
      form.notes !== initialForm.notes,
    [form, initialForm]
  )

  const hasRequired = Boolean(form.name.trim())
  const canSave = isDirty && !deleteClient.isPending && !updateClient.isPending
  const showNameError = attemptedSave && !form.name.trim()
  const keyboardAccessoryId = 'client-edit-keyboard-dismiss'
  const keyboardDismissMode: 'interactive' | 'on-drag' =
    Platform.OS === 'ios' ? 'interactive' : 'on-drag'
  const isBootstrapping = clientsLoading && !clients.length
  const isMissingClient = !isBootstrapping && !client
  const contentBottomPadding = 40 + insets.bottom

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

  const resolveSectionForField = useCallback((field: KeyboardField): SectionKey => {
    if (field === 'name') return 'name'
    if (field === 'notes') return 'notes'
    return 'contact'
  }, [])

  const resolveFieldTarget = useCallback(
    (field: KeyboardField) => {
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

  const getFocusOffset = useCallback((field: KeyboardField) => {
    if (field === 'name') {
      return Platform.OS === 'ios' ? 36 : 28
    }
    if (field === 'notes') {
      return Platform.OS === 'ios' ? 96 : 82
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

  const handleKeyboardFieldLayout = useCallback((field: KeyboardField, y: number) => {
    focusY.current[field] = y
    if (field === 'name') {
      requiredY.current.name = y
    }
  }, [])

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
        const targetY = resolveFieldTarget('name')
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

    const nextName = splitDisplayName(form.name)
    const fallbackName = splitDisplayName(client.name)
    const firstName = nextName.firstName || fallbackName.firstName
    const lastName = nextName.lastName || fallbackName.lastName || firstName

    try {
      await updateClient.mutateAsync({
        clientId: client.id,
        firstName,
        lastName,
        email: form.email,
        phone: form.phone,
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
  }, [setFocusedKeyboardField])

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
    canGoToNextKeyboardField,
    canGoToPreviousKeyboardField,
    canSave,
    client,
    confirmDelete,
    contentBottomPadding,
    focusAdjacentKeyboardField,
    form,
    handleBack,
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
    showNameError,
    topInset,
    updateField,
  }
}

export type EditClientScreenModel = ReturnType<typeof useEditClientScreenModel>
