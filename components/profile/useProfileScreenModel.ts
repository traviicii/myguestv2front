import { useEffect, useMemo, useState } from 'react'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  useThemePrefs,
} from 'components/ThemePrefs'
import { useAuth } from 'components/auth/AuthProvider'
import { useClientGroups, useServices } from 'components/data/queries'
import { useOverviewStore } from 'components/state/overviewStore'
import { useStudioStore } from 'components/state/studioStore'
import {
  formatPhoneForDisplay,
  formatPhoneForInput,
  normalizePhoneForStorage,
} from 'components/utils/phone'
import {
  buildThemeLabel,
} from './themeOptions'

const METRIC_LABELS: Record<string, string> = {
  revenueYtd: 'Revenue YTD',
  totalClients: 'Total Clients',
  activeClients: 'Active Clients',
  inactiveClients: 'Inactive Clients',
  avgTicket: 'Average Ticket',
  newClients90: 'New Clients',
  colorCoverage: 'Color Chart Coverage',
  photoCoverage: 'Photo Coverage',
}

const OVERVIEW_SECTION_LABELS: Record<string, string> = {
  quickActions: 'Quick Actions',
  metrics: 'Metrics',
  recentAppointments: 'Recent Appointments',
  recentClients: 'Recently Added',
  pinnedClients: 'Pinned',
}

const formatDateSummary = (
  dateDisplayFormat: 'short' | 'long',
  includeWeekday: boolean
) => {
  if (dateDisplayFormat === 'short') return 'MM/DD/YYYY'
  return includeWeekday ? 'Long format with weekday' : 'Long format'
}

export function useProfileScreenModel() {
  const insets = useSafeAreaInsets()
  const tabBarHeight = useBottomTabBarHeight()
  const topInset = Math.max(insets.top + 8, 16)
  const {
    mode,
    modePreference,
    palette,
    aesthetic,
  } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const isModern = aesthetic === 'modern'
  const sectionGap = 18
  const cardTone: 'secondary' | 'default' = isGlass ? 'secondary' : 'default'
  const { profile, setProfile, appSettings } = useStudioStore()
  const selectedMetrics = useOverviewStore((state) => state.selectedMetrics)
  const { user, signOutUser, canUseFirebaseAuth } = useAuth()
  const { data: activeServices = [] } = useServices('true')
  const { data: activeClientGroups = [] } = useClientGroups('true')
  const [isEditing, setIsEditing] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [draftProfile, setDraftProfile] = useState(() => ({
    ...profile,
    phone: formatPhoneForInput(profile.phone),
  }))

  useEffect(() => {
    setDraftProfile({
      ...profile,
      phone: formatPhoneForInput(profile.phone),
    })
  }, [profile])

  useEffect(() => {
    const nextProfile: Partial<typeof profile> = {}
    const firebaseEmail = user?.email?.trim()
    const firebaseName = user?.displayName?.trim()

    if (firebaseEmail && firebaseEmail !== profile.email) {
      nextProfile.email = firebaseEmail
    }
    if (firebaseName && !profile.name.trim()) {
      nextProfile.name = firebaseName
    }

    if (Object.keys(nextProfile).length > 0) {
      setProfile(nextProfile)
    }
  }, [profile.email, profile.name, setProfile, user?.displayName, user?.email])

  const isProfileDirty = useMemo(() => {
    return (
      draftProfile.name.trim() !== profile.name.trim() ||
      draftProfile.email.trim() !== profile.email.trim() ||
      normalizePhoneForStorage(draftProfile.phone) !== normalizePhoneForStorage(profile.phone)
    )
  }, [draftProfile.email, draftProfile.name, draftProfile.phone, profile.email, profile.name, profile.phone])
  const currentThemeLabel = buildThemeLabel(
    {
      aesthetic,
      modePreference,
      palette,
    },
    mode
  )

  const displayEmail = (user?.email ?? profile.email ?? '').trim()
  const displayName = profile.name.trim() || user?.displayName?.trim() || 'Add your name'
  const displayPhone = formatPhoneForDisplay(profile.phone)
  const showPhone = Boolean(displayPhone)

  const clientStatusSummary = !appSettings.clientsShowStatus
    ? `${activeClientGroups.length} client ${
        activeClientGroups.length === 1 ? 'group' : 'groups'
      } · Activity labels off`
    : `${appSettings.activeStatusMonths}-month active window · ${
        appSettings.clientsShowStatusList ? 'List on' : 'List off'
      } · ${activeClientGroups.length} ${
        activeClientGroups.length === 1 ? 'group' : 'groups'
      }`

  const visibleSectionLabels = Object.entries(appSettings.overviewSections)
    .filter(([, enabled]) => enabled)
    .map(([id]) => OVERVIEW_SECTION_LABELS[id] ?? id)

  const metricLabels = selectedMetrics.map((id) => METRIC_LABELS[id] ?? id)

  const overviewSummary = `${visibleSectionLabels.length} sections · ${
    metricLabels.length
  } metrics · ${appSettings.overviewRecentAppointmentsCount}/${
    appSettings.overviewRecentClientsCount
  }/${appSettings.clientDetailsAppointmentLogsCount} previews`

  const servicesSummary = `${activeServices.length} active ${
    activeServices.length === 1 ? 'service' : 'services'
  } for appointment logs`
  const datesSummary = formatDateSummary(
    appSettings.dateDisplayFormat,
    appSettings.dateLongIncludeWeekday
  )

  const handleSaveProfile = () => {
    if (!isProfileDirty) return
    setProfile({
      name: draftProfile.name.trim(),
      email: user?.email ?? draftProfile.email.trim(),
      phone: normalizePhoneForStorage(draftProfile.phone),
    })
    setIsEditing(false)
  }

  const handleCancelProfile = () => {
    setDraftProfile(profile)
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOutUser()
    } finally {
      setIsSigningOut(false)
    }
  }

  return {
    activeServices,
    activeClientGroups,
    aesthetic,
    appSettings,
    canSaveProfile: isProfileDirty,
    canUseFirebaseAuth,
    cardTone,
    clientStatusSummary,
    contentPaddingBottom: Math.max(32, tabBarHeight + insets.bottom + 18),
    currentThemeLabel,
    displayEmail,
    displayName,
    displayPhone,
    datesSummary,
    draftProfile,
    handleCancelProfile,
    handleSaveProfile,
    handleSignOut,
    isEditing,
    isGlass,
    isModern,
    isSigningOut,
    metricLabels,
    mode,
    modePreference,
    overviewSummary,
    palette,
    sectionGap,
    servicesSummary,
    setDraftProfile,
    setIsEditing,
    showPhone,
    topInset,
    user,
  }
}

export type ProfileScreenModel = ReturnType<typeof useProfileScreenModel>
