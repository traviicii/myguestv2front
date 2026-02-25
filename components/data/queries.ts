import { useQuery } from '@tanstack/react-query'
import {
  appointmentHistory,
  clients,
  colorAnalysisByClient,
  imagesByClient,
} from 'components/mockData'

// These hooks are the app's data boundary. They currently return local
// testing collections and can be replaced with real API-backed fetchers
// without changing screen-level query usage.
export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => clients,
    initialData: clients,
  })
}

export function useAppointmentHistory() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => appointmentHistory,
    initialData: appointmentHistory,
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
