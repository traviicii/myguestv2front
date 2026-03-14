import { Button } from 'tamagui'

import { useAestheticProfile, withIconColor } from './controlShared'
import {
  GlassButtonLayer,
  useGlassButtonLayerColors,
  useResolvedButtonChildren,
} from './buttonShared'

export function PrimaryButton({
  children,
  icon,
  iconAfter,
  ...props
}: React.ComponentProps<typeof Button>) {
  const profile = useAestheticProfile()
  const { colors, isGlassLight } = useGlassButtonLayerColors('primary')
  const resolvedChildren = useResolvedButtonChildren({
    children,
    color: '$buttonPrimaryFg',
  })

  return (
    <Button
      height={44}
      rounded={profile.controlRadius}
      bg="$buttonPrimaryBg"
      borderWidth={1}
      borderColor="$buttonPrimaryBorder"
      overflow={isGlassLight ? 'hidden' : undefined}
      icon={withIconColor(icon, '$buttonPrimaryFg')}
      iconAfter={withIconColor(iconAfter, '$buttonPrimaryFg')}
      pressStyle={{
        bg: '$buttonPrimaryBgPress',
        borderColor: '$buttonPrimaryBorderPress',
        opacity: profile.buttonPressOpacity,
      }}
      hoverStyle={{
        bg: '$buttonPrimaryBgPress',
        borderColor: '$buttonPrimaryBorderPress',
      }}
      focusStyle={{ borderColor: '$focusRing' }}
      disabledStyle={{
        opacity: 0.58,
        bg: '$buttonPrimaryBgPress',
        borderColor: '$buttonPrimaryBorderPress',
      }}
      {...props}
    >
      {isGlassLight ? (
        <GlassButtonLayer
          colors={colors}
          start={{ x: 0.12, y: 0 }}
          end={{ x: 0.88, y: 1 }}
          radius={profile.controlRadius}
          opacity={0.6}
        />
      ) : null}
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
  const { colors, isGlassLight } = useGlassButtonLayerColors('secondary')
  const resolvedChildren = useResolvedButtonChildren({
    children,
    color: '$buttonSecondaryFg',
  })

  return (
    <Button
      height={44}
      rounded={profile.controlRadius}
      bg="$buttonSecondaryBg"
      borderWidth={1}
      borderColor="$buttonSecondaryBorder"
      overflow={isGlassLight ? 'hidden' : undefined}
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
      {isGlassLight ? (
        <GlassButtonLayer
          colors={colors}
          start={{ x: 0.14, y: 0 }}
          end={{ x: 0.86, y: 1 }}
          radius={profile.controlRadius}
          opacity={0.4}
        />
      ) : null}
      {resolvedChildren}
    </Button>
  )
}

export function GhostButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const profile = useAestheticProfile()
  const resolvedChildren = useResolvedButtonChildren({
    children,
    color: '$accent',
  })

  return (
    <Button
      height={40}
      chromeless
      rounded={profile.controlRadius}
      pressStyle={{ bg: '$surfaceChipActive', opacity: profile.buttonPressOpacity }}
      hoverStyle={{ bg: '$surfaceChipActive' }}
      {...props}
    >
      {resolvedChildren}
    </Button>
  )
}
