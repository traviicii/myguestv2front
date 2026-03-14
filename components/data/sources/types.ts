import type {
  CreateClientInput,
  DeleteAccountInput,
  UpdateClientInput,
} from '../api/clients'
import type { CreateFormulaInput, UpdateFormulaInput } from '../api/appointments'
import type { UpsertColorChartInput } from '../api/colorCharts'
import type { OverviewMetrics, OverviewMetricsInput } from '../api/metrics'
import type { CreateServiceInput, ServiceOption, UpdateServiceInput } from '../api/services'
import type { AppointmentHistory, Client, ColorAnalysis } from '../models'

export type DataSourceKind = 'api' | 'mock'

export type DataSource = {
  kind: DataSourceKind
  fetchClients: () => Promise<Client[]>
  fetchAppointmentHistory: () => Promise<AppointmentHistory[]>
  fetchAppointmentHistoryLite: () => Promise<AppointmentHistory[]>
  fetchAppointmentDetail: (appointmentId: string) => Promise<AppointmentHistory | null>
  fetchOverviewMetrics: (input: OverviewMetricsInput) => Promise<OverviewMetrics>
  fetchColorAnalysisByClient: () => Promise<Record<string, ColorAnalysis>>
  fetchColorAnalysisForClient: (clientId: string) => Promise<ColorAnalysis | null>
  fetchImagesByClient: () => Promise<Record<string, number>>
  fetchServices: (active: 'true' | 'false' | 'all') => Promise<ServiceOption[]>
  createClient: (input: CreateClientInput) => Promise<Client>
  deleteClient: (clientId: string) => Promise<void>
  deleteAccount: (input: DeleteAccountInput) => Promise<unknown>
  updateClient: (input: UpdateClientInput) => Promise<Client>
  createService: (input: CreateServiceInput) => Promise<ServiceOption>
  updateService: (input: UpdateServiceInput) => Promise<ServiceOption>
  deactivateService: (serviceId: number) => Promise<void>
  reactivateService: (serviceId: number) => Promise<ServiceOption>
  permanentlyDeleteService: (serviceId: number) => Promise<void>
  createAppointmentLog: (input: CreateFormulaInput) => Promise<AppointmentHistory>
  updateAppointmentLog: (input: UpdateFormulaInput) => Promise<AppointmentHistory>
  upsertColorAnalysisForClient: (
    clientId: string,
    input: UpsertColorChartInput
  ) => Promise<ColorAnalysis>
}
