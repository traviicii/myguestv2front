import type { ReactNode } from 'react'
import { Text, YStack } from 'tamagui'

import {
  asStringChildren,
  formatBracket,
  getFontFamilyStyle,
  type HeaderMotif,
  useAestheticProfile,
} from './controlShared'

export function FieldLabel({
  children,
  motif = 'auto',
  ...props
}: React.ComponentProps<typeof Text> & { motif?: HeaderMotif }) {
  const profile = useAestheticProfile()
  const isModernType = profile.headingFontFamily === 'Syne'
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
      letterSpacing={profile.labelUppercase ? 0.7 : isModernType ? 0.12 : 0}
      style={getFontFamilyStyle(profile.labelFontFamily) as never}
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
  const isModernType = profile.headingFontFamily === 'Syne'
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
      letterSpacing={profile.headingUppercase ? 0.9 : isModernType ? -0.28 : -0.1}
      style={getFontFamilyStyle(profile.headingFontFamily) as never}
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
  const isModernType = profile.headingFontFamily === 'Syne'
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
      letterSpacing={profile.eyebrowUppercase ? 1.1 : isModernType ? 0.28 : 0.8}
      color="$textMuted"
      style={getFontFamilyStyle(profile.labelFontFamily ?? profile.bodyFontFamily) as never}
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
  const profile = useAestheticProfile()

  return (
    <YStack gap="$1.5">
      {eyebrow ? <ThemedEyebrowText motif={motif}>{eyebrow}</ThemedEyebrowText> : null}
      <ThemedHeadingText motif={motif} fontWeight="700" fontSize={20}>
        {title}
      </ThemedHeadingText>
      {subtitle ? (
        <Text
          fontSize={12}
          color="$textSecondary"
          style={getFontFamilyStyle(profile.bodyFontFamily) as never}
        >
          {subtitle}
        </Text>
      ) : null}
    </YStack>
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
  const isModernType = profile.headingFontFamily === 'Syne'
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
      color={active ? '$chromeTintActive' : '$textSecondary'}
      letterSpacing={profile.labelUppercase ? 0.8 : isModernType ? 0.08 : 0}
      style={getFontFamilyStyle(profile.labelFontFamily) as never}
      {...props}
    >
      {label}
    </Text>
  )
}
