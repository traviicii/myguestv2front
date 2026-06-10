import { File } from 'expo-file-system'
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage'

import { getFirebaseAuth, getFirebaseApp } from 'components/auth/firebaseClient'
import type { FormulaImageInput } from 'components/data/api/appointments'
import type { AppointmentImageRef } from 'components/data/models'
import { deriveImageFileName, getImageDisplayUri } from 'components/utils/formulaImages'

const localImageSchemePattern = /^(file|content|ph|assets-library):\/\//i
const httpUrlPattern = /^https?:\/\//i

const isLocalImageUri = (value: string) => localImageSchemePattern.test(value)
const isHttpUrl = (value: string) => httpUrlPattern.test(value)

const sanitizePathSegment = (value: string, fallback: string) => {
  const sanitized = value
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')

  return sanitized || fallback
}

const getImageContentType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'heic':
      return 'image/heic'
    case 'heif':
      return 'image/heif'
    default:
      return 'image/jpeg'
  }
}

const hasImageSignature = (bytes: Uint8Array) => {
  if (bytes.length < 12) return false

  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  const isHeicOrHeif =
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70 &&
    bytes[8] === 0x68 &&
    bytes[9] === 0x65 &&
    bytes[10] === 0x69 &&
    (bytes[11] === 0x63 || bytes[11] === 0x66)

  return isJpeg || isPng || isWebp || isHeicOrHeif
}

const readLocalImageData = async (uri: string) => {
  const imageFile = new File(uri)
  const bytes = await imageFile.bytes()
  if (!hasImageSignature(bytes)) {
    throw new Error('The selected photo could not be read as valid image data.')
  }

  const response = await fetch(uri)
  const blob = await response.blob()
  if (blob.size <= 0) {
    throw new Error('The selected photo could not be prepared for upload.')
  }

  return {
    blob,
    byteCount: bytes.byteLength,
  }
}

const createAppointmentImageObjectKey = ({
  fileName,
  index,
  uid,
}: {
  fileName: string
  index: number
  uid: string
}) => {
  const safeUid = sanitizePathSegment(uid, 'user')
  const safeFileName = sanitizePathSegment(fileName, `image-${index + 1}.jpg`)
  const uniquePrefix = `${Date.now()}-${index + 1}-${Math.random()
    .toString(36)
    .slice(2, 10)}`

  return `appointment-images/${safeUid}/${uniquePrefix}-${safeFileName}`
}

const toDurableImageInput = (image: AppointmentImageRef): FormulaImageInput => {
  if (image.storageProvider === 'firebase' && image.objectKey) {
    return {
      storageProvider: 'firebase',
      publicUrl: image.publicUrl ?? undefined,
      objectKey: image.objectKey,
      fileName: image.fileName,
    }
  }

  return {
    storageProvider: image.storageProvider,
    publicUrl: image.publicUrl ?? undefined,
    objectKey: image.objectKey ?? undefined,
    fileName: image.fileName,
  }
}

const uploadLocalAppointmentImage = async (
  uri: string,
  index: number
): Promise<FormulaImageInput> => {
  const auth = getFirebaseAuth()
  const uid = auth.currentUser?.uid
  if (!uid) {
    throw new Error('Sign in again before saving photos to this appointment log.')
  }

  const fileName = deriveImageFileName(uri, index)
  const objectKey = createAppointmentImageObjectKey({ fileName, index, uid })
  let publicUrl: string | undefined
  try {
    const storage = getStorage(getFirebaseApp())
    const imageRef = storageRef(storage, objectKey)
    const imageData = await readLocalImageData(uri)

    await uploadBytes(imageRef, imageData.blob, {
      cacheControl: 'private, max-age=31536000',
      contentType: getImageContentType(fileName),
      customMetadata: {
        ownerUid: uid,
        source: 'myguest-appointment-log',
      },
    })

    publicUrl = await getDownloadURL(imageRef)
    if (__DEV__) {
      console.log('[appointment-image-upload:complete]', {
        byteCount: imageData.byteCount,
        contentType: getImageContentType(fileName),
        fileName,
        objectKey,
      })
    }
  } catch (error) {
    const details = error instanceof Error && error.message ? ` ${error.message}` : ''
    throw new Error(
      `Unable to upload appointment photos.${details} If this appointment has older photos from another app install, reattach them from Photos or save it from the build where they still appear.`
    )
  }

  return {
    storageProvider: 'firebase',
    publicUrl,
    objectKey,
    fileName,
  }
}

export const buildDurableAppointmentImageInputs = async ({
  imageUris,
  existingRefs = [],
}: {
  imageUris: string[]
  existingRefs?: AppointmentImageRef[]
}): Promise<FormulaImageInput[]> => {
  const existingByUri = new Map<string, AppointmentImageRef>()
  existingRefs.forEach((image) => {
    const displayUri = getImageDisplayUri(image).trim()
    if (displayUri) existingByUri.set(displayUri, image)
  })

  const seen = new Set<string>()
  const inputs: FormulaImageInput[] = []

  for (const [index, uri] of imageUris.entries()) {
    const trimmed = (uri || '').trim()
    if (!trimmed) continue

    const existing = existingByUri.get(trimmed)
    const input = existing && existing.storageProvider !== 'device_local'
      ? toDurableImageInput(existing)
      : isLocalImageUri(trimmed)
        ? await uploadLocalAppointmentImage(trimmed, index)
        : isHttpUrl(trimmed)
          ? {
              storageProvider: existing?.storageProvider ?? 'remote_url',
              publicUrl: trimmed,
              fileName: existing?.fileName ?? deriveImageFileName(trimmed, index),
            }
          : {
              storageProvider: 'firebase',
              objectKey: trimmed,
              fileName: existing?.fileName ?? deriveImageFileName(trimmed, index),
            }

    const dedupeKey = `${input.storageProvider ?? ''}|${input.publicUrl ?? ''}|${
      input.objectKey ?? ''
    }`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)
    inputs.push(input)
  }

  return inputs
}
