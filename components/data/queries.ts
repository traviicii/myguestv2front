import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  appointmentHistory as mockAppointmentHistory,
  clients as mockClients,
  colorAnalysisByClient,
  imagesByClient,
} from 'components/mockData'
import {
  type CreateClientInput,
  createClientViaApi,
  fetchAppointmentHistoryFromApi,
  fetchClientsFromApi,
} from './api'

const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true'

// These hooks are the app's data boundary. They currently return local
// testing collections and can be replaced with real API-backed fetchers
// without changing screen-level query usage.
export function useClients() {
  return useQuery({
    queryKey: ['clients', USE_MOCK_DATA ? 'mock' : 'api'],
    queryFn: async () => {
      if (USE_MOCK_DATA) return mockClients
      return fetchClientsFromApi()
    },
    initialData: USE_MOCK_DATA ? mockClients : undefined,
  })
}

export function useAppointmentHistory() {
  return useQuery({
    queryKey: ['appointments', USE_MOCK_DATA ? 'mock' : 'api'],
    queryFn: async () => {
      if (USE_MOCK_DATA) return mockAppointmentHistory
      return fetchAppointmentHistoryFromApi()
    },
    initialData: USE_MOCK_DATA ? mockAppointmentHistory : undefined,
  })
}

export function useColorAnalysisByClient() {
  return useQuery({
    queryKey: ['color-analysis'],
    queryFn: async () => colorAnalysisByClient,
    initialData: colorAnalysisByClient,
  })
}

export function useImagesByClient() {
  return useQuery({
    queryKey: ['client-images'],
    queryFn: async () => imagesByClient,
    initialData: imagesByClient,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateClientInput) => {
      if (USE_MOCK_DATA) {
        throw new Error(
          'Mock data mode is enabled. Set EXPO_PUBLIC_USE_MOCK_DATA=false to create clients in v2 backend.'
        )
      }
      return createClientViaApi(input)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
      ])
    },
  })
}
