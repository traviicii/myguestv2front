import { useRef, useState } from 'react'

export function useOverviewRefresh({
  refetchAppointments,
  refetchClients,
  refetchOverviewMetrics,
}: {
  refetchAppointments: () => Promise<unknown>
  refetchClients: () => Promise<unknown>
  refetchOverviewMetrics: () => Promise<unknown>
}) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isRefreshingRef = useRef(false)
  const minRefreshMs = 650

  const handleRefresh = async () => {
    if (isRefreshingRef.current) return
    isRefreshingRef.current = true
    setIsRefreshing(true)
    const startedAt = Date.now()
    try {
      await Promise.all([
        refetchClients(),
        refetchAppointments(),
        refetchOverviewMetrics(),
      ])
    } finally {
      const elapsed = Date.now() - startedAt
      if (elapsed < minRefreshMs) {
        await new Promise((resolve) => setTimeout(resolve, minRefreshMs - elapsed))
      }
      setIsRefreshing(false)
      isRefreshingRef.current = false
    }
  }

  return {
    handleRefresh,
    isRefreshing,
  }
}
