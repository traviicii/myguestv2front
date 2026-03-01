import {
  useRouter } from 'expo-router'
import { useMemo } from 'react'
import { PlusCircle,
  Search,
  SlidersHorizontal } from '@tamagui/lucide-icons'
import { ScrollView,
  Text,
  XStack,
  YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useAppointmentHistory,
  useClients } from 'components/data/queries'
import { OptionChip,
  OptionChipLabel,
  SectionDivider,
  SurfaceCard,
  TextField,
  ThemedHeadingText,
  cardSurfaceProps,
} from 'components/ui/controls'
import { useThemePrefs } from 'components/ThemePrefs'
import { formatDateByStyle } from 'components/utils/date'
import { useClientsStore } from 'components/state/clientsStore'
import { useStudioStore } from 'components/state/studioStore'

const statusColors = {
  Active: '$green10',
  Inactive: '$orange10',
} as const

export default function ClientsScreen() {
  const router = useRouter()
  const { aesthetic } = useThemePrefs()
  const isCyberpunk = aesthetic === 'cyberpunk'
  const isGlass = aesthetic === 'glass'
  const cardRadius = isCyberpunk ? 0 : isGlass ? 24 : 14
  const controlRadius = isCyberpunk ? 0 : isGlass ? 20 : 10
  const chipRadius = isCyberpunk ? 0 : isGlass ? 16 : 10
  const searchText = useClientsStore((state) => state.searchText)
  const statusFilter = useClientsStore((state) => state.statusFilter)
  const typeFilter = useClientsStore((state) => state.typeFilter)
  const showFilters = useClientsStore((state) => state.showFilters)
  const setSearchText = useClientsStore((state) => state.setSearchText)
  const setStatusFilter = useClientsStore((state) => state.setStatusFilter)
  const setTypeFilter = useClientsStore((state) => state.setTypeFilter)
  const toggleFilters = useClientsStore((state) => state.toggleFilters)
  const { data: clients = [] } = useClients()
  const { data: appointmentHistory = [] } = useAppointmentHistory()
  const showStatus = useStudioStore(
    (state) =>
      state.appSettings.clientsShowStatus &&
      state.appSettings.clientsShowStatusList
  )
  const activeStatusMonths = useStudioStore(
    (state) => state.appSettings.activeStatusMonths
  )
  const dateDisplayFormat = useStudioStore(
    (state) => state.appSettings.dateDisplayFormat
  )
  const dateLongIncludeWeekday = useStudioStore(
    (state) => state.appSettings.dateLongIncludeWeekday
  )

  const activeCutoff = new Date()
  activeCutoff.setMonth(activeCutoff.getMonth() - activeStatusMonths)
  const formatLastVisitLabel = (value: string) => {
    if (!value || value === 'No visits yet' || value === '—') return 'No visits yet'
    return formatDateByStyle(value, dateDisplayFormat, {
      todayLabel: true,
      includeWeekday: dateLongIncludeWeekday,
    })
  }
  const derivedLastVisitByClient = useMemo(() => {
    return appointmentHistory.reduce<Record<string, string>>((acc, entry) => {
      const current = acc[entry.clientId]
      if (!current || new Date(entry.date) > new Date(current)) {
        acc[entry.clientId] = entry.date
      }
      return acc
    }, {})
  }, [appointmentHistory])
  const resolveLastVisit = (clientId: string, fallback: string) =>
    derivedLastVisitByClient[clientId] ?? fallback

  const isActive = (clientId: string) => {
    const history = appointmentHistory.filter((item) => item.clientId === clientId)
    return history.some((entry) => new Date(entry.date) >= activeCutoff)
  }

  const filteredClients = useMemo(() => {
    // Keep filtering logic centralized so chip/search behavior stays predictable.
    const normalizedSearch = searchText.trim().toLowerCase()

    return clients.filter((client) => {
      const activeStatus = isActive(client.id) ? 'Active' : 'Inactive'
      if (statusFilter !== 'All' && activeStatus !== statusFilter) return false
      if (typeFilter !== 'All' && client.type !== typeFilter) return false

      if (!normalizedSearch) return true
      const haystack = [
        client.name,
        client.email,
        client.phone,
        client.notes,
        client.tag,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [appointmentHistory, clients, searchText, statusFilter, typeFilter])

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScrollView contentContainerStyle={{ pb: "$10" }}>
        <YStack px="$5" pt="$6" gap="$4">
          <YStack gap="$2">
            <ThemedHeadingText fontWeight="700" fontSize={16}>
              Client Index
            </ThemedHeadingText>
          </YStack>

          <XStack gap="$3" items="center">
            <XStack
              {...cardSurfaceProps}
              flex={1}
              rounded={controlRadius}
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
                pl="$2"
                placeholder="Search clients, tags, notes"
                value={searchText}
                onChangeText={setSearchText}
                fontSize={12}
                color="$color"
                placeholderTextColor="$textMuted"
              />
            </XStack>
            <XStack
              {...cardSurfaceProps}
              rounded={controlRadius}
              px="$3"
              py="$2.5"
              items="center"
              gap="$2"
              onPress={toggleFilters}
            >
              <SlidersHorizontal size={16} color="$textSecondary" />
              <Text fontSize={12} color="$textSecondary">
                {showFilters ? 'Hide Filters' : 'Filters'}
              </Text>
            </XStack>
          </XStack>

          {showFilters ? (
            <>
              <XStack gap="$2" flexWrap="wrap">
                {(['All', 'Active', 'Inactive'] as const).map((status) => (
                  <OptionChip
                    key={status}
                    active={statusFilter === status}
                    rounded={chipRadius}
                    onPress={() => setStatusFilter(status)}
                  >
                    <OptionChipLabel active={statusFilter === status}>
                      {status}
                    </OptionChipLabel>
                  </OptionChip>
                ))}
              </XStack>

              <XStack gap="$2" flexWrap="wrap">
                {(['All', 'Cut', 'Color', 'Cut & Color'] as const).map((type) => (
                  <OptionChip
                    key={type}
                    active={typeFilter === type}
                    rounded={chipRadius}
                    onPress={() => setTypeFilter(type)}
                  >
                    <OptionChipLabel active={typeFilter === type}>
                      {type}
                    </OptionChipLabel>
                  </OptionChip>
                ))}
              </XStack>
            </>
          ) : null}

          <SectionDivider />

          <YStack gap="$3">
            {filteredClients.map((client, clientIndex) => (
              <YStack key={client.id} gap={aesthetic === 'modern' ? '$2' : '$0'}>
                {isGlass ? (
                  <SurfaceCard
                    tone="secondary"
                    rounded={cardRadius}
                    p="$4"
                    pressStyle={{ opacity: 0.88 }}
                    cursor="pointer"
                    onPress={() => router.push(`/client/${client.id}`)}
                  >
                    <XStack items="center" justify="space-between" gap="$3">
                      <YStack gap="$1" flex={1}>
                        <Text fontSize={15} fontWeight="600">
                          {client.name}
                        </Text>
                        <Text fontSize={12} color="$textSecondary">
                          {client.type} • Last visit{' '}
                          {formatLastVisitLabel(resolveLastVisit(client.id, client.lastVisit))}
                        </Text>
                        <XStack items="center" gap="$2">
                          {showStatus
                            ? (() => {
                                const status = isActive(client.id) ? 'Active' : 'Inactive'
                                return (
                                  <Text fontSize={11} color={statusColors[status]}>
                                    {status}
                                  </Text>
                                )
                              })()
                            : null}
                          {client.tag && client.tag !== client.type ? (
                            <Text fontSize={11} color="$textMuted">
                              {client.tag}
                            </Text>
                          ) : null}
                        </XStack>
                      </YStack>
                      <YStack items="flex-end" gap="$1">
                        <OptionChip
                          active
                          gap="$1.5"
                          onPress={(event) => {
                            event?.stopPropagation?.()
                            router.push(`/client/${client.id}/new-appointment`)
                          }}
                        >
                          <PlusCircle size={12} color="$accent" />
                          <OptionChipLabel active>New Log</OptionChipLabel>
                        </OptionChip>
                      </YStack>
                    </XStack>
                  </SurfaceCard>
                ) : (
                  <XStack
                    {...cardSurfaceProps}
                    rounded={cardRadius}
                    p="$4"
                    items="center"
                    justify="space-between"
                    gap="$3"
                    hoverStyle={{ opacity: 0.92 }}
                    pressStyle={{ opacity: 0.88 }}
                    cursor="pointer"
                    onPress={() => router.push(`/client/${client.id}`)}
                  >
                    <YStack gap="$1" flex={1}>
                      <Text fontSize={15} fontWeight="600">
                        {client.name}
                      </Text>
                      <Text fontSize={12} color="$textSecondary">
                        {client.type} • Last visit{' '}
                        {formatLastVisitLabel(resolveLastVisit(client.id, client.lastVisit))}
                      </Text>
                      <XStack items="center" gap="$2">
                        {showStatus
                          ? (() => {
                              const status = isActive(client.id) ? 'Active' : 'Inactive'
                              return (
                                <Text fontSize={11} color={statusColors[status]}>
                                  {status}
                                </Text>
                              )
                            })()
                          : null}
                        {client.tag && client.tag !== client.type ? (
                          <Text fontSize={11} color="$textMuted">
                            {client.tag}
                          </Text>
                        ) : null}
                      </XStack>
                    </YStack>
                    <YStack items="flex-end" gap="$1">
                      <XStack
                        {...cardSurfaceProps}
                        rounded={chipRadius}
                        px="$2.5"
                        py="$1.5"
                        items="center"
                        gap="$1.5"
                        cursor="pointer"
                        onPress={(event) => {
                          event?.stopPropagation?.()
                          router.push(`/client/${client.id}/new-appointment`)
                        }}
                      >
                        <PlusCircle size={14} color="$accent" />
                        <Text fontSize={11} color="$accent">
                          New Appointment Log
                        </Text>
                      </XStack>
                    </YStack>
                  </XStack>
                )}
                {aesthetic === 'modern' && clientIndex < filteredClients.length - 1 ? (
                  <YStack items="center">
                    <SectionDivider width="88%" />
                  </YStack>
                ) : null}
              </YStack>
            ))}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
