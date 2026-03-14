export type AutoRebookFrequency = 'Off' | 'Weekly' | 'Monthly'
export type DataExportFrequency = 'Off' | 'Monthly' | 'Quarterly'
export type QuickActionId =
  | 'newClient'
  | 'newAppointmentLog'
  | 'newEmailAlert'
  | 'newTextAlert'
export type AppointmentDateFormat = 'short' | 'long'
export type AvgTicketRange = '3m' | '6m' | '12m' | '18m' | 'allTime'
export type PhotoCoverageRange = 'allTime' | '6m' | '12m'
export type OverviewSectionId =
  | 'quickActions'
  | 'metrics'
  | 'recentAppointments'
  | 'recentClients'
  | 'pinnedClients'

export type StudioProfile = {
  email: string
  name: string
  phone: string
}

export type StudioPreferences = {
  autoRebook: AutoRebookFrequency
  dataExports: DataExportFrequency
  notificationsEnabled: boolean
}

export type AppSettings = {
  activeStatusMonths: number
  avgTicketRange: AvgTicketRange
  clientDetailsAppointmentLogsCount: number
  clientsShowStatus: boolean
  clientsShowStatusDetails: boolean
  clientsShowStatusList: boolean
  dateDisplayFormat: AppointmentDateFormat
  dateLongIncludeWeekday: boolean
  overviewQuickActionOrder: QuickActionId[]
  overviewQuickActions: Record<QuickActionId, boolean>
  overviewRecentAppointmentsCount: number
  overviewRecentClientsCount: number
  overviewSections: Record<OverviewSectionId, boolean>
  photoCoverageRange: PhotoCoverageRange
}

export type StudioStore = {
  appSettings: AppSettings
  onboardingComplete: boolean
  pinnedClientIds: string[]
  preferences: StudioPreferences
  profile: StudioProfile
  setAppSettings: (settings: Partial<AppSettings>) => void
  setOnboardingComplete: (complete: boolean) => void
  setPreferences: (prefs: Partial<StudioPreferences>) => void
  setProfile: (profile: Partial<StudioProfile>) => void
  setQuickActionEnabled: (actionId: QuickActionId, enabled: boolean) => void
  setQuickActionOrder: (order: QuickActionId[]) => void
  togglePinnedClient: (clientId: string) => void
}
