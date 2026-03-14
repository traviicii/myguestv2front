import type { UpdateFormulaInput } from 'components/data/api/appointments'
import type { ServiceOption } from 'components/data/api/services'
import type { AppointmentHistory } from 'components/data/models'
import { parseAppointmentPrice } from 'components/appointments/shared/appointmentFormUtils'
import { buildFormulaImageInputs } from 'components/utils/formulaImages'
import { formatDateMMDDYYYY } from 'components/utils/date'
import { normalizeServiceName } from 'components/utils/services'

export type EditAppointmentForm = {
  date: string
  price: string
  notes: string
}

export function buildEditAppointmentInitialForm(
  appointment?: AppointmentHistory | null
): EditAppointmentForm {
  return {
    date: appointment ? formatDateMMDDYYYY(appointment.date) : '',
    price: appointment ? String(appointment.price) : '',
    notes: appointment?.notes ?? '',
  }
}

export function resolveInitialEditAppointmentServiceIds(
  appointment: AppointmentHistory | null | undefined,
  serviceCatalog: ServiceOption[]
): number[] | null {
  if (!appointment) return []

  const appointmentServiceIds = appointment.serviceIds ?? []
  if (appointmentServiceIds.length > 0 && serviceCatalog.length === 0) return null

  const validIds = appointmentServiceIds.filter((serviceId) =>
    serviceCatalog.some((service) => service.id === serviceId)
  )

  if (validIds.length > 0) return validIds
  if (!appointment.services) return []

  const normalized = normalizeServiceName(appointment.services).toLowerCase()
  const match = serviceCatalog.find((service) => service.normalizedName === normalized)
  return match ? [match.id] : []
}

export function hasEditAppointmentChanges({
  form,
  images,
  initialForm,
  initialImages,
  initialServiceIds,
  selectedServiceIds,
}: {
  form: EditAppointmentForm
  images: string[]
  initialForm: EditAppointmentForm
  initialImages: string[]
  initialServiceIds: number[]
  selectedServiceIds: number[]
}) {
  const selectedSnapshot = selectedServiceIds.join('|')
  const initialSnapshot = initialServiceIds.join('|')

  return (
    form.date !== initialForm.date ||
    form.price !== initialForm.price ||
    form.notes !== initialForm.notes ||
    selectedSnapshot !== initialSnapshot ||
    images.join('|') !== initialImages.join('|')
  )
}

export function resolveEditedAppointmentServiceType({
  appointment,
  initialServiceIds,
  selectedServiceIds,
  selectedServices,
}: {
  appointment: AppointmentHistory
  initialServiceIds: number[]
  selectedServiceIds: number[]
  selectedServices: Pick<ServiceOption, 'name'>[]
}) {
  const primaryService = selectedServices[0]?.name
  const normalizedPrimaryService = primaryService
    ? normalizeServiceName(primaryService)
    : null
  const canPreserveLegacy =
    !normalizedPrimaryService &&
    selectedServiceIds.length === 0 &&
    initialServiceIds.length === 0

  const legacyServiceRaw = (appointment.services || '').trim()
  const normalizedLegacyService = legacyServiceRaw
    ? normalizeServiceName(legacyServiceRaw)
    : null
  const legacyServiceType =
    normalizedLegacyService && normalizedLegacyService.toLowerCase() !== 'service'
      ? normalizedLegacyService
      : null

  return canPreserveLegacy ? legacyServiceType : normalizedPrimaryService
}

export function filterEditableAppointmentServices(
  serviceCatalog: ServiceOption[],
  selectedServiceIds: number[]
) {
  return serviceCatalog.filter(
    (service) => service.isActive || selectedServiceIds.includes(service.id)
  )
}

export function toggleEditAppointmentServiceId(current: number[], serviceId: number) {
  if (current.includes(serviceId)) {
    return current.filter((id) => id !== serviceId)
  }
  return [...current, serviceId]
}

export function getEditAppointmentRequiredDateScrollTarget(requiredDateY?: number) {
  if (typeof requiredDateY !== 'number') {
    return null
  }
  return Math.max(0, requiredDateY - 12)
}

export function buildEditAppointmentUpdateInput({
  appointment,
  form,
  images,
  initialServiceIds,
  selectedServiceIds,
  selectedServices,
}: {
  appointment: AppointmentHistory
  form: EditAppointmentForm
  images: string[]
  initialServiceIds: number[]
  selectedServiceIds: number[]
  selectedServices: Pick<ServiceOption, 'name'>[]
}): UpdateFormulaInput {
  return {
    formulaId: appointment.id,
    serviceIds: selectedServiceIds,
    serviceType: resolveEditedAppointmentServiceType({
      appointment,
      initialServiceIds,
      selectedServiceIds,
      selectedServices,
    }),
    notes: form.notes,
    price: parseAppointmentPrice(form.price),
    date: form.date,
    images: buildFormulaImageInputs(images, appointment.imageRefs ?? []),
  }
}
