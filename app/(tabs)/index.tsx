import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'expo-router'
import { ScrollView, Text, XStack, YStack, useTheme } from 'tamagui'
import {
  ArrowRight,
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
import { Animated as RNAnimated } from 'react-native'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  type RenderItemParams,
} from 'react-native-draggable-flatlist'
import { SortableGrid } from 'components/ui/SortableGrid'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { ExpandableEditPanel } from 'components/ui/ExpandableEditPanel'
import { GhostButton, ThemedSwitch } from 'components/ui/controls'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  useAppointmentHistory,
  useClients,
  useColorAnalysisByClient,
  useImagesByClient,
} from 'components/data/queries'
import { useOverviewStore } from 'components/state/overviewStore'
import { formatDateLabel, formatDateMMDDYYYY } from 'components/utils/date'
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

export default function TabOneScreen() {
  const insets = useSafeAreaInsets()
  const theme = useTheme()
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
  const { appSettings, setQuickActionEnabled, setQuickActionOrder, pinnedClientIds } =
    useStudioStore()
  const { data: clients = [] } = useClients()
  const { data: appointmentHistory = [] } = useAppointmentHistory()
  const { data: colorAnalysisByClient = {} } = useColorAnalysisByClient()
  const { data: imagesByClient = {} } = useImagesByClient()

  const recentClients = clients.slice(0, 3)
  const recentHistory = useMemo(() => {
    return [...appointmentHistory]
      .filter((entry) => entry.date)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 3)
  }, [appointmentHistory])

  const activeCutoff = useMemo(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - appSettings.activeStatusMonths)
    return date
  }, [appSettings.activeStatusMonths])

  // Derive dashboard metrics from the same query data powering the rest
  // of the app, so totals stay consistent across screens.
  const metrics = useMemo(() => {
    const entriesLastYear = appointmentHistory.filter((entry) => {
      const d = entry.date ? new Date(entry.date) : null
      return d && !Number.isNaN(d.getTime()) && d >= activeCutoff
    })

    const revenueYtd = entriesLastYear.reduce((sum, entry) => sum + entry.price, 0)
    const avgTicket =
      entriesLastYear.length > 0
        ? revenueYtd / entriesLastYear.length
        : 0

    const activeClientIds = new Set(
      entriesLastYear.map((entry) => entry.clientId)
    )

    const inactiveClients = clients.length - activeClientIds.size

    const newClients90 = (() => {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 90)
      return clients.filter((client) => {
        const first = appointmentHistory
          .filter((entry) => entry.clientId === client.id)
          .map((entry) => entry.date)
          .filter(Boolean)
          .sort()[0]
        if (!first) return false
        const d = new Date(first)
        return !Number.isNaN(d.getTime()) && d >= cutoff
      }).length
    })()

    const serviceMix = (() => {
      const counts = entriesLastYear.reduce<Record<string, number>>(
        (acc, entry) => {
          acc[entry.services] = (acc[entry.services] || 0) + 1
          return acc
        },
        {}
      )
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
      if (!top) return '—'
      const percent = Math.round((top[1] / entriesLastYear.length) * 100)
      return `${top[0]} (${percent}%)`
    })()

    const colorCoverage = (() => {
      const total = clients.length
      const withColor = clients.filter((client) => {
        const data = colorAnalysisByClient[client.id]
        if (!data) return false
        return Object.values(data).some((value) => value && value !== '—' && value !== 'Unknown')
      }).length
      const percent = total > 0 ? Math.round((withColor / total) * 100) : 0
      return `${percent}%`
    })()

    const photoCoverage = (() => {
      const total = clients.length
      const withPhotos = clients.filter((client) => imagesByClient[client.id])
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
      { id: 'photoCoverage', label: 'Photo Coverage', value: photoCoverage },
    ]
  }, [appointmentHistory, clients, colorAnalysisByClient, imagesByClient, activeCutoff])

  const quickActions = useMemo(
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
      ] as const,
    []
  )

  type QuickAction = (typeof quickActions)[number]

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

  const [layoutDraft, setLayoutDraft] = useState<string[]>(visibleSections)
  const [isQuickActionDragging, setIsQuickActionDragging] = useState(false)
  const layoutAnim = useRef(new RNAnimated.Value(showLayoutEditor ? 1 : 0)).current

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

  const sectionLabels: Record<string, string> = {
    quickActions: 'Quick Actions',
    metrics: 'Metrics',
    pinnedClients: 'Pinned Clients',
    recentAppointments: 'Recent Appointments',
    recentClients: 'Recent Clients',
  }

  const renderLayoutItem = ({ item, drag, isActive }: RenderItemParams<string>) => (
    <XStack
      {...cardBorder}
      rounded="$5"
      px="$4"
      py="$4"
      items="center"
      justify="space-between"
      opacity={isActive ? 0.85 : 1}
      onLongPress={drag}
      pressStyle={{ opacity: 0.8 }}
    >
      <Text fontSize={14} fontWeight="600">
        {sectionLabels[item] ?? item}
      </Text>
      <GripVertical size={18} color="$gray7" />
    </XStack>
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

  const lineColor = theme.borderColor?.val ?? '#CBD5E1'
  const renderQuickActionCard = (
    action: QuickAction,
    options?: { draggable?: boolean; isDragging?: boolean; onPressIn?: () => void }
  ) => {
    const Icon = action.icon
    const isPrimary = action.variant === 'primary'
    const isSecondary = action.variant === 'secondary'
    const isDisabled = action.comingSoon
    return (
      <YStack
        width={140}
        aspectRatio={1}
        rounded={999}
        bg={isPrimary ? '$accent' : '$gray1'}
        borderWidth={isPrimary ? 0 : 1}
        borderColor={isPrimary ? 'transparent' : '$borderColor'}
        items="center"
        justify="center"
        gap="$2"
        animation="quick"
        enterStyle={{ opacity: 0, y: 8 }}
        shadowColor={isPrimary ? 'rgba(15,23,42,0.2)' : 'rgba(15,23,42,0.08)'}
        shadowRadius={16}
        shadowOpacity={1}
        shadowOffset={{ width: 0, height: 8 }}
        elevation={isPrimary ? 4 : 3}
        opacity={isDisabled ? 0.55 : 1}
        onPressIn={options?.onPressIn}
        pressStyle={options?.draggable ? { opacity: 0.85 } : undefined}
        scale={options?.isDragging ? 0.97 : 1}
      >
        <Icon
          size={24}
          color={isPrimary ? '$accentContrast' : isSecondary ? '$accent' : '$gray8'}
        />
        <Text
          fontSize={12}
          color={isPrimary ? '$accentContrast' : isSecondary ? '$accent' : '$gray8'}
          textAlign="center"
        >
          {action.label}
        </Text>
        {isDisabled ? (
          <Text fontSize={10} color="$gray7">
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
          <Text fontSize={12} color="$gray8">
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
          <Text fontSize={12} color="$gray8">
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

  const getServiceLabel = (notes: string, fallback: string) => {
    const trimmed = (notes || '').trim()
    if (!trimmed) return fallback
    const firstLine = trimmed.split('\n')[0].trim()
    if (!firstLine) return fallback
    const colonIndex = firstLine.indexOf(':')
    if (colonIndex > 0) return firstLine.slice(0, colonIndex).trim()
    return firstLine
  }

  const renderSection = (id: string) => {
    // Overview sections are rendered from ids so the order can be customized
    // and persisted by the layout editor.
    if (id === 'quickActions') {
      return (
        <YStack key={id} gap="$3">
          <XStack items="center" justify="space-between">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              Quick Actions
            </Text>
            <GhostButton onPress={toggleQuickActionEditor}>
              {showQuickActionEditor ? 'Done' : 'Edit'}
            </GhostButton>
          </XStack>
          <ExpandableEditPanel
            visible={showQuickActionEditor}
            lineColor={lineColor}
            cardProps={cardBorder}
          >
            {quickActionContent}
          </ExpandableEditPanel>
          {showQuickActionEditor ? (
            <Text fontSize={12} color="$gray8">
              Drag buttons to rearrange order.
            </Text>
          ) : null}
          <YStack minHeight={180} justify="center" items="center" width="100%">
            {enabledQuickActions.length ? (
              showQuickActionEditor ? (
                <SortableGrid
                  data={enabledQuickActions}
                  keyExtractor={(item) => item.id}
                  columns={2}
                  itemSize={160}
                  gap={16}
                  onDragActiveChange={setIsQuickActionDragging}
                  onOrderChange={handleQuickActionReorder}
                  renderItem={(item, isActive) => (
                    <YStack mx="$2" my="$2">
                      {renderQuickActionCard(item, {
                        draggable: true,
                        isDragging: isActive,
                      })}
                    </YStack>
                  )}
                />
              ) : (
                <XStack
                  gap="$4"
                  justify="center"
                  items="center"
                  width="100%"
                  flexWrap="wrap"
                >
                  {enabledQuickActions.map((action) => {
                    const isDisabled = action.comingSoon
                    const card = renderQuickActionCard(action)

                    if (action.href && !isDisabled) {
                      return (
                        <Link key={action.id} href={action.href} asChild>
                          {card}
                        </Link>
                      )
                    }

                    return (
                      <YStack key={action.id} pointerEvents="none">
                        {card}
                      </YStack>
                    )
                  })}
                </XStack>
              )
            ) : (
              <Text fontSize={12} color="$gray8">
                No quick actions selected.
              </Text>
            )}
          </YStack>
        </YStack>
      )
    }

    if (id === 'metrics') {
      return (
        <YStack key={id} gap="$3">
          <XStack items="center" justify="space-between">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              Metrics
            </Text>
            <GhostButton onPress={toggleMetricEditor}>
              {showMetricEditor ? 'Done' : 'Edit'}
            </GhostButton>
          </XStack>
          <ExpandableEditPanel
            visible={showMetricEditor}
            lineColor={lineColor}
            cardProps={cardBorder}
          >
            {metricContent}
          </ExpandableEditPanel>
          <XStack gap="$3" flexWrap="wrap">
            {metrics
              .filter((metric) => selectedMetrics.includes(metric.id))
              .map((metric) => (
                <YStack
                  key={metric.id}
                  {...cardBorder}
                  p="$4"
                  rounded="$5"
                  minWidth={140}
                  flexGrow={1}
                  animation="quick"
                  enterStyle={{ opacity: 0, y: 6 }}
                >
                  <Text fontSize={12} color="$gray8">
                    {metric.label}
                  </Text>
                  <Text fontSize={18} fontWeight="700" color="$color">
                    {metric.value}
                  </Text>
                </YStack>
              ))}
          </XStack>
        </YStack>
      )
    }

    if (id === 'pinnedClients') {
      return (
        <YStack key={id} gap="$3">
          <XStack items="center" justify="space-between">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              Pinned Clients
            </Text>
          </XStack>
          {pinnedClients.length ? (
            <YStack gap="$3">
              {pinnedClients.slice(0, 3).map((client) => (
                <Link key={client.id} href={`/client/${client.id}`} asChild>
                  <XStack
                    {...cardBorder}
                    p="$4"
                    rounded="$5"
                    items="center"
                    justify="space-between"
                    gap="$3"
                    pressStyle={{ opacity: 0.85 }}
                  >
                    <YStack>
                      <Text fontSize={14} fontWeight="600">
                        {client.name}
                      </Text>
                      <Text fontSize={12} color="$gray8">
                        {client.type} • Last visit {formatDateMMDDYYYY(client.lastVisit)}
                      </Text>
                    </YStack>
                    <ArrowRight size={14} color="$accent" />
                  </XStack>
                </Link>
              ))}
            </YStack>
          ) : (
            <Text fontSize={12} color="$gray8">
              Pin clients from their profile to keep them handy here.
            </Text>
          )}
        </YStack>
      )
    }

    if (id === 'recentAppointments') {
      return (
        <YStack key={id} gap="$3">
          <XStack items="center" justify="space-between">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              Recent Appointments
            </Text>
            <Link href="/appointments" asChild>
              <XStack items="center" gap="$1">
                <Text fontSize={12} color="$accent">
                  Full history
                </Text>
                <ArrowRight size={14} color="$accent" />
              </XStack>
            </Link>
          </XStack>
          <YStack gap="$3">
            {recentHistory.map((entry) => {
              const clientName =
                clients.find((client) => client.id === entry.clientId)?.name ?? 'Client'
              return (
                <Link key={entry.id} href={`/appointment/${entry.id}`} asChild>
                  <XStack
                    {...cardBorder}
                    p="$4"
                    rounded="$5"
                    items="center"
                    justify="space-between"
                    gap="$3"
                    animation="quick"
                    enterStyle={{ opacity: 0, y: 6 }}
                  >
                    <XStack items="center" gap="$3">
                      <XStack
                        bg="$accentSoft"
                        rounded="$4"
                        p="$2.5"
                        items="center"
                        justify="center"
                      >
                        <CalendarDays size={18} color="$accent" />
                      </XStack>
                      <YStack gap="$1">
                        <Text fontSize={14} fontWeight="600">
                          {getServiceLabel(entry.notes, entry.services)}
                        </Text>
                        <XStack items="center" gap="$2">
                          <Text fontSize={12} color="$gray8">
                            {clientName}
                          </Text>
                          <Text fontSize={11} color="$gray8">
                            {formatDateLabel(entry.date, { todayLabel: true })}
                          </Text>
                        </XStack>
                      </YStack>
                    </XStack>
                    <Text fontSize={12} color="$gray9">
                      ${entry.price}
                    </Text>
                  </XStack>
                </Link>
              )
            })}
          </YStack>
        </YStack>
      )
    }

    if (id === 'recentClients') {
      return (
        <YStack key={id} gap="$3">
          <XStack items="center" justify="space-between">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              Recent Clients
            </Text>
            <Link href="/recent-clients" asChild>
              <XStack items="center" gap="$1">
                <Text fontSize={12} color="$accent">
                  View all
                </Text>
                <ArrowRight size={14} color="$accent" />
              </XStack>
            </Link>
          </XStack>
          <YStack gap="$3">
            {recentClients.map((client) => (
              <Link key={client.id} href={`/client/${client.id}`} asChild>
                <XStack
                  {...cardBorder}
                  p="$4"
                  rounded="$5"
                  items="center"
                  justify="space-between"
                  gap="$3"
                >
                  <YStack>
                    <Text fontSize={14} fontWeight="600">
                      {client.name}
                    </Text>
                    <Text fontSize={12} color="$gray8">
                      {client.type} • Last visit {formatDateMMDDYYYY(client.lastVisit)}
                    </Text>
                  </YStack>
                </XStack>
              </Link>
            ))}
          </YStack>
        </YStack>
      )
    }

    return null
  }

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      {showLayoutEditor ? (
        <NestableScrollContainer
          contentContainerStyle={{ paddingBottom: 40 }}
          scrollEnabled={false}
        >
          <YStack px="$5" pt="$6" gap="$5">
            <YStack gap="$3">
              <Text fontSize={12} color="$gray8">
                Hold and drag to reorder your Overview sections.
              </Text>
              <NestableDraggableFlatList
                data={layoutDraft}
                keyExtractor={(item) => item}
                renderItem={renderLayoutItem}
                onDragEnd={({ data }) => setLayoutDraft(data)}
                scrollEnabled={false}
                activationDistance={10}
              />
            </YStack>
          </YStack>
        </NestableScrollContainer>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          scrollEnabled={!showQuickActionEditor && !isQuickActionDragging}
        >
          <YStack px="$5" pt="$6" gap="$5">
            {visibleSections.map((sectionId) => renderSection(sectionId))}
            <YStack alignItems="center" pt="$2" pb="$2">
              <YStack height={52} alignItems="center" justify="center" position="relative">
                <RNAnimated.View
                  pointerEvents="auto"
                  style={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}
                >
                  <XStack
                    width={44}
                    height={44}
                    rounded={999}
                    bg="$gray1"
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
          left={0}
          right={0}
          bottom={Math.max(16, insets.bottom + 8)}
          alignItems="center"
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
                  rounded="$4"
                  px="$4"
                  py="$2.5"
                  borderWidth={1}
                  borderColor="$borderColor"
                  bg="$gray1"
                  items="center"
                  gap="$2"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={handleCancelLayout}
                >
                  <X size={14} color="$gray8" />
                  <Text fontSize={12} color="$gray8">
                    Cancel
                  </Text>
                </XStack>
              </RNAnimated.View>
              <RNAnimated.View style={{ transform: [{ translateX: rightTranslate }] }}>
                <XStack
                  rounded="$4"
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
