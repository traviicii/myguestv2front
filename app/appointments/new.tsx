import {
  useMemo,
  useRef,
  useState } from 'react'
import { Link, useRouter } from 'expo-router'
import { ChevronLeft,
  Search,
  UserPlus,
  X } from '@tamagui/lucide-icons'
import { ScrollView,
  Text,
  XStack,
  YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useAppointmentHistory, useClients } from 'components/data/queries'
import { useStudioStore } from 'components/state/studioStore'
import { useThemePrefs } from 'components/ThemePrefs'
import { SectionDivider,
  SecondaryButton,
  PreviewCard,
  TextField,
  cardSurfaceProps,
} from 'components/ui/controls'
import { formatDateByStyle } from 'components/utils/date'

export default function NewAppointmentClientPicker() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const { aesthetic, mode: themeMode } = useThemePrefs()
  const isCyberpunk = aesthetic === 'cyberpunk'
  const isGlass = aesthetic === 'glass'
  const controlRadius = isCyberpunk ? 0 : isGlass ? 20 : 10
  const { data: clients = [] } = useClients()
  const { data: appointmentHistory = [] } = useAppointmentHistory()
  const appSettings = useStudioStore((state) => state.appSettings)
  const [searchText, setSearchText] = useState('')
  const searchInputRef = useRef<any>(null)
  const formatLastVisitLabel = (value: string) => {
    if (!value || value === 'No visits yet' || value === '—') return 'No visits yet'
    return formatDateByStyle(value, appSettings.dateDisplayFormat, {
      todayLabel: true,
      includeWeekday: appSettings.dateLongIncludeWeekday,
    })
  }

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
  const derivedLastVisitByClient = useMemo(() => {
    return appointmentHistory.reduce<Record<string, string>>((acc, entry) => {
      const current = acc[entry.clientId]
      if (!current || new Date(entry.date) > new Date(current)) {
        acc[entry.clientId] = entry.date
      }
      return acc
    }, {})
  }, [appointmentHistory])

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
      <ScrollView contentContainerStyle={{ pb: "$10" }} keyboardShouldPersistTaps="handled">
        <YStack px="$5" pt="$3" gap="$4">
          <YStack gap="$2">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              New Appointment Log
            </Text>
            <Text fontSize={12} color="$textSecondary">
              Choose a client to log an appointment.
            </Text>
          </YStack>

          <XStack
            {...cardSurfaceProps}
            rounded={controlRadius}
            width="100%"
            px="$3"
            py="$2"
            items="center"
            gap="$2"
          >
            <Search size={16} color="$textSecondary" />
            <TextField
              ref={searchInputRef}
              flex={1}
              borderWidth={0}
              height={36}
              px="$0"
              pl="$2"
              placeholder="Search clients"
              value={searchText}
              onChangeText={setSearchText}
              fontSize={12}
              color="$color"
              placeholderTextColor="$textMuted"
            />
            <XStack
              width={28}
              height={28}
              rounded={999}
              items="center"
              justify="center"
              onPress={() => {
                if (!searchText) return
                setSearchText('')
                requestAnimationFrame(() => {
                  searchInputRef.current?.focus?.()
                })
              }}
              pressStyle={searchText ? { opacity: 0.7 } : undefined}
              opacity={searchText ? 1 : 0.35}
              pointerEvents={searchText ? 'auto' : 'none'}
            >
              <X size={14} color="$textSecondary" />
            </XStack>
          </XStack>

          <SectionDivider />

          <YStack gap="$3">
            {filteredClients.length === 0 ? (
              <PreviewCard p="$4">
                <Text fontSize={12} color="$textSecondary">
                  No clients match your search.
                </Text>
              </PreviewCard>
            ) : (
              filteredClients.map((client) => (
                <Link key={client.id} href={`/client/${client.id}/new-appointment`} asChild>
                  <PreviewCard p="$4" pressStyle={{ opacity: 0.88 }} cursor="pointer">
                    <XStack items="center" justify="space-between" gap="$3">
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
                      <XStack items="center" gap="$2">
                        <UserPlus size={16} color="$accent" />
                        <Text fontSize={12} color="$accent">
                          Select
                        </Text>
                      </XStack>
                    </XStack>
                  </PreviewCard>
                </Link>
              ))
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
