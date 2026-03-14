import { useMemo, useRef, useState } from 'react'
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
  const typeFilter = useClientsStore((state) => state.typeFilter)
  const showFilters = useClientsStore((state) => state.showFilters)
  const setSearchText = useClientsStore((state) => state.setSearchText)
  const setStatusFilter = useClientsStore((state) => state.setStatusFilter)
  const setTypeFilter = useClientsStore((state) => state.setTypeFilter)
  const toggleFilters = useClientsStore((state) => state.toggleFilters)
  const resetFilters = useClientsStore((state) => state.resetFilters)
  const searchInputRef = useRef<any>(null)

  const {
    data: clients = [],
    refetch: refetchClients,
  } = useClients()
  const {
    data: appointmentHistory = [],
    refetch: refetchAppointments,
  } = useAppointmentHistoryLite()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const isRefreshingRef = useRef(false)
  const minRefreshMs = 650

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

  const filteredClients = useMemo(() => {
    const effectiveSearch = searchText.trim() ? debouncedSearchText : searchText
    const normalizedSearch = effectiveSearch.trim().toLowerCase()

    return clients
      .filter((client) => {
        const activeStatus = activeClientIds.has(client.id) ? 'Active' : 'Inactive'
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
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [activeClientIds, clients, debouncedSearchText, searchText, statusFilter, typeFilter])

  const hasClients = clients.length > 0
  const hasFilteredClients = filteredClients.length > 0

  const handleRefresh = async () => {
    if (isRefreshingRef.current) return
    isRefreshingRef.current = true
    setIsRefreshing(true)
    const startedAt = Date.now()

    try {
      await Promise.all([refetchClients(), refetchAppointments()])
    } finally {
      const elapsed = Date.now() - startedAt
      if (elapsed < minRefreshMs) {
        await new Promise((resolve) => setTimeout(resolve, minRefreshMs - elapsed))
      }
      setIsRefreshing(false)
      isRefreshingRef.current = false
    }
  }

  const handleClearSearch = () => {
    if (!searchText) return
    setSearchText('')
    requestAnimationFrame(() => {
      searchInputRef.current?.focus?.()
    })
  }

  return {
    aesthetic,
    chipRadius,
    controlRadius,
    filteredClients,
    formatLastVisitLabel,
    handleClearSearch,
    handleRefresh,
    hasClients,
    hasFilteredClients,
    insets,
    isActive,
    isGlass,
    isGlassLight,
    isRefreshing,
    lineColor,
    resetFilters,
    resolveLastVisit,
    searchInputRef,
    searchText,
    setSearchText,
    setStatusFilter,
    setTypeFilter,
    showFilters,
    showStatus,
    statusFilter,
    toggleFilters,
    topInset,
    typeFilter,
  }
}

export type ClientsScreenModel = ReturnType<typeof useClientsScreenModel>
