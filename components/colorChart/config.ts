import type { ColorAnalysis } from 'components/mockData'

export type ColorChartFieldKey =
  | 'porosity'
  | 'hair_texture'
  | 'elasticity'
  | 'scalp_condition'
  | 'natural_level'
  | 'desired_level'
  | 'contrib_pigment'
  | 'gray_front'
  | 'gray_sides'
  | 'gray_back'
  | 'skin_depth'
  | 'skin_tone'
  | 'eye_color'

export type ColorChartPicklistFieldKey =
  | 'porosity'
  | 'hair_texture'
  | 'elasticity'
  | 'scalp_condition'
  | 'contrib_pigment'
  | 'skin_depth'
  | 'skin_tone'
  | 'eye_color'

export type ColorChartFormState = Record<ColorChartFieldKey, string>

export const COLOR_ANALYSIS_FIELD_MAP: Record<ColorChartFieldKey, keyof ColorAnalysis> = {
  porosity: 'porosity',
  hair_texture: 'texture',
  elasticity: 'elasticity',
  scalp_condition: 'scalpCondition',
  natural_level: 'naturalLevel',
  desired_level: 'desiredLevel',
  contrib_pigment: 'contributingPigment',
  gray_front: 'grayFront',
  gray_sides: 'graySides',
  gray_back: 'grayBack',
  skin_depth: 'skinDepth',
  skin_tone: 'skinTone',
  eye_color: 'eyeColor',
}

export const COLOR_CHART_FIELD_LABELS: Record<ColorChartFieldKey, string> = {
  porosity: 'Porosity',
  hair_texture: 'Texture',
  elasticity: 'Elasticity',
  scalp_condition: 'Scalp Condition',
  natural_level: 'Natural Level',
  desired_level: 'Desired Level',
  contrib_pigment: 'Contributing Pigment',
  gray_front: 'Gray Front',
  gray_sides: 'Gray Sides',
  gray_back: 'Gray Back',
  skin_depth: 'Skin Depth',
  skin_tone: 'Skin Tone',
  eye_color: 'Eye Color',
}

export const COLOR_CHART_OPTIONS: Record<ColorChartPicklistFieldKey, readonly string[]> = {
  porosity: ['Resistant', 'Normal', 'Porous', 'Very Porous'],
  hair_texture: ['Fine', 'Medium', 'Coarse'],
  elasticity: ['Normal', 'Poor', 'Very Poor'],
  scalp_condition: ['Normal', 'Dry', 'Oily'],
  contrib_pigment: ['Yellow', 'Yellow/Orange', 'Orange', 'Orange/Red', 'Red'],
  skin_depth: ['Light', 'Medium', 'Dark'],
  skin_tone: ['Warm', 'Cool', 'Neutral'],
  eye_color: ['Brown', 'Hazel', 'Blue', 'Green', 'Gray'],
}

export const COLOR_CHART_GROUPS: ReadonlyArray<{
  id: 'hairProfile' | 'levelPlanning' | 'grayCoverage' | 'toneProfile'
  title: string
  fields: readonly ColorChartFieldKey[]
}> = [
  {
    id: 'hairProfile',
    title: 'Hair Profile',
    fields: ['porosity', 'hair_texture', 'elasticity', 'scalp_condition'],
  },
  {
    id: 'levelPlanning',
    title: 'Level Planning',
    fields: ['natural_level', 'desired_level', 'contrib_pigment'],
  },
  {
    id: 'grayCoverage',
    title: 'Gray Coverage',
    fields: ['gray_front', 'gray_sides', 'gray_back'],
  },
  {
    id: 'toneProfile',
    title: 'Tone Profile',
    fields: ['skin_depth', 'skin_tone', 'eye_color'],
  },
]
