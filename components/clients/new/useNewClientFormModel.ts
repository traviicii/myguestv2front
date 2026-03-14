import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Alert, Keyboard, Platform } from 'react-native'

import { useCreateClient } from 'components/data/queries'

import {
  buildNewClientInitialForm,
  getNewClientRequiredScrollTarget,
  hasNewClientDraftContent,
  hasRequiredNewClientFields,
  type ClientType,
} from './newClientFormUtils'

export function useNewClientFormModel() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<any>(null)
  const createClient = useCreateClient()
  const requiredY = useRef<{ firstName?: number; lastName?: number }>({})
  const defaultType: ClientType = 'Cut & Color'

  const [clientType, setClientType] = useState<ClientType>(defaultType)
  const [form, setForm] = useState(() => buildNewClientInitialForm())
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)

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

  const handleSave = async () => {
    setAttemptedSave(true)
    if (!hasRequired) {
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
    canSave,
    clientType,
    createClient,
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
    showFirstNameError,
    showLastNameError,
    topInset: Math.max(insets.top + 8, 16),
    handleSave,
    onScrollBeginDrag: Keyboard.dismiss,
  }
}

export type NewClientFormModel = ReturnType<typeof useNewClientFormModel>
