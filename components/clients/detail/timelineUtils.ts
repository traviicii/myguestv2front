import type { AppointmentHistory, ColorAnalysis } from 'components/data/models'
import { getServiceLabel } from 'components/utils/services'

export type ClientTimelineEntry =
  | {
      id: string
      kind: 'appointment'
      date: string
      title: string
      detail: string
      secondaryDetail?: string
      notePreview?: string
      imageUrl?: string
      sourceId: string
    }
  | {
      id: string
      kind: 'colorChart'
      date: string
      title: string
      detail: string
      secondaryDetail?: string
      notePreview?: string
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

function buildAppointmentDetail(entry: AppointmentHistory) {
  const photoCount = entry.images?.length ?? 0
  return photoCount > 0 ? `$${entry.price} • ${photoCount} photo${photoCount === 1 ? '' : 's'}` : `$${entry.price}`
}

function buildAppointmentNotePreview(entry: AppointmentHistory) {
  const notes = normalizeValue(entry.notes)
  return notes
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
  return (
    joinNonEmpty([
      normalizeValue(colorAnalysis.contributingPigment)
        ? `Pigment ${normalizeValue(colorAnalysis.contributingPigment)}`
        : '',
      normalizeValue(colorAnalysis.texture)
        ? `Texture ${normalizeValue(colorAnalysis.texture)}`
        : '',
    ]) || 'Color profile updated'
  )
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
    .map((entry) => ({
      id: `appointment-${entry.id}`,
      kind: 'appointment',
      date: entry.date,
      title: getServiceLabel(entry.services, entry.notes),
      detail: buildAppointmentDetail(entry),
      secondaryDetail: undefined,
      notePreview: buildAppointmentNotePreview(entry),
      imageUrl: entry.images?.[0],
      sourceId: entry.id,
    }))

  const timelineEntries = [...appointmentEntries]
  if (colorAnalysis?.updatedAt) {
    timelineEntries.push({
      id: `color-chart-${colorAnalysis.id ?? clientId}`,
      kind: 'colorChart',
      date: colorAnalysis.updatedAt,
      title: 'Color chart updated',
      detail: buildColorChartDetail(colorAnalysis),
      secondaryDetail: buildColorChartSecondaryDetail(colorAnalysis),
      notePreview: buildColorChartNotePreview(colorAnalysis),
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
