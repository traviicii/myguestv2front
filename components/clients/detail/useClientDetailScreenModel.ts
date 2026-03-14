import { useCallback, useMemo } from 'react'
import { Linking } from 'react-native'
import { useLocalSearchParams, useRouter, type Href } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useThemePrefs } from 'components/ThemePrefs'
import {
  useAppointmentHistoryLite,
  useClients,
  useColorAnalysisByClient,
  useColorAnalysisForClient,
} from 'components/data/queries'
import { useStudioStore } from 'components/state/studioStore'
import { formatDateByStyle } from 'components/utils/date'

export function useClientDetailScreenModel() {
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
  const { data: appointmentHistory = [] } = useAppointmentHistoryLite()
  const { data: colorAnalysisByClient = {} } = useColorAnalysisByClient()
  const { pinnedClientIds, togglePinnedClient, appSettings } = useStudioStore()
  const topInset = Math.max(insets.top + 8, 16)

  const client = clients.find((item) => item.id === resolvedClientId)
  const { data: colorAnalysisForClient } = useColorAnalysisForClient(
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
  const colorAnalysis =
    colorAnalysisForClient ??
    (resolvedClientId ? colorAnalysisByClient[resolvedClientId] : undefined)
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
    handleTogglePinned,
    hasColorChartData,
    history,
    isBootstrapping,
    isCyberpunk,
    isGlass,
    isMissingClient,
    isPinned,
    newAppointmentHref,
    openExternal,
    phoneUrl,
    resolvedClientId,
    showStatus,
    smsUrl,
    statusColor,
    statusLabel,
    thumbRadius,
    topInset,
    latestHistoryDate,
  }
}

export type ClientDetailScreenModel = ReturnType<typeof useClientDetailScreenModel>
