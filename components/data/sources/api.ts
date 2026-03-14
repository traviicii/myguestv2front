import type { DataSource } from './types'
import {
  createClientViaApi,
  deleteAccountViaApi,
  deleteClientViaApi,
  fetchClientsFromApi,
  updateClientViaApi,
} from '../api/clients'
import {
  createFormulaViaApi,
  fetchAppointmentById,
  fetchAppointmentHistoryFromApi,
  fetchAppointmentHistoryLite,
  updateFormulaViaApi,
} from '../api/appointments'
import {
  fetchColorAnalysisByClientFromApi,
  fetchColorAnalysisForClientFromApi,
  upsertColorAnalysisForClientViaApi,
} from '../api/colorCharts'
import { fetchOverviewMetrics } from '../api/metrics'
import {
  createServiceViaApi,
  deactivateServiceViaApi,
  fetchServicesFromApi,
  permanentlyDeleteServiceViaApi,
  reactivateServiceViaApi,
  updateServiceViaApi,
} from '../api/services'

export const apiDataSource: DataSource = {
  kind: 'api',
  fetchClients: fetchClientsFromApi,
  fetchAppointmentHistory: fetchAppointmentHistoryFromApi,
  fetchAppointmentHistoryLite,
  fetchAppointmentDetail: fetchAppointmentById,
  fetchOverviewMetrics,
  fetchColorAnalysisByClient: fetchColorAnalysisByClientFromApi,
  fetchColorAnalysisForClient: fetchColorAnalysisForClientFromApi,
  fetchImagesByClient: async () => ({}),
  fetchServices: fetchServicesFromApi,
  createClient: createClientViaApi,
  deleteClient: deleteClientViaApi,
  deleteAccount: deleteAccountViaApi,
  updateClient: updateClientViaApi,
  createService: createServiceViaApi,
  updateService: updateServiceViaApi,
  deactivateService: deactivateServiceViaApi,
  reactivateService: reactivateServiceViaApi,
  permanentlyDeleteService: permanentlyDeleteServiceViaApi,
  createAppointmentLog: createFormulaViaApi,
  updateAppointmentLog: updateFormulaViaApi,
  upsertColorAnalysisForClient: upsertColorAnalysisForClientViaApi,
}
