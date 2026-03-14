import { Link } from 'expo-router'
import { PreviewCard } from 'components/ui/controls'
import { useMemo } from 'react'
import { Text, YStack } from 'tamagui'
import { FlatList } from 'react-native'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useAppointmentHistoryLite, useClients } from 'components/data/queries'
import { useStudioStore } from 'components/state/studioStore'
import { sortClientsByNewest } from 'components/utils/clientSort'
import { formatDateByStyle } from 'components/utils/date'
import { deriveLastVisitByClient } from 'components/utils/clientDerived'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function RecentClientsScreen() {
  const { data: clients = [] } = useClients()
  const { data: appointmentHistory = [] } = useAppointmentHistoryLite()
  const appSettings = useStudioStore((state) => state.appSettings)
  const insets = useSafeAreaInsets()
  const formatLastVisitLabel = (value: string) => {
    if (!value || value === 'No visits yet' || value === '—') return 'No visits yet'
    return formatDateByStyle(value, appSettings.dateDisplayFormat, {
      todayLabel: true,
      includeWeekday: appSettings.dateLongIncludeWeekday,
    })
  }

  const sortedClients = useMemo(() => {
    return sortClientsByNewest(clients)
  }, [clients])
  const derivedLastVisitByClient = useMemo(
    () => deriveLastVisitByClient(appointmentHistory),
    [appointmentHistory]
  )

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <FlatList
        data={sortedClients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom + 24) }}
        ListHeaderComponent={
          <YStack px="$5" pt="$6" gap="$4">
            <YStack gap="$2">
              <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
                Recent Clients
              </Text>
              <Text fontSize={12} color="$textSecondary">
                Newest clients in your database.
              </Text>
            </YStack>
          </YStack>
        }
        ListEmptyComponent={
          <YStack px="$5" pt="$2">
            <PreviewCard p="$4">
              <Text fontSize={12} color="$textSecondary">
                No clients yet.
              </Text>
            </PreviewCard>
          </YStack>
        }
        renderItem={({ item: client }) => (
          <YStack px="$5" mb="$3">
            <Link href={`/client/${client.id}`} asChild>
              <PreviewCard p="$4" pressStyle={{ opacity: 0.88 }} cursor="pointer">
                <YStack>
                  <Text fontSize={14} fontWeight="600">
                    {client.name}
                  </Text>
                  <Text fontSize={12} color="$textSecondary">
                    {client.type} • Last visit{' '}
                    {formatLastVisitLabel(
                      derivedLastVisitByClient[client.id] ?? client.lastVisit
                    )}
                  </Text>
                </YStack>
              </PreviewCard>
            </Link>
          </YStack>
        )}
      />
    </YStack>
  )
}
