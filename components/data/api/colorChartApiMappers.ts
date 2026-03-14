import type { ColorAnalysis } from '../models'

import { isRecord, toClientIdString } from './core'
import type { FlexibleColorChart } from './colorChartApiTypes'

const normalizeColorValue = (value: string | null | undefined) => {
  const trimmed = (value ?? '').trim()
  return trimmed || '—'
}

export const getColorChartClientId = (value: unknown): string | null => {
  if (!isRecord(value)) return null
  return toClientIdString(value.client_id ?? value.clientId)
}

export const coerceColorChartItems = (payload: unknown): FlexibleColorChart[] => {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is FlexibleColorChart => isRecord(item))
  }
  if (!isRecord(payload)) return []

  const items =
    payload.items ??
    payload.colorcharts ??
    payload.color_charts ??
    payload.colorchart ??
    null

  if (Array.isArray(items)) {
    return items.filter((item): item is FlexibleColorChart => isRecord(item))
  }
  if (isRecord(items)) {
    return [items as FlexibleColorChart]
  }
  if ('client_id' in payload || 'clientId' in payload) {
    return [payload as FlexibleColorChart]
  }
  return []
}

export function toColorAnalysisModel(chart: FlexibleColorChart): ColorAnalysis {
  return {
    porosity: normalizeColorValue(chart.porosity),
    texture: normalizeColorValue(chart.hair_texture ?? chart.texture),
    elasticity: normalizeColorValue(chart.elasticity),
    scalpCondition: normalizeColorValue(chart.scalp_condition ?? chart.scalpCondition),
    naturalLevel: normalizeColorValue(chart.natural_level ?? chart.naturalLevel),
    desiredLevel: normalizeColorValue(chart.desired_level ?? chart.desiredLevel),
    contributingPigment: normalizeColorValue(
      chart.contrib_pigment ?? chart.contributingPigment
    ),
    grayFront: normalizeColorValue(chart.gray_front ?? chart.grayFront),
    graySides: normalizeColorValue(chart.gray_sides ?? chart.graySides),
    grayBack: normalizeColorValue(chart.gray_back ?? chart.grayBack),
    skinDepth: normalizeColorValue(chart.skin_depth ?? chart.skinDepth),
    skinTone: normalizeColorValue(chart.skin_tone ?? chart.skinTone),
    eyeColor: normalizeColorValue(chart.eye_color ?? chart.eyeColor),
  }
}

export function mapColorChartItemsByClient(
  items: FlexibleColorChart[]
): Record<string, ColorAnalysis> {
  return items.reduce<Record<string, ColorAnalysis>>((acc, chart) => {
    const clientId = getColorChartClientId(chart)
    if (!clientId) return acc
    acc[clientId] = toColorAnalysisModel(chart)
    return acc
  }, {})
}

export function getColorChartForClientFromPayload(
  payload: unknown,
  clientId: string
): ColorAnalysis | null {
  const charts = coerceColorChartItems(payload)
  if (!charts.length) return null

  const match = charts.find((item) => getColorChartClientId(item) === clientId)
  if (!match) return null
  return toColorAnalysisModel(match)
}
