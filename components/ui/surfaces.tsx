import type { ReactNode } from 'react'
import { Separator, Text, XStack, YStack } from 'tamagui'

import { useThemePrefs } from '../ThemePrefs'
import { getGlassBlurIntensity, type GlassDensity } from './glassStyle'
import {
  cardSurfaceProps,
  chipSurfaceProps,
  GlassEffectLayer,
  type CardMode,
  type SurfaceTone,
  useAestheticProfile,
  withNodeColor,
} from './controlShared'
import {
  resolveGlassOrbTokens,
  resolvePreviewCardDefaults,
  resolvePreviewContainerTokens,
  resolveSurfaceCardRadius,
  resolveSurfaceCardTokens,
} from './surfaceUtils'

export function SectionDivider(props: React.ComponentProps<typeof Separator>) {
  const profile = useAestheticProfile()

  return (
    <Separator
      borderColor="$divider"
      opacity={profile.dividerOpacity}
      borderBottomWidth={profile.dividerWidth}
      {...props}
    />
  )
}

export function SurfaceCard({
  mode = 'section',
  tone = 'default',
  children,
  ...props
}: React.ComponentProps<typeof YStack> & { mode?: CardMode; tone?: SurfaceTone }) {
  const profile = useAestheticProfile()
  const { aesthetic, mode: themeMode } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const isDarkGlass = isGlass && themeMode === 'dark'

  if (mode === 'section' && profile.sectionTransparent && tone === 'default') {
    return (
      <YStack
        rounded={profile.cardRadius}
        p="$4"
        gap="$3"
        bg="transparent"
        borderWidth={0}
        shadowOpacity={0}
        elevation={0}
        {...props}
      >
        {children}
      </YStack>
    )
  }

  const { isPanel, radius } = resolveSurfaceCardRadius({ mode, profile })
  const { borderWidth, resolvedBg, resolvedBorder, resolvedShadow } =
    resolveSurfaceCardTokens({
      isDarkGlass,
      isPanel,
      tone,
    })
  const glassDensity: GlassDensity = tone === 'tabGlass' ? 'tab' : 'panel'
  const glassIntensity = getGlassBlurIntensity(themeMode, glassDensity)

  return (
    <YStack
      rounded={radius}
      p="$4"
      gap="$3"
      bg={resolvedBg as never}
      borderWidth={borderWidth}
      borderColor={resolvedBorder as never}
      shadowColor={resolvedShadow as never}
      shadowRadius={18}
      shadowOpacity={1}
      shadowOffset={{ width: 0, height: 8 }}
      elevation={2}
      overflow={isGlass ? 'hidden' : undefined}
      {...props}
    >
      {isGlass ? (
        <GlassEffectLayer
          radius={radius}
          mode={themeMode}
          density={glassDensity}
          intensity={glassIntensity}
        />
      ) : null}
      {children}
    </YStack>
  )
}

export function PreviewCard({
  mode,
  tone,
  children,
  ...props
}: React.ComponentProps<typeof YStack> & { mode?: CardMode; tone?: SurfaceTone }) {
  const profile = useAestheticProfile()
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const { p, px, py, pt, pb, pl, pr, gap, rounded, ...rest } = props
  const {
    resolvedGap,
    resolvedMode,
    resolvedPadding,
    resolvedRadius,
    resolvedTone,
  } = resolvePreviewCardDefaults({
    gap,
    isGlass,
    mode,
    p,
    profile,
    rounded,
    tone,
  })

  if (!isGlass) {
    return (
      <YStack
        {...cardSurfaceProps}
        rounded={resolvedRadius as never}
        p={resolvedPadding as never}
        gap={resolvedGap as never}
        {...rest}
      >
        {children}
      </YStack>
    )
  }

  return (
    <SurfaceCard
      mode={resolvedMode}
      tone={resolvedTone}
      rounded={resolvedRadius as never}
      p={resolvedPadding as never}
      gap={resolvedGap as never}
      px={px}
      py={py}
      pt={pt}
      pb={pb}
      pl={pl}
      pr={pr}
      position="relative"
      {...rest}
    >
      {children}
    </SurfaceCard>
  )
}

export function GlassOrbAction({
  label,
  icon,
  variant = 'secondary',
  disabled = false,
  onPress,
}: {
  label: string
  icon: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  onPress?: () => void
}) {
  const { aesthetic, mode } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const isDarkGlass = isGlass && mode === 'dark'
  const blurIntensity = getGlassBlurIntensity(mode, 'orb')
  const orbTokens = resolveGlassOrbTokens({
    disabled,
    isDarkGlass,
    isGlass,
    variant,
  })

  return (
    <YStack
      width={140}
      height={140}
      rounded={999}
      bg={orbTokens.bg as never}
      borderWidth={orbTokens.borderWidth}
      borderColor={orbTokens.borderColor as never}
      shadowColor={orbTokens.shadowColor as never}
      shadowRadius={orbTokens.shadowRadius}
      shadowOpacity={1}
      shadowOffset={{ width: 0, height: 8 }}
      elevation={orbTokens.elevation}
      items="center"
      justify="center"
      overflow={isGlass ? 'hidden' : undefined}
      opacity={orbTokens.opacity}
      onPress={disabled ? undefined : onPress}
      pressStyle={disabled ? undefined : { opacity: 0.88, scale: 0.98 }}
      cursor={orbTokens.cursor}
    >
      {isGlass ? (
        <GlassEffectLayer
          radius={999}
          mode={mode}
          density="orb"
          intensity={blurIntensity}
        />
      ) : null}
      <YStack items="center" justify="center" gap="$2" px="$2">
        {withNodeColor(icon, orbTokens.iconColor)}
        <Text fontSize={12} color={orbTokens.labelColor as never} style={{ textAlign: 'center' }}>
          {label}
        </Text>
        {disabled ? (
          <Text fontSize={10} color="$textMuted">
            Coming soon
          </Text>
        ) : null}
      </YStack>
    </YStack>
  )
}

export function OptionChip({
  active = false,
  ...props
}: React.ComponentProps<typeof XStack> & { active?: boolean }) {
  const profile = useAestheticProfile()

  return (
    <XStack
      rounded={profile.chipRadius}
      px="$2.5"
      py="$1.5"
      items="center"
      borderWidth={profile.chipBorderWidth}
      bg={active ? '$surfaceChipActive' : chipSurfaceProps.bg}
      borderColor={active ? '$borderAccent' : chipSurfaceProps.borderColor}
      pressStyle={{
        opacity: 0.9,
        bg: active ? '$surfaceChipActive' : '$surfacePreview',
      }}
      {...props}
    />
  )
}

export function PreviewContainer({
  children,
  ...props
}: React.ComponentProps<typeof YStack>) {
  const profile = useAestheticProfile()
  const { aesthetic, mode } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const isDarkGlass = isGlass && mode === 'dark'
  const containerTokens = resolvePreviewContainerTokens({
    isDarkGlass,
    isGlass,
    previewRadius: profile.previewRadius,
  })

  return (
    <YStack
      bg="$surfacePreview"
      borderWidth={containerTokens.borderWidth}
      borderColor="$surfacePanelBorder"
      rounded={containerTokens.rounded}
      p="$3"
      gap="$2"
      shadowColor="$surfacePanelShadow"
      shadowRadius={12}
      shadowOpacity={1}
      shadowOffset={{ width: 0, height: 6 }}
      elevation={2}
      overflow={containerTokens.overflow as never}
      {...props}
    >
      {isGlass ? <GlassEffectLayer radius={profile.previewRadius} mode={mode} intensity={60} /> : null}
      {children}
    </YStack>
  )
}
