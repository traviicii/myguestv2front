import { Link } from 'expo-router'
import { cardSurfaceProps } from 'components/ui/controls'
import { useMemo } from 'react'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useAppointmentHistory, useClients } from 'components/data/queries'
import { useStudioStore } from 'components/state/studioStore'
import { sortClientsByNewest } from 'components/utils/clientSort'
import { formatDateByStyle } from 'components/utils/date'

export default function RecentClientsScreen() {
  const { data: clients = [] } = useClients()
  const { data: appointmentHistory = [] } = useAppointmentHistory()
  const appSettings = useStudioStore((state) => state.appSettings)

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
    return sortClientsByNewest(clients)
  }, [clients])

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScrollView contentContainerStyle={{ pb: "$10" }}>
        <YStack px="$5" pt="$6" gap="$4">
          <YStack gap="$2">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              Recent Clients
            </Text>
            <Text fontSize={12} color="$textSecondary">
              Newest clients in your database.
            </Text>
          </YStack>

          <YStack gap="$3">
            {sortedClients.length === 0 ? (
              <YStack {...cardSurfaceProps} rounded="$5" p="$4">
                <Text fontSize={12} color="$textSecondary">
                  No clients yet.
                </Text>
              </YStack>
            ) : (
              sortedClients.map((client) => {
                const lastVisit = lastVisitByClient[client.id] ?? client.lastVisit
                return (
                  <Link key={client.id} href={`/client/${client.id}`} asChild>
                    <XStack
                      {...cardSurfaceProps}
                      p="$4"
                      rounded="$5"
                      items="center"
                      justify="space-between"
                      gap="$3"
                                                                >
                      <YStack>
                        <Text fontSize={14} fontWeight="600">
                          {client.name}
                        </Text>
                        <Text fontSize={12} color="$textSecondary">
                          {client.type} • Last visit{' '}
                          {formatDateByStyle(lastVisit || '—', appSettings.dateDisplayFormat, {
                            todayLabel: true,
                            includeWeekday: appSettings.dateLongIncludeWeekday,
                          })}
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
