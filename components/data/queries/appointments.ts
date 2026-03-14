import { useMutation, useQuery } from '@tanstack/react-query'

import type { CreateFormulaInput, UpdateFormulaInput } from '../api/appointments'
import { MOCK_APPOINTMENT_HISTORY } from '../mock/fixtures'
import { DATA_SOURCE_KIND, dataSource, initialIfMock, useDataQueryClient } from './shared'

export function useAppointmentHistory() {
  return useQuery({
    queryKey: ['appointments', DATA_SOURCE_KIND, 'full'],
    queryFn: () => dataSource.fetchAppointmentHistory(),
    initialData: initialIfMock(MOCK_APPOINTMENT_HISTORY),
  })
}

export function useAppointmentHistoryLite() {
  return useQuery({
    queryKey: ['appointments', DATA_SOURCE_KIND, 'lite'],
    queryFn: () => dataSource.fetchAppointmentHistoryLite(),
    initialData: initialIfMock(MOCK_APPOINTMENT_HISTORY),
  })
}

export function useAppointmentDetail(appointmentId?: string) {
  return useQuery({
    queryKey: ['appointment-detail', DATA_SOURCE_KIND, appointmentId ?? 'none'],
    enabled: Boolean(appointmentId),
    queryFn: async () => {
      if (!appointmentId) return null
      return dataSource.fetchAppointmentDetail(appointmentId)
    },
  })
}

export function useCreateAppointmentLog() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (input: CreateFormulaInput) => dataSource.createAppointmentLog(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
        queryClient.invalidateQueries({ queryKey: ['metrics', 'overview'] }),
      ])
    },
  })
}

export function useUpdateAppointmentLog() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (input: UpdateFormulaInput) => dataSource.updateAppointmentLog(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
        queryClient.invalidateQueries({ queryKey: ['metrics', 'overview'] }),
        queryClient.invalidateQueries({ queryKey: ['appointment-detail'] }),
      ])
    },
  })
}
