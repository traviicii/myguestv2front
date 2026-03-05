import { useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useThemePrefs } from 'components/ThemePrefs'
import {
  useCreateAppointmentLog,
  useCreateClient,
  useCreateService,
  useServices,
} from 'components/data/queries'
import { formatDateMMDDYYYY } from 'components/utils/date'
import { normalizeServiceName } from 'components/utils/services'
import { useStudioStore } from 'components/state/studioStore'
import {
  OptionChip,
  OptionChipLabel,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  SurfaceCard,
  TextField,
  ThemedHeadingText,
} from 'components/ui/controls'

const pad = (value: number) => String(value).padStart(2, '0')
const todayLabel = () => {
  const date = new Date()
  return formatDateMMDDYYYY(
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  )
}

const CLIENT_TYPES = ['Cut', 'Color', 'Cut & Color'] as const

export default function OnboardingScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const { profile, setProfile, setOnboardingComplete } = useStudioStore()
  const { data: serviceOptions = [] } = useServices('true')
  const createService = useCreateService()
  const createClient = useCreateClient()
  const createAppointmentLog = useCreateAppointmentLog()

  const [step, setStep] = useState(1)
  const [profileDraft, setProfileDraft] = useState(profile)
  const [serviceDraft, setServiceDraft] = useState('')
  const [clientDraft, setClientDraft] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    clientType: 'Cut' as (typeof CLIENT_TYPES)[number],
  })
  const [createdClientId, setCreatedClientId] = useState<string | null>(null)
  const [appointmentDraft, setAppointmentDraft] = useState({
    date: todayLabel(),
    price: '',
    notes: '',
  })
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [newServiceName, setNewServiceName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const cardTone = isGlass ? 'secondary' : 'default'

  const stepTitle = useMemo(() => {
    if (step === 1) return 'Studio Profile'
    if (step === 2) return 'Service Presets (Optional)'
    if (step === 3) return 'First Client'
    return 'First Appointment Log'
  }, [step])

  const handleProfileNext = () => {
    setProfile({
      name: profileDraft.name.trim(),
      email: profileDraft.email.trim(),
      phone: profileDraft.phone.trim(),
    })
    setStep(2)
  }

  const handleAddService = async () => {
    const normalized = normalizeServiceName(serviceDraft)
    if (!normalized) return
    try {
      await createService.mutateAsync({ name: normalized })
      setServiceDraft('')
    } catch {
      // Keep onboarding non-blocking; user can add services later.
    }
  }

  const handleClientNext = async () => {
    if (!clientDraft.firstName.trim() || !clientDraft.lastName.trim()) return
    setIsSaving(true)
    try {
      const client = await createClient.mutateAsync({
        firstName: clientDraft.firstName.trim(),
        lastName: clientDraft.lastName.trim(),
        email: clientDraft.email.trim() || undefined,
        phone: clientDraft.phone.trim() || undefined,
        clientType: clientDraft.clientType,
      })
      setCreatedClientId(client.id)
      setStep(4)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNewService = async () => {
    const normalized = normalizeServiceName(newServiceName)
    if (!normalized) return
    try {
      const service = await createService.mutateAsync({ name: normalized, createdFromLog: true })
      setSelectedServiceId(service.id)
      setNewServiceName('')
    } catch {
      // no-op
    }
  }

  const handleFinish = async () => {
    if (!createdClientId) return
    setIsSaving(true)
    try {
      const serviceIds = selectedServiceId ? [selectedServiceId] : []
      const primaryService = serviceOptions.find((item) => item.id === selectedServiceId)?.name
      const price = appointmentDraft.price.trim() ? Number(appointmentDraft.price) : null

      await createAppointmentLog.mutateAsync({
        clientId: createdClientId,
        serviceIds,
        serviceType: primaryService ? normalizeServiceName(primaryService) : null,
        notes: appointmentDraft.notes,
        price: Number.isNaN(price) ? null : price,
        date: appointmentDraft.date,
      })

      setOnboardingComplete(true)
      router.replace('/(tabs)')
    } finally {
      setIsSaving(false)
    }
  }

  const canAdvanceClient = Boolean(clientDraft.firstName.trim() && clientDraft.lastName.trim())

  return (
    <YStack flex={1} bg="$surfacePage">
      <ScrollView contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom + 24) }}>
        <YStack px="$5" pt={Math.max(insets.top + 16, 32)} gap="$4">
          <ThemedHeadingText fontSize={18} fontWeight="700">
            Welcome to MyGuest v2
          </ThemedHeadingText>
          <Text fontSize={12} color="$textSecondary">
            Step {step} of 4 · {stepTitle}
          </Text>

          <SurfaceCard tone={cardTone} p="$5" gap="$4">
            {step === 1 ? (
              <YStack gap="$3">
                <Text fontSize={13} color="$textSecondary">
                  Tell us about your studio so we can personalize your workspace.
                </Text>
                <TextField
                  placeholder="Name"
                  value={profileDraft.name}
                  onChangeText={(text) => setProfileDraft((prev) => ({ ...prev, name: text }))}
                />
                <TextField
                  placeholder="Email"
                  keyboardType="email-address"
                  value={profileDraft.email}
                  onChangeText={(text) => setProfileDraft((prev) => ({ ...prev, email: text }))}
                />
                <TextField
                  placeholder="Phone"
                  keyboardType="phone-pad"
                  value={profileDraft.phone}
                  onChangeText={(text) => setProfileDraft((prev) => ({ ...prev, phone: text }))}
                />
                <PrimaryButton onPress={handleProfileNext}>Next</PrimaryButton>
              </YStack>
            ) : null}

            {step === 2 ? (
              <YStack gap="$3">
                <Text fontSize={13} color="$textSecondary">
                  Presets save time when you log appointments. You can add more later from the log.
                </Text>
                <YStack gap="$2">
                  {serviceOptions.map((service) => (
                    <Text key={service.id} fontSize={12} color="$textSecondary">
                      • {service.name}
                    </Text>
                  ))}
                </YStack>
                <SectionDivider />
                <TextField
                  placeholder="Add another preset"
                  value={serviceDraft}
                  onChangeText={setServiceDraft}
                />
                <XStack gap="$3">
                  <SecondaryButton flex={1} onPress={() => setStep(3)}>
                    Skip
                  </SecondaryButton>
                  <PrimaryButton flex={1} onPress={handleAddService}>
                    Add preset
                  </PrimaryButton>
                </XStack>
                <PrimaryButton onPress={() => setStep(3)}>Next</PrimaryButton>
              </YStack>
            ) : null}

            {step === 3 ? (
              <YStack gap="$3">
                <Text fontSize={13} color="$textSecondary">
                  Add your first client so you can log an appointment.
                </Text>
                <TextField
                  placeholder="First name"
                  value={clientDraft.firstName}
                  onChangeText={(text) => setClientDraft((prev) => ({ ...prev, firstName: text }))}
                />
                <TextField
                  placeholder="Last name"
                  value={clientDraft.lastName}
                  onChangeText={(text) => setClientDraft((prev) => ({ ...prev, lastName: text }))}
                />
                <TextField
                  placeholder="Email (optional)"
                  keyboardType="email-address"
                  value={clientDraft.email}
                  onChangeText={(text) => setClientDraft((prev) => ({ ...prev, email: text }))}
                />
                <TextField
                  placeholder="Phone (optional)"
                  keyboardType="phone-pad"
                  value={clientDraft.phone}
                  onChangeText={(text) => setClientDraft((prev) => ({ ...prev, phone: text }))}
                />
                <XStack gap="$2" flexWrap="wrap">
                  {CLIENT_TYPES.map((type) => (
                    <OptionChip
                      key={type}
                      active={clientDraft.clientType === type}
                      onPress={() => setClientDraft((prev) => ({ ...prev, clientType: type }))}
                    >
                      <OptionChipLabel active={clientDraft.clientType === type}>{type}</OptionChipLabel>
                    </OptionChip>
                  ))}
                </XStack>
                <PrimaryButton disabled={!canAdvanceClient || isSaving} onPress={handleClientNext}>
                  {isSaving ? 'Saving...' : 'Next'}
                </PrimaryButton>
              </YStack>
            ) : null}

            {step === 4 ? (
              <YStack gap="$3">
                <Text fontSize={13} color="$textSecondary">
                  Log the first appointment to see your dashboard metrics.
                </Text>
                <TextField
                  placeholder="Date (MM/DD/YYYY)"
                  value={appointmentDraft.date}
                  onChangeText={(text) => setAppointmentDraft((prev) => ({ ...prev, date: text }))}
                />
                <Text fontSize={12} color="$textSecondary">
                  Choose a preset service
                </Text>
                <XStack gap="$2" flexWrap="wrap">
                  {serviceOptions.map((service) => (
                    <OptionChip
                      key={service.id}
                      active={selectedServiceId === service.id}
                      onPress={() => setSelectedServiceId(service.id)}
                    >
                      <OptionChipLabel active={selectedServiceId === service.id}>
                        {service.name}
                      </OptionChipLabel>
                    </OptionChip>
                  ))}
                </XStack>
                <TextField
                  placeholder="Or add a new service"
                  value={newServiceName}
                  onChangeText={setNewServiceName}
                />
                <SecondaryButton onPress={handleSaveNewService}>Save as preset</SecondaryButton>
                <TextField
                  placeholder="Price (optional)"
                  keyboardType="decimal-pad"
                  value={appointmentDraft.price}
                  onChangeText={(text) => setAppointmentDraft((prev) => ({ ...prev, price: text }))}
                />
                <TextField
                  placeholder="Notes (optional)"
                  value={appointmentDraft.notes}
                  onChangeText={(text) => setAppointmentDraft((prev) => ({ ...prev, notes: text }))}
                />
                <Text fontSize={12} color="$textSecondary">
                  You own your data. Export CSVs or delete your account anytime in Settings.
                </Text>
                <PrimaryButton disabled={isSaving} onPress={handleFinish}>
                  {isSaving ? 'Saving...' : 'Save & Finish'}
                </PrimaryButton>
              </YStack>
            ) : null}
          </SurfaceCard>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
