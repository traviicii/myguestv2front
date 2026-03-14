import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useIsFocused } from '@react-navigation/native'
import { useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'tamagui'

import { useThemePrefs } from 'components/ThemePrefs'
import {
  useAppointmentHistoryLite,
  useClients,
  useOverviewMetrics,
} from 'components/data/queries'
import { useOverviewStore } from 'components/state/overviewStore'
import { useStudioStore } from 'components/state/studioStore'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'

import { overviewSectionLabels } from './overviewModelConfig'
import { getOrderedQuickActions } from './overviewQuickActionUtils'
import type { OverviewQuickAction } from './overviewModelTypes'
import {
  buildOverviewAppearance,
  buildOverviewCutoffs,
  formatOverviewLastVisitLabel,
  resolveOverviewLastVisit,
} from './overviewModelUtils'
import { useOverviewContentData } from './useOverviewContentData'
import { useOverviewEditorState } from './useOverviewEditorState'
import { useOverviewRefresh } from './useOverviewRefresh'

export type { OverviewMetricCard, OverviewQuickAction } from './overviewModelTypes'

export function useOverviewScreenModel() {
  const insets = useSafeAreaInsets()
  const tabBarHeight = useBottomTabBarHeight()
  const isFocused = useIsFocused()
  const theme = useTheme()
  const { aesthetic } = useThemePrefs()
  const { actionCardRadius, controlRadius, iconBadgeRadius, isCyberpunk, isGlass, sectionCardRadius } =
    buildOverviewAppearance(aesthetic)
  const topInset = Math.max(insets.top + 8, 16)

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

  const {
    data: clients = [],
    refetch: refetchClients,
  } = useClients()
  const {
    data: appointmentHistory = [],
    refetch: refetchAppointments,
  } = useAppointmentHistoryLite()

  const [isQuickActionDragging, setIsQuickActionDragging] = useState(false)

  const overviewCutoffs = useMemo(
    () =>
      buildOverviewCutoffs({
        activeStatusMonths: appSettings.activeStatusMonths,
        avgTicketRange: appSettings.avgTicketRange,
        photoCoverageRange: appSettings.photoCoverageRange,
      }),
    [
      appSettings.activeStatusMonths,
      appSettings.avgTicketRange,
      appSettings.photoCoverageRange,
    ]
  )

  const { data: overviewMetrics, refetch: refetchOverviewMetrics } =
    useOverviewMetrics(overviewCutoffs)

  const orderedQuickActions = useMemo(
    () => getOrderedQuickActions(appSettings.overviewQuickActionOrder),
    [appSettings.overviewQuickActionOrder]
  )

  const {
    clientMap,
    derivedLastVisitByClient,
    enabledQuickActions,
    isEmptyAccount,
    metrics,
    pinnedClients,
    quickActionColumns,
    quickActionGap,
    quickActionGridHeight,
    quickActionItemSize,
    recentClients,
    recentHistory,
    shouldCenterQuickActionRow,
    visibleSections,
  } = useOverviewContentData({
    appSettings,
    clients,
    appointmentHistory,
    overviewMetrics,
    orderedQuickActions,
    pinnedClientIds,
    sectionOrder,
  })

  const {
    buttonsOpacity,
    buttonsTranslate,
    handleCancelLayout,
    handleSaveLayout,
    iconOpacity,
    iconScale,
    layoutAnim,
    layoutDraft,
    leftTranslate,
    quickActionHintAnim,
    rightTranslate,
    setLayoutDraft,
  } = useOverviewEditorState({
    isFocused,
    sectionOrder,
    setSectionOrder,
    showLayoutEditor,
    showQuickActionEditor,
    toggleLayoutEditor,
    visibleSections,
  })

  const formatLastVisitLabel = (value: string) =>
    formatOverviewLastVisitLabel(value, appSettings)

  const resolveLastVisit = (clientId: string, fallback: string) =>
    resolveOverviewLastVisit(clientId, fallback, derivedLastVisitByClient)

  const handleQuickActionReorder = (nextEnabled: OverviewQuickAction[]) => {
    const enabledIds = nextEnabled.map((action) => action.id)
    const disabledIds = appSettings.overviewQuickActionOrder.filter(
      (id) => !enabledIds.includes(id)
    )
    setQuickActionOrder([...enabledIds, ...disabledIds])
  }

  const lineColor = toNativeColor(theme.borderColor?.val, FALLBACK_COLORS.borderSubtle)

  const { handleRefresh, isRefreshing } = useOverviewRefresh({
    refetchAppointments,
    refetchClients,
    refetchOverviewMetrics,
  })

  return {
    aesthetic,
    appSettings,
    actionCardRadius,
    buttonsOpacity,
    buttonsTranslate,
    clients,
    clientMap,
    controlRadius,
    enabledQuickActions,
    formatLastVisitLabel,
    handleCancelLayout,
    handleQuickActionReorder,
    handleRefresh,
    handleSaveLayout,
    iconBadgeRadius,
    iconOpacity,
    iconScale,
    insets,
    isCyberpunk,
    isEmptyAccount,
    isGlass,
    isFocused,
    isQuickActionDragging,
    isRefreshing,
    layoutAnim,
    layoutDraft,
    leftTranslate,
    lineColor,
    metrics,
    orderedQuickActions,
    pinnedClients,
    quickActionColumns,
    quickActionGap,
    quickActionGridHeight,
    quickActionHintAnim,
    quickActionItemSize,
    recentClients,
    recentHistory,
    resolveLastVisit,
    rightTranslate,
    sectionCardRadius,
    sectionLabels: overviewSectionLabels,
    selectedMetrics,
    setLayoutDraft,
    setMetricSelection,
    setQuickActionEnabled,
    setQuickActionOrder,
    setIsQuickActionDragging,
    shouldCenterQuickActionRow,
    showLayoutEditor,
    showMetricEditor,
    showQuickActionEditor,
    tabBarHeight,
    toggleLayoutEditor,
    toggleMetricEditor,
    toggleQuickActionEditor,
    topInset,
    visibleSections,
  }
}

export type OverviewScreenModel = ReturnType<typeof useOverviewScreenModel>
