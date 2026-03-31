import { Text, Theme, XStack, YStack } from 'tamagui'

import {
  ThemeSelectionOverrideProvider,
  type ThemeAesthetic,
  type ThemeMode,
  type ThemePalette,
} from 'components/ThemePrefs'
import { SurfaceCard } from 'components/ui/controls'
import { useAestheticProfile } from 'components/ui/controlShared'

const AESTHETIC_LABELS: Record<ThemeAesthetic, string> = {
  modern: 'Modern',
  cyberpunk: 'Cyberpunk',
  glass: 'Glass',
}

const PALETTE_LABELS: Record<ThemePalette, string> = {
  signal: 'Signal',
  alloy: 'Alloy',
  pearl: 'Pearl',
}

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
      width={168}
      minW={168}
      maxW={168}
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

      <YStack gap="$0.75">
        <Text fontSize={10} color="$textMuted" letterSpacing={0.4}>
          {AESTHETIC_LABELS[aesthetic]}
        </Text>
        <XStack items="center" justify="space-between" gap="$2">
          <Text fontSize={12} fontWeight={active ? '700' : '600'} color="$textPrimary" flex={1}>
            {label}
          </Text>
          <YStack
            px="$1.5"
            py="$1"
            rounded={999}
            bg={active ? '$surfaceChipActive' : '$surfaceChip'}
            borderWidth={1}
            borderColor={active ? '$borderAccent' : '$borderSubtle'}
          >
            <Text
              fontSize={10}
              fontWeight={active ? '700' : '600'}
              color={active ? '$accent' : '$textMuted'}
            >
              {active ? 'Selected' : PALETTE_LABELS[palette]}
            </Text>
          </YStack>
        </XStack>
        <Text fontSize={11} color="$textSecondary">
          {PALETTE_LABELS[palette]} · {mode === 'dark' ? 'Dark' : 'Light'}
        </Text>
      </YStack>
    </SurfaceCard>
  )
}
