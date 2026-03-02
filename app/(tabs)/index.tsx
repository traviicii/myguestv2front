import {
  useEffect,
  useMemo,
  useRef,
  useState } from 'react'
import { Link, useRouter } from 'expo-router'
import { ScrollView,
  Text,
  XStack,
  YStack,
  useTheme } from 'tamagui'
import { ArrowRight,
  CalendarDays,
  Check,
  GripVertical,
  LayoutGrid,
  Mail,
  MessageCircle,
  PlusCircle,
  UserPlus,
  X,
  } from '@tamagui/lucide-icons'
import { Animated as RNAnimated,
  Pressable as RNPressable } from 'react-native'
import DraggableFlatList,
  { type RenderItemParams,
  } from 'react-native-draggable-flatlist'
import { SortableGrid } from 'components/ui/SortableGrid'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { ExpandableEditPanel } from 'components/ui/ExpandableEditPanel'
import { GhostButton,
  GlassOrbAction,
  PreviewCard,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  SurfaceCard,
  ThemedHeadingText,
  ThemedSwitch,
  cardSurfaceProps,
} from 'components/ui/controls'
import { useThemePrefs } from 'components/ThemePrefs'
import { useIsFocused } from '@react-navigation/native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  useAppointmentHistory,
  useClients,
  useColorAnalysisByClient,
} from 'components/data/queries'
import { useOverviewStore } from 'components/state/overviewStore'
import { formatDateByStyle } from 'components/utils/date'
import { sortClientsByNewest } from 'components/utils/clientSort'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'
import { getServiceLabel, normalizeServiceName } from 'components/utils/services'
import {
  useStudioStore,
  type OverviewSectionId,
  type QuickActionId,
} from 'components/state/studioStore'

const editPanelCardBorder = {
  bg: '$surfaceCard',
  borderWidth: 1,
  borderColor: '$borderSubtle',
} as const

export default function TabOneScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tabBarHeight = useBottomTabBarHeight()
  const isFocused = useIsFocused()
  const theme = useTheme()
  const { aesthetic } = useThemePrefs()
  const isCyberpunk = aesthetic === 'cyberpunk'
  const isGlass = aesthetic === 'glass'
  const sectionCardRadius = isCyberpunk ? 0 : isGlass ? 24 : 14
  const controlRadius = isCyberpunk ? 0 : isGlass ? 20 : 10
  const actionCardRadius = isCyberpunk ? 0 : isGlass ? 52 : 999
  const iconBadgeRadius = isCyberpunk ? 0 : isGlass ? 16 : 10
  const showMetricEditor = useOverviewStore((state) => state.showMetricEditor)
  const showQuickActionEditor = useOverviewStore(
    (state) => state.showQuickActionEditor
  )
  const showLayoutEditor = useOverviewStore((state) => state.showLayoutEditor)
  const selectedMetrics = useOverviewStore((state) => state.selectedMetrics)
  const sectionOrder = useOverviewStore((state) => state.sectionOrder)
  const toggleMetricEditor = useOverviewStore((state) => state.toggleMetricEditor)
  const toggleQuickActionEditor = useOverviewStore(
    (state) => state.toggleQuickActionEditor
  )
  const toggleLayoutEditor = useOverviewStore((state) => state.toggleLayoutEditor)
  const setMetricSelection = useOverviewStore((state) => state.setMetricSelection)
  const setSectionOrder = useOverviewStore((state) => state.setSectionOrder)
  const {
    appSettings,
    setQuickActionEnabled,
    setQuickActionOrder,
    pinnedClientIds,
  } = useStudioStore()
  const { data: clients = [] } = useClients()
  const { data: appointmentHistory = [] } = useAppointmentHistory()
  const { data: colorAnalysisByClient = {} } = useColorAnalysisByClient()
  const derivedLastVisitByClient = useMemo(() => {
    return appointmentHistory.reduce<Record<string, string>>((acc, entry) => {
      const current = acc[entry.clientId]
      if (!current || new Date(entry.date) > new Date(current)) {
        acc[entry.clientId] = entry.date
      }
      return acc
    }, {})
  }, [appointmentHistory])

  const formatLastVisitLabel = (value: string) => {
    if (!value || value === 'No visits yet' || value === '—') return 'No visits yet'
    return formatDateByStyle(value, appSettings.dateDisplayFormat, {
      todayLabel: true,
      includeWeekday: appSettings.dateLongIncludeWeekday,
    })
  }
  const resolveLastVisit = (clientId: string, fallback: string) =>
    derivedLastVisitByClient[clientId] ?? fallback

  const recentClients = useMemo(
    () => sortClientsByNewest(clients).slice(0, appSettings.overviewRecentClientsCount),
    [appSettings.overviewRecentClientsCount, clients]
  )
  const recentHistory = useMemo(() => {
    return [...appointmentHistory]
      .filter((entry) => entry.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, appSettings.overviewRecentAppointmentsCount)
  }, [appSettings.overviewRecentAppointmentsCount, appointmentHistory])
  const isEmptyAccount = clients.length === 0 && appointmentHistory.length === 0

  const activeCutoff = useMemo(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - appSettings.activeStatusMonths)
    return date
  }, [appSettings.activeStatusMonths])

  const yearStart = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), 0, 1)
  }, [])

  // Derive dashboard metrics from the same query data powering the rest
  // of the app, so totals stay consistent across screens.
  const metrics = useMemo(() => {
    const entriesActiveWindow = appointmentHistory.filter((entry) => {
      const d = entry.date ? new Date(entry.date) : null
      return d && !Number.isNaN(d.getTime()) && d >= activeCutoff
    })

    const entriesYtd = appointmentHistory.filter((entry) => {
      const d = entry.date ? new Date(entry.date) : null
      return d && !Number.isNaN(d.getTime()) && d >= yearStart
    })

    const revenueYtd = entriesYtd.reduce((sum, entry) => sum + entry.price, 0)
    const avgTicketEntries = (() => {
      if (appSettings.avgTicketRange === 'allTime') {
        return appointmentHistory.filter((entry) => entry.date)
      }
      const months = Number(appSettings.avgTicketRange.replace('m', ''))
      if (!Number.isFinite(months) || months <= 0) {
        return appointmentHistory.filter((entry) => entry.date)
      }
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - months)
      return appointmentHistory.filter((entry) => {
        const d = entry.date ? new Date(entry.date) : null
        return d && !Number.isNaN(d.getTime()) && d >= cutoff
      })
    })()
    const avgTicket =
      avgTicketEntries.length > 0
        ? avgTicketEntries.reduce((sum, entry) => sum + entry.price, 0) /
          avgTicketEntries.length
        : 0

    const activeClientIds = new Set(
      entriesActiveWindow.map((entry) => entry.clientId)
    )

    const inactiveClients = clients.length - activeClientIds.size

    const newClients90 = (() => {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 90)
      return clients.filter((client) => {
        if (!client.createdAt) return false
        const d = new Date(client.createdAt)
        return !Number.isNaN(d.getTime()) && d >= cutoff
      }).length
    })()

    const serviceMix = (() => {
      const counts = entriesActiveWindow.reduce<Record<string, number>>(
        (acc, entry) => {
          const normalizedLabels =
            entry.serviceLabels?.map((label) => normalizeServiceName(label)).filter(Boolean) ?? []
          const labels = normalizedLabels.length
            ? normalizedLabels
            : [normalizeServiceName(entry.services) || 'Service']
          labels.forEach((label) => {
            acc[label] = (acc[label] || 0) + 1
          })
          return acc
        },
        {}
      )
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
      if (!top) return '—'
      const percent = Math.round((top[1] / entriesActiveWindow.length) * 100)
      return `${top[0]} (${percent}%)`
    })()

    const colorCoverage = (() => {
      const eligibleColorClients = clients.filter(
        (client) => client.type === 'Color' || client.type === 'Cut & Color'
      )
      const total = eligibleColorClients.length
      const withColor = eligibleColorClients.filter((client) => {
        const data = colorAnalysisByClient[client.id]
        if (!data) return false
        return Object.values(data).some((value) => value && value !== '—' && value !== 'Unknown')
      }).length
      const percent = total > 0 ? Math.round((withColor / total) * 100) : 0
      return `${percent}%`
    })()

    const photoCoverage = (() => {
      const cutoffMonths =
        appSettings.photoCoverageRange === '6m'
          ? 6
          : appSettings.photoCoverageRange === '12m'
            ? 12
            : null
      const cutoff = cutoffMonths
        ? (() => {
            const d = new Date()
            d.setMonth(d.getMonth() - cutoffMonths)
            return d
          })()
        : null
      const scoped = cutoff
        ? appointmentHistory.filter((entry) => {
            const d = entry.date ? new Date(entry.date) : null
            return d && !Number.isNaN(d.getTime()) && d >= cutoff
          })
        : appointmentHistory
      const total = scoped.length
      const withPhotos = scoped.filter((entry) => (entry.images?.length ?? 0) > 0)
        .length
      const percent = total > 0 ? Math.round((withPhotos / total) * 100) : 0
      return `${percent}%`
    })()

    return [
      { id: 'revenueYtd', label: 'Revenue (YTD)', value: `$${revenueYtd.toFixed(0)}` },
      { id: 'totalClients', label: 'Total Clients', value: `${clients.length}` },
      { id: 'activeClients', label: 'Active Clients', value: `${activeClientIds.size}` },
      { id: 'inactiveClients', label: 'Inactive Clients', value: `${inactiveClients}` },
      { id: 'avgTicket', label: 'Average Ticket', value: `$${avgTicket.toFixed(0)}` },
      { id: 'newClients90', label: 'New Clients (90d)', value: `${newClients90}` },
      { id: 'serviceMix', label: 'Top Service Mix', value: serviceMix },
      { id: 'colorCoverage', label: 'Color Chart Coverage', value: colorCoverage },
      { id: 'photoCoverage', label: 'Photo Coverage (Logs)', value: photoCoverage },
    ]
  }, [
    appointmentHistory,
    appSettings.avgTicketRange,
    appSettings.photoCoverageRange,
    clients,
    colorAnalysisByClient,
    activeCutoff,
    yearStart,
  ])

  type QuickAction = {
    id: QuickActionId
    label: string
    icon: any
    href?: '/clients/new' | '/appointments/new'
    variant: 'primary' | 'secondary' | 'ghost'
    comingSoon?: boolean
  }

  const quickActions = useMemo<QuickAction[]>(
    () =>
      [
        {
          id: 'newClient',
          label: 'New Client',
          icon: UserPlus,
          href: '/clients/new',
          variant: 'primary',
        },
        {
          id: 'newAppointmentLog',
          label: 'New Appointment Log',
          icon: PlusCircle,
          href: '/appointments/new',
          variant: 'secondary',
        },
        {
          id: 'newEmailAlert',
          label: 'New Email Alert',
          icon: Mail,
          variant: 'ghost',
          comingSoon: true,
        },
        {
          id: 'newTextAlert',
          label: 'New Text Alert',
          icon: MessageCircle,
          variant: 'ghost',
          comingSoon: true,
        },
      ],
    []
  )

  const orderedQuickActions = useMemo(() => {
    const actionMap = new Map(quickActions.map((action) => [action.id, action]))
    const orderedIds = appSettings.overviewQuickActionOrder
    const ordered = orderedIds
      .map((id) => actionMap.get(id))
      .filter(Boolean) as (typeof quickActions)[number][]
    const missing = quickActions.filter((action) => !orderedIds.includes(action.id))
    return [...ordered, ...missing]
  }, [appSettings.overviewQuickActionOrder, quickActions])

  const enabledQuickActions = useMemo(
    () =>
      orderedQuickActions.filter(
        (action) => appSettings.overviewQuickActions[action.id]
      ),
    [appSettings.overviewQuickActions, orderedQuickActions]
  )
  const quickActionColumns = 2
  const quickActionItemSize = 148
  const quickActionGap = 12
  const shouldCenterQuickActionRow =
    enabledQuickActions.length % quickActionColumns !== 0
  const quickActionRows = Math.max(
    1,
    Math.ceil(enabledQuickActions.length / quickActionColumns)
  )
  const quickActionGridHeight =
    enabledQuickActions.length > 0
      ? quickActionRows * quickActionItemSize +
        quickActionGap * (quickActionRows - 1)
      : 0

  const handleQuickActionReorder = (nextEnabled: QuickAction[]) => {
    const enabledIds = nextEnabled.map((action) => action.id)
    const disabledIds = appSettings.overviewQuickActionOrder.filter(
      (id) => !enabledIds.includes(id)
    )
    setQuickActionOrder([...enabledIds, ...disabledIds])
  }

  const pinnedClients = useMemo(() => {
    if (!pinnedClientIds.length) return []
    return clients.filter((client) => pinnedClientIds.includes(client.id))
  }, [clients, pinnedClientIds])

  const visibleSections = useMemo(
    () => sectionOrder.filter((id) => appSettings.overviewSections[id]),
    [appSettings.overviewSections, sectionOrder]
  )

  const [layoutDraft, setLayoutDraft] = useState<OverviewSectionId[]>(visibleSections)
  const [isQuickActionDragging, setIsQuickActionDragging] = useState(false)
  const layoutAnim = useRef(new RNAnimated.Value(showLayoutEditor ? 1 : 0)).current
  const quickActionHintAnim = useRef(
    new RNAnimated.Value(showQuickActionEditor ? 1 : 0)
  ).current

  useEffect(() => {
    if (showLayoutEditor) {
      setLayoutDraft(visibleSections)
    }
  }, [showLayoutEditor, visibleSections])


  useEffect(() => {
    RNAnimated.timing(layoutAnim, {
      toValue: showLayoutEditor ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start()
  }, [layoutAnim, showLayoutEditor])

  useEffect(() => {
    RNAnimated.timing(quickActionHintAnim, {
      toValue: showQuickActionEditor ? 1 : 0,
      duration: 170,
      useNativeDriver: false,
    }).start()
  }, [quickActionHintAnim, showQuickActionEditor])

  useEffect(() => {
    if (isFocused || !showLayoutEditor) return
    setLayoutDraft(visibleSections)
    toggleLayoutEditor()
  }, [isFocused, showLayoutEditor, toggleLayoutEditor, visibleSections])

  const handleSaveLayout = () => {
    const hiddenSections = sectionOrder.filter(
      (id) => !visibleSections.includes(id)
    )
    const nextOrder = [...layoutDraft, ...hiddenSections]
    setSectionOrder(nextOrder)
    toggleLayoutEditor()
  }

  const handleCancelLayout = () => {
    setLayoutDraft(visibleSections)
    toggleLayoutEditor()
  }

  const sectionLabels: Record<OverviewSectionId, string> = {
    quickActions: 'Quick Actions',
    metrics: 'Metrics',
    pinnedClients: 'Pinned Clients',
    recentAppointments: 'Recent Appointments',
    recentClients: 'Recent Clients',
  }

  const renderLayoutItem = ({ item, drag, isActive }: RenderItemParams<OverviewSectionId>) => (
    <RNPressable onLongPress={drag} delayLongPress={120}>
      <XStack
        {...cardSurfaceProps}
        rounded={sectionCardRadius}
        px="$4"
        py="$3"
        my="$1"
        items="center"
        justify="space-between"
        opacity={isActive ? 0.85 : 1}
        pressStyle={{ opacity: 0.8 }}
        overflow="visible"
      >
        <Text fontSize={14} fontWeight="600">
          {sectionLabels[item] ?? item}
        </Text>
        <XStack
          width={28}
          height={28}
          rounded={isCyberpunk ? 0 : 8}
          items="center"
          justify="center"
          onPressIn={drag}
        >
          <GripVertical size={18} color="$textMuted" />
        </XStack>
      </XStack>
    </RNPressable>
  )

  const iconOpacity = layoutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  })
  const iconScale = layoutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  })
  const buttonsOpacity = layoutAnim
  const buttonsTranslate = layoutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  })
  const leftTranslate = layoutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  })
  const rightTranslate = layoutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 14],
  })

  const lineColor = toNativeColor(theme.borderColor?.val, FALLBACK_COLORS.borderSubtle)
  const renderQuickActionCard = (
    action: QuickAction,
    options?: { isDragging?: boolean; onPress?: () => void }
  ) => {
    const Icon = action.icon
    const isPrimary = action.variant === 'primary'
    const isSecondary = action.variant === 'secondary'
    const isDisabled = action.comingSoon
    const onPress = !isDisabled ? options?.onPress : undefined

    if (isGlass) {
      return (
        <YStack scale={options?.isDragging ? 0.97 : 1}>
          <GlassOrbAction
            label={action.label}
            icon={<Icon size={24} />}
            variant={action.variant}
            disabled={Boolean(isDisabled)}
            onPress={onPress}
          />
        </YStack>
      )
    }

    const backgroundColor = isPrimary ? '$buttonPrimaryBg' : '$surfaceCard'
    const borderWidth = isPrimary ? 0 : 1
    const borderColor = isPrimary ? 'transparent' : '$borderColor'
    const iconColor = isPrimary
      ? '$buttonPrimaryFg'
      : isSecondary
        ? '$accent'
        : '$textSecondary'
    const labelColor = isPrimary
      ? '$buttonPrimaryFg'
      : isSecondary
        ? '$accent'
        : '$textSecondary'

    return (
      <YStack
        width={140}
        aspectRatio={1}
        rounded={actionCardRadius}
        bg={backgroundColor}
        borderWidth={borderWidth}
        borderColor={borderColor}
        items="center"
        justify="center"
        gap="$2"
        cursor={isDisabled ? 'default' : 'pointer'}
        shadowColor={
          isPrimary ? FALLBACK_COLORS.shadowPrimaryCard : FALLBACK_COLORS.shadowSecondaryCard
        }
        shadowRadius={16}
        shadowOpacity={1}
        shadowOffset={{ width: 0, height: 8 }}
        elevation={isPrimary ? 4 : 3}
        opacity={isDisabled ? 0.55 : 1}
        pressStyle={isDisabled ? undefined : { opacity: 0.85 }}
        onPress={onPress}
        scale={options?.isDragging ? 0.97 : 1}
      >
        <Icon size={24} color={iconColor} />
        <Text
          fontSize={12}
          color={labelColor}
          style={{ textAlign: 'center' }}
        >
          {action.label}
        </Text>
        {isDisabled ? (
          <Text fontSize={10} color="$textMuted">
            Coming soon
          </Text>
        ) : null}
      </YStack>
    )
  }

  const quickActionContent = () => (
    <>
      {orderedQuickActions.map((action) => (
        <XStack key={action.id} items="center" justify="space-between">
          <Text fontSize={12} color="$textSecondary">
            {action.label}
          </Text>
          <ThemedSwitch
            size="$2"
            checked={appSettings.overviewQuickActions[action.id]}
            onCheckedChange={(checked) =>
              setQuickActionEnabled(action.id, Boolean(checked))
            }
          />
        </XStack>
      ))}
    </>
  )
  const metricContent = () => (
    <>
      {metrics.map((metric) => (
        <XStack key={metric.id} items="center" justify="space-between">
          <Text fontSize={12} color="$textSecondary">
            {metric.label}
          </Text>
          <ThemedSwitch
            size="$2"
            checked={selectedMetrics.includes(metric.id)}
            onCheckedChange={(checked) => {
              setMetricSelection(metric.id, checked)
            }}
          />
        </XStack>
      ))}
    </>
  )

  const renderSection = (id: string) => {
    // Overview sections are rendered from ids so the order can be customized
    // and persisted by the layout editor.
    if (id === 'quickActions') {
      return (
        <YStack key={id}>
          <XStack items="center" justify="space-between" mb="$2">
            <ThemedHeadingText fontWeight="700" fontSize={16}>
              Quick Actions
            </ThemedHeadingText>
            <GhostButton onPress={toggleQuickActionEditor}>
              {showQuickActionEditor ? 'Done' : 'Edit'}
            </GhostButton>
          </XStack>
          <ExpandableEditPanel
            visible={showQuickActionEditor}
            lineColor={lineColor}
            cardProps={editPanelCardBorder}
          >
            {quickActionContent}
          </ExpandableEditPanel>
          <RNAnimated.View
            pointerEvents="none"
            style={{
              opacity: quickActionHintAnim,
              height: quickActionHintAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 18],
              }),
              marginTop: quickActionHintAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 8],
              }),
              overflow: 'hidden',
            }}
          >
            <Text fontSize={12} color="$textSecondary">
              Drag buttons to rearrange order.
            </Text>
          </RNAnimated.View>
          <YStack mt="$1" minH={160} justify="center" items="center" width="100%">
            {enabledQuickActions.length ? (
              <YStack
                width="100%"
                position="relative"
                minH={160}
                height={Math.max(quickActionGridHeight, 160)}
              >
                <SortableGrid
                  data={enabledQuickActions}
                  keyExtractor={(item) => item.id}
                  columns={quickActionColumns}
                  itemSize={quickActionItemSize}
                  gap={quickActionGap}
                  centerLastRow={shouldCenterQuickActionRow}
                  dragEnabled={showQuickActionEditor}
                  onDragActiveChange={setIsQuickActionDragging}
                  onOrderChange={handleQuickActionReorder}
                  renderItem={(item, isActive) => {
                    const isDisabled = item.comingSoon
                    const card = renderQuickActionCard(item, {
                      isDragging: isActive,
                      onPress:
                        !showQuickActionEditor && item.href && !isDisabled
                          ? () => router.push(item.href)
                          : undefined,
                    })

                    if (!showQuickActionEditor && isDisabled) {
                      return (
                        <YStack key={item.id} pointerEvents="none">
                          {card}
                        </YStack>
                      )
                    }

                    return card
                  }}
                />
              </YStack>
            ) : (
              <Text fontSize={12} color="$textSecondary">
                No quick actions selected.
              </Text>
            )}
          </YStack>
        </YStack>
      )
    }

    if (id === 'metrics') {
      return (
        <YStack key={id}>
          <XStack items="center" justify="space-between" mb="$2">
            <ThemedHeadingText fontWeight="700" fontSize={16}>
              Metrics
            </ThemedHeadingText>
            <GhostButton onPress={toggleMetricEditor}>
              {showMetricEditor ? 'Done' : 'Edit'}
            </GhostButton>
          </XStack>
          <ExpandableEditPanel
            visible={showMetricEditor}
            lineColor={lineColor}
            cardProps={editPanelCardBorder}
          >
            {metricContent}
          </ExpandableEditPanel>
          <XStack mt="$1" gap="$3" flexWrap="wrap">
            {metrics
              .filter((metric) => selectedMetrics.includes(metric.id))
              .map((metric) => (
                isGlass ? (
                  <SurfaceCard
                    key={metric.id}
                    tone="tabGlass"
                    p="$4"
                    gap="$1"
                    rounded={sectionCardRadius}
                    minW={140}
                    flex={1}
                  >
                    <Text fontSize={12} color="$textSecondary">
                      {metric.label}
                    </Text>
                    <Text fontSize={18} fontWeight="700" color="$color">
                      {metric.value}
                    </Text>
                  </SurfaceCard>
                ) : (
                  <YStack
                    key={metric.id}
                    {...cardSurfaceProps}
                    p="$4"
                    rounded={sectionCardRadius}
                    minW={140}
                    flex={1}
                  >
                    <Text fontSize={12} color="$textSecondary">
                      {metric.label}
                    </Text>
                    <Text fontSize={18} fontWeight="700" color="$color">
                      {metric.value}
                    </Text>
                  </YStack>
                )
              ))}
          </XStack>
        </YStack>
      )
    }

    if (id === 'pinnedClients') {
      return (
        <YStack key={id} gap="$3">
          <XStack items="center" justify="space-between">
            <ThemedHeadingText fontWeight="700" fontSize={16}>
              Pinned Clients
            </ThemedHeadingText>
          </XStack>
          {pinnedClients.length ? (
            <YStack gap="$3">
              {pinnedClients.slice(0, 3).map((client) => (
                <Link key={client.id} href={`/client/${client.id}`} asChild>
                  <PreviewCard p="$4" pressStyle={{ opacity: 0.85 }}>
                    <XStack items="center" justify="space-between" gap="$3">
                      <YStack>
                        <Text fontSize={14} fontWeight="600">
                          {client.name}
                        </Text>
                        <Text fontSize={12} color="$textSecondary">
                          {client.type} • Last visit{' '}
                          {formatLastVisitLabel(resolveLastVisit(client.id, client.lastVisit))}
                        </Text>
                      </YStack>
                      <ArrowRight size={14} color="$accent" />
                    </XStack>
                  </PreviewCard>
                </Link>
              ))}
            </YStack>
          ) : (
            <Text fontSize={12} color="$textSecondary">
              Pin clients from their profile to keep them handy here.
            </Text>
          )}
        </YStack>
      )
    }

    if (id === 'recentAppointments') {
      const hasAppointments = recentHistory.length > 0
      const canLogAppointment = clients.length > 0
      return (
        <YStack key={id} gap="$3">
          <XStack items="center" justify="space-between">
            <ThemedHeadingText fontWeight="700" fontSize={16}>
              Recent Appointments
            </ThemedHeadingText>
            <Link href="/appointments" asChild>
              <XStack items="center" gap="$1">
                <Text fontSize={12} color="$accent">
                  Full history
                </Text>
                <ArrowRight size={14} color="$accent" />
              </XStack>
            </Link>
          </XStack>
          {hasAppointments ? (
            <YStack gap="$3">
              {recentHistory.map((entry, entryIndex) => {
                const clientName =
                  clients.find((client) => client.id === entry.clientId)?.name ?? 'Client'
                return (
                  <YStack key={entry.id} gap={aesthetic === 'modern' ? '$2' : '$0'}>
                    <Link href={`/appointment/${entry.id}`} asChild>
                      <PreviewCard p="$4">
                        <XStack items="center" justify="space-between" gap="$3">
                          <XStack items="center" gap="$3">
                            <XStack
                              bg="$accentSoft"
                              rounded={iconBadgeRadius}
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
                                  {clientName}
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
                          <Text fontSize={12} color="$textMuted">
                            ${entry.price}
                          </Text>
                        </XStack>
                      </PreviewCard>
                    </Link>
                    {aesthetic === 'modern' && entryIndex < recentHistory.length - 1 ? (
                      <YStack items="center">
                        <SectionDivider width="88%" />
                      </YStack>
                    ) : null}
                  </YStack>
                )
              })}
            </YStack>
          ) : (
            <SurfaceCard p="$4" tone={isGlass ? 'secondary' : 'default'} gap="$2">
              <Text fontSize={12} color="$textSecondary">
                No appointment logs yet.
              </Text>
              <SecondaryButton
                onPress={() =>
                  router.push(canLogAppointment ? '/appointments/new' : '/clients/new')
                }
              >
                {canLogAppointment ? 'Log appointment' : 'Add a client first'}
              </SecondaryButton>
            </SurfaceCard>
          )}
        </YStack>
      )
    }

    if (id === 'recentClients') {
      const hasRecentClients = recentClients.length > 0
      return (
        <YStack key={id} gap="$3">
          <XStack items="center" justify="space-between">
            <ThemedHeadingText fontWeight="700" fontSize={16}>
              Recent Clients
            </ThemedHeadingText>
            <Link href="/recent-clients" asChild>
              <XStack items="center" gap="$1">
                <Text fontSize={12} color="$accent">
                  View all
                </Text>
                <ArrowRight size={14} color="$accent" />
              </XStack>
            </Link>
          </XStack>
          {hasRecentClients ? (
            <YStack gap="$3">
              {recentClients.map((client, clientIndex) => (
                <YStack key={client.id} gap={aesthetic === 'modern' ? '$2' : '$0'}>
                  <Link href={`/client/${client.id}`} asChild>
                    <PreviewCard p="$4">
                      <XStack items="center" justify="space-between" gap="$3">
                        <YStack>
                          <Text fontSize={14} fontWeight="600">
                            {client.name}
                          </Text>
                          <Text fontSize={12} color="$textSecondary">
                            {client.type} • Last visit{' '}
                            {formatLastVisitLabel(resolveLastVisit(client.id, client.lastVisit))}
                          </Text>
                        </YStack>
                      </XStack>
                    </PreviewCard>
                  </Link>
                  {aesthetic === 'modern' && clientIndex < recentClients.length - 1 ? (
                    <YStack items="center">
                      <SectionDivider width="88%" />
                    </YStack>
                  ) : null}
                </YStack>
              ))}
            </YStack>
          ) : (
            <SurfaceCard p="$4" tone={isGlass ? 'secondary' : 'default'} gap="$2">
              <Text fontSize={12} color="$textSecondary">
                No clients yet.
              </Text>
              <SecondaryButton onPress={() => router.push('/clients/new')}>
                Add your first client
              </SecondaryButton>
            </SurfaceCard>
          )}
        </YStack>
      )
    }

    return null
  }

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      {showLayoutEditor ? (
        <YStack px="$5" pt="$6" gap="$5">
          <YStack gap="$3">
            <Text fontSize={12} color="$textSecondary">
              Hold and drag to reorder your Overview sections.
            </Text>
            <DraggableFlatList
              data={layoutDraft}
              keyExtractor={(item) => item}
              renderItem={renderLayoutItem}
              onDragEnd={({ data }) => setLayoutDraft(data)}
              scrollEnabled={false}
              activationDistance={2}
              style={{ overflow: 'visible' }}
              contentContainerStyle={{ paddingVertical: 4 }}
            />
          </YStack>
        </YStack>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: Math.max(24, tabBarHeight + insets.bottom + 12),
          }}
          scrollEnabled={!isQuickActionDragging}
        >
          <YStack px="$5" pt="$6" gap="$5">
            {isEmptyAccount ? (
              <SurfaceCard tone={isGlass ? 'secondary' : 'default'} p="$4" gap="$3">
                <ThemedHeadingText fontWeight="700" fontSize={16}>
                  Welcome to MyGuest
                </ThemedHeadingText>
                <Text fontSize={12} color="$textSecondary">
                  Start by adding your first client. You can log appointments after.
                </Text>
                <PrimaryButton onPress={() => router.push('/clients/new')}>
                  Add First Client
                </PrimaryButton>
              </SurfaceCard>
            ) : null}
            {visibleSections.map((sectionId, index) => (
              <YStack key={sectionId} gap="$3">
                {renderSection(sectionId)}
                {aesthetic === 'modern' && index < visibleSections.length - 1 ? (
                  <SectionDivider />
                ) : null}
              </YStack>
            ))}
            <YStack items="center" pt="$2" pb="$2">
              <YStack height={52} items="center" justify="center" position="relative">
                <RNAnimated.View
                  pointerEvents="auto"
                  style={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}
                >
                  <XStack
                    width={44}
                    height={44}
                    rounded={controlRadius}
                    bg="$surfaceCard"
                    borderWidth={1}
                    borderColor="$borderColor"
                    items="center"
                    justify="center"
                    pressStyle={{ opacity: 0.7 }}
                    onPress={toggleLayoutEditor}
                  >
                    <LayoutGrid size={18} color="$accent" />
                  </XStack>
                </RNAnimated.View>
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>
      )}

      {showLayoutEditor ? (
        <YStack
          position="absolute"
          l={0}
          r={0}
          b={Math.max(16, tabBarHeight + insets.bottom + 8)}
          items="center"
          pointerEvents="box-none"
        >
          <RNAnimated.View
            style={{
              opacity: buttonsOpacity,
              transform: [{ translateY: buttonsTranslate }],
            }}
          >
            <XStack gap="$2">
              <RNAnimated.View style={{ transform: [{ translateX: leftTranslate }] }}>
                <XStack
                  rounded={controlRadius}
                  px="$4"
                  py="$2.5"
                  borderWidth={1}
                  borderColor="$borderColor"
                  bg="$surfaceCard"
                  items="center"
                  gap="$2"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={handleCancelLayout}
                >
                  <X size={14} color="$textSecondary" />
                  <Text fontSize={12} color="$textSecondary">
                    Cancel
                  </Text>
                </XStack>
              </RNAnimated.View>
              <RNAnimated.View style={{ transform: [{ translateX: rightTranslate }] }}>
                <XStack
                  rounded={controlRadius}
                  px="$4"
                  py="$2.5"
                  bg="$accent"
                  items="center"
                  gap="$2"
                  pressStyle={{ opacity: 0.85 }}
                  onPress={handleSaveLayout}
                >
                  <Check size={14} color="$accentContrast" />
                  <Text fontSize={12} color="$accentContrast">
                    Save
                  </Text>
                </XStack>
              </RNAnimated.View>
            </XStack>
          </RNAnimated.View>
        </YStack>
      ) : null}
    </YStack>
  )
}
