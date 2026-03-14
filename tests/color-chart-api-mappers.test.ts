import { expect, test } from '@playwright/test'

import {
  coerceColorChartItems,
  getColorChartForClientFromPayload,
  mapColorChartItemsByClient,
  toColorAnalysisModel,
} from '../components/data/api/colorChartApiMappers'

test('color chart mappers coerce flexible payload shapes and normalize missing values', () => {
  expect(
    coerceColorChartItems({
      color_charts: [
        {
          client_id: 9,
          porosity: ' High ',
          hair_texture: null,
          elasticity: '',
        },
      ],
    })
  ).toHaveLength(1)

  expect(
    toColorAnalysisModel({
      porosity: ' High ',
      texture: null,
      elasticity: '',
      scalpCondition: 'Oily',
    })
  ).toMatchObject({
    porosity: 'High',
    texture: '—',
    elasticity: '—',
    scalpCondition: 'Oily',
  })
})

test('color chart mappers resolve per-client payloads and client maps', () => {
  const payload = {
    items: [
      {
        client_id: 4,
        porosity: 'Medium',
        hair_texture: 'Fine',
        elasticity: 'Good',
      },
      {
        clientId: '8',
        porosity: 'Low',
        texture: 'Coarse',
        elasticity: 'Fair',
      },
    ],
  }

  expect(getColorChartForClientFromPayload(payload, '8')).toMatchObject({
    porosity: 'Low',
    texture: 'Coarse',
    elasticity: 'Fair',
  })

  expect(mapColorChartItemsByClient(coerceColorChartItems(payload))).toEqual({
    '4': expect.objectContaining({ porosity: 'Medium', texture: 'Fine' }),
    '8': expect.objectContaining({ porosity: 'Low', texture: 'Coarse' }),
  })
})
