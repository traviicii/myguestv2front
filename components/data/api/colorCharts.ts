import type { ColorAnalysis } from '../models'

import { fetchClientsFromApi } from './clients'
import { isNotFoundError, request } from './core'
import {
  coerceColorChartItems,
  getColorChartForClientFromPayload,
  mapColorChartItemsByClient,
  toColorAnalysisModel,
} from './colorChartApiMappers'
import {
  buildUpsertColorChartPayload,
  toColorChartClientId,
} from './colorChartApiPayloads'
import type {
  ApiColorChart,
  ApiColorChartListResponse,
  FlexibleColorChart,
  UpsertColorChartInput,
} from './colorChartApiTypes'

export type { UpsertColorChartInput }

const colorChartClientPathBuilders = [
  (clientId: number | string) => `/clients/${clientId}/color-chart`,
]

async function fetchColorAnalysisByClientViaClientFallback() {
  const clients = await fetchClientsFromApi()

  const entries = await Promise.all(
    clients.map(async (client) => {
      for (const buildPath of colorChartClientPathBuilders) {
        try {
          const payload = await request<unknown>(buildPath(client.id), {
            method: 'GET',
          })
          const colorAnalysis = getColorChartForClientFromPayload(
            payload,
            String(client.id)
          )
          if (!colorAnalysis) continue
          return [String(client.id), colorAnalysis] as const
        } catch (error) {
          if (isNotFoundError(error)) {
            continue
          }
          throw error
        }
      }

      return null
    })
  )

  return entries.reduce<Record<string, ColorAnalysis>>((acc, entry) => {
    if (!entry) return acc
    const [clientId, colorAnalysis] = entry
    acc[clientId] = colorAnalysis
    return acc
  }, {})
}

async function fetchPaginatedColorChartItems() {
  const limit = 200
  let offset = 0
  let hasPaginatedShape = false
  let totalFromApi: number | null = null
  const items: FlexibleColorChart[] = []

  while (true) {
    const response = await request<unknown>(`/color-charts?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    })

    const responseItems = coerceColorChartItems(response)
    items.push(...responseItems)

    const payload = response as Partial<ApiColorChartListResponse>
    hasPaginatedShape = Array.isArray(payload.items)
    if (!hasPaginatedShape) {
      break
    }

    totalFromApi = typeof payload.total === 'number' ? payload.total : null
    offset += limit
    if (responseItems.length === 0) break
    if (totalFromApi !== null && items.length >= totalFromApi) break
  }

  return { hasPaginatedShape, items, totalFromApi }
}

export async function fetchColorAnalysisForClientFromApi(
  clientId: string
): Promise<ColorAnalysis | null> {
  const normalizedClientId = toColorChartClientId(clientId)

  for (const buildPath of colorChartClientPathBuilders) {
    try {
      const payload = await request<unknown>(buildPath(normalizedClientId), {
        method: 'GET',
      })
      const colorAnalysis = getColorChartForClientFromPayload(
        payload,
        normalizedClientId
      )
      if (colorAnalysis) return colorAnalysis
    } catch (error) {
      if (isNotFoundError(error)) continue
      throw error
    }
  }

  try {
    const payload = await request<unknown>(`/color-charts?limit=500&offset=0`, {
      method: 'GET',
    })
    return getColorChartForClientFromPayload(payload, normalizedClientId)
  } catch (error) {
    if (isNotFoundError(error)) return null
    throw error
  }
}

export async function upsertColorAnalysisForClientViaApi(
  clientId: string,
  input: UpsertColorChartInput
): Promise<ColorAnalysis> {
  const normalizedClientId = toColorChartClientId(clientId)

  const response = await request<ApiColorChart>(
    `/clients/${normalizedClientId}/color-chart`,
    {
      method: 'PATCH',
      body: JSON.stringify(buildUpsertColorChartPayload(input)),
    }
  )

  return toColorAnalysisModel(response)
}

export async function fetchColorAnalysisByClientFromApi(): Promise<
  Record<string, ColorAnalysis>
> {
  let primaryResult: Record<string, ColorAnalysis> = {}
  let hasPaginatedShape = false
  let totalFromApi: number | null = null

  try {
    const paginated = await fetchPaginatedColorChartItems()
    hasPaginatedShape = paginated.hasPaginatedShape
    totalFromApi = paginated.totalFromApi
    primaryResult = mapColorChartItemsByClient(paginated.items)
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error
    }
  }

  if (Object.keys(primaryResult).length > 0) {
    return primaryResult
  }

  if (hasPaginatedShape && totalFromApi === 0) {
    return {}
  }

  try {
    return await fetchColorAnalysisByClientViaClientFallback()
  } catch (error) {
    if (isNotFoundError(error)) {
      return {}
    }
    throw error
  }
}
