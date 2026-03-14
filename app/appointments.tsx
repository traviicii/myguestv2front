import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { PreviewCard } from 'components/ui/controls'
import { useMemo } from 'react'
import { CalendarDays } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'
import { FlatList, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import { useThemePrefs } from 'components/ThemePrefs'
import { useAppointmentHistoryLite, useClients } from 'components/data/queries'
import { useStudioStore } from 'components/state/studioStore'
import { formatDateByStyle } from 'components/utils/date'
import { getServiceLabel } from 'components/utils/services'
import { buildClientMap } from 'components/utils/clientDerived'

export default function AppointmentsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const { aesthetic } = useThemePrefs()
  const isCyberpunk = aesthetic === 'cyberpunk'
  const isGlass = aesthetic === 'glass'
  const badgeRadius = isCyberpunk ? 0 : isGlass ? 16 : 10
  const thumbRadius = isCyberpunk ? 0 : isGlass ? 14 : 8
  const params = useLocalSearchParams<{ clientId?: string | string[] }>()
  const clientId = Array.isArray(params.clientId) ? params.clientId[0] : params.clientId
  const { data: clients = [] } = useClients()
  const { data: appointmentHistory = [] } = useAppointmentHistoryLite()
  const appSettings = useStudioStore((state) => state.appSettings)

  const sortedHistory = useMemo(() => {
    const source = clientId
      ? appointmentHistory.filter((entry) => entry.clientId === clientId)
      : appointmentHistory
    return [...source]
      .filter((entry) => entry.date)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [appointmentHistory, clientId])
  const clientMap = useMemo(() => buildClientMap(clients), [clients])

  const clientName = clientId
    ? clients.find((client) => client.id === clientId)?.name
    : null

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} bg="$background" position="relative">
        <AmbientBackdrop />
        <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
        <FlatList
          data={sortedHistory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: Math.max(24, insets.bottom + 24),
          }}
          ListHeaderComponent={
            <YStack px="$5" pt="$3" gap="$4">
              <YStack gap="$2">
                <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
                  Appointment Logs
                </Text>
                <Text fontSize={12} color="$textSecondary">
                  {clientName
                    ? `Logs for ${clientName}.`
                    : 'All recorded visits, most recent first.'}
                </Text>
              </YStack>
            </YStack>
          }
          ListEmptyComponent={
            <YStack px="$5" pt="$2">
              <PreviewCard p="$4">
                <Text fontSize={12} color="$textSecondary">
                  No appointment logs recorded yet.
                </Text>
              </PreviewCard>
            </YStack>
          }
          renderItem={({ item: entry }) => {
            const entryClientName = clientMap.get(entry.clientId)?.name ?? 'Client'
            return (
              <YStack px="$5" mb="$3">
                <Link href={`/appointment/${entry.id}`} asChild>
                  <PreviewCard p="$4" pressStyle={{ opacity: 0.88 }} cursor="pointer">
                    <XStack items="center" justify="space-between" gap="$3">
                      <XStack items="center" gap="$3">
                        <XStack
                          bg="$accentSoft"
                          rounded={badgeRadius}
                          p="$2.5"
                          items="center"
                          justify="center"
                        >
                          <CalendarDays size={18} color="$accent" />
                        </XStack>
                        <YStack gap="$1">
                          <Text fontSize={14} fontWeight="600">
                            {getServiceLabel(entry.services, entry.notes)}
                          </Text>
                          <XStack items="center" gap="$2">
                            <Text fontSize={12} color="$textSecondary">
                              {entryClientName}
                            </Text>
                            <Text fontSize={11} color="$textSecondary">
                              {formatDateByStyle(entry.date, appSettings.dateDisplayFormat, {
                                todayLabel: true,
                                includeWeekday: appSettings.dateLongIncludeWeekday,
                              })}
                            </Text>
                          </XStack>
                        </YStack>
                      </XStack>
                      <XStack items="center" gap="$2">
                        <Text fontSize={12} color="$textMuted">
                          ${entry.price}
                        </Text>
                        {entry.images?.length ? (
                          <YStack
                            width={36}
                            height={36}
                            rounded={thumbRadius}
                            overflow="hidden"
                            borderWidth={1}
                            borderColor="$borderSubtle"
                          >
                            <Image
                              source={{ uri: entry.images[0] }}
                              style={{ width: '100%', height: '100%' }}
                            />
                          </YStack>
                        ) : null}
                      </XStack>
                    </XStack>
                  </PreviewCard>
                </Link>
              </YStack>
            )
          }}
        />
      </YStack>
    </>
  )
}
