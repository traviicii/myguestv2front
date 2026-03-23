import { Text, Theme, XStack, YStack } from 'tamagui'

import {
  ThemeSelectionOverrideProvider,
  type ThemeAesthetic,
  type ThemeMode,
  type ThemePalette,
} from 'components/ThemePrefs'
import { SurfaceCard } from 'components/ui/controls'
import { useAestheticProfile } from 'components/ui/controlShared'

function ThemePresetArtwork() {
  const profile = useAestheticProfile()
  const motifRadius = Math.max(4, Math.min(profile.controlRadius, 18))

  return (
    <YStack
      height={92}
      rounded={profile.previewRadius}
      overflow="hidden"
      bg="$surfacePreview"
      borderWidth={1}
      borderColor="$surfacePanelBorder"
      p="$2.5"
      gap="$2"
    >
      <XStack justify="space-between" items="center">
        <YStack gap="$1">
          <YStack width={48} height={8} rounded={motifRadius} bg="$accent" />
          <YStack width={34} height={6} rounded={motifRadius} bg="$textMuted" opacity={0.55} />
        </YStack>
        <YStack
          width={28}
          height={28}
          rounded={motifRadius}
          bg="$surfaceChipActive"
          borderWidth={1}
          borderColor="$borderAccent"
        />
      </XStack>

      <XStack flex={1} gap="$1.5" items="flex-end">
        <YStack flex={1} gap="$1.5">
          <YStack
            height={12}
            width="72%"
            rounded={motifRadius}
            bg="$accent"
            opacity={0.72}
          />
          <YStack
            flex={1}
            rounded={motifRadius}
            bg="$surfaceCardRaised"
            borderWidth={1}
            borderColor="$surfaceCardBorder"
          />
        </YStack>
        <YStack
          width={44}
          height={52}
          rounded={motifRadius}
          bg="$surfaceCardRaised"
          borderWidth={1}
          borderColor="$surfaceCardBorder"
        />
      </XStack>
    </YStack>
  )
}

export function ThemePresetTile({
  active,
  aesthetic,
  label,
  mode,
  onPress,
  palette,
  testID,
  themeName,
}: {
  active: boolean
  aesthetic: ThemeAesthetic
  label: string
  mode: ThemeMode
  onPress: () => void
  palette: ThemePalette
  testID: string
  themeName: string
}) {
  return (
    <SurfaceCard
      testID={testID}
      width={156}
      minW={156}
      maxW={156}
      flex={0}
      mode="panel"
      tone="default"
      p="$2.5"
      gap="$2"
      borderColor={active ? '$borderAccent' : '$borderSubtle'}
      borderWidth={active ? 2 : 1}
      bg={active ? '$surfaceChipActive' : '$surfaceCardRaised'}
      cursor="pointer"
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label} ${mode} theme preset`}
      onPress={onPress}
      pressStyle={{ opacity: 0.94 }}
      style={{
        transform: [{ scale: active ? 1.02 : 1 }],
      }}
    >
      <ThemeSelectionOverrideProvider
        value={{
          aesthetic,
          mode,
          palette,
        }}
      >
        <Theme name={themeName as never}>
          <ThemePresetArtwork />
        </Theme>
      </ThemeSelectionOverrideProvider>

      <XStack items="center" justify="space-between" gap="$2">
        <Text fontSize={12} fontWeight={active ? '700' : '600'} color="$textPrimary">
          {label}
        </Text>
        <YStack
          width={10}
          height={10}
          rounded={999}
          bg={active ? '$accent' : '$surfaceChip'}
          borderWidth={1}
          borderColor={active ? '$accent' : '$borderSubtle'}
        />
      </XStack>
    </SurfaceCard>
  )
}
