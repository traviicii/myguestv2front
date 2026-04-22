import { useMemo } from 'react'
import { useRouter } from 'expo-router'
import { Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useToastController } from '@tamagui/toast'

import { useThemePrefs } from 'components/ThemePrefs'
import { useAuth } from 'components/auth/AuthProvider'
import { PRIVACY_POLICY_URL, SUPPORT_URL } from 'components/data/config'
import { useExportMyData } from 'components/data/queries'
import { privacyHighlights, privacySummary } from 'components/privacy/content'
import { useStudioStore } from 'components/state/studioStore'

import { showSettingsInfo } from './settingsInfo'
import {
  appointmentDateOptions,
  avgTicketOptions,
  overviewSectionOptions,
  photoCoverageOptions,
} from './settingsModelConfig'
import {
  buildClientDisplaySummary,
  buildDatesFormattingSummary,
  buildOverviewInsightsSummary,
  buildServicesLogsSummary,
  buildDisplayRows,
  clampPreviewCount,
  getSettingsCardTone,
} from './settingsModelUtils'
import type { PreviewCountSettingKey } from './settingsModelTypes'
import { useSettingsServiceManagement } from './useSettingsServiceManagement'

export function useSettingsScreenModel() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToastController()
  const topInset = Math.max(insets.top + 8, 16)
  const { aesthetic } = useThemePrefs()
  const { user } = useAuth()
  const cardTone = getSettingsCardTone(aesthetic)
  const { appSettings, setAppSettings } = useStudioStore()

  const serviceManagement = useSettingsServiceManagement()
  const exportMyData = useExportMyData()

  const displayRows = useMemo(
    () =>
      buildDisplayRows({
        clientDetailsAppointmentLogsCount:
          appSettings.clientDetailsAppointmentLogsCount,
        overviewRecentAppointmentsCount: appSettings.overviewRecentAppointmentsCount,
        overviewRecentClientsCount: appSettings.overviewRecentClientsCount,
      }),
    [
      appSettings.clientDetailsAppointmentLogsCount,
      appSettings.overviewRecentAppointmentsCount,
      appSettings.overviewRecentClientsCount,
    ]
  )

  const updatePreviewCount = (key: PreviewCountSettingKey, delta: number) => {
    setAppSettings({
      [key]: clampPreviewCount(appSettings[key], delta),
    })
  }

  const visibleSectionsCount = Object.values(appSettings.overviewSections).filter(Boolean).length
  const clientDisplaySummary = buildClientDisplaySummary(appSettings)
  const overviewInsightsSummary = buildOverviewInsightsSummary({
    appSettings,
    visibleSectionsCount,
  })
  const servicesLogsSummary = buildServicesLogsSummary({
    activeServicesCount: serviceManagement.activeServices.length,
    inactiveServicesCount: serviceManagement.inactiveServices.length,
  })
  const datesFormattingSummary = buildDatesFormattingSummary(appSettings)
  const accountPrivacySummary = user?.email?.trim()
    ? `Signed in as ${user.email.trim()}`
    : 'Support, privacy, exports, and account actions'

  const openConfiguredUrl = async ({
    fallbackHref,
    url,
    label,
  }: {
    fallbackHref: '/privacy-policy' | '/support'
    url: string
    label: string
  }) => {
    if (!url) {
      router.push(fallbackHref)
      return
    }

    try {
      await Linking.openURL(url)
    } catch (error) {
      toast.show(`Unable to open ${label.toLowerCase()}`, {
        message: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const handleOpenPrivacyPolicy = async () => {
    await openConfiguredUrl({
      fallbackHref: '/privacy-policy',
      url: PRIVACY_POLICY_URL,
      label: 'Privacy Policy',
    })
  }

  const handleOpenSupport = async () => {
    await openConfiguredUrl({
      fallbackHref: '/support',
      url: SUPPORT_URL,
      label: 'Support',
    })
  }

  const handleExportMyData = async () => {
    try {
      const result = await exportMyData.mutateAsync()
      toast.show('Export ready', {
        message:
          result.method === 'share'
            ? `${result.fileName} is ready to share or save.`
            : `${result.fileName} downloaded successfully.`,
      })
    } catch (error) {
      toast.show('Export failed', {
        message: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  return {
    ...serviceManagement,
    appSettings,
    appointmentDateOptions,
    clientDisplaySummary,
    avgTicketOptions,
    datesFormattingSummary,
    cardTone,
    displayRows,
    accountPrivacySummary,
    handleExportMyData,
    handleOpenPrivacyPolicy,
    handleOpenSupport,
    hasPrivacyPolicyUrl: Boolean(PRIVACY_POLICY_URL),
    hasSupportUrl: Boolean(SUPPORT_URL),
    isExportingData: exportMyData.isPending,
    privacySummary: `${privacySummary} Data export is CSV-only; images stay attached to appointments in the app.`,
    overviewSectionOptions,
    overviewInsightsSummary,
    photoCoverageOptions,
    privacyHighlights,
    setAppSettings,
    showInfo: showSettingsInfo,
    servicesLogsSummary,
    topInset,
    updatePreviewCount,
  }
}

export type SettingsScreenModel = ReturnType<typeof useSettingsScreenModel>
