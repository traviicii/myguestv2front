import type { ServiceOption } from 'components/data/api/services'

export function hasServiceNameConflict(
  serviceCatalog: ServiceOption[],
  normalizedName: string,
  options?: { excludeServiceId?: number }
) {
  return serviceCatalog.some(
    (service) =>
      service.id !== options?.excludeServiceId &&
      service.normalizedName === normalizedName.toLowerCase()
  )
}

export function buildServiceReorderUpdates(
  activeServices: Pick<ServiceOption, 'id' | 'sortOrder'>[],
  serviceId: number,
  direction: 'up' | 'down'
) {
  const ids = activeServices.map((service) => service.id)
  const currentIndex = ids.indexOf(serviceId)
  if (currentIndex < 0) return []

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (targetIndex < 0 || targetIndex >= ids.length) return []

  const nextOrder = [...ids]
  const [moved] = nextOrder.splice(currentIndex, 1)
  nextOrder.splice(targetIndex, 0, moved)

  return nextOrder
    .map((id, index) => {
      const current = activeServices.find((service) => service.id === id)
      if (!current || current.sortOrder === index) {
        return null
      }
      return {
        serviceId: id,
        sortOrder: index,
      }
    })
    .filter((value): value is { serviceId: number; sortOrder: number } => Boolean(value))
}
