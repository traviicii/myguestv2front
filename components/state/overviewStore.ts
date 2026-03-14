// Personalization state for the Overview screen (layout + metric selection).
// Persisted locally so each device keeps its own configuration.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import {
  applyMetricSelection,
  defaultMetrics,
  defaultSectionOrder,
  mergeOverviewStoreState,
  normalizeOverviewSectionOrder,
} from './overviewStoreConfig'
import { zustandStorage } from './storage'
import type { OverviewStore } from './overviewStoreTypes'

export type { OverviewSectionId, OverviewStore } from './overviewStoreTypes'

// Stores personalization for the Overview screen: which cards are visible,
// in what order, and whether editor modes are currently open.
export const useOverviewStore = create<OverviewStore>()(
  persist(
    (set) => ({
      showMetricEditor: false,
      showQuickActionEditor: false,
      showLayoutEditor: false,
      selectedMetrics: defaultMetrics,
      sectionOrder: defaultSectionOrder,
      toggleMetricEditor: () =>
        set((state) => ({ showMetricEditor: !state.showMetricEditor })),
      toggleQuickActionEditor: () =>
        set((state) => ({
          showQuickActionEditor: !state.showQuickActionEditor,
        })),
      toggleLayoutEditor: () =>
        set((state) => ({ showLayoutEditor: !state.showLayoutEditor })),
      setMetricSelection: (id, selected) =>
        set((state) => ({
          selectedMetrics: applyMetricSelection(state.selectedMetrics, id, selected),
        })),
      setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }),
      setSectionOrder: (order) =>
        set({ sectionOrder: normalizeOverviewSectionOrder(order) }),
    }),
    {
      name: 'overview-store',
      storage: zustandStorage,
      partialize: (state) => ({
        selectedMetrics: state.selectedMetrics,
        sectionOrder: state.sectionOrder,
      }),
      merge: mergeOverviewStoreState,
    }
  )
)
