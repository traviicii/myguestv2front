import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Search } from '@tamagui/lucide-icons'

import {
  useAppointmentHistory,
  useClients,
  useCreateAppointmentLog,
  useCreateService,
  useServices,
} from 'components/data/queries'
import { normalizeServiceName } from 'components/utils/services'
import { formatDateMMDDYYYY } from 'components/utils/date'
import { useFollowUpsStore } from 'components/state/followUpsStore'
import {
  OptionChip,
  OptionChipLabel,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  TextAreaField,
  TextField,
  PreviewCard,
  ThemedHeadingText,
} from 'components/ui/controls'

const pad = (value: number) => String(value).padStart(2, '0')
const todayLabel = () => {
  const date = new Date()
  return formatDateMMDDYYYY(
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  )
}

const FOLLOW_UP_WEEKS = 6

type FollowUpChannel = 'sms' | 'email'

const parseDateInput = (value: string): Date | null => {
  const trimmed = (value || '').trim()
  if (!trimmed) return null

  const slashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slashMatch) {
    const month = Number(slashMatch[1])
    const day = Number(slashMatch[2])
    const year = Number(slashMatch[3])
    return new Date(year, month - 1, day)
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const year = Number(isoMatch[1])
    const month = Number(isoMatch[2])
    const day = Number(isoMatch[3])
    return new Date(year, month - 1, day)
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed
  }

  return null
}

const addWeeks = (base: Date, weeks: number) => {
  const next = new Date(base)
  next.setDate(next.getDate() + weeks * 7)
  return next
}

const buildFollowUpMessage = (clientName: string, channel: FollowUpChannel) => {
  const firstName = clientName.split(' ')[0] || clientName
  if (channel === 'email') {
    return `Hi ${firstName},\n\nJust checking in to see if you'd like to book your next appointment. Let me know what works best for you.`
  }
  return `Hi ${firstName}, just checking in to see if you'd like to book your next appointment.`
}

export default function QuickLogScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data: clients = [] } = useClients()
  const { data: serviceOptions = [] } = useServices('true')
  const { data: appointmentHistory = [] } = useAppointmentHistory()
  const createAppointmentLog = useCreateAppointmentLog()
  const createService = useCreateService()
  const addFollowUp = useFollowUpsStore((state) => state.addFollowUp)

  const [searchText, setSearchText] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [newServiceName, setNewServiceName] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(todayLabel())
  const [followUpChannel, setFollowUpChannel] = useState<FollowUpChannel>('sms')
  const [followUpMessage, setFollowUpMessage] = useState('')
  const [hasEditedMessage, setHasEditedMessage] = useState(false)
  const [followUpDate, setFollowUpDate] = useState(() => {
    const due = addWeeks(new Date(), FOLLOW_UP_WEEKS)
    return formatDateMMDDYYYY(due.toISOString())
  })
  const [hasEditedFollowUpDate, setHasEditedFollowUpDate] = useState(false)
  const previousClientIdRef = useRef<string | null>(null)

  const filteredClients = useMemo(() => {
    const normalized = searchText.trim().toLowerCase()
    if (!normalized) return clients
    return clients.filter((client) => {
      const haystack = [client.name, client.email, client.phone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalized)
    })
  }, [clients, searchText])

  const selectedClient = clients.find((client) => client.id === selectedClientId) || null
  const primaryService = serviceOptions.find((item) => item.id === selectedServiceId)
  const lastAppointment = useMemo(() => {
    if (!selectedClientId) return null
    return appointmentHistory.reduce((latest, entry) => {
      if (entry.clientId !== selectedClientId) return latest
      if (!entry.date) return latest
      if (!latest) return entry
      return new Date(entry.date).getTime() > new Date(latest.date).getTime()
        ? entry
        : latest
    }, null as (typeof appointmentHistory)[number] | null)
  }, [appointmentHistory, selectedClientId])

  const defaultFollowUpDate = useMemo(() => {
    const base = parseDateInput(date) ?? new Date()
    const due = addWeeks(base, FOLLOW_UP_WEEKS)
    return formatDateMMDDYYYY(due.toISOString())
  }, [date])

  useEffect(() => {
    const currentClientId = selectedClientId ?? null
    const clientChanged = currentClientId !== previousClientIdRef.current
    previousClientIdRef.current = currentClientId

    if (!selectedClient) {
      setFollowUpMessage('')
      setHasEditedMessage(false)
      return
    }

    if (clientChanged) {
      setFollowUpMessage(buildFollowUpMessage(selectedClient.name, followUpChannel))
      setHasEditedMessage(false)
      return
    }

    if (!hasEditedMessage) {
      setFollowUpMessage(buildFollowUpMessage(selectedClient.name, followUpChannel))
    }
  }, [followUpChannel, hasEditedMessage, selectedClient, selectedClientId])

  useEffect(() => {
    if (hasEditedFollowUpDate) return
    setFollowUpDate(defaultFollowUpDate)
  }, [defaultFollowUpDate, hasEditedFollowUpDate])

  useEffect(() => {
    if (!selectedClientId || !lastAppointment) return
    if (!selectedServiceId) {
      let nextServiceId = lastAppointment.serviceIds?.[0]
      if (!nextServiceId && lastAppointment.services) {
        const normalized = normalizeServiceName(lastAppointment.services).toLowerCase()
        nextServiceId = serviceOptions.find((service) => service.normalizedName === normalized)?.id
      }
      if (nextServiceId) {
        setSelectedServiceId(nextServiceId)
      }
    }
    if (!price && lastAppointment.price) {
      setPrice(String(lastAppointment.price))
    }
  }, [lastAppointment, price, selectedClientId, selectedServiceId, serviceOptions])

  const resetForm = () => {
    setSelectedClientId(null)
    setSelectedServiceId(null)
    setNewServiceName('')
    setPrice('')
    setNotes('')
    setDate(todayLabel())
    setFollowUpChannel('sms')
    setFollowUpMessage('')
    setHasEditedMessage(false)
    setHasEditedFollowUpDate(false)
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

  const handleSave = async (withFollowUp: boolean) => {
    if (!selectedClient) return
    const numericPrice = price.trim() ? Number(price) : null

    await createAppointmentLog.mutateAsync({
      clientId: selectedClient.id,
      serviceIds: selectedServiceId ? [selectedServiceId] : [],
      serviceType: primaryService ? normalizeServiceName(primaryService.name) : null,
      notes,
      price: Number.isNaN(numericPrice) ? null : numericPrice,
      date,
    })

    if (withFollowUp) {
      const parsedDue = parseDateInput(followUpDate)
      const baseDate = parseDateInput(date) ?? new Date()
      const dueDate = parsedDue ?? addWeeks(baseDate, FOLLOW_UP_WEEKS)

      addFollowUp({
        clientId: selectedClient.id,
        dueAt: dueDate.toISOString(),
        channel: followUpChannel,
        message: followUpMessage || buildFollowUpMessage(selectedClient.name, followUpChannel),
      })
    }

    router.back()
    resetForm()
  }

  return (
    <YStack flex={1} bg="$background" position="relative">
      <ScrollView contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom + 16) }}>
        <YStack px="$5" pt={Math.max(insets.top + 16, 24)} gap="$4">
          <ThemedHeadingText fontSize={18} fontWeight="700">
            Quick Log
          </ThemedHeadingText>
          <Text fontSize={12} color="$textSecondary">
            Log an appointment in under a minute.
          </Text>

          {!selectedClient ? (
            <YStack gap="$3">
              <PreviewCard p="$0" gap="$0" px="$3" py="$2">
                <XStack items="center" gap="$2">
                  <Search size={16} color="$textSecondary" />
                  <TextField
                    flex={1}
                    borderWidth={0}
                    height={36}
                    px="$0"
                    placeholder="Search clients"
                    value={searchText}
                    onChangeText={setSearchText}
                    fontSize={12}
                    color="$color"
                    placeholderTextColor="$textMuted"
                    accessibilityLabel="Search clients"
                  />
                </XStack>
              </PreviewCard>

              <YStack gap="$2">
                {filteredClients.map((client) => (
                  <PreviewCard
                    key={client.id}
                    p="$4"
                    pressStyle={{ opacity: 0.88 }}
                    cursor="pointer"
                    onPress={() => setSelectedClientId(client.id)}
                  >
                    <Text fontSize={14} fontWeight="600">
                      {client.name}
                    </Text>
                    <Text fontSize={12} color="$textSecondary">
                      {client.type}
                    </Text>
                  </PreviewCard>
                ))}
              </YStack>
            </YStack>
          ) : (
            <YStack gap="$3">
              <Text fontSize={14} fontWeight="600">
                {selectedClient.name}
              </Text>

              <SectionDivider />

              <TextField
                placeholder="Date (MM/DD/YYYY)"
                value={date}
                onChangeText={setDate}
                accessibilityLabel="Appointment date"
              />

              <Text fontSize={12} color="$textSecondary">
                Choose a service
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
                value={price}
                onChangeText={setPrice}
              />
              <TextField
                placeholder="Notes (optional)"
                value={notes}
                onChangeText={setNotes}
              />

              <Text fontSize={12} color="$textSecondary">
                Follow-up channel
              </Text>
              <XStack gap="$2">
                {(['sms', 'email'] as FollowUpChannel[]).map((channel) => (
                  <OptionChip
                    key={channel}
                    active={followUpChannel === channel}
                    onPress={() => setFollowUpChannel(channel)}
                  >
                    <OptionChipLabel active={followUpChannel === channel}>
                      {channel === 'sms' ? 'Text' : 'Email'}
                    </OptionChipLabel>
                  </OptionChip>
                ))}
              </XStack>

              <Text fontSize={12} color="$textSecondary">
                Follow-up date
              </Text>
              <TextField
                placeholder="MM/DD/YYYY"
                value={followUpDate}
                onChangeText={(text) => {
                  setHasEditedFollowUpDate(true)
                  setFollowUpDate(text)
                }}
                accessibilityLabel="Follow-up date"
              />

              <Text fontSize={12} color="$textSecondary">
                Follow-up message
              </Text>
              <TextAreaField
                minH={120}
                value={followUpMessage}
                onChangeText={(text) => {
                  setHasEditedMessage(true)
                  setFollowUpMessage(text)
                }}
                placeholder="Add your follow-up message"
              />

              <XStack gap="$3" pt="$2">
                <SecondaryButton flex={1} onPress={() => handleSave(false)}>
                  Save
                </SecondaryButton>
                <PrimaryButton flex={1} onPress={() => handleSave(true)}>
                  Save + Follow-up
                </PrimaryButton>
              </XStack>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
