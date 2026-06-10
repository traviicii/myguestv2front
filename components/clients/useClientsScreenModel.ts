import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard } from 'react-native'
import type { FlatList, ViewToken } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'tamagui'

import { useThemePrefs } from 'components/ThemePrefs'
import type { Client } from 'components/data/models'
import {
  useAppointmentHistoryLite,
  useClientGroups,
  useClients,
  useServices,
} from 'components/data/queries'
import { useClientsStore } from 'components/state/clientsStore'
import { useStudioStore } from 'components/state/studioStore'
import { deriveLastVisitByClient } from 'components/utils/clientDerived'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'
import { formatDateByStyle } from 'components/utils/date'
import { buildRebookingRecommendationMap } from 'components/utils/rebooking'
import { useDebouncedValue } from 'components/utils/useDebouncedValue'
import { impactLightHaptic } from 'components/utils/haptics'
import { usePullToRefresh } from 'components/ui/usePullToRefresh'

const ALPHA_RAIL_MIN_ITEMS = 12
const ALPHA_RAIL_TOP_OFFSET = 126
const ALPHA_RAIL_HIDE_DELAY_MS = 900
const CLIENT_JUMP_VIEW_POSITION = 0.24
const SCROLL_INDEX_FALLBACK_OFFSET = 140
const ALPHA_RAIL_LETTERS = [
  '#',
  ...Array.from({ length: 26 }, (_value, index) =>
    String.fromCharCode(65 + index)
  ),
] as const

type AlphaRailLetter = (typeof ALPHA_RAIL_LETTERS)[number]

export type ClientSectionHeaderItem = {
  type: 'section'
  letter: AlphaRailLetter
}

export type ClientListRowItem = {
  type: 'client'
  client: Client
  index: number
}

export type ClientListItem = ClientSectionHeaderItem | ClientListRowItem

type ScrollToIndexFailedInfo = {
  averageItemLength: number
  highestMeasuredFrameIndex: number
  index: number
}

function getAlphaBucket(name: string): AlphaRailLetter {
  const firstCharacter = name.trim().charAt(0).toUpperCase()
  return /^[A-Z]$/.test(firstCharacter)
    ? (firstCharacter as AlphaRailLetter)
    : '#'
}

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
  const groupFilter = useClientsStore((state) => state.groupFilter)
  const visitFilter = useClientsStore((state) => state.visitFilter)
  const followUpFilter = useClientsStore((state) => state.followUpFilter)
  const showFilters = useClientsStore((state) => state.showFilters)
  const setSearchText = useClientsStore((state) => state.setSearchText)
  const setStatusFilter = useClientsStore((state) => state.setStatusFilter)
  const setTagFilter = useClientsStore((state) => state.setTagFilter)
  const setGroupFilter = useClientsStore((state) => state.setGroupFilter)
  const setVisitFilter = useClientsStore((state) => state.setVisitFilter)
  const setFollowUpFilter = useClientsStore((state) => state.setFollowUpFilter)
  const openFilters = useClientsStore((state) => state.openFilters)
  const closeFilters = useClientsStore((state) => state.closeFilters)
  const toggleFilters = useClientsStore((state) => state.toggleFilters)
  const resetFilters = useClientsStore((state) => state.resetFilters)
  const resetFilterSelections = useClientsStore((state) => state.resetFilterSelections)
  const searchInputRef = useRef<any>(null)
  const flatListRef = useRef<FlatList<ClientListItem>>(null)
  const scrollRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const alphaRailHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const alphaRailFocusedLetterRef = useRef<AlphaRailLetter | null>(null)
  const alphaRailJumpFocusTargetRef = useRef<AlphaRailLetter | null>(null)
  const lastAlphaJumpHapticRef = useRef<AlphaRailLetter | null>(null)
  const [alphaRailVisible, setAlphaRailVisible] = useState(false)
  const [alphaRailFocusedLetter, setAlphaRailFocusedLetter] =
    useState<AlphaRailLetter | null>(null)

  const {
    data: clients = [],
    refetch: refetchClients,
  } = useClients()
  const { data: clientGroups = [], refetch: refetchClientGroups } = useClientGroups('true')
  const {
    data: appointmentHistory = [],
    refetch: refetchAppointments,
  } = useAppointmentHistoryLite()
  const { data: serviceCatalog = [], refetch: refetchServices } = useServices('all')

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

  const rebookingByClient = useMemo(
    () =>
      buildRebookingRecommendationMap({
        appointmentHistory,
        clients,
        serviceCatalog,
      }),
    [appointmentHistory, clients, serviceCatalog]
  )

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
        const rebooking = rebookingByClient[client.id]
        if (followUpFilter === 'Overdue' && rebooking?.status !== 'overdue') {
          return false
        }
        if (followUpFilter === 'Due This Week' && rebooking?.status !== 'dueThisWeek') {
          return false
        }
        const clientGroupIds = client.groupIds ?? client.groups?.map((group) => group.id) ?? []
        if (groupFilter !== 'All' && !clientGroupIds.includes(Number(groupFilter))) {
          return false
        }
        if (tagFilter !== 'All' && client.tag.trim() !== tagFilter) return false

        if (!normalizedSearch) return true
        const haystack = [
          client.name,
          client.email,
          client.phone,
          client.notes,
          client.tag,
          client.type,
          ...(client.groups ?? []).map((group) => group.name),
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
    groupFilter,
    followUpFilter,
    rebookingByClient,
    visitFilter,
  ])

  const hasClients = clients.length > 0
  const hasFilteredClients = filteredClients.length > 0
  const shouldShowAlphaRail =
    hasFilteredClients &&
    filteredClients.length >= ALPHA_RAIL_MIN_ITEMS

  const {
    alphaIndexMap,
    clientListItems,
  } = useMemo(() => {
    const map: Partial<Record<(typeof ALPHA_RAIL_LETTERS)[number], number>> = {}
    const items: ClientListItem[] = []

    // Alphabet headers are synthetic FlatList rows so jump targets stay stable
    // without trading the existing list architecture for a SectionList.
    filteredClients.forEach((client, index) => {
      const bucket = getAlphaBucket(client.name)
      if (map[bucket] === undefined) {
        map[bucket] = items.length
        items.push({
          letter: bucket,
          type: 'section',
        })
      }

      items.push({
        client,
        index,
        type: 'client',
      })
    })

    return {
      alphaIndexMap: map,
      clientListItems: items,
    }
  }, [filteredClients])

  const availableAlphaLetters = useMemo(
    () =>
      new Set(
        ALPHA_RAIL_LETTERS.filter((letter) => alphaIndexMap[letter] !== undefined)
      ),
    [alphaIndexMap]
  )
  const alphaRailFocusedIndex = alphaRailFocusedLetter
    ? ALPHA_RAIL_LETTERS.indexOf(alphaRailFocusedLetter)
    : null
  const activeFilterCount =
    Number(statusFilter !== 'All') +
    Number(groupFilter !== 'All') +
    Number(followUpFilter !== 'All') +
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
      await Promise.all([
        refetchClients(),
        refetchAppointments(),
        refetchClientGroups(),
        refetchServices(),
      ])
    },
  })

  const handleClearSearch = () => {
    if (!searchText) return
    setSearchText('')
    requestAnimationFrame(() => {
      searchInputRef.current?.focus?.()
    })
  }

  const handleSearchSubmit = useCallback(() => {
    searchInputRef.current?.blur?.()
    Keyboard.dismiss()
  }, [])

  const updateAlphaRailFocusedLetter = useCallback(
    (letter: AlphaRailLetter | null) => {
      if (alphaRailFocusedLetterRef.current === letter) return

      alphaRailFocusedLetterRef.current = letter
      setAlphaRailFocusedLetter(letter)
    },
    []
  )

  const clearAlphaRailJumpFocusLock = useCallback(() => {
    alphaRailJumpFocusTargetRef.current = null
  }, [])

  const lockAlphaRailFocusOnLetter = useCallback(
    (letter: AlphaRailLetter) => {
      alphaRailJumpFocusTargetRef.current = letter
      updateAlphaRailFocusedLetter(letter)
    },
    [updateAlphaRailFocusedLetter]
  )

  const clientsViewabilityConfig = useRef({
    itemVisiblePercentThreshold: 38,
    minimumViewTime: 60,
  }).current

  const handleClientsViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const jumpTarget = alphaRailJumpFocusTargetRef.current
      if (jumpTarget) {
        updateAlphaRailFocusedLetter(jumpTarget)
        return
      }

      let firstVisibleIndex = Number.POSITIVE_INFINITY
      let firstVisibleName: string | null = null

      viewableItems.forEach((item) => {
        const itemIndex = item.index
        const isFirstVisibleCandidate =
          item.isViewable &&
          itemIndex !== null &&
          itemIndex < firstVisibleIndex

        if (!isFirstVisibleCandidate) return

        const listItem = item.item as ClientListItem | undefined
        const name =
          listItem?.type === 'section'
            ? listItem.letter
            : listItem?.client.name
        firstVisibleIndex = itemIndex
        firstVisibleName = typeof name === 'string' ? name : null
      })

      updateAlphaRailFocusedLetter(
        firstVisibleName ? getAlphaBucket(firstVisibleName) : null
      )
    }
  ).current

  const clearAlphaRailHideTimeout = useCallback(() => {
    if (alphaRailHideTimeoutRef.current !== null) {
      clearTimeout(alphaRailHideTimeoutRef.current)
      alphaRailHideTimeoutRef.current = null
    }
  }, [])

  const scheduleAlphaRailHide = useCallback(
    (delayMs = ALPHA_RAIL_HIDE_DELAY_MS) => {
      clearAlphaRailHideTimeout()

      alphaRailHideTimeoutRef.current = setTimeout(() => {
        setAlphaRailVisible(false)
        alphaRailHideTimeoutRef.current = null
      }, delayMs)
    },
    [clearAlphaRailHideTimeout]
  )

  const showAlphaRail = useCallback(
    () => {
      if (!shouldShowAlphaRail) return

      clearAlphaRailHideTimeout()
      setAlphaRailVisible(true)
    },
    [clearAlphaRailHideTimeout, shouldShowAlphaRail]
  )

  const handleAlphaRailInteractionStart = useCallback(() => {
    showAlphaRail()
  }, [showAlphaRail])

  const handleAlphaRailInteractionEnd = useCallback(() => {
    scheduleAlphaRailHide(700)
  }, [scheduleAlphaRailHide])

  const jumpToClientIndex = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: CLIENT_JUMP_VIEW_POSITION,
    })
  }, [])

  const jumpToLetter = useCallback(
    (letter: (typeof ALPHA_RAIL_LETTERS)[number]) => {
      const index = alphaIndexMap[letter]
      if (index === undefined) return

      lockAlphaRailFocusOnLetter(letter)
      if (lastAlphaJumpHapticRef.current !== letter) {
        lastAlphaJumpHapticRef.current = letter
        void impactLightHaptic()
      }
      jumpToClientIndex(index)
    },
    [alphaIndexMap, jumpToClientIndex, lockAlphaRailFocusOnLetter]
  )

  const handleScrollToIndexFailed = useCallback(
    (info: ScrollToIndexFailedInfo) => {
      flatListRef.current?.scrollToOffset({
        offset: Math.max(
          0,
          info.averageItemLength * info.index - SCROLL_INDEX_FALLBACK_OFFSET
        ),
        animated: true,
      })

      if (scrollRetryTimeoutRef.current !== null) {
        clearTimeout(scrollRetryTimeoutRef.current)
      }

      scrollRetryTimeoutRef.current = setTimeout(() => {
        jumpToClientIndex(info.index)
        scrollRetryTimeoutRef.current = null
      }, 160)
    },
    [jumpToClientIndex]
  )

  const handleClientsScroll = useCallback(
    (event: Parameters<typeof handleRefreshScroll>[0]) => {
      handleRefreshScroll(event)
      showAlphaRail()
    },
    [handleRefreshScroll, showAlphaRail]
  )

  const handleClientsScrollBeginDrag = useCallback(() => {
    clearAlphaRailJumpFocusLock()
    searchInputRef.current?.blur?.()
    Keyboard.dismiss()
    showAlphaRail()
  }, [clearAlphaRailJumpFocusLock, showAlphaRail])

  const handleClientsScrollRelease = useCallback(
    () => {
      handleRefreshScrollRelease()
      scheduleAlphaRailHide(700)
    },
    [handleRefreshScrollRelease, scheduleAlphaRailHide]
  )

  useEffect(() => {
    if (groupFilter === 'All') return

    const hasSelectedGroup = clientGroups.some((group) => group.id === Number(groupFilter))
    if (!hasSelectedGroup) {
      setGroupFilter('All')
    }
  }, [clientGroups, groupFilter, setGroupFilter])

  useEffect(() => {
    if (!shouldShowAlphaRail) {
      clearAlphaRailJumpFocusLock()
      clearAlphaRailHideTimeout()
      setAlphaRailVisible(false)
      updateAlphaRailFocusedLetter(null)
    }
  }, [
    clearAlphaRailHideTimeout,
    clearAlphaRailJumpFocusLock,
    shouldShowAlphaRail,
    updateAlphaRailFocusedLetter,
  ])

  useEffect(() => {
    if (!shouldShowAlphaRail) return

    updateAlphaRailFocusedLetter(
      filteredClients[0]?.name ? getAlphaBucket(filteredClients[0].name) : null
    )
  }, [filteredClients, shouldShowAlphaRail, updateAlphaRailFocusedLetter])

  useEffect(
    () => () => {
      if (scrollRetryTimeoutRef.current !== null) {
        clearTimeout(scrollRetryTimeoutRef.current)
      }
      clearAlphaRailHideTimeout()
      clearAlphaRailJumpFocusLock()
    },
    [clearAlphaRailHideTimeout, clearAlphaRailJumpFocusLock]
  )

  return {
    activeFilterCount,
    alphaRailFocusedIndex,
    alphaRailFocusedLetter,
    alphaIndexMap,
    alphaRailLetters: ALPHA_RAIL_LETTERS,
    alphaRailTop: topInset + ALPHA_RAIL_TOP_OFFSET,
    alphaRailVisible,
    aesthetic,
    availableTags,
    availableAlphaLetters,
    chipRadius,
    clientGroups,
    clientListItems,
    clientsViewabilityConfig,
    closeFilterSheet: closeFilters,
    controlRadius,
    flatListRef,
    filteredClients,
    focusedAlphaLetter: alphaRailFocusedLetter,
    formatLastVisitLabel,
    handleAlphaRailInteractionEnd,
    handleAlphaRailInteractionStart,
    handleClearSearch,
    handleClientsScroll,
    handleClientsScrollBeginDrag,
    handleClientsScrollRelease,
    handleClientsViewableItemsChanged,
    handleRefresh,
    handleSearchSubmit,
    handleScrollToIndexFailed,
    hasClients,
    hasActiveFilters: activeFilterCount > 0,
    hasFilteredClients,
    filterSheetOpen: showFilters,
    followUpFilter,
    insets,
    isActive,
    isGlass,
    isGlassLight,
    isRefreshPullActive,
    isRefreshing,
    isRefreshThresholdReached,
    lineColor,
    jumpToLetter,
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
    setGroupFilter,
    setFollowUpFilter,
    setVisitFilter,
    showFilters,
    showStatus,
    shouldShowAlphaRail,
    statusFilter,
    tagFilter,
    toggleFilters,
    topInset,
    groupFilter,
    visitFilter,
  }
}

export type ClientsScreenModel = ReturnType<typeof useClientsScreenModel>
