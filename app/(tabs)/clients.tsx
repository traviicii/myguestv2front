import {
  useRouter } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PlusCircle,
  Search,
  SlidersHorizontal,
  X } from '@tamagui/lucide-icons'
import { Text,
  XStack,
  YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useAppointmentHistory,
  useClients } from 'components/data/queries'
import { OptionChip,
  OptionChipLabel,
  PreviewCard,
  PrimaryButton,
  SectionDivider,
  TextField,
  ThemedHeadingText,
  cardSurfaceProps,
} from 'components/ui/controls'
import { useThemePrefs } from 'components/ThemePrefs'
import { formatDateByStyle } from 'components/utils/date'
import { useClientsStore } from 'components/state/clientsStore'
import { useStudioStore } from 'components/state/studioStore'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Animated as RNAnimated, RefreshControl } from 'react-native'
import { RefreshGlyph } from 'components/ui/RefreshGlyph'
import { useIsFocused } from '@react-navigation/native'

const statusColors = {
  Active: '$green10',
  Inactive: '$orange10',
} as const

export default function ClientsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { aesthetic, mode: themeMode } = useThemePrefs()
  const isCyberpunk = aesthetic === 'cyberpunk'
  const isGlass = aesthetic === 'glass'
  const isGlassLight = isGlass && themeMode === 'light'
  const controlRadius = isCyberpunk ? 0 : isGlass ? 20 : 10
  const chipRadius = isCyberpunk ? 0 : isGlass ? 16 : 10
  const isFocused = useIsFocused()
  const searchText = useClientsStore((state) => state.searchText)
  const statusFilter = useClientsStore((state) => state.statusFilter)
  const typeFilter = useClientsStore((state) => state.typeFilter)
  const showFilters = useClientsStore((state) => state.showFilters)
  const setSearchText = useClientsStore((state) => state.setSearchText)
  const setStatusFilter = useClientsStore((state) => state.setStatusFilter)
  const setTypeFilter = useClientsStore((state) => state.setTypeFilter)
  const toggleFilters = useClientsStore((state) => state.toggleFilters)
  const resetFilters = useClientsStore((state) => state.resetFilters)
  const searchInputRef = useRef<any>(null)
  const {
    data: clients = [],
    refetch: refetchClients,
  } = useClients()
  const {
    data: appointmentHistory = [],
    refetch: refetchAppointments,
  } = useAppointmentHistory()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const pullMax = 90
  const scrollY = useRef(new RNAnimated.Value(0)).current
  const pullDistance = RNAnimated.multiply(scrollY, -1)
  const pullClamped = RNAnimated.diffClamp(pullDistance, 0, pullMax)
  const pullProgress = RNAnimated.divide(pullClamped, pullMax)
  const [isThresholdReached, setIsThresholdReached] = useState(false)
  const thresholdRef = useRef(false)
  const pullDistanceRef = useRef(0)
  const minRefreshMs = 650
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
  const hasClients = clients.length > 0
  const hasFilteredClients = filteredClients.length > 0
  useEffect(() => {
    if (isFocused) return
    pullDistanceRef.current = 0
    thresholdRef.current = false
    setIsThresholdReached(false)
    scrollY.setValue(0)
  }, [isFocused, scrollY])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const startedAt = Date.now()
    try {
      await Promise.all([refetchClients(), refetchAppointments()])
    } finally {
      const elapsed = Date.now() - startedAt
      if (elapsed < minRefreshMs) {
        await new Promise((resolve) => setTimeout(resolve, minRefreshMs - elapsed))
      }
      pullDistanceRef.current = 0
      setIsRefreshing(false)
    }
  }

  const handleScroll = RNAnimated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const y = event?.nativeEvent?.contentOffset?.y ?? 0
        const distance = Math.max(0, -y)
        pullDistanceRef.current = distance
        const reached = distance >= pullMax * 0.95
        if (reached !== thresholdRef.current) {
          thresholdRef.current = reached
          setIsThresholdReached(reached)
        }
      },
    }
  )

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
        <YStack
          position="absolute"
          top={Math.max(insets.top + 4, 16)}
        left={0}
        right={0}
        items="center"
        pointerEvents="none"
        zIndex={20}
        height={40}
        overflow="hidden"
        >
          <RefreshGlyph
            progress={pullProgress}
            refreshing={isRefreshing}
            thresholdReached={isThresholdReached}
          />
        </YStack>
      <RNAnimated.ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(24, insets.bottom + 24),
        }}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={['transparent']}
            progressViewOffset={40}
          />
        }
      >
        <YStack px="$5" pt={Math.max(insets.top + 8, 24)} gap="$4">
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
                ref={searchInputRef}
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
          </XStack>

          <XStack justify="flex-end">
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

          {showFilters && hasClients ? (
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

          {!hasClients ? (
            <PreviewCard p="$4" gap="$2" items="center">
              <Text fontSize={14} fontWeight="600">
                No clients yet
              </Text>
              <Text fontSize={12} color="$textSecondary" style={{ textAlign: 'center' }}>
                Add your first client to get started.
              </Text>
              <PrimaryButton onPress={() => router.push('/clients/new')}>
                New Client
              </PrimaryButton>
            </PreviewCard>
          ) : !hasFilteredClients ? (
            <PreviewCard p="$4" gap="$2" items="center">
              <Text fontSize={12} color="$textSecondary" style={{ textAlign: 'center' }}>
                No clients match your search or filters.
              </Text>
              <PrimaryButton onPress={resetFilters}>Clear filters</PrimaryButton>
            </PreviewCard>
          ) : (
            <YStack gap="$3">
              {filteredClients.map((client, clientIndex) => (
                <YStack key={client.id} gap={aesthetic === 'modern' ? '$2' : '$0'}>
                  <PreviewCard
                    p="$4"
                    pressStyle={{ opacity: 0.88 }}
                    hoverStyle={{ opacity: 0.92 }}
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
                        {isGlass ? (
                          <OptionChip
                            active={!isGlassLight}
                            gap="$1.5"
                            onPress={(event) => {
                              event?.stopPropagation?.()
                              router.push(`/client/${client.id}/new-appointment`)
                            }}
                          >
                            <PlusCircle size={12} color="$accent" />
                            <OptionChipLabel active={!isGlassLight}>
                              New Appointment Log
                            </OptionChipLabel>
                          </OptionChip>
                        ) : (
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
                        )}
                      </YStack>
                    </XStack>
                  </PreviewCard>
                  {aesthetic === 'modern' && clientIndex < filteredClients.length - 1 ? (
                    <YStack items="center">
                      <SectionDivider width="88%" />
                    </YStack>
                  ) : null}
                </YStack>
              ))}
            </YStack>
          )}
        </YStack>
      </RNAnimated.ScrollView>
    </YStack>
  )
}
