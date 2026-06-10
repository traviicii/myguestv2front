import { getDownloadURL, getStorage, ref as storageRef } from 'firebase/storage'

import { getFirebaseApp } from 'components/auth/firebaseClient'
import type { AppointmentImageRef } from 'components/data/models'
import { getRenderableImageUri } from 'components/utils/formulaImages'

const isFirebaseProvider = (value: string | undefined | null) =>
  (value ?? '').trim().toLowerCase() === 'firebase'

const uniqueNonEmpty = (values: string[]) => {
  const seen = new Set<string>()
  return values.filter((value) => {
    const trimmed = value.trim()
    if (!trimmed || seen.has(trimmed)) return false
    seen.add(trimmed)
    return true
  })
}

export async function resolveAppointmentImageUri(image: AppointmentImageRef) {
  const fallbackUri = getRenderableImageUri(image)
  const objectKey = image.objectKey?.trim()
  if (!isFirebaseProvider(image.storageProvider) || !objectKey) {
    return fallbackUri
  }

  try {
    const storage = getStorage(getFirebaseApp())
    return await getDownloadURL(storageRef(storage, objectKey))
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[appointment-image-resolver:failed]',
        image.fileName,
        error instanceof Error ? error.message : ''
      )
    }
    return fallbackUri
  }
}

export async function resolveAppointmentImageUris(imageRefs: AppointmentImageRef[]) {
  const resolved = await Promise.all(imageRefs.map(resolveAppointmentImageUri))
  return uniqueNonEmpty(resolved)
}
