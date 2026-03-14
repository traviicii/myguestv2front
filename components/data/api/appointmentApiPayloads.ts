import { normalizeServiceName } from 'components/utils/services'

import { toClientIdString } from './core'
import type {
  CreateFormulaInput,
  FormulaImageInput,
  FormulaListOptions,
  UpdateFormulaInput,
} from './appointmentApiTypes'

function normalizeServiceTypeInput(value: string | null | undefined) {
  const normalized = normalizeServiceName(value ?? '').trim()
  if (!normalized || normalized.toLowerCase() === 'service') return null
  return normalized
}

export function toFormulaClientId(clientId: string) {
  const normalized = toClientIdString(clientId)
  if (!normalized) {
    throw new Error('Invalid client id.')
  }
  return normalized
}

export function toFormulaId(formulaId: string) {
  const normalized = formulaId.replace(/^h-/, '').trim()
  if (!/^\d+$/.test(normalized)) {
    throw new Error('Invalid appointment id.')
  }
  return Number(normalized)
}

export function toServiceAtIso(value: string) {
  const trimmed = (value || '').trim()
  if (!trimmed) {
    throw new Error('Appointment date is required.')
  }

  const slashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slashMatch) {
    const month = slashMatch[1]
    const day = slashMatch[2]
    const year = slashMatch[3]
    return `${year}-${month}-${day}T00:00:00Z`
  }

  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoDateMatch) {
    return `${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}T00:00:00Z`
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString()
  }

  throw new Error('Invalid appointment date format.')
}

export function toPriceCents(price: number | null | undefined) {
  if (price === null || price === undefined || Number.isNaN(price)) return null
  return Math.round(price * 100)
}

export function buildFormulaServicePayload(
  serviceIds: number[] | undefined,
  serviceType: string | null | undefined
) {
  const normalizedIds = (serviceIds ?? []).filter((id) => Number.isFinite(id))
  const normalizedType = normalizeServiceTypeInput(serviceType)

  if (normalizedIds.length > 0) {
    return {
      service_ids: normalizedIds,
      service_type: normalizedType ?? null,
    }
  }

  if (normalizedType) {
    return {
      service_type: normalizedType,
    }
  }

  if (serviceIds !== undefined) {
    return {
      service_ids: [],
    }
  }

  return {}
}

export const toApiFormulaImagePayload = (image: FormulaImageInput) => ({
  storage_provider: image.storageProvider ?? null,
  public_url: image.publicUrl ?? null,
  object_key: image.objectKey ?? null,
  file_name: image.fileName ?? null,
})

export function buildFormulaListQuery(
  limit: number,
  offset: number,
  options?: FormulaListOptions
) {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  params.set('offset', String(offset))
  if (options?.fields) params.set('fields', options.fields)
  if (options?.include) {
    params.set('include', options.include.join(','))
  }
  if (options?.imageLimit !== undefined) {
    params.set('image_limit', String(options.imageLimit))
  }
  return params.toString()
}

export function buildCreateFormulaPayload(input: CreateFormulaInput) {
  return {
    ...buildFormulaServicePayload(input.serviceIds, input.serviceType),
    notes: input.notes?.trim() || null,
    price_cents: toPriceCents(input.price),
    service_at: toServiceAtIso(input.date),
    images: input.images?.map(toApiFormulaImagePayload) ?? [],
  }
}

export function buildUpdateFormulaPayload(input: UpdateFormulaInput) {
  const payload: Record<string, unknown> = {}

  if (input.serviceIds !== undefined || input.serviceType !== undefined) {
    Object.assign(payload, buildFormulaServicePayload(input.serviceIds, input.serviceType))
  }
  if (input.notes !== undefined) payload.notes = input.notes?.trim() || null
  if (input.price !== undefined) payload.price_cents = toPriceCents(input.price)
  if (input.date !== undefined) payload.service_at = toServiceAtIso(input.date)
  if (input.images !== undefined) payload.images = input.images.map(toApiFormulaImagePayload)

  return payload
}
