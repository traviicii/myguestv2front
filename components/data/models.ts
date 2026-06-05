export type ClientType = string

export type ClientGroup = {
  id: number
  name: string
  normalizedName: string
  sortOrder: number
  archivedAt?: string | null
  clientCount?: number
}

export type Client = {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  birthday?: string | null
  createdAt?: string
  lastVisit: string
  type: ClientType
  groupIds?: number[]
  groups?: ClientGroup[]
  revenueYtd: number
  tag: string
  status: 'Active' | 'Inactive'
  notes: string
}

export type AppointmentImageRef = {
  storageProvider: string
  publicUrl?: string | null
  objectKey?: string | null
  fileName: string
}

export type AppointmentHistory = {
  id: string
  clientId: string
  date: string
  services: string
  serviceIds?: number[]
  serviceLabels?: string[]
  price: number
  notes: string
  images?: string[]
  imageRefs?: AppointmentImageRef[]
}

export type ColorAnalysis = {
  id?: string
  clientId?: string
  createdAt?: string
  updatedAt?: string
  porosity: string
  texture: string
  elasticity: string
  scalpCondition: string
  naturalLevel: string
  desiredLevel: string
  contributingPigment: string
  grayFront: string
  graySides: string
  grayBack: string
  skinDepth: string
  skinTone: string
  eyeColor: string
}
