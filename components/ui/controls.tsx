import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { styled, Button, Input, TextArea, Separator, Switch, useTheme } from 'tamagui'
import { useThemePrefs } from '../ThemePrefs'

// Shared UI primitives keep spacing, color, and interaction patterns
// consistent across all screens.
export const PrimaryButton = styled(Button, {
  height: 44,
  borderRadius: 12,
  bg: '$accent',
  color: '$accentContrast',
  pressStyle: { bg: '$accentPress' },
  hoverStyle: { bg: '$accentPress' },
})

export const SecondaryButton = styled(Button, {
  height: 44,
  borderRadius: 12,
  bg: '$background',
  color: '$gray9',
  borderWidth: 1,
  borderColor: '$gray3',
  pressStyle: { bg: '$gray2' },
  hoverStyle: { bg: '$gray2' },
})

export const GhostButton = styled(Button, {
  height: 40,
  chromeless: true,
  color: '$gray8',
})

export const TextField = styled(Input, {
  height: 44,
  borderRadius: 12,
  bg: '$background',
  borderWidth: 1,
  borderColor: '$gray3',
  px: '$3',
  fontSize: 14,
  color: '$color',
})

export const TextAreaField = styled(TextArea, {
  minHeight: 120,
  borderRadius: 12,
  bg: '$background',
  borderWidth: 1,
  borderColor: '$gray3',
  px: '$3',
  py: '$3',
  fontSize: 14,
  color: '$color',
})

export const SectionDivider = styled(Separator, {
  borderColor: '$gray3',
  opacity: 0.6,
})

export function ThemedSwitch(props: React.ComponentProps<typeof Switch>) {
  const { mode } = useThemePrefs()
  const isDark = mode === 'dark'

  return (
    <Switch
      size="$2"
      bg={isDark ? '$gray3' : '$gray6'}
      borderColor={isDark ? '$gray4' : '$gray7'}
      borderWidth={1}
      checkedStyle={{ bg: '$accent', borderColor: '$accentPress' }}
      {...props}
    >
      <Switch.Thumb
        bg={isDark ? '$gray11' : '$gray1'}
        borderWidth={1}
        borderColor="$gray3"
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
  }, [pulseKey])

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
        borderColor: theme.red10?.val ?? '#EF4444',
        zIndex: 2,
        opacity,
        transform: [{ scale }],
      }}
    />
  )
}
