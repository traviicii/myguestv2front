export type ApiFormula = {
  id: number
  client_id: number
  service_type: string | null
  services?: ApiFormulaService[]
  notes: string | null
  price_cents: number | null
  service_at: string
  images?: ApiFormulaImage[]
}

export type ApiFormulaService = {
  service_id: number
  name: string
  position: number
  label_snapshot: string
}

export type ApiFormulaImage = {
  id: number
  formula_id: number
  storage_provider: string
  public_url: string | null
  object_key: string | null
  file_name: string
}

export type ApiFormulaListResponse = {
  total: number
  limit: number
  offset: number
  items: ApiFormula[]
}

export type FormulaImageInput = {
  storageProvider?: string
  publicUrl?: string | null
  objectKey?: string | null
  fileName?: string
}

export type CreateFormulaInput = {
  clientId: string
  serviceIds: number[]
  serviceType?: string | null
  notes?: string
  price?: number | null
  date: string
  images?: FormulaImageInput[]
}

export type UpdateFormulaInput = {
  formulaId: string
  serviceIds?: number[]
  serviceType?: string | null
  notes?: string | null
  price?: number | null
  date?: string
  images?: FormulaImageInput[]
}

export type FormulaListOptions = {
  fields?: 'full' | 'lite'
  include?: ('images' | 'services')[]
  imageLimit?: number
}
