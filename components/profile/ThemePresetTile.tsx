import { Check } from '@tamagui/lucide-icons'
import { Text, Theme, XStack, YStack } from 'tamagui'

import {
  ThemeSelectionOverrideProvider,
  type ThemeAesthetic,
  type ThemeMode,
  type ThemePalette,
} from 'components/ThemePrefs'
import {
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  ThemedEyebrowText,
  ThemedHeadingText,
} from 'components/ui/controls'
import { useAestheticProfile } from 'components/ui/controlShared'

function ThemePresetSelectedMarker({ testID }: { testID: string }) {
  const profile = useAestheticProfile()

  return (
    <YStack
      testID={testID}
      width={22}
      height={22}
      rounded={profile.chipRadius}
      items="center"
      justify="center"
      bg="$accent"
      borderWidth={1}
      borderColor="$accent"
      accessibilityLabel="Selected preset"
    >
      <Check size={12} color="$accentContrast" />
    </YStack>
  )
}

function ThemePresetClientRow() {
  const profile = useAestheticProfile()

  return (
    <YStack
      rounded={Math.max(profile.cardRadius - 8, profile.controlRadius)}
      bg="$surfaceCardRaised"
      borderWidth={1}
      borderColor="$surfaceCardBorder"
      p="$2.5"
      gap="$1"
    >
      <Text numberOfLines={1} fontSize={11} fontWeight="700" color="$textPrimary">
        Alexis Asoshnick
      </Text>
      <Text numberOfLines={1} fontSize={10} color="$textSecondary">
        Cut • Last visit Mar 24
      </Text>
    </YStack>
  )
}

function ThemePresetSelectionButton({
  current,
  testID,
}: {
  current: boolean
  testID: string
}) {
  const ButtonComponent = current ? PrimaryButton : SecondaryButton

  return (
    <XStack>
      <ButtonComponent
        testID={testID}
        minW={112}
        height={32}
        px="$3"
        icon={current ? <Check size={14} /> : undefined}
        onPress={() => {}}
        pointerEvents="none"
      >
        {current ? 'Selected' : 'Select'}
      </ButtonComponent>
    </XStack>
  )
}

function ThemePresetFragment({
  current,
  testID,
}: {
  current: boolean
  testID: string
}) {
  return (
    <YStack width={156} maxW="100%" gap="$1.5">
      <ThemedEyebrowText>Pinned</ThemedEyebrowText>
      <ThemePresetClientRow />
      <ThemePresetSelectionButton current={current} testID={testID} />
    </YStack>
  )
}

export function ThemePresetTile({
  current,
  aesthetic,
  label,
  mode,
  onPress,
  palette,
  testID,
  themeName,
}: {
  current: boolean
  aesthetic: ThemeAesthetic
  label: string
  mode: ThemeMode
  onPress: () => void
  palette: ThemePalette
  testID: string
  themeName: string
}) {
  return (
    <ThemeSelectionOverrideProvider
      value={{
        aesthetic,
        mode,
        palette,
      }}
    >
      <Theme name={themeName as never}>
        <SurfaceCard
          testID={testID}
          width="100%"
          mode="panel"
          tone="default"
          p="$2.5"
          gap="$2"
          borderColor={current ? '$borderAccent' : '$surfacePanelBorder'}
          borderWidth={current ? 2 : 1}
          cursor="pointer"
          accessibilityRole="button"
          accessibilityState={{ selected: current }}
          accessibilityLabel={`${label} preset`}
          onPress={onPress}
          pressStyle={{ opacity: 0.96, scale: 0.995 }}
        >
          <XStack items="center" gap="$2.5">
            <YStack flex={1} minW={0} justify="center" py="$1">
              <XStack items="flex-start" justify="space-between" gap="$2">
                <ThemedHeadingText
                  flex={1}
                  minW={0}
                  fontSize={16}
                  fontWeight="700"
                  numberOfLines={2}
                >
                  {label}
                </ThemedHeadingText>
                {current ? (
                  <ThemePresetSelectedMarker testID={`${testID}-selected-marker`} />
                ) : null}
              </XStack>
            </YStack>

            <YStack
              shrink={0}
              pl="$2.5"
              py="$0.5"
              borderLeftWidth={1}
              borderLeftColor={current ? '$borderAccent' : '$surfacePanelBorder'}
            >
              <ThemePresetFragment current={current} testID={`${testID}-cta`} />
            </YStack>
          </XStack>
        </SurfaceCard>
      </Theme>
    </ThemeSelectionOverrideProvider>
  )
}
