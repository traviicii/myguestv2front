import { useMemo } from 'react'
import { Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useToastController } from '@tamagui/toast'

import { useThemePrefs } from 'components/ThemePrefs'
import { PRIVACY_POLICY_URL, SUPPORT_URL } from 'components/data/config'
import { useExportMyData } from 'components/data/queries'
import { useStudioStore } from 'components/state/studioStore'

import { showSettingsInfo } from './settingsInfo'
import {
  appointmentDateOptions,
  avgTicketOptions,
  overviewSectionOptions,
  photoCoverageOptions,
  privacyHighlights,
} from './settingsModelConfig'
import {
  buildDisplayRows,
  clampPreviewCount,
  getSettingsCardTone,
} from './settingsModelUtils'
import type { PreviewCountSettingKey } from './settingsModelTypes'
import { useSettingsServiceManagement } from './useSettingsServiceManagement'

export function useSettingsScreenModel() {
  const insets = useSafeAreaInsets()
  const toast = useToastController()
  const topInset = Math.max(insets.top + 8, 16)
  const { aesthetic } = useThemePrefs()
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

  const openConfiguredUrl = async ({
    url,
    label,
    envKey,
  }: {
    url: string
    label: string
    envKey: string
  }) => {
    if (!url) {
      toast.show(`${label} unavailable`, {
        message: __DEV__
          ? `Set ${envKey} in .env before the release build.`
          : `${label} is not configured in this build yet.`,
      })
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
      url: PRIVACY_POLICY_URL,
      label: 'Privacy Policy',
      envKey: 'EXPO_PUBLIC_PRIVACY_POLICY_URL',
    })
  }

  const handleOpenSupport = async () => {
    await openConfiguredUrl({
      url: SUPPORT_URL,
      label: 'Support',
      envKey: 'EXPO_PUBLIC_SUPPORT_URL',
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
    avgTicketOptions,
    cardTone,
    displayRows,
    handleExportMyData,
    handleOpenPrivacyPolicy,
    handleOpenSupport,
    hasPrivacyPolicyUrl: Boolean(PRIVACY_POLICY_URL),
    hasSupportUrl: Boolean(SUPPORT_URL),
    isExportingData: exportMyData.isPending,
    privacySummary:
      'MyGuest stores your account identity, client contact details, notes, appointment history, color chart data, and optional appointment photos. Data export is CSV-only; images stay attached to appointments in the app.',
    overviewSectionOptions,
    photoCoverageOptions,
    privacyHighlights,
    setAppSettings,
    showInfo: showSettingsInfo,
    topInset,
    updatePreviewCount,
  }
}

export type SettingsScreenModel = ReturnType<typeof useSettingsScreenModel>
