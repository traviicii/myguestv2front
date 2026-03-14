import { useMutation, useQuery } from '@tanstack/react-query'

import type { CreateServiceInput, UpdateServiceInput } from '../api/services'
import { MOCK_SERVICES } from '../sources/mock'
import { DATA_SOURCE_KIND, dataSource, initialIfMock, useDataQueryClient } from './shared'

export function useServices(active: 'true' | 'false' | 'all' = 'true') {
  const initialServices =
    active === 'all'
      ? MOCK_SERVICES
      : active === 'false'
        ? MOCK_SERVICES.filter((service) => !service.isActive)
        : MOCK_SERVICES.filter((service) => service.isActive)

  return useQuery({
    queryKey: ['services', DATA_SOURCE_KIND, active],
    queryFn: () => dataSource.fetchServices(active),
    initialData: initialIfMock(initialServices),
  })
}

export function useCreateService() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (input: CreateServiceInput) => dataSource.createService(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['services'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
      ])
    },
  })
}

export function useUpdateService() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (input: UpdateServiceInput) => dataSource.updateService(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['services'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
      ])
    },
  })
}

export function useDeactivateService() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (serviceId: number) => dataSource.deactivateService(serviceId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['services'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
      ])
    },
  })
}

export function useReactivateService() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (serviceId: number) => dataSource.reactivateService(serviceId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['services'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
      ])
    },
  })
}

export function usePermanentlyDeleteService() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (serviceId: number) => dataSource.permanentlyDeleteService(serviceId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['services'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
      ])
    },
  })
}
