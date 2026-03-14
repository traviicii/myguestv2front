import { useQuery } from '@tanstack/react-query'

import type { OverviewMetricsInput } from '../api/metrics'
import { DATA_SOURCE_KIND, dataSource } from './shared'

export function useOverviewMetrics(input?: OverviewMetricsInput) {
  return useQuery({
    queryKey: ['metrics', 'overview', DATA_SOURCE_KIND, input ?? 'none'],
    enabled: Boolean(input),
    queryFn: async () => {
      if (!input) return null
      return dataSource.fetchOverviewMetrics(input)
    },
  })
}
