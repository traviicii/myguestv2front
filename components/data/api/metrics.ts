import { request } from './core'

type ApiOverviewMetrics = {
  revenue_ytd: number
  avg_ticket: number
  total_clients: number
  active_clients: number
  inactive_clients: number
  new_clients_90: number
  service_mix_label: string
  service_mix_percent: number
  color_coverage_percent: number
  photo_coverage_percent: number
}

export type OverviewMetrics = {
  revenueYtd: number
  avgTicket: number
  totalClients: number
  activeClients: number
  inactiveClients: number
  newClients90: number
  serviceMixLabel: string
  serviceMixPercent: number
  colorCoveragePercent: number
  photoCoveragePercent: number
}

export type OverviewMetricsInput = {
  activeCutoff: string
  yearStart: string
  avgTicketCutoff?: string | null
  photoCutoff?: string | null
  newClientsCutoff: string
}

export async function fetchOverviewMetrics(
  input: OverviewMetricsInput
): Promise<OverviewMetrics> {
  const params = new URLSearchParams()
  params.set('active_cutoff', input.activeCutoff)
  params.set('year_start', input.yearStart)
  params.set('new_clients_cutoff', input.newClientsCutoff)
  if (input.avgTicketCutoff) params.set('avg_ticket_cutoff', input.avgTicketCutoff)
  if (input.photoCutoff) params.set('photo_cutoff', input.photoCutoff)

  const response = await request<ApiOverviewMetrics>(`/metrics/overview?${params.toString()}`, {
    method: 'GET',
  })

  return {
    revenueYtd: response.revenue_ytd,
    avgTicket: response.avg_ticket,
    totalClients: response.total_clients,
    activeClients: response.active_clients,
    inactiveClients: response.inactive_clients,
    newClients90: response.new_clients_90,
    serviceMixLabel: response.service_mix_label,
    serviceMixPercent: response.service_mix_percent,
    colorCoveragePercent: response.color_coverage_percent,
    photoCoveragePercent: response.photo_coverage_percent,
  }
}
