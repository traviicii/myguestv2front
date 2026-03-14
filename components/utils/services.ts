// Service name normalization is shared by the UI and backend so that
// "cut & color" and "Cut & Color" collapse to the same canonical label.
const CONNECTOR_WORDS = new Set(['and', 'or', 'of', 'the', 'a', 'an', 'for', 'to'])

// Default presets used when no service catalog has been created yet.
export const DEFAULT_APPOINTMENT_SERVICES = [
  'Cut',
  'Color',
  'Cut & Color',
  'Balayage',
  'Single Process',
  'Glaze',
]

// Normalize whitespace so we do not create multiple presets for the same label.
const normalizeWhitespace = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, ' ')

// Title-case a token while preserving connector words and separators.
const toTitleToken = (token: string, index: number, total: number) => {
  const trimmed = token.trim()
  if (!trimmed) return ''

  if (/^[&/+|-]+$/.test(trimmed)) {
    return trimmed
  }

  const lowered = trimmed.toLowerCase()
  if (index > 0 && index < total - 1 && CONNECTOR_WORDS.has(lowered)) {
    return lowered
  }

  return lowered.replace(/(^[a-z])|([-/][a-z])/g, (segment) => segment.toUpperCase())
}

// Convert raw user input into a canonical, display-friendly label.
export const normalizeServiceName = (value: string) => {
  const normalized = normalizeWhitespace(value)
  if (!normalized) return ''

  const parts = normalized.split(' ')
  return parts.map((part, index) => toTitleToken(part, index, parts.length)).join(' ')
}

// Deduplicate and normalize a list of service strings, with a fallback.
export const normalizeServiceList = (
  services: string[] | undefined,
  fallback: string[] = DEFAULT_APPOINTMENT_SERVICES
) => {
  const normalized: string[] = []
  const seen = new Set<string>()

  ;(services ?? []).forEach((service) => {
    const formatted = normalizeServiceName(service)
    if (!formatted) return
    const key = formatted.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    normalized.push(formatted)
  })

  if (normalized.length) return normalized
  return [...fallback]
}

// Use a best-effort label from service type or notes, so the UI never shows "Service".
export const getServiceLabel = (serviceType: string, notes: string) => {
  const normalizedService = normalizeServiceName(serviceType)
  if (normalizedService && normalizedService.toLowerCase() !== 'service') {
    return normalizedService
  }

  const trimmed = (notes || '').trim()
  if (!trimmed) return normalizedService || 'Service'

  const firstLine = trimmed.split('\n')[0].trim()
  if (!firstLine) return normalizedService || 'Service'

  const colonIndex = firstLine.indexOf(':')
  const fallback = colonIndex > 0 ? firstLine.slice(0, colonIndex).trim() : firstLine
  const normalizedFallback = normalizeServiceName(fallback)
  return normalizedFallback || normalizedService || 'Service'
}
