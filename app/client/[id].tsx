import { Link, Stack, useLocalSearchParams, type Href } from 'expo-router'
import {
  ChevronRight,
  Mail,
  MessageCircle,
  Pin,
  PinOff,
  Palette,
  Phone,
  List,
  Scissors,
} from '@tamagui/lucide-icons'
import { Image, Linking } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  useAppointmentHistory,
  useClients,
  useColorAnalysisByClient,
} from 'components/data/queries'
import { SectionDivider } from 'components/ui/controls'
import { formatDateByStyle } from 'components/utils/date'
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
} as const

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: clients = [] } = useClients()
  const { data: appointmentHistory = [] } = useAppointmentHistory()
  const { data: colorAnalysisByClient = {} } = useColorAnalysisByClient()
  const { pinnedClientIds, togglePinnedClient, appSettings } = useStudioStore()

  const client = clients.find((item) => item.id === id) ?? clients[0]

  const editHref: Href =
    id && typeof id === 'string'
      ? { pathname: '/client/[id]/edit', params: { id } }
      : '/clients'

  if (!client) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <Text fontSize={13} color="$gray8">
          Client not found.
        </Text>
      </YStack>
    )
  }

  const history = appointmentHistory.filter((item) => item.clientId === client.id)
  const colorAnalysis = colorAnalysisByClient[client.id]
  const isPinned = pinnedClientIds.includes(client.id)
  const activeCutoff = new Date()
  activeCutoff.setMonth(activeCutoff.getMonth() - appSettings.activeStatusMonths)
  // "Active" status is user-configurable in Settings via activeStatusMonths.
  const isActive = history.some((entry) => new Date(entry.date) >= activeCutoff)
  const statusLabel = isActive ? 'Active' : 'Inactive'
  const statusColor = isActive ? '$green10' : '$orange10'
  const showStatus =
    appSettings.clientsShowStatus && appSettings.clientsShowStatusDetails

  const sanitizedPhone = client.phone?.replace(/[^\d+]/g, '') ?? ''
  const phoneUrl = sanitizedPhone ? `tel:${sanitizedPhone}` : ''
  const smsUrl = sanitizedPhone ? `sms:${sanitizedPhone}` : ''
  const emailUrl = client.email ? `mailto:${client.email}` : ''

  const openExternal = async (url: string) => {
    // Guard unsupported schemes on each platform before attempting launch.
    if (!url) return
    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      }
    } catch {
      // no-op for unsupported schemes
    }
  }

  const getServiceLabel = (serviceType: string, notes: string) => {
    const normalizedService = (serviceType || '').trim()
    if (normalizedService && normalizedService.toLowerCase() !== 'service') {
      return normalizedService
    }
    const trimmed = (notes || '').trim()
    if (!trimmed) return normalizedService || 'Service'
    const firstLine = trimmed.split('\n')[0].trim()
    if (!firstLine) return normalizedService || 'Service'
    const colonIndex = firstLine.indexOf(':')
    if (colonIndex > 0) return firstLine.slice(0, colonIndex).trim()
    return firstLine
  }

  return (
    <YStack flex={1} bg="$background" position="relative">
      <Stack.Screen
        options={{
          headerRight: () => (
            <XStack items="center" gap="$2">
              <XStack
                px="$2"
                py="$1.5"
                items="center"
                justify="center"
                pressStyle={{ opacity: 0.7 }}
                onPress={() => togglePinnedClient(client.id)}
              >
                {isPinned ? (
                  <PinOff size={16} color="$accent" />
                ) : (
                  <Pin size={16} color="$gray8" />
                )}
              </XStack>
              <Link href={editHref} asChild>
                <XStack
                  px="$3"
                  py="$1.5"
                  items="center"
                  justify="center"
                  pressStyle={{ opacity: 0.7 }}
                >
                  <Text fontSize={13} color="$accent" fontWeight="600">
                    Edit
                  </Text>
                </XStack>
              </Link>
            </XStack>
          ),
        }}
      />
      <AmbientBackdrop />
      <ScrollView contentContainerStyle={{ pb: "$10" }}>
        <YStack px="$5" pt="$6" gap="$4">
          <YStack gap="$2">
            <Text fontSize={20} fontWeight="700">
              {client.name}
            </Text>
            <XStack items="center" gap="$2" flexWrap="wrap">
              <Text fontSize={12} color="$gray8">
                {client.type}
              </Text>
              {showStatus ? (
                <Text fontSize={11} color={statusColor}>
                  {statusLabel}
                </Text>
              ) : null}
              {client.tag ? (
                <Text fontSize={11} color="$gray7">
                  {client.tag}
                </Text>
              ) : null}
            </XStack>
            <Text fontSize={12} color="$gray8">
              Last visit{' '}
              {formatDateByStyle(client.lastVisit, appSettings.dateDisplayFormat, {
                todayLabel: true,
                includeWeekday: appSettings.dateLongIncludeWeekday,
              })}
            </Text>
          </YStack>
          <YStack {...cardBorder} rounded="$5" p="$4" gap="$2">
            <XStack items="center" gap="$2">
              <Mail size={14} color="$gray8" />
              <Text fontSize={12} color="$gray8">
                {client.email}
              </Text>
            </XStack>
            <XStack items="center" gap="$2">
              <Phone size={14} color="$gray8" />
              <Text fontSize={12} color="$gray8">
                {client.phone}
              </Text>
            </XStack>
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Quick Actions
            </Text>
            <XStack gap="$2">
              <XStack
                {...cardBorder}
                rounded="$4"
                px="$3"
                py="$2.5"
                items="center"
                gap="$2"
                flex={1}
                opacity={phoneUrl ? 1 : 0.4}
                onPress={() => openExternal(phoneUrl)}
              >
                <Phone size={14} color="$accent" />
                <Text fontSize={12} color="$accent">
                  Call
                </Text>
              </XStack>
              <XStack
                {...cardBorder}
                rounded="$4"
                px="$3"
                py="$2.5"
                items="center"
                gap="$2"
                flex={1}
                opacity={smsUrl ? 1 : 0.4}
                onPress={() => openExternal(smsUrl)}
              >
                <MessageCircle size={14} color="$accent" />
                <Text fontSize={12} color="$accent">
                  Text
                </Text>
              </XStack>
              <XStack
                {...cardBorder}
                rounded="$4"
                px="$3"
                py="$2.5"
                items="center"
                gap="$2"
                flex={1}
                opacity={emailUrl ? 1 : 0.4}
                onPress={() => openExternal(emailUrl)}
              >
                <Mail size={14} color="$accent" />
                <Text fontSize={12} color="$accent">
                  Email
                </Text>
              </XStack>
            </XStack>
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Notes
            </Text>
            <YStack {...cardBorder} rounded="$5" p="$4">
              <Text fontSize={12} color="$gray8">
                {client.notes}
              </Text>
            </YStack>
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
            <XStack items="center" justify="space-between">
              <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
                Appointment Logs
              </Text>
            </XStack>
            <XStack gap="$2">
              <Link href={`/client/${client.id}/new-appointment`} asChild>
                <XStack
                  {...cardBorder}
                  rounded="$4"
                  px="$3"
                  py="$2.5"
                  items="center"
                  gap="$2"
                  flex={1}
                  justify="center"
                >
                  <Scissors size={14} color="$accent" />
                  <Text fontSize={12} color="$accent">
                    New Appointment Log
                  </Text>
                </XStack>
              </Link>
              <Link href={`/appointments?clientId=${client.id}`} asChild>
                <XStack
                  {...cardBorder}
                  rounded="$4"
                  px="$3"
                  py="$2.5"
                  items="center"
                  gap="$2"
                  flex={1}
                  justify="center"
                >
                  <List size={14} color="$accent" />
                  <Text fontSize={12} color="$accent">
                    View All
                  </Text>
                </XStack>
              </Link>
            </XStack>
            <YStack gap="$3">
              {history.length === 0 ? (
                <YStack {...cardBorder} rounded="$5" p="$4">
                  <Text fontSize={12} color="$gray8">
                    No appointment logs yet.
                  </Text>
                </YStack>
              ) : (
                history.map((entry) => (
                  <Link key={entry.id} href={`/appointment/${entry.id}`} asChild>
                    <XStack
                      {...cardBorder}
                      rounded="$5"
                      p="$4"
                      items="center"
                      justify="space-between"
                      gap="$2"
                      pressStyle={{ opacity: 0.85 }}
                    >
                      <YStack flex={1} gap="$1">
                        <Text fontSize={13} fontWeight="600">
                          {getServiceLabel(entry.services, entry.notes)}
                        </Text>
                        <Text fontSize={12} color="$gray8">
                          {formatDateByStyle(entry.date, 'short', {
                            todayLabel: true,
                          })}
                        </Text>
                      </YStack>
                      <XStack items="center" gap="$2">
                        <Text fontSize={12} fontWeight="700">
                          ${entry.price}
                        </Text>
                        {entry.images?.length ? (
                          <YStack
                            width={34}
                            height={34}
                            rounded="$3"
                            overflow="hidden"
                            borderWidth={1}
                            borderColor="$gray3"
                          >
                            <Image
                              source={{ uri: entry.images[0] }}
                              style={{ width: '100%', height: '100%' }}
                            />
                          </YStack>
                        ) : null}
                        <ChevronRight size={16} color="$gray7" />
                      </XStack>
                    </XStack>
                  </Link>
                ))
              )}
            </YStack>
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
            <XStack items="center" justify="space-between">
              <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
                Color Analysis
              </Text>
              <XStack items="center" gap="$1">
                <Palette size={14} color="$accent" />
                <Text fontSize={12} color="$accent">
                  View full chart
                </Text>
              </XStack>
            </XStack>
            <YStack {...cardBorder} rounded="$5" p="$4" gap="$2">
              {colorAnalysis ? (
                <>
                  <XStack justify="space-between">
                    <Text fontSize={12} color="$gray8">
                      Porosity
                    </Text>
                    <Text fontSize={12}>{colorAnalysis.porosity}</Text>
                  </XStack>
                  <XStack justify="space-between">
                    <Text fontSize={12} color="$gray8">
                      Texture
                    </Text>
                    <Text fontSize={12}>{colorAnalysis.texture}</Text>
                  </XStack>
                  <XStack justify="space-between">
                    <Text fontSize={12} color="$gray8">
                      Elasticity
                    </Text>
                    <Text fontSize={12}>{colorAnalysis.elasticity}</Text>
                  </XStack>
                  <XStack justify="space-between">
                    <Text fontSize={12} color="$gray8">
                      Scalp
                    </Text>
                    <Text fontSize={12}>{colorAnalysis.scalpCondition}</Text>
                  </XStack>
                  <XStack justify="space-between">
                    <Text fontSize={12} color="$gray8">
                      Levels
                    </Text>
                    <Text fontSize={12}>
                      {colorAnalysis.naturalLevel} → {colorAnalysis.desiredLevel}
                    </Text>
                  </XStack>
                  <XStack justify="space-between">
                    <Text fontSize={12} color="$gray8">
                      Pigment
                    </Text>
                    <Text fontSize={12}>{colorAnalysis.contributingPigment}</Text>
                  </XStack>
                </>
              ) : (
                <Text fontSize={12} color="$gray8">
                  Color analysis not recorded yet.
                </Text>
              )}
            </YStack>
          </YStack>

        </YStack>
      </ScrollView>
    </YStack>
  )
}
