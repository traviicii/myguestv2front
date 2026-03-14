import { expect, test } from '@playwright/test'

import {
  buildAmbientBackdropVisuals,
  resolveAmbientEffectMode,
  shouldAnimateAmbientBackdrop,
  toAlpha,
} from 'components/ambientBackdropUtils'

test('ambient backdrop helpers resolve alpha colors safely', async () => {
  expect(toAlpha('#abc', 0.5)).toBe('rgba(170, 187, 204, 0.5)')
  expect(toAlpha('rgb(260, -10, 12)', 2)).toBe('rgba(255, 0, 12, 1)')
  expect(toAlpha('transparent', 0.4)).toBe('transparent')
})

test('ambient backdrop helpers resolve mode and animation eligibility', async () => {
  expect(resolveAmbientEffectMode('auto')).toBe('faux')
  expect(resolveAmbientEffectMode('off')).toBe('off')
  expect(shouldAnimateAmbientBackdrop('faux', 'glass')).toBe(true)
  expect(shouldAnimateAmbientBackdrop('faux', 'modern')).toBe(false)
})

test('ambient backdrop helpers build glass and non-glass visual states', async () => {
  const glassLight = buildAmbientBackdropVisuals({
    aesthetic: 'glass',
    mode: 'light',
    palette: 'alloy',
    backdropStart: '#D9EAFF',
    backdropEnd: '#F1F7FF',
    backdropAccent: '#A8C7FF',
  })

  expect(glassLight.glassLight).toBe(true)
  expect(glassLight.glassLiquidBase).toEqual([
    'rgba(217, 234, 255, 0.9)',
    'rgba(168, 199, 255, 0.32)',
    'rgba(241, 247, 255, 0.95)',
  ])
  expect(glassLight.blobOpacity).toBe(0.34)
  expect(glassLight.showAmbientShapes).toBe(true)
  expect(glassLight.blurIntensity).toBe(28)

  const glassDark = buildAmbientBackdropVisuals({
    aesthetic: 'glass',
    mode: 'dark',
    palette: 'signal',
    backdropStart: '#223047',
    backdropEnd: '#101B2A',
    backdropAccent: '#86A7FF',
  })

  expect(glassDark.glassLight).toBe(false)
  expect(glassDark.glassLiquidBase).toBeNull()
  expect(glassDark.showAmbientShapes).toBe(false)
  expect(glassDark.veilOpacity).toBe(0.2)

  const modern = buildAmbientBackdropVisuals({
    aesthetic: 'modern',
    mode: 'light',
    palette: 'pearl',
    backdropStart: '#D9EAFF',
    backdropEnd: '#F1F7FF',
    backdropAccent: '#A8C7FF',
  })

  expect(modern.isGlassNative).toBe(false)
  expect(modern.accentOpacity).toBe(0.1)
  expect(modern.secondaryOpacity).toBe(0.08)
  expect(modern.veilOpacity).toBe(0.08)
})
