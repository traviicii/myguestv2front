import { useMutation, useQuery } from '@tanstack/react-query'

import type { UpsertColorChartInput } from '../api/colorCharts'
import {
  MOCK_COLOR_ANALYSIS_BY_CLIENT,
  MOCK_IMAGES_BY_CLIENT,
} from '../mock/fixtures'
import { DATA_SOURCE_KIND, dataSource, initialIfMock, useDataQueryClient } from './shared'

export function useColorAnalysisByClient() {
  return useQuery({
    queryKey: ['color-analysis', DATA_SOURCE_KIND],
    refetchOnMount: 'always',
    queryFn: () => dataSource.fetchColorAnalysisByClient(),
    initialData: initialIfMock(MOCK_COLOR_ANALYSIS_BY_CLIENT),
  })
}

export function useColorAnalysisForClient(clientId?: string) {
  return useQuery({
    queryKey: ['color-analysis-client', DATA_SOURCE_KIND, clientId ?? 'none'],
    enabled: Boolean(clientId),
    refetchOnMount: 'always',
    queryFn: async () => {
      if (!clientId) return null
      return dataSource.fetchColorAnalysisForClient(clientId)
    },
  })
}

export function useUpsertColorAnalysisForClient() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: async ({
      clientId,
      input,
    }: {
      clientId: string
      input: UpsertColorChartInput
    }) => dataSource.upsertColorAnalysisForClient(clientId, input),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['color-analysis'] }),
        queryClient.invalidateQueries({
          queryKey: ['color-analysis-client', DATA_SOURCE_KIND, variables.clientId],
        }),
        queryClient.invalidateQueries({ queryKey: ['metrics', 'overview'] }),
      ])
    },
  })
}

export function useImagesByClient() {
  return useQuery({
    queryKey: ['client-images', DATA_SOURCE_KIND],
    queryFn: () => dataSource.fetchImagesByClient(),
    initialData: initialIfMock(MOCK_IMAGES_BY_CLIENT),
  })
}
