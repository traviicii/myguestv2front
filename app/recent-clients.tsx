import { Link } from 'expo-router'
import { useMemo } from 'react'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useAppointmentHistory, useClients } from 'components/data/queries'
import { formatDateMMDDYYYY } from 'components/utils/date'

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

const getDateValue = (dateString: string) => {
  if (!dateString || dateString === '—') return null
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  return date.getTime()
}

export default function RecentClientsScreen() {
  const { data: clients = [] } = useClients()
  const { data: appointmentHistory = [] } = useAppointmentHistory()

  const lastVisitByClient = useMemo(() => {
    return appointmentHistory.reduce<Record<string, string>>((acc, entry) => {
      const current = acc[entry.clientId]
      if (!current || entry.date > current) {
        acc[entry.clientId] = entry.date
      }
      return acc
    }, {})
  }, [appointmentHistory])

  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => {
      const aDate = getDateValue(lastVisitByClient[a.id] ?? a.lastVisit) ?? -1
      const bDate = getDateValue(lastVisitByClient[b.id] ?? b.lastVisit) ?? -1
      if (aDate !== bDate) return bDate - aDate
      return a.name.localeCompare(b.name)
    })
  }, [clients, lastVisitByClient])

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack px="$5" pt="$6" gap="$4">
          <YStack gap="$2">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              Recent Clients
            </Text>
            <Text fontSize={12} color="$gray8">
              Last visit dates sorted from most recent.
            </Text>
          </YStack>

          <YStack gap="$3">
            {sortedClients.length === 0 ? (
              <YStack {...cardBorder} rounded="$5" p="$4">
                <Text fontSize={12} color="$gray8">
                  No clients yet.
                </Text>
              </YStack>
            ) : (
              sortedClients.map((client) => {
                const lastVisit = lastVisitByClient[client.id] ?? client.lastVisit
                return (
                  <Link key={client.id} href={`/client/${client.id}`} asChild>
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
                      <YStack>
                        <Text fontSize={14} fontWeight="600">
                          {client.name}
                        </Text>
                        <Text fontSize={12} color="$gray8">
                          {client.type} • Last visit {formatDateMMDDYYYY(lastVisit || '—')}
                        </Text>
                      </YStack>
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
