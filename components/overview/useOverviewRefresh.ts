import { usePullToRefresh } from 'components/ui/usePullToRefresh'

export function useOverviewRefresh({
  refetchAppointments,
  refetchClients,
  refetchOverviewMetrics,
}: {
  refetchAppointments: () => Promise<unknown>
  refetchClients: () => Promise<unknown>
  refetchOverviewMetrics: () => Promise<unknown>
}) {
  return usePullToRefresh({
    onRefreshAction: async () => {
      await Promise.all([
        refetchClients(),
        refetchAppointments(),
        refetchOverviewMetrics(),
      ])
    },
  })
}
