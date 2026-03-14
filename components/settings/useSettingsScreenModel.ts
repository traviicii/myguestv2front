import { useMemo } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useThemePrefs } from 'components/ThemePrefs'
import { useStudioStore } from 'components/state/studioStore'

import { showSettingsInfo } from './settingsInfo'
import {
  appointmentDateOptions,
  avgTicketOptions,
  overviewSectionOptions,
  photoCoverageOptions,
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
  const topInset = Math.max(insets.top + 8, 16)
  const { aesthetic } = useThemePrefs()
  const cardTone = getSettingsCardTone(aesthetic)
  const { appSettings, setAppSettings } = useStudioStore()

  const serviceManagement = useSettingsServiceManagement()

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

  return {
    ...serviceManagement,
    appSettings,
    appointmentDateOptions,
    avgTicketOptions,
    cardTone,
    displayRows,
    overviewSectionOptions,
    photoCoverageOptions,
    setAppSettings,
    showInfo: showSettingsInfo,
    topInset,
    updatePreviewCount,
  }
}

export type SettingsScreenModel = ReturnType<typeof useSettingsScreenModel>
