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
  isLiveApiConfigured,
} from './api'

const USE_LIVE_API = isLiveApiConfigured()

// These hooks are the app's data boundary. They currently return local
// testing collections and can be replaced with real API-backed fetchers
// without changing screen-level query usage.
export function useClients() {
  return useQuery({
    queryKey: ['clients', USE_LIVE_API ? 'api' : 'mock'],
    queryFn: async () => {
      if (!USE_LIVE_API) return mockClients
      return fetchClientsFromApi()
    },
    initialData: USE_LIVE_API ? undefined : mockClients,
  })
}

export function useAppointmentHistory() {
  return useQuery({
    queryKey: ['appointments', USE_LIVE_API ? 'api' : 'mock'],
    queryFn: async () => {
      if (!USE_LIVE_API) return mockAppointmentHistory
      return fetchAppointmentHistoryFromApi()
    },
    initialData: USE_LIVE_API ? undefined : mockAppointmentHistory,
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
      if (!USE_LIVE_API) {
        throw new Error(
          'Live API is not configured. Set EXPO_PUBLIC_DEV_ID_TOKEN in .env to create clients in v2 backend.'
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
