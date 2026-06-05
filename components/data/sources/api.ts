import type { DataSource } from './types'
import {
  createClientViaApi,
  deleteAccountViaApi,
  deleteClientViaApi,
  fetchClientsFromApi,
  updateClientViaApi,
} from '../api/clients'
import {
  archiveClientGroupViaApi,
  createClientGroupViaApi,
  fetchClientGroupsFromApi,
  reactivateClientGroupViaApi,
  updateClientGroupViaApi,
} from '../api/clientGroups'
import { exportMyDataViaApi } from '../api/exports'
import {
  createFormulaViaApi,
  deleteFormulaViaApi,
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
  fetchClientGroups: fetchClientGroupsFromApi,
  fetchServices: fetchServicesFromApi,
  exportMyData: exportMyDataViaApi,
  createClient: createClientViaApi,
  deleteClient: deleteClientViaApi,
  deleteAccount: deleteAccountViaApi,
  updateClient: updateClientViaApi,
  createClientGroup: createClientGroupViaApi,
  updateClientGroup: updateClientGroupViaApi,
  archiveClientGroup: archiveClientGroupViaApi,
  reactivateClientGroup: reactivateClientGroupViaApi,
  createService: createServiceViaApi,
  updateService: updateServiceViaApi,
  deactivateService: deactivateServiceViaApi,
  reactivateService: reactivateServiceViaApi,
  permanentlyDeleteService: permanentlyDeleteServiceViaApi,
  createAppointmentLog: createFormulaViaApi,
  updateAppointmentLog: updateFormulaViaApi,
  deleteAppointmentLog: deleteFormulaViaApi,
  upsertColorAnalysisForClient: upsertColorAnalysisForClientViaApi,
}
