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
  buildClientDisplaySummary,
  buildDatesFormattingSummary,
  buildOverviewInsightsSummary,
  buildServicesLogsSummary,
  buildDisplayRows,
  clampPreviewCount,
  getSettingsCardTone,
} from './settingsModelUtils'
import type { PreviewCountSettingKey } from './settingsModelTypes'
import { useSettingsClientGroupManagement } from './useSettingsClientGroupManagement'
import { useSettingsServiceManagement } from './useSettingsServiceManagement'

export function useSettingsScreenModel() {
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const { aesthetic } = useThemePrefs()
  const cardTone = getSettingsCardTone(aesthetic)
  const { appSettings, setAppSettings } = useStudioStore()

  const clientGroupManagement = useSettingsClientGroupManagement()
  const activeClientGroupIds = useMemo(
    () => clientGroupManagement.activeClientGroups.map((group) => group.id),
    [clientGroupManagement.activeClientGroups]
  )
  const serviceManagement = useSettingsServiceManagement({ activeClientGroupIds })

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
  return {
    ...clientGroupManagement,
    ...serviceManagement,
    appSettings,
    appointmentDateOptions,
    clientDisplaySummary,
    avgTicketOptions,
    datesFormattingSummary,
    cardTone,
    displayRows,
    overviewSectionOptions,
    overviewInsightsSummary,
    photoCoverageOptions,
    setAppSettings,
    showInfo: showSettingsInfo,
    servicesLogsSummary,
    topInset,
    updatePreviewCount,
  }
}

export type SettingsScreenModel = ReturnType<typeof useSettingsScreenModel>
