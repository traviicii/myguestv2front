import { useEffect, useMemo, useState } from 'react'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  useThemePrefs,
} from 'components/ThemePrefs'
import { useAuth } from 'components/auth/AuthProvider'
import { useServices } from 'components/data/queries'
import { useOverviewStore } from 'components/state/overviewStore'
import { useStudioStore } from 'components/state/studioStore'
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
  recentClients: 'Recent Clients',
  pinnedClients: 'Pinned Clients',
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
  const sectionGap: '$5' | '$4' = isModern ? '$5' : '$4'
  const cardTone: 'secondary' | 'default' = isGlass ? 'secondary' : 'default'
  const { profile, setProfile, appSettings } = useStudioStore()
  const selectedMetrics = useOverviewStore((state) => state.selectedMetrics)
  const { user, signOutUser, canUseFirebaseAuth } = useAuth()
  const { data: activeServices = [] } = useServices('true')
  const [isEditing, setIsEditing] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [draftProfile, setDraftProfile] = useState(profile)

  useEffect(() => {
    setDraftProfile(profile)
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
      draftProfile.phone.trim() !== profile.phone.trim()
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
  const displayPhone = profile.phone.trim()
  const showPhone = Boolean(displayPhone)

  const clientStatusSummary = !appSettings.clientsShowStatus
    ? 'Status labels are hidden on client cards and detail screens.'
    : `Clients are marked active when they visited within ${appSettings.activeStatusMonths} months. ${appSettings.clientsShowStatusList ? 'Client list labels are on.' : 'Client list labels are off.'} ${appSettings.clientsShowStatusDetails ? 'Client detail labels are on.' : 'Client detail labels are off.'}`

  const visibleSectionLabels = Object.entries(appSettings.overviewSections)
    .filter(([, enabled]) => enabled)
    .map(([id]) => OVERVIEW_SECTION_LABELS[id] ?? id)

  const metricLabels = selectedMetrics.map((id) => METRIC_LABELS[id] ?? id)

  const overviewSummary = `${visibleSectionLabels.length} sections visible · ${metricLabels.length} metrics active · ${appSettings.overviewRecentAppointmentsCount}/${appSettings.overviewRecentClientsCount}/${appSettings.clientDetailsAppointmentLogsCount} preview counts`

  const servicesSummary = `${activeServices.length} active services · Dates show ${formatDateSummary(appSettings.dateDisplayFormat, appSettings.dateLongIncludeWeekday)}`

  const handleSaveProfile = () => {
    if (!isProfileDirty) return
    setProfile({
      name: draftProfile.name.trim(),
      email: user?.email ?? draftProfile.email.trim(),
      phone: draftProfile.phone.trim(),
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
