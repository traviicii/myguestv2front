import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { zustandStorage } from './storage'

type OverviewSectionId =
  | 'quickActions'
  | 'metrics'
  | 'pinnedClients'
  | 'recentAppointments'
  | 'recentClients'

type OverviewStore = {
  showMetricEditor: boolean
  showQuickActionEditor: boolean
  showLayoutEditor: boolean
  selectedMetrics: string[]
  sectionOrder: OverviewSectionId[]
  toggleMetricEditor: () => void
  toggleQuickActionEditor: () => void
  toggleLayoutEditor: () => void
  setMetricSelection: (id: string, selected: boolean) => void
  setSelectedMetrics: (metrics: string[]) => void
  setSectionOrder: (order: OverviewSectionId[]) => void
}

const defaultMetrics = ['revenueYtd', 'totalClients', 'activeClients', 'avgTicket']
const defaultSectionOrder: OverviewSectionId[] = [
  'quickActions',
  'metrics',
  'pinnedClients',
  'recentAppointments',
  'recentClients',
]

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
        set((state) => {
          const hasMetric = state.selectedMetrics.includes(id)
          if (selected && !hasMetric) {
            return { selectedMetrics: [...state.selectedMetrics, id] }
          }
          if (!selected && hasMetric) {
            return {
              selectedMetrics: state.selectedMetrics.filter(
                (metric) => metric !== id
              ),
            }
          }
          return state
        }),
      setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }),
      setSectionOrder: (order) => set({ sectionOrder: order }),
    }),
    {
      name: 'overview-store',
      storage: zustandStorage,
      partialize: (state) => ({
        selectedMetrics: state.selectedMetrics,
        sectionOrder: state.sectionOrder,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<OverviewStore>
        const persistedOrder = persistedState.sectionOrder ?? current.sectionOrder
        // Keep newly introduced sections visible even if an older persisted
        // order does not include them yet.
        const normalizedOrder = [
          ...persistedOrder,
          ...current.sectionOrder.filter((id) => !persistedOrder.includes(id)),
        ]
        return {
          ...current,
          ...persistedState,
          sectionOrder: normalizedOrder,
        }
      },
    }
  )
)
