import { forwardRef, useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { Input, Switch, TextArea, useTheme } from 'tamagui'

import { toNativeColor } from 'components/utils/color'
import { useAestheticProfile } from './controlShared'

export const TextField = forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>((props, ref) => {
  const profile = useAestheticProfile()
  const focusStyle = {
    borderColor: '$focusRing',
    bg: '$surfaceFieldActive',
    ...(props.focusStyle as object | undefined),
  } as never

  return (
    <Input
      ref={ref}
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
})

TextField.displayName = 'TextField'

export function TextAreaField(props: React.ComponentProps<typeof TextArea>) {
  const profile = useAestheticProfile()
  const focusStyle = {
    borderColor: '$focusRing',
    bg: '$surfaceFieldActive',
    ...(props.focusStyle as object | undefined),
  } as never

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
    if (!active || !pulseKey) return

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
