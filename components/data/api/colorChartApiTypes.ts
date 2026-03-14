export type ApiColorChart = {
  id: number
  client_id: number
  porosity: string | null
  hair_texture: string | null
  elasticity: string | null
  scalp_condition: string | null
  natural_level: string | null
  desired_level: string | null
  contrib_pigment: string | null
  gray_front: string | null
  gray_sides: string | null
  gray_back: string | null
  skin_depth: string | null
  skin_tone: string | null
  eye_color: string | null
}

export type ApiColorChartListResponse = {
  total: number
  limit: number
  offset: number
  items: ApiColorChart[]
}

export type FlexibleColorChart = Partial<ApiColorChart> &
  Partial<{
    clientId: number | string | null
    texture: string | null
    scalpCondition: string | null
    naturalLevel: string | null
    desiredLevel: string | null
    contributingPigment: string | null
    grayFront: string | null
    graySides: string | null
    grayBack: string | null
    skinDepth: string | null
    skinTone: string | null
    eyeColor: string | null
  }>

export type UpsertColorChartInput = Partial<
  Pick<
    ApiColorChart,
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
  >
>
