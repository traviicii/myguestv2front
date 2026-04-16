import type {
  AppointmentHistory,
  ColorAnalysis,
} from 'components/data/models'
import { getServiceLabel, normalizeServiceName } from 'components/utils/services'

export type ClientTimelineEntry =
  | {
      id: string
      kind: 'appointment'
      date: string
      eventLabel: string
      title: string
      supportingLine?: string
      tertiaryLine?: string
      priceLabel: string
      photoCount: number
      photoLabel?: string
      imageUrl?: string
      sourceId: string
    }
  | {
      id: string
      kind: 'colorChart'
      date: string
      eventLabel: string
      title: string
      supportingLine: string
      tertiaryLine?: string
      metaLabel: string
      sourceId: string
    }

const EMPTY_SENTINELS = new Set(['', '—', '-', 'unknown', 'n/a'])

function normalizeValue(value?: string | null) {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return ''
  if (EMPTY_SENTINELS.has(trimmed.toLowerCase())) return ''
  return trimmed
}

function parseTimelineDate(value: string) {
  const trimmed = (value || '').trim()
  const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnlyMatch) {
    return new Date(
      Number(dateOnlyMatch[1]),
      Number(dateOnlyMatch[2]) - 1,
      Number(dateOnlyMatch[3]),
      12
    )
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) return parsed
  return new Date(0)
}

function shortenText(value: string, maxLength = 72) {
  if (value.length <= maxLength) return value
  return `${value.slice(0, Math.max(maxLength - 1, 0)).trimEnd()}…`
}

function buildPriceLabel(price: number) {
  return `$${price}`
}

function buildPhotoLabel(photoCount: number) {
  if (photoCount <= 0) return ''
  return `${photoCount} photo${photoCount === 1 ? '' : 's'}`
}

function getAppointmentServiceLabels(entry: AppointmentHistory) {
  const normalizedLabels =
    entry.serviceLabels
      ?.map((label) => normalizeServiceName(label))
      .filter(Boolean) ?? []

  if (normalizedLabels.length > 0) return normalizedLabels

  return [getServiceLabel(entry.services, entry.notes)]
}

function buildAdditionalServiceSummary(serviceLabels: string[]) {
  const extras = serviceLabels.slice(1)
  if (extras.length === 0) return ''
  if (extras.length === 1) return `Also ${extras[0]}`
  if (extras.length === 2) return `Also ${extras[0]} + ${extras[1]}`
  return `Also ${extras[0]} +${extras.length - 1} more`
}

function buildAppointmentNotePreview(entry: AppointmentHistory) {
  const notes = normalizeValue(entry.notes).replace(/\s+/g, ' ')
  if (!notes) return ''
  return shortenText(notes, 84)
}

function buildAppointmentSupportingLine(entry: AppointmentHistory, serviceLabels: string[]) {
  return buildAdditionalServiceSummary(serviceLabels) || buildAppointmentNotePreview(entry)
}

function buildAppointmentTertiaryLine(entry: AppointmentHistory, serviceLabels: string[]) {
  if (serviceLabels.length <= 1) return ''
  return buildAppointmentNotePreview(entry)
}

function buildColorChartDetail(colorAnalysis: ColorAnalysis) {
  const natural = normalizeValue(colorAnalysis.naturalLevel)
  const desired = normalizeValue(colorAnalysis.desiredLevel)
  if (natural && desired) return `Levels ${natural} → ${desired}`
  if (desired) return `Desired level ${desired}`
  if (natural) return `Natural level ${natural}`
  return 'Profile details refreshed'
}

function joinNonEmpty(values: string[]) {
  return values.filter(Boolean).join(' • ')
}

function buildColorChartSecondaryDetail(colorAnalysis: ColorAnalysis) {
  return joinNonEmpty([
    normalizeValue(colorAnalysis.contributingPigment)
      ? `Pigment ${normalizeValue(colorAnalysis.contributingPigment)}`
      : '',
    normalizeValue(colorAnalysis.texture)
      ? `Texture ${normalizeValue(colorAnalysis.texture)}`
      : '',
  ])
}

function buildColorChartNotePreview(colorAnalysis: ColorAnalysis) {
  return joinNonEmpty([
    normalizeValue(colorAnalysis.porosity)
      ? `Porosity ${normalizeValue(colorAnalysis.porosity)}`
      : '',
    normalizeValue(colorAnalysis.elasticity)
      ? `Elasticity ${normalizeValue(colorAnalysis.elasticity)}`
      : '',
  ])
}

function buildColorChartTertiaryLine(colorAnalysis: ColorAnalysis) {
  return (
    buildColorChartSecondaryDetail(colorAnalysis) ||
    buildColorChartNotePreview(colorAnalysis) ||
    ''
  )
}

type BuildClientTimelineEntriesInput = {
  clientId: string
  appointmentHistory: AppointmentHistory[]
  colorAnalysis?: ColorAnalysis | null
  limit?: number
}

export function buildClientTimelineEntries({
  clientId,
  appointmentHistory,
  colorAnalysis,
  limit,
}: BuildClientTimelineEntriesInput): ClientTimelineEntry[] {
  const appointmentEntries: ClientTimelineEntry[] = appointmentHistory
    .filter((entry) => entry.clientId === clientId)
    .map((entry) => {
      const serviceLabels = getAppointmentServiceLabels(entry)
      const photoCount = entry.images?.length ?? 0

      return {
        id: `appointment-${entry.id}`,
        kind: 'appointment',
        date: entry.date,
        eventLabel: 'Appointment log',
        title: serviceLabels[0] ?? getServiceLabel(entry.services, entry.notes),
        supportingLine: buildAppointmentSupportingLine(entry, serviceLabels) || undefined,
        tertiaryLine: buildAppointmentTertiaryLine(entry, serviceLabels) || undefined,
        priceLabel: buildPriceLabel(entry.price),
        photoCount,
        photoLabel: buildPhotoLabel(photoCount) || undefined,
        imageUrl: entry.images?.[0],
        sourceId: entry.id,
      }
    })

  const timelineEntries = [...appointmentEntries]
  if (colorAnalysis?.updatedAt) {
    timelineEntries.push({
      id: `color-chart-${colorAnalysis.id ?? clientId}`,
      kind: 'colorChart',
      date: colorAnalysis.updatedAt,
      eventLabel: 'Color chart',
      title: 'Color chart updated',
      supportingLine: buildColorChartDetail(colorAnalysis),
      tertiaryLine: buildColorChartTertiaryLine(colorAnalysis) || undefined,
      metaLabel: 'Chart',
      sourceId: colorAnalysis.id ?? clientId,
    })
  }

  timelineEntries.sort(
    (left, right) =>
      parseTimelineDate(right.date).getTime() - parseTimelineDate(left.date).getTime()
  )

  if (typeof limit === 'number') {
    return timelineEntries.slice(0, Math.max(limit, 0))
  }
  return timelineEntries
}
