import type { OverviewSectionId } from './studioStoreTypes'

export type { OverviewSectionId } from './studioStoreTypes'

export type OverviewStore = {
  sectionOrder: OverviewSectionId[]
  selectedMetrics: string[]
  setMetricSelection: (id: string, selected: boolean) => void
  setSectionOrder: (order: OverviewSectionId[]) => void
  setSelectedMetrics: (metrics: string[]) => void
  showLayoutEditor: boolean
  showMetricEditor: boolean
  showQuickActionEditor: boolean
  toggleLayoutEditor: () => void
  toggleMetricEditor: () => void
  toggleQuickActionEditor: () => void
}
