import type { OverviewStore, OverviewSectionId } from './overviewStoreTypes'

// Default metric set for first-time users and for recovering from bad local state.
export const defaultMetrics = ['revenueYtd', 'totalClients', 'activeClients', 'avgTicket']

// Default layout order. New sections are appended in the merge function below.
export const defaultSectionOrder: OverviewSectionId[] = [
  'quickActions',
  'metrics',
  'pinnedClients',
  'recentAppointments',
  'recentClients',
]

export const normalizeOverviewSectionOrder = (order?: OverviewSectionId[]) => {
  const unique = Array.from(
    new Set((order ?? []).filter((id) => defaultSectionOrder.includes(id)))
  )
  defaultSectionOrder.forEach((id) => {
    if (!unique.includes(id)) {
      unique.push(id)
    }
  })
  return unique
}

export const applyMetricSelection = (
  selectedMetrics: string[],
  metricId: string,
  selected: boolean
) => {
  const hasMetric = selectedMetrics.includes(metricId)
  if (selected && !hasMetric) {
    return [...selectedMetrics, metricId]
  }
  if (!selected && hasMetric) {
    return selectedMetrics.filter((metric) => metric !== metricId)
  }
  return selectedMetrics
}

export const mergeOverviewStoreState = (
  persisted: unknown,
  current: OverviewStore
): OverviewStore => {
  const persistedState = (persisted as Partial<OverviewStore> | undefined) ?? {}
  return {
    ...current,
    ...persistedState,
    sectionOrder: normalizeOverviewSectionOrder(
      persistedState.sectionOrder ?? current.sectionOrder
    ),
  }
}
