// Global studio-level settings and preferences for the current device.
// This store is persisted locally so users keep layout and personalization choices.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import {
  defaultAppSettings,
  defaultStudioPreferences,
  defaultStudioProfile,
  mergeStudioStoreState,
  normalizeQuickActionOrder,
} from './studioStoreConfig'
import { zustandStorage } from './storage'
import type { StudioStore } from './studioStoreTypes'

export type {
  AppSettings,
  AppointmentDateFormat,
  AutoRebookFrequency,
  AvgTicketRange,
  DataExportFrequency,
  OverviewSectionId,
  PhotoCoverageRange,
  QuickActionId,
  StudioPreferences,
  StudioProfile,
  StudioStore,
} from './studioStoreTypes'

// App-wide preference/profile settings that should persist for this device.
// This is intentionally a single store so settings updates can be coalesced
// and persisted with a single write.
export const useStudioStore = create<StudioStore>()(
  persist(
    (set) => ({
      profile: defaultStudioProfile,
      preferences: defaultStudioPreferences,
      appSettings: defaultAppSettings,
      pinnedClientIds: [],
      onboardingComplete: false,
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
      setOnboardingComplete: (complete) =>
        set(() => ({
          onboardingComplete: complete,
        })),
    }),
    {
      name: 'studio-store',
      storage: zustandStorage,
      merge: mergeStudioStoreState,
    }
  )
)
