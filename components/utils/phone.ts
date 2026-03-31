export const PHONE_INPUT_PLACEHOLDER = '(555) 555-5555'

const NON_DIGIT = /\D/g

export function extractPhoneDigits(value: string) {
  return value.replace(NON_DIGIT, '')
}

// Current phone handling is US-first in the input UX, but we centralize
// normalization here so future E.164/international support stays scoped to one file.
export function normalizePhoneForStorage(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const digits = extractPhoneDigits(trimmed)
  if (!digits) return ''

  if (trimmed.startsWith('+')) {
    return `+${digits}`
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1)
  }

  return digits
}

export function formatPhoneForInput(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const digits = extractPhoneDigits(trimmed)
  const looksLikeInternational = trimmed.startsWith('+') || (digits.length > 10 && !digits.startsWith('1'))

  if (looksLikeInternational) {
    return trimmed
  }

  const normalizedDigits =
    digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits.slice(0, 10)

  if (normalizedDigits.length === 0) return ''
  if (normalizedDigits.length < 4) return normalizedDigits
  if (normalizedDigits.length < 7) {
    return `(${normalizedDigits.slice(0, 3)}) ${normalizedDigits.slice(3)}`
  }
  return `(${normalizedDigits.slice(0, 3)}) ${normalizedDigits.slice(3, 6)}-${normalizedDigits.slice(6)}`
}

export function formatPhoneForDisplay(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const formatted = formatPhoneForInput(trimmed)
  return formatted || trimmed
}
