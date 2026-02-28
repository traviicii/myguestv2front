import type { ColorAnalysis } from 'components/mockData'
import {
  COLOR_ANALYSIS_FIELD_MAP,
  COLOR_CHART_OPTIONS,
  type ColorChartFieldKey,
  type ColorChartFormState,
  type ColorChartPicklistFieldKey,
} from './config'

const EMPTY_SENTINELS = new Set(['', '—', '-', 'unknown', 'n/a'])

export const COLOR_CHART_FIELDS = Object.keys(
  COLOR_ANALYSIS_FIELD_MAP
) as ColorChartFieldKey[]

export const COLOR_CHART_PICKLIST_FIELDS = Object.keys(
  COLOR_CHART_OPTIONS
) as ColorChartPicklistFieldKey[]

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

export const normalizeColorChartValue = (value?: string | null) => {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return ''
  if (EMPTY_SENTINELS.has(trimmed.toLowerCase())) return ''
  return trimmed
}

export function createEmptyColorChartFormState(): ColorChartFormState {
  return COLOR_CHART_FIELDS.reduce((acc, key) => {
    acc[key] = ''
    return acc
  }, {} as ColorChartFormState)
}

export function normalizePicklistValue(
  key: ColorChartPicklistFieldKey,
  value?: string | null
): string | null {
  const normalized = normalizeColorChartValue(value)
  if (!normalized) return null
  const targetToken = normalizeToken(normalized)
  const options = COLOR_CHART_OPTIONS[key]
  const match = options.find((option) => normalizeToken(option) === targetToken)
  return match ?? null
}

export function isOtherColorChartValue(
  key: ColorChartPicklistFieldKey,
  value?: string | null
) {
  const normalized = normalizeColorChartValue(value)
  if (!normalized) return false
  return !normalizePicklistValue(key, normalized)
}

export function createColorChartFormState(
  colorAnalysis?: ColorAnalysis
): ColorChartFormState {
  const base = createEmptyColorChartFormState()
  if (!colorAnalysis) return base

  COLOR_CHART_FIELDS.forEach((key) => {
    const sourceKey = COLOR_ANALYSIS_FIELD_MAP[key]
    const sourceValue = normalizeColorChartValue(colorAnalysis[sourceKey] as string | undefined)

    if (COLOR_CHART_PICKLIST_FIELDS.includes(key as ColorChartPicklistFieldKey)) {
      const picklistKey = key as ColorChartPicklistFieldKey
      base[key] = normalizePicklistValue(picklistKey, sourceValue) ?? sourceValue
      return
    }

    base[key] = sourceValue
  })

  return base
}

export function hasAnyColorChartValues(
  values: Partial<ColorChartFormState> | null | undefined
) {
  if (!values) return false
  return COLOR_CHART_FIELDS.some((key) => Boolean(normalizeColorChartValue(values[key])))
}

export function hasAnyColorChartValuesFromAnalysis(colorAnalysis?: ColorAnalysis) {
  if (!colorAnalysis) return false
  return COLOR_CHART_FIELDS.some((key) => {
    const sourceKey = COLOR_ANALYSIS_FIELD_MAP[key]
    return Boolean(normalizeColorChartValue(colorAnalysis[sourceKey] as string | undefined))
  })
}

export function isColorChartDirty(
  current: ColorChartFormState,
  initial: ColorChartFormState
) {
  return COLOR_CHART_FIELDS.some((key) => {
    const currentValue = normalizeColorChartValue(current[key])
    const initialValue = normalizeColorChartValue(initial[key])
    return currentValue !== initialValue
  })
}

export function getColorChartDisplayValue(value?: string | null) {
  return normalizeColorChartValue(value) || '—'
}
