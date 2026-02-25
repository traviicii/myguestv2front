import { Link, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { CalendarDays } from '@tamagui/lucide-icons'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { Image } from 'react-native'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useAppointmentHistory, useClients } from 'components/data/queries'
import { formatDateLabel } from 'components/utils/date'

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

const getServiceLabel = (notes: string, fallback: string) => {
  const trimmed = (notes || '').trim()
  if (!trimmed) return fallback
  const firstLine = trimmed.split('\n')[0].trim()
  if (!firstLine) return fallback
  const colonIndex = firstLine.indexOf(':')
  if (colonIndex > 0) return firstLine.slice(0, colonIndex).trim()
  return firstLine
}

export default function AppointmentsScreen() {
  const params = useLocalSearchParams<{ clientId?: string | string[] }>()
  const clientId = Array.isArray(params.clientId) ? params.clientId[0] : params.clientId
  const { data: clients = [] } = useClients()
  const { data: appointmentHistory = [] } = useAppointmentHistory()

  const sortedHistory = useMemo(() => {
    const source = clientId
      ? appointmentHistory.filter((entry) => entry.clientId === clientId)
      : appointmentHistory
    return [...source]
      .filter((entry) => entry.date)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [appointmentHistory, clientId])

  const clientName = clientId
    ? clients.find((client) => client.id === clientId)?.name
    : null

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack px="$5" pt="$6" gap="$4">
          <YStack gap="$2">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              Appointment Logs
            </Text>
            <Text fontSize={12} color="$gray8">
              {clientName
                ? `Logs for ${clientName}.`
                : 'All recorded visits, most recent first.'}
            </Text>
          </YStack>

          <YStack gap="$3">
            {sortedHistory.length === 0 ? (
              <YStack {...cardBorder} rounded="$5" p="$4">
                <Text fontSize={12} color="$gray8">
                  No appointment logs recorded yet.
                </Text>
              </YStack>
            ) : (
              sortedHistory.map((entry) => {
                const clientName =
                  clients.find((client) => client.id === entry.clientId)?.name ??
                  'Client'
                return (
                  <Link key={entry.id} href={`/appointment/${entry.id}`} asChild>
                    <XStack
                      {...cardBorder}
                      p="$4"
                      rounded="$5"
                      items="center"
                      justify="space-between"
                      gap="$3"
                      animation="quick"
                      enterStyle={{ opacity: 0, y: 6 }}
                    >
                      <XStack items="center" gap="$3">
                        <XStack
                          bg="$accentSoft"
                          rounded="$4"
                          p="$2.5"
                          items="center"
                          justify="center"
                        >
                          <CalendarDays size={18} color="$accent" />
                        </XStack>
                        <YStack gap="$1">
                          <Text fontSize={14} fontWeight="600">
                            {getServiceLabel(entry.notes, entry.services)}
                          </Text>
                          <XStack items="center" gap="$2">
                            <Text fontSize={12} color="$gray8">
                              {clientName}
                            </Text>
                            <Text fontSize={11} color="$gray8">
                              {formatDateLabel(entry.date, { todayLabel: true })}
                            </Text>
                          </XStack>
                        </YStack>
                      </XStack>
                      <XStack items="center" gap="$2">
                        <Text fontSize={12} color="$gray9">
                          ${entry.price}
                        </Text>
                        {entry.images?.length ? (
                          <YStack
                            width={36}
                            height={36}
                            rounded="$3"
                            overflow="hidden"
                            borderWidth={1}
                            borderColor="$gray3"
                          >
                            <Image
                              source={{ uri: entry.images[0] }}
                              style={{ width: '100%', height: '100%' }}
                            />
                          </YStack>
                        ) : null}
                      </XStack>
                    </XStack>
                  </Link>
                )
              })
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
