import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Keyboard, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { ClientType } from 'components/data/models'
import { useClients, useDeleteClient, useUpdateClient } from 'components/data/queries'
import { useThemePrefs } from 'components/ThemePrefs'

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
  const requiredY = useRef<{ name?: number }>({})

  const client = useMemo(() => clients.find((item) => item.id === id), [clients, id])

  const initialForm = useMemo<EditClientForm>(
    () => ({
      name: client?.name ?? '',
      email: client?.email ?? '',
      phone: client?.phone ?? '',
      type: client?.type ?? 'Cut',
      notes: client?.notes ?? '',
    }),
    [client]
  )

  const [form, setForm] = useState(initialForm)
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)

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

  const updateField = useCallback(<K extends keyof EditClientForm>(field: K, value: EditClientForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleNameLayout = useCallback((y: number) => {
    requiredY.current.name = y
  }, [])

  const pulseNameError = useCallback((delayMs: number) => {
    setTimeout(() => {
      setPulseKey((count) => count + 1)
    }, delayMs)
  }, [])

  const handleSave = useCallback(async () => {
    setAttemptedSave(true)
    if (!hasRequired || !isDirty) {
      if (!hasRequired && typeof requiredY.current.name === 'number') {
        scrollRef.current?.scrollTo({
          y: Math.max(0, requiredY.current.name - 12),
          animated: true,
        })
        pulseNameError(350)
      } else if (!hasRequired) {
        pulseNameError(0)
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
      router.back()
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error instanceof Error
          ? error.message
          : 'Unable to save this client right now. Please try again.'
      )
    }
  }, [client, form, hasRequired, isDirty, pulseNameError, router, updateClient])

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
                await deleteClient.mutateAsync(client.id)
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

  const handleScrollBeginDrag = useCallback(() => {
    Keyboard.dismiss()
  }, [])

  return {
    canSave,
    client,
    confirmDelete,
    form,
    handleBack,
    handleNameLayout,
    handleSave,
    handleScrollBeginDrag,
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
    showNameError,
    topInset,
    updateField,
  }
}

export type EditClientScreenModel = ReturnType<typeof useEditClientScreenModel>
