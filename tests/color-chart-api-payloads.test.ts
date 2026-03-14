import { expect, test } from '@playwright/test'

import {
  buildUpsertColorChartPayload,
  toColorChartClientId,
} from '../components/data/api/colorChartApiPayloads'

test('color chart payload helpers normalize client ids and trim mutable fields', () => {
  expect(toColorChartClientId('12')).toBe('12')
  expect(() => toColorChartClientId('')).toThrow('Invalid client id.')

  expect(
    buildUpsertColorChartPayload({
      porosity: ' High ',
      hair_texture: '  ',
      elasticity: undefined,
      scalp_condition: 'Dry',
    })
  ).toEqual({
    porosity: 'High',
    hair_texture: null,
    scalp_condition: 'Dry',
  })
})
