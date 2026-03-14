import { expect, test } from '@playwright/test'

import {
  buildOtherInputState,
  getColorChartFieldPlaceholder,
  normalizeFormState,
} from '../components/colorChart/edit/modelUtils'

test('color chart edit helpers normalize picklist values and detect custom inputs', () => {
  const normalized = normalizeFormState({
    porosity: ' normal ',
    hair_texture: 'Custom Texture',
    elasticity: '—',
    scalp_condition: 'Dry',
    natural_level: ' 5 ',
    desired_level: ' 7 ',
    contrib_pigment: 'orange',
    gray_front: '10%',
    gray_sides: '20%',
    gray_back: '30%',
    skin_depth: ' medium ',
    skin_tone: 'neutral',
    eye_color: 'Amber',
  })

  expect(normalized).toMatchObject({
    porosity: 'Normal',
    hair_texture: 'Custom Texture',
    elasticity: '',
    scalp_condition: 'Dry',
    contrib_pigment: 'Orange',
    skin_depth: 'Medium',
    skin_tone: 'Neutral',
    eye_color: 'Amber',
  })

  expect(buildOtherInputState(normalized)).toMatchObject({
    hair_texture: true,
    eye_color: true,
    porosity: false,
    scalp_condition: false,
  })
})

test('color chart edit helpers provide field placeholders', () => {
  expect(getColorChartFieldPlaceholder('eye_color')).toBe('Enter eye color')
  expect(getColorChartFieldPlaceholder('skin_tone')).toBe('Enter custom skin tone')
  expect(getColorChartFieldPlaceholder('gray_front')).toBe('0%')
  expect(getColorChartFieldPlaceholder('desired_level')).toBe('Desired level')
})
