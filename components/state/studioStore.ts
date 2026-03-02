import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { zustandStorage } from './storage'

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

type StudioProfile = {
  name: string
  email: string
  phone: string
}

type StudioPreferences = {
  notificationsEnabled: boolean
  autoRebook: AutoRebookFrequency
  dataExports: DataExportFrequency
}

type AppSettings = {
  clientsShowStatus: boolean
  clientsShowStatusList: boolean
  clientsShowStatusDetails: boolean
  dateDisplayFormat: AppointmentDateFormat
  dateLongIncludeWeekday: boolean
  overviewRecentAppointmentsCount: number
  overviewRecentClientsCount: number
  clientDetailsAppointmentLogsCount: number
  overviewQuickActions: Record<QuickActionId, boolean>
  overviewQuickActionOrder: QuickActionId[]
  overviewSections: Record<OverviewSectionId, boolean>
  activeStatusMonths: number
  avgTicketRange: AvgTicketRange
  photoCoverageRange: PhotoCoverageRange
}

type StudioStore = {
  profile: StudioProfile
  preferences: StudioPreferences
  appSettings: AppSettings
  pinnedClientIds: string[]
  setProfile: (profile: Partial<StudioProfile>) => void
  setPreferences: (prefs: Partial<StudioPreferences>) => void
  setAppSettings: (settings: Partial<AppSettings>) => void
  setQuickActionEnabled: (actionId: QuickActionId, enabled: boolean) => void
  setQuickActionOrder: (order: QuickActionId[]) => void
  togglePinnedClient: (clientId: string) => void
}

const quickActionDefaults: QuickActionId[] = [
  'newClient',
  'newAppointmentLog',
  'newEmailAlert',
  'newTextAlert',
]

const normalizeAppointmentDateFormat = (
  format: AppointmentDateFormat | 'shortWithToday' | string | undefined,
  fallback: AppointmentDateFormat
): AppointmentDateFormat => {
  if (format === 'long') return 'long'
  return fallback
}

const normalizeQuickActionOrder = (order?: QuickActionId[]) => {
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

const normalizeAvgTicketRange = (
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

const clampPreviewCount = (value: number | undefined, fallback: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(12, Math.max(1, Math.round(value)))
}

// App-wide preference/profile settings that should persist for this device.
export const useStudioStore = create<StudioStore>()(
  persist(
    (set) => ({
      profile: {
        name: 'Travis Peck',
        email: 'travis@example.com',
        phone: '(555) 010-1240',
      },
      preferences: {
        notificationsEnabled: true,
        autoRebook: 'Weekly',
        dataExports: 'Monthly',
      },
      appSettings: {
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
      },
      pinnedClientIds: [],
      setProfile: (profile) =>
        set((state) => ({
          profile: { ...state.profile, ...profile },
        })),
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
      setAppSettings: (settings) =>
        set((state) => ({
          appSettings: { ...state.appSettings, ...settings },
        })),
      setQuickActionEnabled: (actionId, enabled) =>
        set((state) => ({
          appSettings: {
            ...state.appSettings,
            overviewQuickActions: {
              ...state.appSettings.overviewQuickActions,
              [actionId]: enabled,
            },
            overviewQuickActionOrder: state.appSettings.overviewQuickActionOrder.includes(
              actionId
            )
              ? state.appSettings.overviewQuickActionOrder
              : [...state.appSettings.overviewQuickActionOrder, actionId],
          },
        })),
      setQuickActionOrder: (order) =>
        set((state) => ({
          appSettings: {
            ...state.appSettings,
            overviewQuickActionOrder: normalizeQuickActionOrder(order),
          },
        })),
      togglePinnedClient: (clientId) =>
        set((state) => {
          const isPinned = state.pinnedClientIds.includes(clientId)
          return {
            pinnedClientIds: isPinned
              ? state.pinnedClientIds.filter((id) => id !== clientId)
              : [...state.pinnedClientIds, clientId],
          }
        }),
    }),
    {
      name: 'studio-store',
      storage: zustandStorage,
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<StudioStore>
        const merged = { ...current, ...persistedState }
        const persistedApp = persistedState.appSettings as
          | (Partial<AppSettings> & {
              appointmentPreviewDateFormat?: AppointmentDateFormat | string
              appointmentDetailDateFormat?: AppointmentDateFormat | string
            })
          | undefined

        // Merge nested setting groups defensively so new defaults are not lost
        // when older persisted payloads are missing keys.
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
              persistedApp?.clientsShowStatusList ??
              current.appSettings.clientsShowStatusList,
            clientsShowStatusDetails:
              persistedApp?.clientsShowStatusDetails ??
              current.appSettings.clientsShowStatusDetails,
            dateDisplayFormat: normalizeAppointmentDateFormat(
              persistedApp?.dateDisplayFormat ??
                persistedApp?.appointmentDetailDateFormat ??
                persistedApp?.appointmentPreviewDateFormat,
              current.appSettings.dateDisplayFormat
            ),
            dateLongIncludeWeekday:
              persistedApp?.dateLongIncludeWeekday ??
              current.appSettings.dateLongIncludeWeekday,
            overviewRecentAppointmentsCount:
              clampPreviewCount(
                persistedApp?.overviewRecentAppointmentsCount,
                current.appSettings.overviewRecentAppointmentsCount
              ),
            overviewRecentClientsCount:
              clampPreviewCount(
                persistedApp?.overviewRecentClientsCount,
                current.appSettings.overviewRecentClientsCount
              ),
            clientDetailsAppointmentLogsCount:
              clampPreviewCount(
                persistedApp?.clientDetailsAppointmentLogsCount,
                current.appSettings.clientDetailsAppointmentLogsCount
              ),
            overviewQuickActionOrder: normalizeQuickActionOrder(
              persistedApp?.overviewQuickActionOrder ??
                current.appSettings.overviewQuickActionOrder
            ),
            overviewSections: {
              ...current.appSettings.overviewSections,
              ...(persistedApp?.overviewSections ?? {}),
            },
            activeStatusMonths:
              persistedApp?.activeStatusMonths ?? current.appSettings.activeStatusMonths,
            avgTicketRange:
              normalizeAvgTicketRange(
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
      },
    }
  )
)
