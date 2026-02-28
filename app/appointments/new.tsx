import {
  useMemo,
  useState } from 'react'
import { Link, useRouter } from 'expo-router'
import { ChevronLeft,
  Search,
  UserPlus } from '@tamagui/lucide-icons'
import { ScrollView,
  Text,
  XStack,
  YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useThemePrefs } from 'components/ThemePrefs'
import { useClients } from 'components/data/queries'
import { useStudioStore } from 'components/state/studioStore'
import { SectionDivider,
  SecondaryButton,
  SurfaceCard,
  TextField,
  cardSurfaceProps,
} from 'components/ui/controls'
import { formatDateByStyle } from 'components/utils/date'

export default function NewAppointmentClientPicker() {
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const { data: clients = [] } = useClients()
  const appSettings = useStudioStore((state) => state.appSettings)
  const [searchText, setSearchText] = useState('')

  const filteredClients = useMemo(() => {
    const normalized = searchText.trim().toLowerCase()
    if (!normalized) return [...clients].sort((a, b) => a.name.localeCompare(b.name))
    return clients
      .filter((client) => {
        const haystack = [client.name, client.email, client.phone, client.tag]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(normalized)
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [clients, searchText])

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <XStack px="$5" pt={topInset} pb="$2" items="center" justify="space-between">
        <SecondaryButton
          size="$2"
          height={36}
          width={38}
          px="$2"
          icon={<ChevronLeft size={16} />}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <YStack width={38} />
      </XStack>
      <ScrollView contentContainerStyle={{ pb: "$10" }}>
        <YStack px="$5" pt="$3" gap="$4">
          <YStack gap="$2">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              New Appointment Log
            </Text>
            <Text fontSize={12} color="$textSecondary">
              Choose a client to log an appointment.
            </Text>
          </YStack>

          {isGlass ? (
            <SurfaceCard
              mode="alwaysCard"
              tone="secondary"
              rounded="$4"
              p="$0"
              gap="$0"
              px="$3"
              py="$2"
            >
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
                />
              </XStack>
            </SurfaceCard>
          ) : (
            <XStack
              {...cardSurfaceProps}
              rounded="$4"
              px="$3"
              py="$2"
              items="center"
              gap="$2"
            >
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
              />
            </XStack>
          )}

          <SectionDivider />

          <YStack gap="$3">
            {filteredClients.length === 0 ? (
              isGlass ? (
                <SurfaceCard mode="alwaysCard" tone="secondary" rounded="$5" p="$4">
                  <Text fontSize={12} color="$textSecondary">
                    No clients match your search.
                  </Text>
                </SurfaceCard>
              ) : (
                <YStack {...cardSurfaceProps} rounded="$5" p="$4">
                  <Text fontSize={12} color="$textSecondary">
                    No clients match your search.
                  </Text>
                </YStack>
              )
            ) : (
              filteredClients.map((client) => (
                <Link key={client.id} href={`/client/${client.id}/new-appointment`} asChild>
                  {isGlass ? (
                    <SurfaceCard
                      mode="alwaysCard"
                      tone="secondary"
                      rounded="$5"
                      p="$4"
                      pressStyle={{ opacity: 0.88 }}
                      cursor="pointer"
                    >
                      <XStack items="center" justify="space-between" gap="$3">
                        <YStack>
                          <Text fontSize={14} fontWeight="600">
                            {client.name}
                          </Text>
                          <Text fontSize={12} color="$textSecondary">
                            {client.type} • Last visit{' '}
                            {formatDateByStyle(client.lastVisit, appSettings.dateDisplayFormat, {
                              todayLabel: true,
                              includeWeekday: appSettings.dateLongIncludeWeekday,
                            })}
                          </Text>
                        </YStack>
                        <XStack items="center" gap="$2">
                          <UserPlus size={16} color="$accent" />
                          <Text fontSize={12} color="$accent">
                            Select
                          </Text>
                        </XStack>
                      </XStack>
                    </SurfaceCard>
                  ) : (
                    <XStack
                      {...cardSurfaceProps}
                      rounded="$5"
                      p="$4"
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
                          {formatDateByStyle(client.lastVisit, appSettings.dateDisplayFormat, {
                            todayLabel: true,
                            includeWeekday: appSettings.dateLongIncludeWeekday,
                          })}
                        </Text>
                      </YStack>
                      <XStack items="center" gap="$2">
                        <UserPlus size={16} color="$accent" />
                        <Text fontSize={12} color="$accent">
                          Select
                        </Text>
                      </XStack>
                    </XStack>
                  )}
                </Link>
              ))
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
