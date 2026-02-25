import { useMemo, useRef, useState } from 'react'
import { Link } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import {
  ErrorPulseBorder,
  PrimaryButton,
  SecondaryButton,
  TextAreaField,
  TextField,
} from './ui/controls'

const cardBorder = {
  bg: '$gray1',
  borderWidth: 1,
  borderColor: '$gray3',
  shadowColor: 'rgba(15,23,42,0.08)',
  shadowRadius: 18,
  shadowOpacity: 1,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
}

const chipStyle = {
  bg: '$gray1',
  borderWidth: 1,
  borderColor: '$gray3',
}

type ClientType = 'Cut' | 'Color' | 'Cut & Color'

export function NewClientForm() {
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<any>(null)
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

  const handleSave = () => {
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

    // Save wiring lives outside this form in the current iteration.
    // Keeping validation here lets us add persistence without reshaping UI logic.
  }

  return (
    <ScrollView
      ref={scrollRef}
      flex={1}
      contentContainerStyle={{
        paddingBottom: 40 + insets.bottom,
      }}
    >
      <YStack gap="$4">
        <YStack {...cardBorder} rounded="$5" p="$4" gap="$3">
          <YStack
            gap="$2"
            onLayout={(event) => {
              requiredY.current.firstName = event.nativeEvent.layout.y
            }}
          >
            <Text fontSize={12} color="$gray8">
              First name
            </Text>
            <YStack position="relative" pointerEvents="box-none">
              <TextField
                placeholder="First name"
                value={form.firstName}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, firstName: text }))
                }
                borderColor={showFirstNameError ? '$red10' : '$gray3'}
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
            <Text fontSize={12} color="$gray8">
              Last name
            </Text>
            <YStack position="relative" pointerEvents="box-none">
              <TextField
                placeholder="Last name"
                value={form.lastName}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, lastName: text }))
                }
                borderColor={showLastNameError ? '$red10' : '$gray3'}
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
            <Text fontSize={12} color="$gray8">
              Email
            </Text>
            <TextField
              placeholder="email@example.com"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
            />
          </YStack>
          <YStack gap="$2">
            <Text fontSize={12} color="$gray8">
              Phone
            </Text>
            <TextField
              placeholder="(555) 555-5555"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
            />
          </YStack>
          <YStack gap="$2">
            <Text fontSize={12} color="$gray8">
              Birthday
            </Text>
            <TextField
              placeholder="YYYY-MM-DD"
              value={form.birthday}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, birthday: text }))
              }
            />
          </YStack>
        </YStack>

        <YStack {...cardBorder} rounded="$5" p="$4" gap="$3">
          <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
            Client Type
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            {(['Cut', 'Color', 'Cut & Color'] as const).map((type) => (
              <XStack
                key={type}
                {...chipStyle}
                rounded="$3"
                px="$2.5"
                py="$1.5"
                items="center"
                bg={clientType === type ? '$accentMuted' : '$background'}
                borderColor={clientType === type ? '$accentSoft' : '$borderColor'}
                onPress={() => setClientType(type)}
              >
                <Text
                  fontSize={11}
                  color={clientType === type ? '$accent' : '$gray8'}
                >
                  {type}
                </Text>
              </XStack>
            ))}
          </XStack>
        </YStack>

        <YStack {...cardBorder} rounded="$5" p="$4" gap="$3">
          <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
            Notes
          </Text>
          <TextAreaField
            placeholder="Client preferences, formulas, reminders..."
            value={form.notes}
            onChangeText={(text) => setForm((prev) => ({ ...prev, notes: text }))}
          />
        </YStack>

        <XStack gap="$3">
          <Link href="/(tabs)/clients" asChild>
            <SecondaryButton flex={1}>Cancel</SecondaryButton>
          </Link>
          <PrimaryButton
            flex={1}
            disabled={!canSave}
            opacity={canSave ? 1 : 0.5}
            onPress={handleSave}
          >
            Save Client
          </PrimaryButton>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
