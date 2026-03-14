import type { CardMode, SurfaceTone } from './controlShared'

export function resolveSurfaceCardTokens({
  isDarkGlass,
  isPanel,
  tone,
}: {
  isDarkGlass: boolean
  isPanel: boolean
  tone: SurfaceTone
}) {
  return {
    borderWidth: isDarkGlass ? 0 : 1,
    resolvedBg:
      tone === 'secondary'
        ? '$surfaceSecondary'
        : tone === 'tabGlass'
          ? '$surfaceTabGlass'
          : isPanel
            ? '$surfacePanel'
            : '$surfaceCardRaised',
    resolvedBorder:
      tone === 'secondary'
        ? '$surfaceSecondaryBorder'
        : tone === 'tabGlass'
          ? '$surfaceTabGlassBorder'
          : isPanel
            ? '$surfacePanelBorder'
            : '$surfaceCardBorder',
    resolvedShadow:
      tone === 'tabGlass'
        ? '$surfaceTabGlassShadow'
        : isPanel || tone === 'secondary'
          ? '$surfacePanelShadow'
          : '$surfaceCardShadow',
  } as const
}

export function resolveSurfaceCardRadius({
  mode,
  profile,
}: {
  mode: CardMode
  profile: { cardRadius: number; panelRadius: number }
}) {
  const isPanel = mode === 'panel' || mode === 'alwaysCard'
  return {
    isPanel,
    radius: isPanel ? profile.panelRadius : profile.cardRadius,
  } as const
}

export function resolvePreviewCardDefaults({
  gap,
  isGlass,
  mode,
  p,
  profile,
  rounded,
  tone,
}: {
  gap: unknown
  isGlass: boolean
  mode?: CardMode
  p: unknown
  profile: { cardRadius: number }
  rounded: unknown
  tone?: SurfaceTone
}) {
  return {
    resolvedGap: gap ?? '$3',
    resolvedMode: mode ?? (isGlass ? 'alwaysCard' : 'section'),
    resolvedPadding: p ?? '$4',
    resolvedRadius: rounded ?? profile.cardRadius,
    resolvedTone: tone ?? (isGlass ? 'secondary' : 'default'),
  } as const
}

export function resolveGlassOrbTokens({
  disabled,
  isGlass,
  isDarkGlass,
  variant,
}: {
  disabled: boolean
  isGlass: boolean
  isDarkGlass: boolean
  variant: 'primary' | 'secondary' | 'ghost'
}) {
  return {
    bg: isGlass ? '$surfaceTabGlass' : '$surfaceCardRaised',
    borderColor: isGlass ? '$surfaceTabGlassBorder' : '$surfaceCardBorder',
    borderWidth: isDarkGlass ? 0 : 1,
    cursor: disabled ? 'default' : 'pointer',
    elevation: isGlass ? 5 : 3,
    iconColor: variant === 'ghost' ? '$textSecondary' : '$accent',
    labelColor: variant === 'ghost' ? '$textSecondary' : '$textPrimary',
    opacity: disabled ? 0.55 : 1,
    shadowColor: isGlass ? '$surfaceTabGlassShadow' : '$surfaceCardShadow',
    shadowRadius: isGlass ? 20 : 16,
  } as const
}

export function resolvePreviewContainerTokens({
  isDarkGlass,
  isGlass,
  previewRadius,
}: {
  isDarkGlass: boolean
  isGlass: boolean
  previewRadius: number
}) {
  return {
    borderWidth: isDarkGlass ? 0 : 1,
    overflow: isGlass ? 'hidden' : undefined,
    rounded: previewRadius,
  } as const
}
