import { useMutation, useQuery } from '@tanstack/react-query'

import type {
  CreateClientInput,
  DeleteAccountInput,
  UpdateClientInput,
} from '../api/clients'
import { MOCK_CLIENTS } from '../mock/fixtures'
import { dataSource, initialIfMock, useDataQueryClient } from './shared'

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => dataSource.fetchClients(),
    initialData: initialIfMock(MOCK_CLIENTS),
  })
}

export function useCreateClient() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (input: CreateClientInput) => dataSource.createClient(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['metrics', 'overview'] }),
      ])
    },
  })
}

export function useUpdateClient() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (input: UpdateClientInput) => dataSource.updateClient(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['metrics', 'overview'] }),
      ])
    },
  })
}

export function useDeleteClient() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (clientId: string) => dataSource.deleteClient(clientId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['color-analysis'] }),
        queryClient.invalidateQueries({ queryKey: ['color-analysis-client'] }),
        queryClient.invalidateQueries({ queryKey: ['metrics', 'overview'] }),
      ])
    },
  })
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (input: DeleteAccountInput) => dataSource.deleteAccount(input),
  })
}
