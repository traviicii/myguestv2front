import { useMemo, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'tamagui'

import { useThemePrefs } from 'components/ThemePrefs'
import { useAppointmentHistoryLite, useClients } from 'components/data/queries'
import { useClientsStore } from 'components/state/clientsStore'
import { useStudioStore } from 'components/state/studioStore'
import { deriveLastVisitByClient } from 'components/utils/clientDerived'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'
import { formatDateByStyle } from 'components/utils/date'
import { useDebouncedValue } from 'components/utils/useDebouncedValue'
import { usePullToRefresh } from 'components/ui/usePullToRefresh'

export function useClientsScreenModel() {
  const insets = useSafeAreaInsets()
  const { aesthetic, mode: themeMode } = useThemePrefs()
  const isCyberpunk = aesthetic === 'cyberpunk'
  const isGlass = aesthetic === 'glass'
  const isGlassLight = isGlass && themeMode === 'light'
  const controlRadius = isCyberpunk ? 0 : isGlass ? 20 : 10
  const chipRadius = isCyberpunk ? 0 : isGlass ? 16 : 10
  const topInset = Math.max(insets.top + 8, 16)
  const theme = useTheme()

  const searchText = useClientsStore((state) => state.searchText)
  const debouncedSearchText = useDebouncedValue(searchText, 200)
  const statusFilter = useClientsStore((state) => state.statusFilter)
  const tagFilter = useClientsStore((state) => state.tagFilter)
  const typeFilter = useClientsStore((state) => state.typeFilter)
  const visitFilter = useClientsStore((state) => state.visitFilter)
  const showFilters = useClientsStore((state) => state.showFilters)
  const setSearchText = useClientsStore((state) => state.setSearchText)
  const setStatusFilter = useClientsStore((state) => state.setStatusFilter)
  const setTagFilter = useClientsStore((state) => state.setTagFilter)
  const setTypeFilter = useClientsStore((state) => state.setTypeFilter)
  const setVisitFilter = useClientsStore((state) => state.setVisitFilter)
  const openFilters = useClientsStore((state) => state.openFilters)
  const closeFilters = useClientsStore((state) => state.closeFilters)
  const toggleFilters = useClientsStore((state) => state.toggleFilters)
  const resetFilters = useClientsStore((state) => state.resetFilters)
  const resetFilterSelections = useClientsStore((state) => state.resetFilterSelections)
  const searchInputRef = useRef<any>(null)

  const {
    data: clients = [],
    refetch: refetchClients,
  } = useClients()
  const {
    data: appointmentHistory = [],
    refetch: refetchAppointments,
  } = useAppointmentHistoryLite()

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

  const lineColor = toNativeColor(theme.borderColor?.val, FALLBACK_COLORS.borderSubtle)

  const activeCutoff = useMemo(() => {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - activeStatusMonths)
    return cutoff
  }, [activeStatusMonths])

  const formatLastVisitLabel = (value: string) => {
    if (!value || value === 'No visits yet' || value === '—') return 'No visits yet'
    return formatDateByStyle(value, dateDisplayFormat, {
      todayLabel: true,
      includeWeekday: dateLongIncludeWeekday,
    })
  }

  const parseVisitDate = (value: string | undefined) => {
    if (!value || value === 'No visits yet' || value === '—') return null
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const derivedLastVisitByClient = useMemo(
    () => deriveLastVisitByClient(appointmentHistory),
    [appointmentHistory]
  )

  const resolveLastVisit = (clientId: string, fallback: string) =>
    derivedLastVisitByClient[clientId] ?? fallback

  const activeClientIds = useMemo(() => {
    const activeIds = new Set<string>()
    clients.forEach((client) => {
      const lastVisit = derivedLastVisitByClient[client.id] ?? client.lastVisit
      const visitDate = parseVisitDate(lastVisit)
      if (visitDate && visitDate >= activeCutoff) {
        activeIds.add(client.id)
      }
    })
    return activeIds
  }, [activeCutoff, clients, derivedLastVisitByClient])

  const isActive = (clientId: string) => activeClientIds.has(clientId)

  const availableTags = useMemo(() => {
    return Array.from(
      new Set(
        clients
          .map((client) => client.tag.trim())
          .filter((tag) => tag.length > 0)
          .filter((tag) => !['Cut', 'Color', 'Cut & Color'].includes(tag))
      )
    ).sort((a, b) => a.localeCompare(b))
  }, [clients])

  const filteredClients = useMemo(() => {
    const effectiveSearch = searchText.trim() ? debouncedSearchText : searchText
    const normalizedSearch = effectiveSearch.trim().toLowerCase()

    return clients
      .filter((client) => {
        const activeStatus = activeClientIds.has(client.id) ? 'Active' : 'Inactive'
        const visitDate = parseVisitDate(derivedLastVisitByClient[client.id] ?? client.lastVisit)
        if (statusFilter !== 'All' && activeStatus !== statusFilter) return false
        if (visitFilter === 'Needs First Visit' && visitDate !== null) return false
        if (visitFilter === 'Returning' && visitDate === null) return false
        if (typeFilter !== 'All' && client.type !== typeFilter) return false
        if (tagFilter !== 'All' && client.tag.trim() !== tagFilter) return false

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
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [
    activeClientIds,
    clients,
    debouncedSearchText,
    derivedLastVisitByClient,
    searchText,
    statusFilter,
    tagFilter,
    typeFilter,
    visitFilter,
  ])

  const hasClients = clients.length > 0
  const hasFilteredClients = filteredClients.length > 0
  const activeFilterCount =
    Number(statusFilter !== 'All') +
    Number(typeFilter !== 'All') +
    Number(visitFilter !== 'All') +
    Number(tagFilter !== 'All')

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
      await Promise.all([refetchClients(), refetchAppointments()])
    },
  })

  const handleClearSearch = () => {
    if (!searchText) return
    setSearchText('')
    requestAnimationFrame(() => {
      searchInputRef.current?.focus?.()
    })
  }

  return {
    activeFilterCount,
    aesthetic,
    availableTags,
    chipRadius,
    closeFilterSheet: closeFilters,
    controlRadius,
    filteredClients,
    formatLastVisitLabel,
    handleClearSearch,
    handleRefresh,
    handleRefreshScroll,
    handleRefreshScrollRelease,
    hasClients,
    hasActiveFilters: activeFilterCount > 0,
    hasFilteredClients,
    filterSheetOpen: showFilters,
    insets,
    isActive,
    isGlass,
    isGlassLight,
    isRefreshPullActive,
    isRefreshing,
    isRefreshThresholdReached,
    lineColor,
    refreshFeedbackMessage,
    refreshPullProgress,
    resetFilters,
    resetFilterSelections,
    resolveLastVisit,
    searchInputRef,
    searchText,
    openFilterSheet: openFilters,
    setSearchText,
    setStatusFilter,
    setTagFilter,
    setTypeFilter,
    setVisitFilter,
    showFilters,
    showStatus,
    statusFilter,
    tagFilter,
    toggleFilters,
    topInset,
    typeFilter,
    visitFilter,
  }
}

export type ClientsScreenModel = ReturnType<typeof useClientsScreenModel>
