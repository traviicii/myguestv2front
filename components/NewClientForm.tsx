import { useMemo, useRef, useState } from 'react'
import { Link, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Alert } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import {
  ErrorPulseBorder,
  FieldLabel,
  OptionChip,
  OptionChipLabel,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  TextAreaField,
  TextField,
  ThemedHeadingText,
} from './ui/controls'
import { useCreateClient } from './data/queries'

type ClientType = 'Cut' | 'Color' | 'Cut & Color'

export function NewClientForm() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<any>(null)
  const createClient = useCreateClient()
  const requiredY = useRef<{ firstName?: number; lastName?: number }>({})
  const defaultType: ClientType = 'Cut & Color'
  const [clientType, setClientType] = useState<ClientType>(defaultType)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthday: '',
    notes: '',
  })
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)

  const isDirty = useMemo(() => {
    const hasText =
      form.firstName.trim() ||
      form.lastName.trim() ||
      form.email.trim() ||
      form.phone.trim() ||
      form.birthday.trim() ||
      form.notes.trim()
    return Boolean(hasText) || clientType !== defaultType
  }, [clientType, defaultType, form])

  const hasRequired = useMemo(() => {
    return Boolean(form.firstName.trim() && form.lastName.trim())
  }, [form.firstName, form.lastName])

  const canSave = isDirty
  const showFirstNameError = attemptedSave && !form.firstName.trim()
  const showLastNameError = attemptedSave && !form.lastName.trim()

  const handleSave = async () => {
    setAttemptedSave(true)
    if (!hasRequired) {
      const targetY =
        !form.firstName.trim()
          ? requiredY.current.firstName
          : requiredY.current.lastName
      const shouldScroll = typeof targetY === 'number'
      // Bring the first invalid field into view before pulsing error border.
      if (shouldScroll) {
        scrollRef.current?.scrollTo({ y: Math.max(0, targetY - 12), animated: true })
      }
      const delay = shouldScroll ? 350 : 0
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

  return (
    <ScrollView
      ref={scrollRef}
      flex={1}
      contentContainerStyle={{
        pb: 40 + insets.bottom,
      }}
    >
      <YStack gap="$4">
        <SurfaceCard p="$4" gap="$3">
          <YStack
            gap="$2"
            onLayout={(event) => {
              requiredY.current.firstName = event.nativeEvent.layout.y
            }}
          >
            <FieldLabel>First name</FieldLabel>
            <YStack position="relative" pointerEvents="box-none">
              <TextField
                placeholder="First name"
                value={form.firstName}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, firstName: text }))
                }
                borderColor={showFirstNameError ? '$red10' : '$borderSubtle'}
              />
              <ErrorPulseBorder active={showFirstNameError} pulseKey={pulseKey} />
            </YStack>
            {showFirstNameError ? (
              <Text fontSize={11} color="$red10">
                First name is required.
              </Text>
            ) : null}
          </YStack>
          <YStack
            gap="$2"
            onLayout={(event) => {
              requiredY.current.lastName = event.nativeEvent.layout.y
            }}
          >
            <FieldLabel>Last name</FieldLabel>
            <YStack position="relative" pointerEvents="box-none">
              <TextField
                placeholder="Last name"
                value={form.lastName}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, lastName: text }))
                }
                borderColor={showLastNameError ? '$red10' : '$borderSubtle'}
              />
              <ErrorPulseBorder active={showLastNameError} pulseKey={pulseKey} />
            </YStack>
            {showLastNameError ? (
              <Text fontSize={11} color="$red10">
                Last name is required.
              </Text>
            ) : null}
          </YStack>
          <YStack gap="$2">
            <FieldLabel>Email</FieldLabel>
            <TextField
              placeholder="email@example.com"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
            />
          </YStack>
          <YStack gap="$2">
            <FieldLabel>Phone</FieldLabel>
            <TextField
              placeholder="(555) 555-5555"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
            />
          </YStack>
          <YStack gap="$2">
            <FieldLabel>Birthday</FieldLabel>
            <TextField
              placeholder="YYYY-MM-DD"
              value={form.birthday}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, birthday: text }))
              }
            />
          </YStack>
        </SurfaceCard>

        <SurfaceCard p="$4" gap="$3">
          <ThemedHeadingText fontWeight="700" fontSize={14}>
            Client Type
          </ThemedHeadingText>
          <XStack gap="$2" flexWrap="wrap">
            {(['Cut', 'Color', 'Cut & Color'] as const).map((type) => (
              <OptionChip
                key={type}
                active={clientType === type}
                onPress={() => setClientType(type)}
              >
                <OptionChipLabel active={clientType === type}>
                  {type}
                </OptionChipLabel>
              </OptionChip>
            ))}
          </XStack>
        </SurfaceCard>

        <SurfaceCard p="$4" gap="$3">
          <ThemedHeadingText fontWeight="700" fontSize={14}>
            Notes
          </ThemedHeadingText>
          <TextAreaField
            placeholder="Client preferences, formulas, reminders..."
            value={form.notes}
            onChangeText={(text) => setForm((prev) => ({ ...prev, notes: text }))}
          />
        </SurfaceCard>

        <XStack gap="$3">
          <Link href="/(tabs)/clients" asChild>
            <SecondaryButton flex={1}>Cancel</SecondaryButton>
          </Link>
          <PrimaryButton
            flex={1}
            disabled={!canSave || createClient.isPending}
            opacity={canSave && !createClient.isPending ? 1 : 0.5}
            onPress={() => {
              void handleSave()
            }}
          >
            {createClient.isPending ? 'Saving...' : 'Save Client'}
          </PrimaryButton>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
