import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  appointmentHistory as mockAppointmentHistory,
  clients as mockClients,
  colorAnalysisByClient,
  imagesByClient,
} from 'components/mockData'
import { DEFAULT_APPOINTMENT_SERVICES } from 'components/utils/services'
import {
  type CreateFormulaInput,
  type CreateServiceInput,
  type CreateClientInput,
  type UpdateFormulaInput,
  type UpdateServiceInput,
  createFormulaViaApi,
  createClientViaApi,
  createServiceViaApi,
  deactivateServiceViaApi,
  fetchAppointmentHistoryFromApi,
  fetchServicesFromApi,
  fetchColorAnalysisForClientFromApi,
  fetchColorAnalysisByClientFromApi,
  fetchClientsFromApi,
  reactivateServiceViaApi,
  updateFormulaViaApi,
  updateServiceViaApi,
} from './api'

const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true'
const mockServices = DEFAULT_APPOINTMENT_SERVICES.map((name, index) => ({
  id: index + 1,
  name,
  normalizedName: name.toLowerCase(),
  sortOrder: index,
  isActive: true,
}))

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
    queryKey: ['color-analysis', USE_MOCK_DATA ? 'mock' : 'api'],
    refetchOnMount: 'always',
    queryFn: async () => {
      if (USE_MOCK_DATA) return colorAnalysisByClient
      return fetchColorAnalysisByClientFromApi()
    },
    initialData: USE_MOCK_DATA ? colorAnalysisByClient : undefined,
  })
}

export function useColorAnalysisForClient(clientId?: string) {
  return useQuery({
    queryKey: ['color-analysis-client', USE_MOCK_DATA ? 'mock' : 'api', clientId ?? 'none'],
    enabled: Boolean(clientId),
    refetchOnMount: 'always',
    queryFn: async () => {
      if (!clientId) return null
      if (USE_MOCK_DATA) {
        const direct = colorAnalysisByClient[clientId]
        if (direct) return direct
        const legacyLikeId = /^\d+$/.test(clientId) ? `c-${clientId}` : clientId
        return colorAnalysisByClient[legacyLikeId] ?? null
      }
      return fetchColorAnalysisForClientFromApi(clientId)
    },
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

export function useServices(active: 'true' | 'false' | 'all' = 'true') {
  return useQuery({
    queryKey: ['services', USE_MOCK_DATA ? 'mock' : 'api', active],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        if (active === 'all') return mockServices
        if (active === 'false') return mockServices.filter((service) => !service.isActive)
        return mockServices.filter((service) => service.isActive)
      }
      return fetchServicesFromApi(active)
    },
    initialData: USE_MOCK_DATA
      ? active === 'all'
        ? mockServices
        : active === 'false'
          ? mockServices.filter((service) => !service.isActive)
          : mockServices.filter((service) => service.isActive)
      : undefined,
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateServiceInput) => {
      if (USE_MOCK_DATA) {
        throw new Error(
          'Mock data mode is enabled. Set EXPO_PUBLIC_USE_MOCK_DATA=false to manage services in v2 backend.'
        )
      }
      return createServiceViaApi(input)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['services'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
      ])
    },
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateServiceInput) => {
      if (USE_MOCK_DATA) {
        throw new Error(
          'Mock data mode is enabled. Set EXPO_PUBLIC_USE_MOCK_DATA=false to manage services in v2 backend.'
        )
      }
      return updateServiceViaApi(input)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['services'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
      ])
    },
  })
}

export function useDeactivateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (serviceId: number) => {
      if (USE_MOCK_DATA) {
        throw new Error(
          'Mock data mode is enabled. Set EXPO_PUBLIC_USE_MOCK_DATA=false to manage services in v2 backend.'
        )
      }
      await deactivateServiceViaApi(serviceId)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['services'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
      ])
    },
  })
}

export function useReactivateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (serviceId: number) => {
      if (USE_MOCK_DATA) {
        throw new Error(
          'Mock data mode is enabled. Set EXPO_PUBLIC_USE_MOCK_DATA=false to manage services in v2 backend.'
        )
      }
      return reactivateServiceViaApi(serviceId)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['services'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
      ])
    },
  })
}

export function useCreateAppointmentLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateFormulaInput) => {
      if (USE_MOCK_DATA) {
        throw new Error(
          'Mock data mode is enabled. Set EXPO_PUBLIC_USE_MOCK_DATA=false to create appointment logs in v2 backend.'
        )
      }
      return createFormulaViaApi(input)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
      ])
    },
  })
}

export function useUpdateAppointmentLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateFormulaInput) => {
      if (USE_MOCK_DATA) {
        throw new Error(
          'Mock data mode is enabled. Set EXPO_PUBLIC_USE_MOCK_DATA=false to update appointment logs in v2 backend.'
        )
      }
      return updateFormulaViaApi(input)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
      ])
    },
  })
}
