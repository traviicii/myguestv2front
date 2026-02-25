import { useMemo, useState } from 'react'
import { Link } from 'expo-router'
import { Search, UserPlus } from '@tamagui/lucide-icons'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useClients } from 'components/data/queries'
import { SectionDivider, TextField } from 'components/ui/controls'
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

export default function NewAppointmentClientPicker() {
  const { data: clients = [] } = useClients()
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
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack px="$5" pt="$6" gap="$4">
          <YStack gap="$2">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              New Appointment Log
            </Text>
            <Text fontSize={12} color="$gray8">
              Choose a client to log an appointment.
            </Text>
          </YStack>

          <XStack
            {...cardBorder}
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
              placeholder="Search clients"
              value={searchText}
              onChangeText={setSearchText}
              fontSize={12}
              color="$color"
              placeholderTextColor="$gray7"
            />
          </XStack>

          <SectionDivider />

          <YStack gap="$3">
            {filteredClients.length === 0 ? (
              <YStack {...cardBorder} rounded="$5" p="$4">
                <Text fontSize={12} color="$gray8">
                  No clients match your search.
                </Text>
              </YStack>
            ) : (
              filteredClients.map((client) => (
                <Link key={client.id} href={`/client/${client.id}/new-appointment`} asChild>
                  <XStack
                    {...cardBorder}
                    rounded="$5"
                    p="$4"
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
                        {client.type} • Last visit {formatDateMMDDYYYY(client.lastVisit)}
                      </Text>
                    </YStack>
                    <XStack items="center" gap="$2">
                      <UserPlus size={16} color="$accent" />
                      <Text fontSize={12} color="$accent">
                        Select
                      </Text>
                    </XStack>
                  </XStack>
                </Link>
              ))
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
