import { toClientIdString } from './core'
import type { UpsertColorChartInput } from './colorChartApiTypes'

const COLOR_CHART_MUTABLE_FIELDS: readonly (keyof UpsertColorChartInput)[] = [
  'porosity',
  'hair_texture',
  'elasticity',
  'scalp_condition',
  'natural_level',
  'desired_level',
  'contrib_pigment',
  'gray_front',
  'gray_sides',
  'gray_back',
  'skin_depth',
  'skin_tone',
  'eye_color',
]

const normalizeColorChartInput = (value: string | null | undefined) => {
  if (value === undefined) return undefined
  const trimmed = (value ?? '').trim()
  return trimmed || null
}

export function toColorChartClientId(clientId: string) {
  const normalizedClientId = toClientIdString(clientId)
  if (!normalizedClientId) {
    throw new Error('Invalid client id.')
  }
  return normalizedClientId
}

export function buildUpsertColorChartPayload(input: UpsertColorChartInput) {
  return COLOR_CHART_MUTABLE_FIELDS.reduce<Record<string, string | null>>((acc, field) => {
    const normalizedValue = normalizeColorChartInput(input[field])
    if (normalizedValue !== undefined) {
      acc[field] = normalizedValue
    }
    return acc
  }, {})
}
