import {
  useEffect,
  useMemo,
  useRef,
  useState } from 'react'
import { useRouter,
  useLocalSearchParams } from 'expo-router'
import { Alert, Keyboard, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView,
  Text,
  XStack,
  YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useClients, useDeleteClient, useUpdateClient } from 'components/data/queries'
import { ErrorPulseBorder,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  TextAreaField,
  TextField,
  cardSurfaceProps,
  chipSurfaceProps,
} from 'components/ui/controls'
import { KeyboardDismissAccessory } from 'components/ui/KeyboardDismissAccessory'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import type { ClientType } from 'components/mockData'

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

export default function EditClientScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const deleteClient = useDeleteClient()
  const updateClient = useUpdateClient()
  const scrollRef = useRef<any>(null)
  const requiredY = useRef<{ name?: number }>({})

  const client = useMemo(
    () => clients.find((item) => item.id === id),
    [clients, id]
  )

  const initialForm = useMemo(
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
  const typeOptions: ClientType[] = ['Cut', 'Color', 'Cut & Color']

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

  const isDirty = useMemo(() => {
    return (
      form.name !== initialForm.name ||
      form.email !== initialForm.email ||
      form.phone !== initialForm.phone ||
      form.type !== initialForm.type ||
      form.notes !== initialForm.notes
    )
  }, [form, initialForm])

  const hasRequired = useMemo(() => {
    return Boolean(form.name.trim())
  }, [form.name])

  const canSave = isDirty && !deleteClient.isPending && !updateClient.isPending
  const showNameError = attemptedSave && !form.name.trim()
  const keyboardAccessoryId = 'client-edit-keyboard-dismiss'
  const keyboardDismissMode = Platform.OS === 'ios' ? 'interactive' : 'on-drag'
  const isBootstrapping = clientsLoading && !clients.length

  if (isBootstrapping) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <AmbientBackdrop />
        <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
        <Text fontSize={13} color="$textSecondary">
          Loading client...
        </Text>
      </YStack>
    )
  }

  if (!client) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <AmbientBackdrop />
        <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
        <Text fontSize={13} color="$textSecondary">
          Client not found.
        </Text>
      </YStack>
    )
  }

  const handleSave = async () => {
    setAttemptedSave(true)
    if (!hasRequired || !isDirty) {
      if (!hasRequired && typeof requiredY.current.name === 'number') {
        scrollRef.current?.scrollTo({
          y: Math.max(0, requiredY.current.name - 12),
          animated: true,
        })
        setTimeout(() => {
          setPulseKey((count) => count + 1)
        }, 350)
      } else if (!hasRequired) {
        setPulseKey((count) => count + 1)
      }
      return
    }

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
  }

  const handleDelete = () => {
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
  }

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
      <KeyboardDismissAccessory nativeID={keyboardAccessoryId} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ pb: "$10" }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={keyboardDismissMode}
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <YStack px="$5" pt="$6" gap="$4">
          <YStack gap="$2">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              Edit Client
            </Text>
            <Text fontSize={12} color="$textSecondary">
              Update contact info and client notes.
            </Text>
          </YStack>

          <SectionDivider />

          <YStack {...cardSurfaceProps} rounded="$5" p="$4" gap="$3">
            <YStack
              gap="$2"
              onLayout={(event) => {
                requiredY.current.name = event.nativeEvent.layout.y
              }}
            >
              <Text fontSize={12} color="$textSecondary">
                Name
              </Text>
              <YStack position="relative">
                <TextField
                  value={form.name}
                  inputAccessoryViewID={keyboardAccessoryId}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, name: text }))
                  }
                  borderColor={showNameError ? '$red10' : '$borderSubtle'}
                />
                <ErrorPulseBorder active={showNameError} pulseKey={pulseKey} />
              </YStack>
              {showNameError ? (
                <Text fontSize={11} color="$red10">
                  Name is required.
                </Text>
              ) : null}
            </YStack>
            <YStack gap="$2">
              <Text fontSize={12} color="$textSecondary">
                Email
              </Text>
              <TextField
                value={form.email}
                inputAccessoryViewID={keyboardAccessoryId}
                onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
              />
            </YStack>
            <YStack gap="$2">
              <Text fontSize={12} color="$textSecondary">
                Phone
              </Text>
              <TextField
                value={form.phone}
                inputAccessoryViewID={keyboardAccessoryId}
                onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
              />
            </YStack>
            <YStack gap="$2">
              <Text fontSize={12} color="$textSecondary">
                Client Type
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {typeOptions.map((type) => (
                  <XStack
                    key={type}
                    {...chipSurfaceProps}
                    rounded="$3"
                    px="$3"
                    py="$2"
                    items="center"
                    bg={form.type === type ? '$accentMuted' : '$background'}
                    borderColor={form.type === type ? '$accentSoft' : '$borderColor'}
                    onPress={() => setForm((prev) => ({ ...prev, type }))}
                  >
                    <Text fontSize={12} color={form.type === type ? '$accent' : '$textSecondary'}>
                      {type}
                    </Text>
                  </XStack>
                ))}
              </XStack>
            </YStack>
          </YStack>

          <YStack gap="$3">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Notes
            </Text>
            <YStack {...cardSurfaceProps} rounded="$5" p="$4">
              <TextAreaField
                value={form.notes}
                inputAccessoryViewID={keyboardAccessoryId}
                onChangeText={(text) => setForm((prev) => ({ ...prev, notes: text }))}
                placeholder="Client preferences, color history, personal notes..."
              />
            </YStack>
          </YStack>

          <XStack gap="$3">
            <SecondaryButton flex={1} onPress={() => router.back()}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              flex={1}
              onPress={() => void handleSave()}
              disabled={!canSave}
              opacity={canSave ? 1 : 0.5}
            >
              {updateClient.isPending ? 'Saving…' : 'Save'}
            </PrimaryButton>
          </XStack>

          <SecondaryButton
            onPress={handleDelete}
            disabled={deleteClient.isPending}
            borderColor="$red8"
            bg="$red2"
            pressStyle={{
              bg: '$red3',
              borderColor: '$red9',
              opacity: 0.92,
            }}
          >
            <Text fontWeight="700" color="$red11">
              {deleteClient.isPending ? 'Deleting…' : 'Delete Client'}
            </Text>
          </SecondaryButton>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
