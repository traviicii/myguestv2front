import type { AppointmentHistory } from '../models'

import { fetchClientsFromApi } from './clients'
import { ApiRequestError, isNotFoundError, request } from './core'
import { sortAppointmentsNewestFirst, toAppointmentModel } from './appointmentApiMappers'
import {
  buildCreateFormulaPayload,
  buildFormulaListQuery,
  buildUpdateFormulaPayload,
  toFormulaClientId,
  toFormulaId,
} from './appointmentApiPayloads'
import type {
  ApiFormula,
  ApiFormulaListResponse,
  CreateFormulaInput,
  FormulaImageInput,
  FormulaListOptions,
  UpdateFormulaInput,
} from './appointmentApiTypes'

export type { CreateFormulaInput, FormulaImageInput, UpdateFormulaInput }

async function fetchFormulaPages(
  path: string,
  options?: FormulaListOptions,
  limit = 200
) {
  let offset = 0
  let total = 0
  const items: ApiFormula[] = []

  do {
    const response = await request<ApiFormulaListResponse>(
      `${path}?${buildFormulaListQuery(limit, offset, options)}`,
      { method: 'GET' }
    )
    total = response.total
    items.push(...response.items)
    offset += limit
    if (response.items.length === 0) break
  } while (items.length < total)

  return items
}

async function fetchFormulaPagesByClientFallback(options?: FormulaListOptions) {
  const clients = await fetchClientsFromApi()
  const formulaResponses = await Promise.all(
    clients.map((client) => fetchFormulaPages(`/clients/${client.id}/formulas`, options, 100))
  )
  return formulaResponses.flat()
}

function isInvalidAppointmentIdError(error: unknown) {
  return error instanceof Error && error.message.includes('Invalid appointment id.')
}

export async function createFormulaViaApi(
  input: CreateFormulaInput
): Promise<AppointmentHistory> {
  const clientId = toFormulaClientId(input.clientId)
  const response = await request<ApiFormula>(`/clients/${clientId}/formulas`, {
    method: 'POST',
    body: JSON.stringify(buildCreateFormulaPayload(input)),
  })

  return toAppointmentModel(response)
}

export async function updateFormulaViaApi(
  input: UpdateFormulaInput
): Promise<AppointmentHistory> {
  const formulaId = toFormulaId(input.formulaId)
  const response = await request<ApiFormula>(`/formulas/${formulaId}`, {
    method: 'PATCH',
    body: JSON.stringify(buildUpdateFormulaPayload(input)),
  })

  return toAppointmentModel(response)
}

export async function fetchAppointmentHistoryFromApi(
  options?: FormulaListOptions
): Promise<AppointmentHistory[]> {
  try {
    const items = await fetchFormulaPages('/formulas', options)
    return sortAppointmentsNewestFirst(items.map(toAppointmentModel))
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error
    }

    const items = await fetchFormulaPagesByClientFallback(options)
    return sortAppointmentsNewestFirst(items.map(toAppointmentModel))
  }
}

export async function fetchAppointmentHistoryLite(): Promise<AppointmentHistory[]> {
  return fetchAppointmentHistoryFromApi({
    fields: 'lite',
    include: ['images'],
    imageLimit: 1,
  })
}

export async function fetchAppointmentById(
  appointmentId: string
): Promise<AppointmentHistory | null> {
  try {
    const formulaId = toFormulaId(appointmentId)
    const response = await request<ApiFormula>(`/formulas/${formulaId}`, {
      method: 'GET',
    })
    return toAppointmentModel(response)
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return null
    }
    if (isInvalidAppointmentIdError(error)) {
      return null
    }
    throw error
  }
}
