import { expect, test } from '@playwright/test'

import type { AppointmentHistory, ColorAnalysis } from '../components/data/models'
import { buildClientTimelineEntries } from '../components/clients/detail/timelineUtils'

const appointmentHistory: AppointmentHistory[] = [
  {
    id: 'h-1001',
    clientId: 'c-101',
    date: '2026-03-07',
    services: 'Cut & Color',
    serviceLabels: ['Cut & Color', 'Glaze'],
    price: 265,
    notes: 'Lived-in blonde refresh with soft finish.',
    images: ['https://images.example.com/mock/avery-finish-1.jpg'],
  },
  {
    id: 'h-1002',
    clientId: 'c-101',
    date: '2026-01-17',
    services: 'Color',
    serviceLabels: ['Color'],
    price: 140,
    notes: '',
  },
]

test('client timeline merges appointment and color chart history in reverse chronological order', () => {
  const colorAnalysis: ColorAnalysis = {
    id: 'cc-101',
    clientId: 'c-101',
    updatedAt: '2026-03-06T16:30:00Z',
    porosity: 'normal',
    texture: 'medium',
    elasticity: 'normal',
    scalpCondition: 'normal',
    naturalLevel: '6',
    desiredLevel: '9',
    contributingPigment: 'yellow/orange',
    grayFront: '10',
    graySides: '5',
    grayBack: '0',
    skinDepth: 'light',
    skinTone: 'neutral',
    eyeColor: 'green',
  }

  expect(
    buildClientTimelineEntries({
      clientId: 'c-101',
      appointmentHistory,
      colorAnalysis,
    })
  ).toEqual([
    expect.objectContaining({
      kind: 'appointment',
      sourceId: 'h-1001',
      eventLabel: 'Appointment log',
      title: 'Cut & Color',
      supportingLine: 'Also Glaze',
      tertiaryLine: 'Lived-in blonde refresh with soft finish.',
      priceLabel: '$265',
      photoCount: 1,
      photoLabel: '1 photo',
    }),
    expect.objectContaining({
      kind: 'colorChart',
      eventLabel: 'Color chart',
      title: 'Color chart updated',
      supportingLine: 'Levels 6 → 9',
      tertiaryLine: 'Pigment yellow/orange • Texture medium',
      metaLabel: 'Chart',
    }),
    expect.objectContaining({
      kind: 'appointment',
      sourceId: 'h-1002',
      supportingLine: undefined,
      tertiaryLine: undefined,
      priceLabel: '$140',
      photoCount: 0,
    }),
  ])
})

test('client timeline respects limits and omits color chart events without timestamps', () => {
  const colorAnalysis: ColorAnalysis = {
    porosity: 'normal',
    texture: 'medium',
    elasticity: 'normal',
    scalpCondition: 'normal',
    naturalLevel: '6',
    desiredLevel: '9',
    contributingPigment: 'yellow/orange',
    grayFront: '10',
    graySides: '5',
    grayBack: '0',
    skinDepth: 'light',
    skinTone: 'neutral',
    eyeColor: 'green',
  }

  expect(
    buildClientTimelineEntries({
      clientId: 'c-101',
      appointmentHistory,
      colorAnalysis,
      limit: 1,
    })
  ).toEqual([
    expect.objectContaining({
      kind: 'appointment',
      sourceId: 'h-1001',
    }),
  ])
})

test('client timeline uses calm color chart fallbacks when only partial profile data exists', () => {
  const colorAnalysis: ColorAnalysis = {
    id: 'cc-101',
    clientId: 'c-101',
    updatedAt: '2026-03-06T16:30:00Z',
    porosity: 'high',
    texture: '',
    elasticity: 'low',
    scalpCondition: 'normal',
    naturalLevel: '',
    desiredLevel: '',
    contributingPigment: '',
    grayFront: '',
    graySides: '',
    grayBack: '',
    skinDepth: '',
    skinTone: '',
    eyeColor: '',
  }

  expect(
    buildClientTimelineEntries({
      clientId: 'c-101',
      appointmentHistory: [],
      colorAnalysis,
    })
  ).toEqual([
    expect.objectContaining({
      kind: 'colorChart',
      supportingLine: 'Profile details refreshed',
      tertiaryLine: 'Porosity high • Elasticity low',
    }),
  ])
})
