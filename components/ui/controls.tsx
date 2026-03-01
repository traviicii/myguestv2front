import { cloneElement, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Button,
  Input,
  Separator,
  Switch,
  Text,
  TextArea,
  XStack,
  YStack,
  useTheme,
} from 'tamagui'
import { useThemePrefs, type ThemeAesthetic } from '../ThemePrefs'
import { toNativeColor } from 'components/utils/color'
import {
  getGlassBlurIntensity,
  getGlassLayerColors,
  type GlassDensity,
} from './glassStyle'

type CardMode = 'section' | 'panel' | 'alwaysCard'
type SurfaceTone = 'default' | 'secondary' | 'tabGlass'
type HeaderMotif = 'auto' | 'plain' | 'bracket'

type AestheticProfile = {
  cardRadius: number
  panelRadius: number
  controlRadius: number
  chipRadius: number
  inputRadius: number
  switchRadius: number
  previewRadius: number
  chipBorderWidth: number
  sectionTransparent: boolean
  headingFontFamily?: string
  labelFontFamily?: string
  headingUppercase: boolean
  labelUppercase: boolean
  buttonUppercase: boolean
  eyebrowUppercase: boolean
  bracketHeaders: boolean
  bracketLabels: boolean
  dividerOpacity: number
  dividerWidth: number
  buttonPressOpacity: number
}

const AESTHETIC_PROFILE: Record<ThemeAesthetic, AestheticProfile> = {
  modern: {
    cardRadius: 0,
    panelRadius: 14,
    controlRadius: 10,
    chipRadius: 10,
    inputRadius: 10,
    switchRadius: 10,
    previewRadius: 14,
    chipBorderWidth: 1,
    sectionTransparent: true,
    headingUppercase: false,
    labelUppercase: false,
    buttonUppercase: false,
    eyebrowUppercase: true,
    bracketHeaders: false,
    bracketLabels: false,
    dividerOpacity: 0.8,
    dividerWidth: 1,
    buttonPressOpacity: 0.9,
  },
  cyberpunk: {
    cardRadius: 0,
    panelRadius: 0,
    controlRadius: 0,
    chipRadius: 0,
    inputRadius: 4,
    switchRadius: 4,
    previewRadius: 0,
    chipBorderWidth: 1.5,
    sectionTransparent: false,
    headingFontFamily: 'SpaceMono',
    labelFontFamily: 'SpaceMono',
    headingUppercase: true,
    labelUppercase: true,
    buttonUppercase: true,
    eyebrowUppercase: true,
    bracketHeaders: true,
    bracketLabels: true,
    dividerOpacity: 1,
    dividerWidth: 1.4,
    buttonPressOpacity: 0.84,
  },
  glass: {
    cardRadius: 28,
    panelRadius: 30,
    controlRadius: 20,
    chipRadius: 18,
    inputRadius: 20,
    switchRadius: 22,
    previewRadius: 32,
    chipBorderWidth: 1,
    sectionTransparent: false,
    headingUppercase: false,
    labelUppercase: false,
    buttonUppercase: false,
    eyebrowUppercase: false,
    bracketHeaders: false,
    bracketLabels: false,
    dividerOpacity: 0.64,
    dividerWidth: 1,
    buttonPressOpacity: 0.92,
  },
}

const normalizeLabel = (value: string) => value.trim().replace(/\s+/g, ' ')

const formatBracket = (value: string) => {
  const normalized = normalizeLabel(value)
  return `[${normalized}]`
}

const asStringChildren = (children: ReactNode): string | null => {
  if (typeof children === 'string') return children
  return null
}

function useAestheticProfile() {
  const { aesthetic } = useThemePrefs()
  return AESTHETIC_PROFILE[aesthetic]
}

function GlassEffectLayer({
  radius,
  mode,
  density = 'panel',
  intensity,
}: {
  radius: number
  mode: 'light' | 'dark'
  density?: GlassDensity
  intensity?: number
}) {
  const theme = useTheme()
  const layerColors = getGlassLayerColors(mode, {
    accent: toNativeColor(theme.backdropAccent?.val, mode === 'dark' ? '#9AB8FF' : '#8FC3FF'),
    start: toNativeColor(theme.backdropStart?.val, mode === 'dark' ? '#465A84' : '#CFE2FF'),
  })
  const gradientColors =
    density === 'tab'
      ? layerColors.tab
      : density === 'orb'
        ? layerColors.orb
        : layerColors.panel
  const blurIntensity = intensity ?? getGlassBlurIntensity(mode, density)

  return (
    <>
      <BlurView
        pointerEvents="none"
        intensity={blurIntensity}
        tint={mode === 'dark' ? 'dark' : 'light'}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={gradientColors}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
      />
    </>
  )
}

type ButtonIcon = React.ComponentProps<typeof Button>['icon']

const withIconColor = (icon: ButtonIcon, color: string): ButtonIcon => {
  if (!icon || !isValidElement(icon)) return icon
  return cloneElement(icon as ReactElement<any>, { color } as any)
}

const withNodeColor = (node: ReactNode, color: string) => {
  if (!node || !isValidElement(node)) return node
  return cloneElement(node as ReactElement<any>, { color } as any)
}

export const cardSurfaceProps = {
  bg: '$surfaceCardRaised',
  borderWidth: 1,
  borderColor: '$surfaceCardBorder',
  shadowColor: '$surfaceCardShadow',
  shadowRadius: 18,
  shadowOpacity: 1,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
} as const

export const chipSurfaceProps = {
  bg: '$surfaceChip',
  borderWidth: 1,
  borderColor: '$borderSubtle',
} as const

export function PrimaryButton({
  children,
  icon,
  iconAfter,
  ...props
}: React.ComponentProps<typeof Button>) {
  const profile = useAestheticProfile()
  const stringChildren = asStringChildren(children)
  const resolvedChildren =
    stringChildren === null ? (
      children
    ) : (
      <Text
        color="$buttonPrimaryFg"
        fontWeight="700"
        letterSpacing={profile.buttonUppercase ? 0.8 : 0}
        textTransform={profile.buttonUppercase ? 'uppercase' : undefined}
        style={
          profile.labelFontFamily
            ? ({ fontFamily: profile.labelFontFamily } as any)
            : undefined
        }
      >
        {stringChildren}
      </Text>
    )

  return (
    <Button
      height={44}
      rounded={profile.controlRadius}
      bg="$buttonPrimaryBg"
      borderWidth={1}
      borderColor="$buttonPrimaryBg"
      icon={withIconColor(icon, '$buttonPrimaryFg')}
      iconAfter={withIconColor(iconAfter, '$buttonPrimaryFg')}
      pressStyle={{
        bg: '$buttonPrimaryBgPress',
        borderColor: '$buttonPrimaryBgPress',
        opacity: profile.buttonPressOpacity,
      }}
      hoverStyle={{
        bg: '$buttonPrimaryBgPress',
        borderColor: '$buttonPrimaryBgPress',
      }}
      focusStyle={{ borderColor: '$focusRing' }}
      disabledStyle={{
        opacity: 0.58,
        bg: '$buttonPrimaryBgPress',
        borderColor: '$buttonPrimaryBgPress',
      }}
      {...props}
    >
      {resolvedChildren}
    </Button>
  )
}

export function SecondaryButton({
  children,
  icon,
  iconAfter,
  ...props
}: React.ComponentProps<typeof Button>) {
  const profile = useAestheticProfile()
  const stringChildren = asStringChildren(children)
  const resolvedChildren =
    stringChildren === null ? (
      children
    ) : (
      <Text
        color="$buttonSecondaryFg"
        fontWeight="700"
        letterSpacing={profile.buttonUppercase ? 0.8 : 0}
        textTransform={profile.buttonUppercase ? 'uppercase' : undefined}
        style={
          profile.labelFontFamily
            ? ({ fontFamily: profile.labelFontFamily } as any)
            : undefined
        }
      >
        {stringChildren}
      </Text>
    )

  return (
    <Button
      height={44}
      rounded={profile.controlRadius}
      bg="$buttonSecondaryBg"
      borderWidth={1}
      borderColor="$buttonSecondaryBorder"
      icon={withIconColor(icon, '$buttonSecondaryFg')}
      iconAfter={withIconColor(iconAfter, '$buttonSecondaryFg')}
      pressStyle={{
        bg: '$buttonSecondaryBgPress',
        borderColor: '$borderAccent',
        opacity: profile.buttonPressOpacity,
      }}
      hoverStyle={{
        bg: '$buttonSecondaryBgPress',
        borderColor: '$borderAccent',
      }}
      focusStyle={{ borderColor: '$focusRing' }}
      disabledStyle={{
        opacity: 0.58,
        bg: '$buttonSecondaryBg',
        borderColor: '$buttonSecondaryBorder',
      }}
      {...props}
    >
      {resolvedChildren}
    </Button>
  )
}

export function GhostButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const profile = useAestheticProfile()
  const stringChildren = asStringChildren(children)

  return (
    <Button
      height={40}
      chromeless
      rounded={profile.controlRadius}
      pressStyle={{ bg: '$surfaceChipActive', opacity: profile.buttonPressOpacity }}
      hoverStyle={{ bg: '$surfaceChipActive' }}
      {...props}
    >
      {stringChildren === null ? (
        children
      ) : (
        <Text
          color="$accent"
          textTransform={profile.buttonUppercase ? 'uppercase' : undefined}
          letterSpacing={profile.buttonUppercase ? 0.6 : 0}
          style={
            profile.labelFontFamily
              ? ({ fontFamily: profile.labelFontFamily } as any)
              : undefined
          }
        >
          {stringChildren}
        </Text>
      )}
    </Button>
  )
}

export function TextField(props: React.ComponentProps<typeof Input>) {
  const profile = useAestheticProfile()
  const focusStyle = {
    borderColor: '$focusRing',
    bg: '$surfaceFieldActive',
    ...(props.focusStyle as object | undefined),
  } as any

  return (
    <Input
      height={44}
      rounded={props.rounded ?? profile.inputRadius}
      bg="$surfaceField"
      borderWidth={1}
      borderColor="$borderSubtle"
      px="$3"
      fontSize={14}
      color="$textPrimary"
      placeholderTextColor="$textMuted"
      focusStyle={focusStyle}
      {...props}
    />
  )
}

export function TextAreaField(props: React.ComponentProps<typeof TextArea>) {
  const profile = useAestheticProfile()
  const focusStyle = {
    borderColor: '$focusRing',
    bg: '$surfaceFieldActive',
    ...(props.focusStyle as object | undefined),
  } as any

  return (
    <TextArea
      minH={120}
      rounded={props.rounded ?? profile.inputRadius}
      bg="$surfaceField"
      borderWidth={1}
      borderColor="$borderSubtle"
      px="$3"
      py="$3"
      fontSize={14}
      color="$textPrimary"
      placeholderTextColor="$textMuted"
      focusStyle={focusStyle}
      {...props}
    />
  )
}

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

export function FieldLabel({
  children,
  motif = 'auto',
  ...props
}: React.ComponentProps<typeof Text> & { motif?: HeaderMotif }) {
  const profile = useAestheticProfile()
  const childString = asStringChildren(children)
  const shouldBracket = motif === 'bracket' || (motif === 'auto' && profile.bracketLabels)
  const label =
    childString === null
      ? children
      : shouldBracket
        ? formatBracket(profile.labelUppercase ? childString.toUpperCase() : childString)
        : profile.labelUppercase
          ? childString.toUpperCase()
          : childString

  return (
    <Text
      fontSize={12}
      color="$textSecondary"
      letterSpacing={profile.labelUppercase ? 0.7 : 0}
      style={
        profile.labelFontFamily
          ? ({ fontFamily: profile.labelFontFamily } as any)
          : undefined
      }
      {...props}
    >
      {label}
    </Text>
  )
}

export function ThemedHeadingText({
  children,
  motif = 'auto',
  ...props
}: React.ComponentProps<typeof Text> & { motif?: HeaderMotif }) {
  const profile = useAestheticProfile()
  const childString = asStringChildren(children)
  const shouldBracket = motif === 'bracket' || (motif === 'auto' && profile.bracketHeaders)
  const heading =
    childString === null
      ? children
      : shouldBracket
        ? formatBracket(profile.headingUppercase ? childString.toUpperCase() : childString)
        : profile.headingUppercase
          ? childString.toUpperCase()
          : childString

  return (
    <Text
      fontFamily="$heading"
      color="$textPrimary"
      letterSpacing={profile.headingUppercase ? 0.9 : 0}
      style={
        profile.headingFontFamily
          ? ({ fontFamily: profile.headingFontFamily } as any)
          : undefined
      }
      {...props}
    >
      {heading}
    </Text>
  )
}

export function ThemedEyebrowText({
  children,
  motif = 'auto',
  ...props
}: React.ComponentProps<typeof Text> & { motif?: HeaderMotif }) {
  const profile = useAestheticProfile()
  const childString = asStringChildren(children)
  const shouldBracket = motif === 'bracket' || (motif === 'auto' && profile.bracketLabels)
  const eyebrow =
    childString === null
      ? children
      : shouldBracket
        ? formatBracket(profile.eyebrowUppercase ? childString.toUpperCase() : childString)
        : profile.eyebrowUppercase
          ? childString.toUpperCase()
          : childString

  return (
    <Text
      fontSize={11}
      letterSpacing={profile.eyebrowUppercase ? 1.1 : 0.8}
      color="$textMuted"
      style={
        profile.labelFontFamily
          ? ({ fontFamily: profile.labelFontFamily } as any)
          : undefined
      }
      {...props}
    >
      {eyebrow}
    </Text>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  motif = 'auto',
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  motif?: HeaderMotif
}) {
  return (
    <YStack gap="$1.5">
      {eyebrow ? <ThemedEyebrowText motif={motif}>{eyebrow}</ThemedEyebrowText> : null}
      <ThemedHeadingText motif={motif} fontWeight="700" fontSize={20}>
        {title}
      </ThemedHeadingText>
      {subtitle ? (
        <Text fontSize={12} color="$textSecondary">
          {subtitle}
        </Text>
      ) : null}
    </YStack>
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

  const isPanel = mode === 'panel' || mode === 'alwaysCard'
  const radius = isPanel ? profile.panelRadius : profile.cardRadius
  const resolvedBg =
    tone === 'secondary'
      ? '$surfaceSecondary'
      : tone === 'tabGlass'
        ? '$surfaceTabGlass'
        : isPanel
          ? '$surfacePanel'
          : '$surfaceCardRaised'
  const resolvedBorder =
    tone === 'secondary'
      ? '$surfaceSecondaryBorder'
      : tone === 'tabGlass'
        ? '$surfaceTabGlassBorder'
        : isPanel
          ? '$surfacePanelBorder'
          : '$surfaceCardBorder'
  const resolvedShadow =
    tone === 'tabGlass'
      ? '$surfaceTabGlassShadow'
      : isPanel || tone === 'secondary'
        ? '$surfacePanelShadow'
        : '$surfaceCardShadow'
  const glassDensity: GlassDensity = tone === 'tabGlass' ? 'tab' : 'panel'
  const glassIntensity = getGlassBlurIntensity(themeMode, glassDensity)

  return (
    <YStack
      rounded={radius}
      p="$4"
      gap="$3"
      bg={resolvedBg}
      borderWidth={isDarkGlass ? 0 : 1}
      borderColor={resolvedBorder}
      shadowColor={resolvedShadow}
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
  const { aesthetic, mode: themeMode } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const resolvedMode = mode ?? 'section'
  const resolvedTone = tone ?? (isGlass ? 'tabGlass' : 'default')
  const {
    p,
    px,
    py,
    pt,
    pb,
    pl,
    pr,
    gap,
    rounded,
    ...rest
  } = props
  const padding = p ?? '$4'
  const contentGap = gap ?? '$3'

  if (!isGlass) {
    return (
      <YStack
        {...cardSurfaceProps}
        rounded={rounded ?? profile.cardRadius}
        p={padding}
        gap={contentGap}
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
      rounded={rounded ?? profile.cardRadius}
      p={padding}
      gap={contentGap}
      px={px}
      py={py}
      pt={pt}
      pb={pb}
      pl={pl}
      pr={pr}
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
  const iconColor =
    variant === 'ghost' ? '$textSecondary' : '$accent'
  const labelColor =
    variant === 'ghost' ? '$textSecondary' : '$textPrimary'
  const blurIntensity = getGlassBlurIntensity(mode, 'orb')

  return (
    <YStack
      width={140}
      height={140}
      rounded={999}
      bg={isGlass ? '$surfaceTabGlass' : '$surfaceCardRaised'}
      borderWidth={isDarkGlass ? 0 : 1}
      borderColor={isGlass ? '$surfaceTabGlassBorder' : '$surfaceCardBorder'}
      shadowColor={isGlass ? '$surfaceTabGlassShadow' : '$surfaceCardShadow'}
      shadowRadius={isGlass ? 20 : 16}
      shadowOpacity={1}
      shadowOffset={{ width: 0, height: 8 }}
      elevation={isGlass ? 5 : 3}
      items="center"
      justify="center"
      overflow={isGlass ? 'hidden' : undefined}
      opacity={disabled ? 0.55 : 1}
      onPress={disabled ? undefined : onPress}
      pressStyle={disabled ? undefined : { opacity: 0.88, scale: 0.98 }}
      cursor={disabled ? 'default' : 'pointer'}
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
        {withNodeColor(icon, iconColor)}
        <Text
          fontSize={12}
          color={labelColor}
          style={{ textAlign: 'center' }}
        >
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
      bg={active ? '$surfaceChipActive' : '$surfaceChip'}
      borderColor={active ? '$borderAccent' : '$borderSubtle'}
      pressStyle={{
        opacity: 0.9,
        bg: active ? '$surfaceChipActive' : '$surfacePreview',
      }}
      {...props}
    />
  )
}

export function OptionChipLabel({
  active = false,
  motif = 'auto',
  children,
  ...props
}: React.ComponentProps<typeof Text> & {
  active?: boolean
  motif?: HeaderMotif
  children: ReactNode
}) {
  const profile = useAestheticProfile()
  const childString = asStringChildren(children)
  const shouldBracket = motif === 'bracket' || (motif === 'auto' && profile.bracketLabels)
  const label =
    childString === null
      ? children
      : shouldBracket
        ? formatBracket(profile.labelUppercase ? childString.toUpperCase() : childString)
        : profile.labelUppercase
          ? childString.toUpperCase()
          : childString

  return (
    <Text
      fontSize={11}
      color={active ? '$accent' : '$textSecondary'}
      letterSpacing={profile.labelUppercase ? 0.8 : 0}
      style={
        profile.labelFontFamily
          ? ({ fontFamily: profile.labelFontFamily } as any)
          : undefined
      }
      {...props}
    >
      {label}
    </Text>
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

  return (
    <YStack
      bg="$surfacePreview"
      borderWidth={isDarkGlass ? 0 : 1}
      borderColor="$surfacePanelBorder"
      rounded={profile.previewRadius}
      p="$3"
      gap="$2"
      shadowColor="$surfacePanelShadow"
      shadowRadius={12}
      shadowOpacity={1}
      shadowOffset={{ width: 0, height: 6 }}
      elevation={2}
      overflow={isGlass ? 'hidden' : undefined}
      {...props}
    >
      {isGlass ? <GlassEffectLayer radius={profile.previewRadius} mode={mode} intensity={60} /> : null}
      {children}
    </YStack>
  )
}

export function ThemedSwitch(props: React.ComponentProps<typeof Switch>) {
  const profile = useAestheticProfile()
  const isChecked = props.checked === true

  return (
    <Switch
      size="$2"
      rounded={profile.switchRadius}
      bg={isChecked ? '$switchTrackOn' : '$switchTrackOff'}
      borderColor={isChecked ? '$borderAccent' : '$switchTrackBorder'}
      borderWidth={1}
      {...props}
    >
      <Switch.Thumb
        rounded={profile.switchRadius}
        bg="$switchThumb"
        borderWidth={1}
        borderColor="$borderSubtle"
      />
    </Switch>
  )
}

export function ErrorPulseBorder({
  active,
  radius = 12,
  pulseKey = 0,
}: {
  active: boolean
  radius?: number
  pulseKey?: number
}) {
  const theme = useTheme()
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!active) {
      opacity.setValue(0)
      scale.setValue(1)
    }
  }, [active, opacity, scale])

  useEffect(() => {
    if (!active) return
    if (!pulseKey) return

    // Triggered by a changing pulseKey so forms can re-run the same animation
    // whenever the user attempts to submit with missing required fields.
    opacity.setValue(0)
    scale.setValue(1)
    const singlePulse = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.02,
          duration: 260,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ]),
    ])

    const animation = Animated.loop(singlePulse, { iterations: 2 })

    animation.start()
    return () => animation.stop()
  }, [pulseKey, active, opacity, scale])

  if (!active) return null

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        borderWidth: 2,
        borderRadius: radius + 2,
        borderColor: toNativeColor(theme.danger?.val, '#EF4444'),
        zIndex: 2,
        opacity,
        transform: [{ scale }],
      }}
    />
  )
}
