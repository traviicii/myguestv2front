import type { CreateFormulaInput } from 'components/data/api/appointments'
import type { ServiceOption } from 'components/data/api/services'
import { parseAppointmentPrice } from 'components/appointments/shared/appointmentFormUtils'
import { buildFormulaImageInputs } from 'components/utils/formulaImages'
import { normalizeServiceName } from 'components/utils/services'

export type NewAppointmentForm = {
  date: string
  price: string
  notes: string
}

export function buildNewAppointmentInitialForm(defaultDate: string): NewAppointmentForm {
  return {
    date: defaultDate,
    price: '',
    notes: '',
  }
}

export function hasNewAppointmentDraftContent({
  form,
  images,
  selectedServiceIds,
}: {
  form: NewAppointmentForm
  images: string[]
  selectedServiceIds: number[]
}) {
  return Boolean(
    form.date.trim() || form.price.trim() || form.notes.trim() || selectedServiceIds.length || images.length
  )
}

export function toggleNewAppointmentServiceId(
  current: number[],
  serviceId: number
) {
  if (current.includes(serviceId)) {
    return current.filter((id) => id !== serviceId)
  }
  return [...current, serviceId]
}

export function getRequiredDateScrollTarget(requiredDateY?: number) {
  if (typeof requiredDateY !== 'number') {
    return null
  }
  return Math.max(0, requiredDateY - 12)
}

export function buildNewAppointmentCreateInput({
  clientId,
  form,
  images,
  selectedServiceIds,
  selectedServices,
}: {
  clientId: string
  form: NewAppointmentForm
  images: string[]
  selectedServiceIds: number[]
  selectedServices: Pick<ServiceOption, 'name'>[]
}): CreateFormulaInput {
  const primaryService = selectedServices[0]?.name

  return {
    clientId,
    serviceIds: selectedServiceIds,
    serviceType: primaryService ? normalizeServiceName(primaryService) : null,
    notes: form.notes,
    price: parseAppointmentPrice(form.price),
    date: form.date,
    images: buildFormulaImageInputs(images),
  }
}
