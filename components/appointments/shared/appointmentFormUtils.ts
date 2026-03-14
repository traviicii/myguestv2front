import type { ServiceOption } from 'components/data/api/services'

export function parseAppointmentPrice(value: string) {
  const cleaned = value.replace(/[^\d.]/g, '')
  if (!cleaned) return null
  const parsed = Number(cleaned)
  return Number.isNaN(parsed) ? null : parsed
}

export function formatPriceFromCents(value: number | null | undefined) {
  if (value === null || value === undefined) return ''
  return (value / 100).toFixed(2).replace(/\.00$/, '')
}

export function getSelectedServices(
  serviceCatalog: ServiceOption[],
  selectedServiceIds: number[]
) {
  return serviceCatalog.filter((service) => selectedServiceIds.includes(service.id))
}

export function getSelectedServiceSummary(
  selectedServices: Pick<ServiceOption, 'name'>[]
) {
  if (selectedServices.length === 0) return 'Select services'
  if (selectedServices.length === 1) return selectedServices[0].name
  return `${selectedServices[0].name} +${selectedServices.length - 1}`
}

export function getSuggestedPriceCents(
  selectedServices: Pick<ServiceOption, 'defaultPriceCents'>[]
) {
  const prices = selectedServices
    .map((service) => service.defaultPriceCents)
    .filter((value): value is number => typeof value === 'number')
  if (!prices.length) return null
  return prices.reduce((sum, value) => sum + value, 0)
}

export function prependImages(current: string[], uris: string[]) {
  if (!uris.length) return current
  return [...uris, ...current]
}

export function removeImageAtIndex(current: string[], index: number) {
  return current.filter((_, idx) => idx !== index)
}

export function moveImageToFront(current: string[], index: number) {
  if (index <= 0 || index >= current.length) return current
  const next = [...current]
  const [cover] = next.splice(index, 1)
  next.unshift(cover)
  return next
}
