import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { PlusCircle, Search, SlidersHorizontal } from '@tamagui/lucide-icons'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useAppointmentHistory, useClients } from 'components/data/queries'
import { SectionDivider, TextField } from 'components/ui/controls'
import { formatDateByStyle } from 'components/utils/date'
import { useClientsStore } from 'components/state/clientsStore'
import { useStudioStore } from 'components/state/studioStore'

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

const chipStyle = {
  bg: '$gray1',
  borderWidth: 1,
  borderColor: '$gray3',
}

const statusColors = {
  Active: '$green10',
  Inactive: '$orange10',
} as const

export default function ClientsScreen() {
  const router = useRouter()
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

  const activeCutoff = new Date()
  activeCutoff.setMonth(activeCutoff.getMonth() - activeStatusMonths)

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
    })
  }, [appointmentHistory, clients, searchText, statusFilter, typeFilter])

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack px="$5" pt="$6" gap="$4">
          <YStack gap="$2">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              Client Index
            </Text>
          </YStack>

          <XStack gap="$3" items="center">
            <XStack
              {...cardBorder}
              flex={1}
              rounded="$4"
              px="$3"
              py="$2"
              items="center"
              gap="$2"
            >
              <Search size={16} color="$gray8" />
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
                placeholderTextColor="$gray7"
              />
            </XStack>
            <XStack
              {...cardBorder}
              rounded="$4"
              px="$3"
              py="$2.5"
              items="center"
              gap="$2"
              onPress={toggleFilters}
            >
              <SlidersHorizontal size={16} color="$gray8" />
              <Text fontSize={12} color="$gray8">
                {showFilters ? 'Hide Filters' : 'Filters'}
              </Text>
            </XStack>
          </XStack>

          {showFilters ? (
            <>
              <XStack gap="$2" flexWrap="wrap">
                {(['All', 'Active', 'Inactive'] as const).map((status) => (
                  <XStack
                    key={status}
                    {...chipStyle}
                    rounded="$3"
                    px="$2.5"
                    py="$1.5"
                    items="center"
                    bg={statusFilter === status ? '$accentMuted' : '$background'}
                    borderColor={statusFilter === status ? '$accentSoft' : '$borderColor'}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text fontSize={11} color={statusFilter === status ? '$accent' : '$gray8'}>
                      {status}
                    </Text>
                  </XStack>
                ))}
              </XStack>

              <XStack gap="$2" flexWrap="wrap">
                {(['All', 'Cut', 'Color', 'Cut & Color'] as const).map((type) => (
                  <XStack
                    key={type}
                    {...chipStyle}
                    rounded="$3"
                    px="$2.5"
                    py="$1.5"
                    items="center"
                    bg={typeFilter === type ? '$accentMuted' : '$background'}
                    borderColor={typeFilter === type ? '$accentSoft' : '$borderColor'}
                    onPress={() => setTypeFilter(type)}
                  >
                    <Text fontSize={11} color={typeFilter === type ? '$accent' : '$gray8'}>
                      {type}
                    </Text>
                  </XStack>
                ))}
              </XStack>
            </>
          ) : null}

          <SectionDivider />

          <YStack gap="$3">
            {filteredClients.map((client) => (
              <XStack
                key={client.id}
                {...cardBorder}
                rounded="$5"
                p="$4"
                items="center"
                justify="space-between"
                gap="$3"
                animation="quick"
                enterStyle={{ opacity: 0, y: 6 }}
                hoverStyle={{ opacity: 0.92 }}
                pressStyle={{ opacity: 0.88 }}
                cursor="pointer"
                onPress={() => router.push(`/client/${client.id}`)}
              >
                <YStack gap="$1" flex={1}>
                  <Text fontSize={15} fontWeight="600">
                    {client.name}
                  </Text>
                  <Text fontSize={12} color="$gray8">
                    {client.type} • Last visit{' '}
                    {formatDateByStyle(client.lastVisit, 'short', { todayLabel: true })}
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
                    <Text fontSize={11} color="$gray7">
                      {client.tag}
                    </Text>
                  </XStack>
                </YStack>
                <YStack items="flex-end" gap="$1">
                  <XStack
                    {...cardBorder}
                    rounded="$3"
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
            ))}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
