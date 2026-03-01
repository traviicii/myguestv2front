import { useCallback, useMemo } from 'react'
import {
  Link,
  useLocalSearchParams,
  useRouter,
  type Href } from 'expo-router'
import { ChevronRight,
  ChevronLeft,
  Mail,
  MessageCircle,
  Pin,
  PinOff,
  Palette,
  Phone,
  List,
  Scissors,
  } from '@tamagui/lucide-icons'
import { Image,
  Linking } from 'react-native'
import { ScrollView,
  Text,
  XStack,
  YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useThemePrefs } from 'components/ThemePrefs'
import { useAppointmentHistory,
  useClients,
  useColorAnalysisForClient,
  useColorAnalysisByClient,
  } from 'components/data/queries'
import { PrimaryButton,
  SectionDivider,
  SecondaryButton,
  SurfaceCard,
  cardSurfaceProps,
} from 'components/ui/controls'
import { formatDateByStyle } from 'components/utils/date'
import { getServiceLabel } from 'components/utils/services'
import { useStudioStore } from 'components/state/studioStore'

export default function ClientDetailScreen() {
  const { aesthetic } = useThemePrefs()
  const isCyberpunk = aesthetic === 'cyberpunk'
  const isGlass = aesthetic === 'glass'
  const cardRadius = isCyberpunk ? 0 : isGlass ? 24 : 14
  const controlRadius = isCyberpunk ? 0 : isGlass ? 20 : 10
  const thumbRadius = isCyberpunk ? 0 : isGlass ? 14 : 8
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const resolvedClientId = typeof id === 'string' ? id : ''
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: appointmentHistory = [] } = useAppointmentHistory()
  const { data: colorAnalysisByClient = {} } = useColorAnalysisByClient()
  const { pinnedClientIds, togglePinnedClient, appSettings } = useStudioStore()
  const topInset = Math.max(insets.top + 8, 16)

  const client = clients.find((item) => item.id === resolvedClientId)
  const { data: colorAnalysisForClient } = useColorAnalysisForClient(
    resolvedClientId || undefined
  )

  const editHref: Href =
    resolvedClientId
      ? { pathname: '/client/[id]/edit', params: { id: resolvedClientId } }
      : '/clients'
  const formatLastVisitLabel = (value: string) => {
    if (!value || value === 'No visits yet' || value === '—') return 'No visits yet'
    return formatDateByStyle(value, appSettings.dateDisplayFormat, {
      todayLabel: true,
      includeWeekday: appSettings.dateLongIncludeWeekday,
    })
  }
  const history = useMemo(
    () =>
      appointmentHistory
        .filter((item) => item.clientId === resolvedClientId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, appSettings.clientDetailsAppointmentLogsCount),
    [
      appSettings.clientDetailsAppointmentLogsCount,
      appointmentHistory,
      resolvedClientId,
    ]
  )
  const latestHistoryDate = useMemo(() => {
    const matching = appointmentHistory.filter((item) => item.clientId === resolvedClientId)
    if (!matching.length) return null
    return [...matching].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      .date
  }, [appointmentHistory, resolvedClientId])
  const colorAnalysis =
    colorAnalysisForClient ??
    (resolvedClientId ? colorAnalysisByClient[resolvedClientId] : undefined)
  const hasColorChartData = Boolean(colorAnalysis)
  const isPinned = resolvedClientId
    ? pinnedClientIds.includes(resolvedClientId)
    : false
  const isBootstrapping = clientsLoading && !clients.length
  const handleTogglePinned = useCallback(
    () => {
      if (!resolvedClientId) return
      togglePinnedClient(resolvedClientId)
    },
    [resolvedClientId, togglePinnedClient]
  )
  const topBar = (
    <XStack
      px="$5"
      pt={topInset}
      pb="$2"
      items="center"
      justify="space-between"
    >
      <SecondaryButton
        size="$2"
        height={36}
        width={38}
        px="$2"
        icon={<ChevronLeft size={16} />}
        onPress={() => router.back()}
      />
      {resolvedClientId ? (
        <XStack gap="$2">
          <SecondaryButton
            size="$2"
            height={36}
            width={38}
            px="$2"
            icon={isPinned ? <PinOff size={16} /> : <Pin size={16} />}
            onPress={handleTogglePinned}
          />
          <SecondaryButton
            size="$2"
            height={36}
            width={72}
            px="$3"
            onPress={() => router.push(editHref)}
          >
            <Text
              fontSize={12}
              lineHeight={14}
              fontWeight="700"
              letterSpacing={isCyberpunk ? 0.8 : 0}
              textTransform={isCyberpunk ? 'uppercase' : undefined}
              style={isCyberpunk ? ({ fontFamily: 'SpaceMono' } as any) : undefined}
              color="$buttonSecondaryFg"
            >
              Edit
            </Text>
          </SecondaryButton>
        </XStack>
      ) : (
        <YStack width={112} />
      )}
    </XStack>
  )

  const GlassCard = ({
    children,
    ...props
  }: React.ComponentProps<typeof YStack>) =>
    isGlass ? (
      <SurfaceCard mode="alwaysCard" tone="secondary" gap="$0" {...props}>
        {children}
      </SurfaceCard>
    ) : (
      <YStack {...cardSurfaceProps} {...props}>
        {children}
      </YStack>
    )

  if (isBootstrapping) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <AmbientBackdrop />
        {topBar}
        <Text fontSize={13} color="$textSecondary">
          Loading client...
        </Text>
      </YStack>
    )
  }

  if (!client) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <AmbientBackdrop />
        {topBar}
        <Text fontSize={13} color="$textSecondary">
          Client not found.
        </Text>
      </YStack>
    )
  }

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

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      {topBar}
      <ScrollView contentContainerStyle={{ pb: "$10" }}>
        <YStack px="$5" pt="$3" gap="$4">
          <YStack gap="$2">
            <Text fontSize={20} fontWeight="700">
              {client.name}
            </Text>
            <XStack items="center" gap="$2" flexWrap="wrap">
              <Text fontSize={12} color="$textSecondary">
                {client.type}
              </Text>
              {showStatus ? (
                <Text fontSize={11} color={statusColor}>
                  {statusLabel}
                </Text>
              ) : null}
              {client.tag && client.tag !== client.type ? (
                <Text fontSize={11} color="$textMuted">
                  {client.tag}
                </Text>
              ) : null}
            </XStack>
            <Text fontSize={12} color="$textSecondary">
              Last visit{' '}
              {formatLastVisitLabel(latestHistoryDate ?? client.lastVisit)}
            </Text>
          </YStack>
          <GlassCard rounded={cardRadius} p="$4" gap="$2">
            <XStack items="center" gap="$2">
              <Mail size={14} color="$textSecondary" />
              <Text fontSize={12} color="$textSecondary">
                {client.email}
              </Text>
            </XStack>
            <XStack items="center" gap="$2">
              <Phone size={14} color="$textSecondary" />
              <Text fontSize={12} color="$textSecondary">
                {client.phone}
              </Text>
            </XStack>
          </GlassCard>

          <SectionDivider />

          <YStack gap="$3">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Quick Actions
            </Text>
            <XStack gap="$2">
              {isGlass ? (
                <>
                  <PrimaryButton
                    size="$2"
                    height={36}
                    px="$3"
                    flex={1}
                    icon={<Phone size={14} />}
                    disabled={!phoneUrl}
                    opacity={phoneUrl ? 1 : 0.4}
                    onPress={() => openExternal(phoneUrl)}
                  >
                    Call
                  </PrimaryButton>
                  <PrimaryButton
                    size="$2"
                    height={36}
                    px="$3"
                    flex={1}
                    icon={<MessageCircle size={14} />}
                    disabled={!smsUrl}
                    opacity={smsUrl ? 1 : 0.4}
                    onPress={() => openExternal(smsUrl)}
                  >
                    Text
                  </PrimaryButton>
                  <PrimaryButton
                    size="$2"
                    height={36}
                    px="$3"
                    flex={1}
                    icon={<Mail size={14} />}
                    disabled={!emailUrl}
                    opacity={emailUrl ? 1 : 0.4}
                    onPress={() => openExternal(emailUrl)}
                  >
                    Email
                  </PrimaryButton>
                </>
              ) : (
                <>
                  <GlassCard
                    rounded={controlRadius}
                    px="$3"
                    py="$2.5"
                    flex={1}
                    opacity={phoneUrl ? 1 : 0.4}
                    onPress={() => openExternal(phoneUrl)}
                  >
                    <XStack items="center" gap="$2">
                      <Phone size={14} color="$accent" />
                      <Text fontSize={12} color="$accent">
                        Call
                      </Text>
                    </XStack>
                  </GlassCard>
                  <GlassCard
                    rounded={controlRadius}
                    px="$3"
                    py="$2.5"
                    flex={1}
                    opacity={smsUrl ? 1 : 0.4}
                    onPress={() => openExternal(smsUrl)}
                  >
                    <XStack items="center" gap="$2">
                      <MessageCircle size={14} color="$accent" />
                      <Text fontSize={12} color="$accent">
                        Text
                      </Text>
                    </XStack>
                  </GlassCard>
                  <GlassCard
                    rounded={controlRadius}
                    px="$3"
                    py="$2.5"
                    flex={1}
                    opacity={emailUrl ? 1 : 0.4}
                    onPress={() => openExternal(emailUrl)}
                  >
                    <XStack items="center" gap="$2">
                      <Mail size={14} color="$accent" />
                      <Text fontSize={12} color="$accent">
                        Email
                      </Text>
                    </XStack>
                  </GlassCard>
                </>
              )}
            </XStack>
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Notes
            </Text>
            <GlassCard rounded={cardRadius} p="$4">
              <Text fontSize={12} color="$textSecondary">
                {client.notes}
              </Text>
            </GlassCard>
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
                {isGlass ? (
                  <PrimaryButton
                    size="$2"
                    height={36}
                    px="$3"
                    flex={1}
                    icon={<Scissors size={14} />}
                  >
                    New Appointment Log
                  </PrimaryButton>
                ) : (
                  <GlassCard
                    rounded={controlRadius}
                    px="$3"
                    py="$2.5"
                    flex={1}
                  >
                    <XStack items="center" gap="$2" justify="center">
                      <Scissors size={14} color="$accent" />
                      <Text fontSize={12} color="$accent">
                        New Appointment Log
                      </Text>
                    </XStack>
                  </GlassCard>
                )}
              </Link>
              <Link href={`/appointments?clientId=${client.id}`} asChild>
                {isGlass ? (
                  <PrimaryButton
                    size="$2"
                    height={36}
                    px="$3"
                    flex={1}
                    icon={<List size={14} />}
                  >
                    View All
                  </PrimaryButton>
                ) : (
                  <GlassCard
                    rounded={controlRadius}
                    px="$3"
                    py="$2.5"
                    flex={1}
                  >
                    <XStack items="center" gap="$2" justify="center">
                      <List size={14} color="$accent" />
                      <Text fontSize={12} color="$accent">
                        View All
                      </Text>
                    </XStack>
                  </GlassCard>
                )}
              </Link>
            </XStack>
            <YStack gap="$3">
              {history.length === 0 ? (
                <GlassCard rounded={cardRadius} p="$4">
                  <Text fontSize={12} color="$textSecondary">
                    No appointment logs yet.
                  </Text>
                </GlassCard>
              ) : (
                history.map((entry) => (
                  <Link key={entry.id} href={`/appointment/${entry.id}`} asChild>
                    <GlassCard
                      rounded={cardRadius}
                      p="$4"
                      pressStyle={{ opacity: 0.85 }}
                    >
                      <XStack items="center" justify="space-between" gap="$2">
                        <YStack flex={1} gap="$1">
                          <Text fontSize={13} fontWeight="600">
                            {getServiceLabel(entry.services, entry.notes)}
                          </Text>
                          <Text fontSize={12} color="$textSecondary">
                            {formatDateByStyle(entry.date, appSettings.dateDisplayFormat, {
                              todayLabel: true,
                              includeWeekday: appSettings.dateLongIncludeWeekday,
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
                          <ChevronRight size={16} color="$textMuted" />
                        </XStack>
                      </XStack>
                    </GlassCard>
                  </Link>
                ))
              )}
            </YStack>
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
            <XStack items="center" justify="space-between">
              <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
                Color Chart
              </Text>
              <Link href={`/client/${client.id}/color-chart`} asChild>
                <XStack items="center" gap="$1">
                  <Palette size={14} color="$accent" />
                  <Text fontSize={12} color="$accent">
                    {hasColorChartData ? 'View Full Chart' : 'Start Color Chart'}
                  </Text>
                </XStack>
              </Link>
            </XStack>
            <GlassCard rounded={cardRadius} p="$4" gap="$2">
              {colorAnalysis ? (
                <>
                  <XStack justify="space-between">
                    <Text fontSize={12} color="$textSecondary">
                      Porosity
                    </Text>
                    <Text fontSize={12}>{colorAnalysis.porosity}</Text>
                  </XStack>
                  <XStack justify="space-between">
                    <Text fontSize={12} color="$textSecondary">
                      Texture
                    </Text>
                    <Text fontSize={12}>{colorAnalysis.texture}</Text>
                  </XStack>
                  <XStack justify="space-between">
                    <Text fontSize={12} color="$textSecondary">
                      Elasticity
                    </Text>
                    <Text fontSize={12}>{colorAnalysis.elasticity}</Text>
                  </XStack>
                  <XStack justify="space-between">
                    <Text fontSize={12} color="$textSecondary">
                      Scalp
                    </Text>
                    <Text fontSize={12}>{colorAnalysis.scalpCondition}</Text>
                  </XStack>
                  <XStack justify="space-between">
                    <Text fontSize={12} color="$textSecondary">
                      Levels
                    </Text>
                    <Text fontSize={12}>
                      {colorAnalysis.naturalLevel} → {colorAnalysis.desiredLevel}
                    </Text>
                  </XStack>
                  <XStack justify="space-between">
                    <Text fontSize={12} color="$textSecondary">
                      Pigment
                    </Text>
                    <Text fontSize={12}>{colorAnalysis.contributingPigment}</Text>
                  </XStack>
                </>
              ) : (
                <Text fontSize={12} color="$textSecondary">
                  Color chart not recorded yet.
                </Text>
              )}
            </GlassCard>
          </YStack>

        </YStack>
      </ScrollView>
    </YStack>
  )
}
