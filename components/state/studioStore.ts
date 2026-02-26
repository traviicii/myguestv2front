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
  overviewQuickActions: Record<QuickActionId, boolean>
  overviewQuickActionOrder: QuickActionId[]
  overviewSections: Record<OverviewSectionId, boolean>
  activeStatusMonths: number
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
          },
          pinnedClientIds: persistedState.pinnedClientIds ?? current.pinnedClientIds,
        }
      },
    }
  )
)
