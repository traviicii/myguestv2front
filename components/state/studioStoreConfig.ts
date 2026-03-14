import type {
  AppSettings,
  AppointmentDateFormat,
  AvgTicketRange,
  PhotoCoverageRange,
  QuickActionId,
  StudioPreferences,
  StudioProfile,
  StudioStore,
} from './studioStoreTypes'

export const quickActionDefaults: QuickActionId[] = [
  'newClient',
  'newAppointmentLog',
  'newEmailAlert',
  'newTextAlert',
]

export const defaultStudioProfile: StudioProfile = {
  name: 'Travis Peck',
  email: 'travis@example.com',
  phone: '(555) 010-1240',
}

export const defaultStudioPreferences: StudioPreferences = {
  notificationsEnabled: true,
  autoRebook: 'Weekly',
  dataExports: 'Monthly',
}

export const defaultAppSettings: AppSettings = {
  clientsShowStatus: true,
  clientsShowStatusList: true,
  clientsShowStatusDetails: true,
  dateDisplayFormat: 'short',
  dateLongIncludeWeekday: true,
  overviewRecentAppointmentsCount: 3,
  overviewRecentClientsCount: 3,
  clientDetailsAppointmentLogsCount: 5,
  overviewQuickActions: {
    newClient: true,
    newAppointmentLog: true,
    newEmailAlert: false,
    newTextAlert: false,
  },
  overviewQuickActionOrder: quickActionDefaults,
  overviewSections: {
    quickActions: true,
    metrics: true,
    recentAppointments: true,
    recentClients: true,
    pinnedClients: true,
  },
  activeStatusMonths: 12,
  avgTicketRange: '12m',
  photoCoverageRange: '12m',
}

export const normalizeAppointmentDateFormat = (
  format: AppointmentDateFormat | 'shortWithToday' | string | undefined,
  fallback: AppointmentDateFormat
): AppointmentDateFormat => {
  if (format === 'long') return 'long'
  return fallback
}

export const normalizeQuickActionOrder = (order?: QuickActionId[]) => {
  const unique = Array.from(
    new Set((order ?? []).filter((id) => quickActionDefaults.includes(id)))
  )
  quickActionDefaults.forEach((id) => {
    if (!unique.includes(id)) {
      unique.push(id)
    }
  })
  return unique
}

export const normalizeAvgTicketRange = (
  value: AvgTicketRange | 'activeWindow' | string | undefined,
  activeMonths: number,
  fallback: AvgTicketRange
): AvgTicketRange => {
  if (value === 'allTime') return 'allTime'
  if (value === '3m' || value === '6m' || value === '12m' || value === '18m') {
    return value
  }
  if (value === 'activeWindow') {
    const mapped = `${activeMonths}m` as AvgTicketRange
    if (mapped === '3m' || mapped === '6m' || mapped === '12m' || mapped === '18m') {
      return mapped
    }
  }
  return fallback
}

export const clampPreviewCount = (value: number | undefined, fallback: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(12, Math.max(1, Math.round(value)))
}

type PersistedStudioAppSettings = Partial<AppSettings> & {
  appointmentDetailDateFormat?: AppointmentDateFormat | string
  appointmentPreviewDateFormat?: AppointmentDateFormat | string
}

type PersistedStudioState = Partial<StudioStore> & {
  appSettings?: PersistedStudioAppSettings
}

export const mergeStudioStoreState = (persisted: unknown, current: StudioStore): StudioStore => {
  const persistedState = (persisted as PersistedStudioState | undefined) ?? {}
  const merged = { ...current, ...persistedState }
  const persistedApp = persistedState.appSettings

  return {
    ...merged,
    profile: {
      ...current.profile,
      ...(persistedState.profile ?? {}),
    },
    preferences: {
      ...current.preferences,
      ...(persistedState.preferences ?? {}),
    },
    appSettings: {
      ...current.appSettings,
      ...(persistedApp ?? {}),
      overviewQuickActions: {
        ...current.appSettings.overviewQuickActions,
        ...(persistedApp?.overviewQuickActions ?? {}),
      },
      clientsShowStatusList:
        persistedApp?.clientsShowStatusList ?? current.appSettings.clientsShowStatusList,
      clientsShowStatusDetails:
        persistedApp?.clientsShowStatusDetails ?? current.appSettings.clientsShowStatusDetails,
      dateDisplayFormat: normalizeAppointmentDateFormat(
        persistedApp?.dateDisplayFormat ??
          persistedApp?.appointmentDetailDateFormat ??
          persistedApp?.appointmentPreviewDateFormat,
        current.appSettings.dateDisplayFormat
      ),
      dateLongIncludeWeekday:
        persistedApp?.dateLongIncludeWeekday ?? current.appSettings.dateLongIncludeWeekday,
      overviewRecentAppointmentsCount: clampPreviewCount(
        persistedApp?.overviewRecentAppointmentsCount,
        current.appSettings.overviewRecentAppointmentsCount
      ),
      overviewRecentClientsCount: clampPreviewCount(
        persistedApp?.overviewRecentClientsCount,
        current.appSettings.overviewRecentClientsCount
      ),
      clientDetailsAppointmentLogsCount: clampPreviewCount(
        persistedApp?.clientDetailsAppointmentLogsCount,
        current.appSettings.clientDetailsAppointmentLogsCount
      ),
      overviewQuickActionOrder: normalizeQuickActionOrder(
        persistedApp?.overviewQuickActionOrder ?? current.appSettings.overviewQuickActionOrder
      ),
      overviewSections: {
        ...current.appSettings.overviewSections,
        ...(persistedApp?.overviewSections ?? {}),
      },
      activeStatusMonths:
        persistedApp?.activeStatusMonths ?? current.appSettings.activeStatusMonths,
      avgTicketRange: normalizeAvgTicketRange(
        persistedApp?.avgTicketRange as AvgTicketRange,
        persistedApp?.activeStatusMonths ?? current.appSettings.activeStatusMonths,
        current.appSettings.avgTicketRange
      ),
      photoCoverageRange:
        (persistedApp?.photoCoverageRange as PhotoCoverageRange) ??
        current.appSettings.photoCoverageRange,
    },
    pinnedClientIds: persistedState.pinnedClientIds ?? current.pinnedClientIds,
  }
}
