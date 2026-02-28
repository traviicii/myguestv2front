import type { FormulaImageInput } from 'components/data/api'
import type { AppointmentImageRef } from 'components/mockData'

const fallbackFileName = (index: number) => `image-${index + 1}.jpg`

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value)

export const getImageDisplayUri = (image: AppointmentImageRef) =>
  image.publicUrl ?? image.objectKey ?? ''

export const deriveImageFileName = (value: string, index: number) => {
  const trimmed = value.trim()
  if (!trimmed) return fallbackFileName(index)
  const withoutQuery = trimmed.split('?')[0].split('#')[0]
  const lastSegment = withoutQuery.split('/').filter(Boolean).pop()
  if (!lastSegment) return fallbackFileName(index)
  return decodeURIComponent(lastSegment)
}

export const buildFormulaImageInputs = (
  imageUris: string[],
  existingRefs: AppointmentImageRef[] = []
): FormulaImageInput[] => {
  const existingByUri = new Map<string, AppointmentImageRef>()
  existingRefs.forEach((ref) => {
    const key = getImageDisplayUri(ref).trim()
    if (!key) return
    existingByUri.set(key, ref)
  })

  const seen = new Set<string>()
  const inputs: FormulaImageInput[] = []

  imageUris.forEach((uri, index) => {
    const trimmed = (uri || '').trim()
    if (!trimmed) return

    const existing = existingByUri.get(trimmed)
    const payload: FormulaImageInput = existing
      ? {
          storageProvider: existing.storageProvider,
          publicUrl: existing.publicUrl ?? undefined,
          objectKey: existing.objectKey ?? undefined,
          fileName: existing.fileName,
        }
      : isHttpUrl(trimmed) || trimmed.startsWith('file://')
        ? {
            storageProvider: isHttpUrl(trimmed) ? 'remote_url' : 'device_local',
            publicUrl: trimmed,
            fileName: deriveImageFileName(trimmed, index),
          }
        : {
            storageProvider: 'firebase',
            objectKey: trimmed,
            fileName: deriveImageFileName(trimmed, index),
          }

    const dedupeKey = `${payload.storageProvider ?? ''}|${payload.publicUrl ?? ''}|${
      payload.objectKey ?? ''
    }`
    if (seen.has(dedupeKey)) return
    seen.add(dedupeKey)
    inputs.push(payload)
  })

  return inputs
}
