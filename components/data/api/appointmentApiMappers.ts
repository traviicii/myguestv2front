import type { AppointmentHistory, AppointmentImageRef } from '../models'

import { normalizeServiceName } from 'components/utils/services'

import type { ApiFormula } from './appointmentApiTypes'

function normalizeServiceType(rawType: string | null | undefined) {
  const normalized = normalizeServiceName(rawType ?? '')
  if (!normalized) return 'Service'
  return normalized
}

function toAppointmentImageRefs(formula: ApiFormula): AppointmentImageRef[] {
  return (
    formula.images?.map((image) => ({
      storageProvider: image.storage_provider,
      publicUrl: image.public_url ?? null,
      objectKey: image.object_key ?? null,
      fileName: image.file_name,
    })) ?? []
  )
}

export function toAppointmentModel(formula: ApiFormula): AppointmentHistory {
  const imageRefs = toAppointmentImageRefs(formula)
  const images = imageRefs
    .map((image) => image.publicUrl ?? image.objectKey ?? '')
    .filter(Boolean)
  const serviceRows = [...(formula.services ?? [])].sort((a, b) => a.position - b.position)
  const serviceLabels = serviceRows
    .map((item) => normalizeServiceName(item.name || item.label_snapshot || ''))
    .filter(Boolean)
  const serviceIds = serviceRows.map((item) => item.service_id)
  const primaryService = serviceLabels[0] ?? normalizeServiceType(formula.service_type)

  return {
    id: `h-${formula.id}`,
    clientId: String(formula.client_id),
    date: formula.service_at,
    services: primaryService,
    serviceIds: serviceIds.length ? serviceIds : undefined,
    serviceLabels: serviceLabels.length ? serviceLabels : undefined,
    price: formula.price_cents ? formula.price_cents / 100 : 0,
    notes: formula.notes ?? '',
    images,
    imageRefs: imageRefs.length ? imageRefs : undefined,
  }
}

export function sortAppointmentsNewestFirst(appointments: AppointmentHistory[]) {
  return [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}
