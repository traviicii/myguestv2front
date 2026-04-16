import { useCallback, useMemo } from 'react'
import { Linking } from 'react-native'
import { useLocalSearchParams, useRouter, type Href } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'tamagui'

import { useThemePrefs } from 'components/ThemePrefs'
import {
  useAppointmentHistoryLite,
  useClients,
  useColorAnalysisByClient,
  useColorAnalysisForClient,
  useServices,
} from 'components/data/queries'
import { useStudioStore } from 'components/state/studioStore'
import { usePullToRefresh } from 'components/ui/usePullToRefresh'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'
import { formatDateByStyle } from 'components/utils/date'
import { buildRebookingRecommendationForClient } from 'components/utils/rebooking'

import { buildClientTimelineEntries } from './timelineUtils'

export function useClientDetailScreenModel() {
  const theme = useTheme()
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
  const {
    data: clients = [],
    isLoading: clientsLoading,
    refetch: refetchClients,
  } = useClients()
  const {
    data: appointmentHistory = [],
    refetch: refetchAppointments,
  } = useAppointmentHistoryLite()
  const { data: serviceCatalog = [], refetch: refetchServices } = useServices('all')
  const {
    data: colorAnalysisByClient = {},
    refetch: refetchColorAnalysisByClient,
  } = useColorAnalysisByClient()
  const { pinnedClientIds, togglePinnedClient, appSettings } = useStudioStore()
  const topInset = Math.max(insets.top + 8, 16)

  const client = clients.find((item) => item.id === resolvedClientId)
  const { data: colorAnalysisForClient, refetch: refetchColorAnalysisForClient } =
    useColorAnalysisForClient(
    resolvedClientId || undefined
    )

  const editHref = useMemo<Href>(
    () =>
      resolvedClientId
        ? { pathname: '/client/[id]/edit', params: { id: resolvedClientId } }
        : '/clients',
    [resolvedClientId]
  )

  const newAppointmentHref = useMemo<Href>(
    () =>
      resolvedClientId
        ? { pathname: '/client/[id]/new-appointment', params: { id: resolvedClientId } }
        : '/clients',
    [resolvedClientId]
  )

  const appointmentsHref = useMemo<Href>(
    () =>
      resolvedClientId
        ? { pathname: '/appointments', params: { clientId: resolvedClientId } }
        : '/appointments',
    [resolvedClientId]
  )

  const colorChartHref = useMemo<Href>(
    () =>
      resolvedClientId
        ? { pathname: '/client/[id]/color-chart', params: { id: resolvedClientId } }
        : '/clients',
    [resolvedClientId]
  )

  const formatLastVisitLabel = useCallback(
    (value: string) => {
      if (!value || value === 'No visits yet' || value === '—') return 'No visits yet'
      return formatDateByStyle(value, appSettings.dateDisplayFormat, {
        todayLabel: true,
        includeWeekday: appSettings.dateLongIncludeWeekday,
      })
    },
    [appSettings.dateDisplayFormat, appSettings.dateLongIncludeWeekday]
  )

  const {
    feedbackMessage: refreshFeedbackMessage,
    handleRefresh,
    handleScroll: handleRefreshScroll,
    handleScrollRelease: handleRefreshScrollRelease,
    isPullActive: isRefreshPullActive,
    isRefreshing,
    isThresholdReached: isRefreshThresholdReached,
    pullProgress: refreshPullProgress,
  } = usePullToRefresh({
    onRefreshAction: async () => {
      await Promise.all([
        refetchClients(),
        refetchAppointments(),
        refetchServices(),
        refetchColorAnalysisByClient(),
        resolvedClientId ? refetchColorAnalysisForClient() : Promise.resolve(null),
      ])
    },
  })

  const matchingHistory = useMemo(
    () =>
      appointmentHistory
        .filter((item) => item.clientId === resolvedClientId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [appointmentHistory, resolvedClientId]
  )

  const history = useMemo(
    () => matchingHistory.slice(0, appSettings.clientDetailsAppointmentLogsCount),
    [appSettings.clientDetailsAppointmentLogsCount, matchingHistory]
  )

  const latestHistoryDate = matchingHistory[0]?.date ?? null
  const rebookingRecommendation = useMemo(
    () =>
      resolvedClientId
        ? buildRebookingRecommendationForClient({
            clientId: resolvedClientId,
            appointmentHistory,
            serviceCatalog,
          })
        : null,
    [appointmentHistory, resolvedClientId, serviceCatalog]
  )
  const colorAnalysis =
    colorAnalysisForClient ??
    (resolvedClientId ? colorAnalysisByClient[resolvedClientId] : undefined)
  const timelineEntries = useMemo(
    () =>
      resolvedClientId
        ? buildClientTimelineEntries({
            clientId: resolvedClientId,
            appointmentHistory,
            colorAnalysis,
            limit: appSettings.clientDetailsAppointmentLogsCount,
          })
        : [],
    [
      appSettings.clientDetailsAppointmentLogsCount,
      appointmentHistory,
      colorAnalysis,
      resolvedClientId,
    ]
  )
  const hasColorChartData = Boolean(colorAnalysis)
  const isPinned = resolvedClientId ? pinnedClientIds.includes(resolvedClientId) : false
  const isBootstrapping = clientsLoading && !clients.length
  const isMissingClient = !isBootstrapping && !client

  const activeCutoff = useMemo(() => {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - appSettings.activeStatusMonths)
    return cutoff
  }, [appSettings.activeStatusMonths])

  const isActive = matchingHistory.some((entry) => new Date(entry.date) >= activeCutoff)
  const statusLabel = isActive ? 'Active' : 'Inactive'
  const statusColor: '$green10' | '$orange10' = isActive ? '$green10' : '$orange10'
  const showStatus =
    appSettings.clientsShowStatus && appSettings.clientsShowStatusDetails

  const sanitizedPhone = client?.phone?.replace(/[^\d+]/g, '') ?? ''
  const phoneUrl = sanitizedPhone ? `tel:${sanitizedPhone}` : ''
  const smsUrl = sanitizedPhone ? `sms:${sanitizedPhone}` : ''
  const emailUrl = client?.email ? `mailto:${client.email}` : ''
  const refreshIndicatorTop = topInset + 44
  const refreshTintColor = toNativeColor(theme.accent?.val, FALLBACK_COLORS.glassAccentLight)

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleEdit = useCallback(() => {
    if (!resolvedClientId) return
    router.push(editHref)
  }, [editHref, resolvedClientId, router])

  const handleTogglePinned = useCallback(() => {
    if (!resolvedClientId) return
    togglePinnedClient(resolvedClientId)
  }, [resolvedClientId, togglePinnedClient])

  const openExternal = useCallback(async (url: string) => {
    if (!url) return
    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      }
    } catch {
      // no-op for unsupported schemes
    }
  }, [])

  const formatAppointmentDate = useCallback(
    (value: string) =>
      formatDateByStyle(value, appSettings.dateDisplayFormat, {
        todayLabel: true,
        includeWeekday: appSettings.dateLongIncludeWeekday,
      }),
    [appSettings.dateDisplayFormat, appSettings.dateLongIncludeWeekday]
  )

  const appointmentDetailHref = useCallback(
    (appointmentId: string): Href => ({
      pathname: '/appointment/[id]',
      params: { id: appointmentId, from: 'client' },
    }),
    []
  )

  return {
    aesthetic,
    appointmentDetailHref,
    appointmentsHref,
    cardRadius,
    client,
    colorAnalysis,
    colorChartHref,
    controlRadius,
    editHref,
    emailUrl,
    formatAppointmentDate,
    formatLastVisitLabel,
    handleBack,
    handleEdit,
    handleRefresh,
    handleRefreshScroll,
    handleRefreshScrollRelease,
    handleTogglePinned,
    hasColorChartData,
    history,
    isBootstrapping,
    isCyberpunk,
    isGlass,
    isMissingClient,
    isPinned,
    isRefreshPullActive,
    isRefreshing,
    isRefreshThresholdReached,
    newAppointmentHref,
    openExternal,
    phoneUrl,
    refreshFeedbackMessage,
    refreshIndicatorTop,
    refreshPullProgress,
    refreshTintColor,
    resolvedClientId,
    showStatus,
    smsUrl,
    statusColor,
    statusLabel,
    thumbRadius,
    topInset,
    latestHistoryDate,
    rebookingRecommendation,
    timelineEntries,
  }
}

export type ClientDetailScreenModel = ReturnType<typeof useClientDetailScreenModel>
