import { Text, Theme, XStack, YStack } from 'tamagui'

import {
  ThemeSelectionOverrideProvider,
  type ThemeAesthetic,
  type ThemeMode,
  type ThemePalette,
} from 'components/ThemePrefs'
import { SurfaceCard, ThemedEyebrowText, ThemedHeadingText } from 'components/ui/controls'
import { useAestheticProfile } from 'components/ui/controlShared'

const AESTHETIC_LABELS: Record<ThemeAesthetic, string> = {
  modern: 'Modern',
  cyberpunk: 'Cyberpunk',
  glass: 'Glass',
}

function ThemePresetMiniButton({ active }: { active: boolean }) {
  const profile = useAestheticProfile()

  return (
    <YStack
      items="center"
      justify="center"
      height={30}
      px="$2"
      rounded={profile.controlRadius}
      bg="$buttonPrimaryBg"
      borderWidth={1}
      borderColor="$buttonPrimaryBorder"
    >
      <Text fontSize={11} fontWeight="700" color="$buttonPrimaryFg">
        {active ? 'Selected' : 'Select'}
      </Text>
    </YStack>
  )
}

function ThemePresetTileContent({
  active,
  aesthetic,
  isLive,
  label,
  mode,
}: {
  active: boolean
  aesthetic: ThemeAesthetic
  isLive: boolean
  label: string
  mode: ThemeMode
}) {
  const profile = useAestheticProfile()
  const statusLabel = active && !isLive ? 'Preview' : isLive ? 'Live' : null

  return (
    <YStack gap="$2">
      <YStack gap="$0.75">
        <ThemedEyebrowText>{AESTHETIC_LABELS[aesthetic]}</ThemedEyebrowText>
        <YStack minW={0} gap="$0.5">
          <ThemedHeadingText fontSize={15} fontWeight="700" numberOfLines={2}>
            {label}
          </ThemedHeadingText>
        </YStack>
      </YStack>

      <XStack items="center" justify="space-between" gap="$2">
        <Text fontSize={10} color="$textMuted" letterSpacing={0.3}>
          {mode === 'dark' ? 'Dark mode' : 'Light mode'}
        </Text>
        {statusLabel ? (
          <YStack
            px="$1.5"
            py={4}
            rounded={profile.chipRadius}
            bg="$surfaceChipActive"
            borderWidth={1}
            borderColor="$borderAccent"
          >
            <Text fontSize={10} fontWeight="700" color="$accent">
              {statusLabel}
            </Text>
          </YStack>
        ) : null}
      </XStack>

      <YStack
        rounded={profile.previewRadius}
        bg="$surfacePage"
        borderWidth={1}
        borderColor="$surfacePanelBorder"
        p="$2"
        gap="$1.5"
      >
        <YStack gap="$0.75">
          <Text fontSize={10} color="$textSecondary">
            Overview
          </Text>
          <XStack items="flex-end" justify="space-between" gap="$2">
            <YStack gap="$0.5">
              <Text fontSize={10} color="$textMuted">
                Active clients
              </Text>
              <Text fontSize={20} fontWeight="700" color="$textPrimary">
                24
              </Text>
            </YStack>
            <YStack
              px="$1.5"
              py={4}
              rounded={profile.chipRadius}
              bg="$surfaceChipActive"
              borderWidth={1}
              borderColor="$borderAccent"
            >
              <Text fontSize={10} fontWeight="700" color="$accent">
                Ready
              </Text>
            </YStack>
          </XStack>
        </YStack>

        <ThemePresetMiniButton active={active} />
      </YStack>
    </YStack>
  )
}

export function ThemePresetTile({
  active,
  aesthetic,
  isLive,
  label,
  mode,
  onPress,
  palette,
  testID,
  themeName,
}: {
  active: boolean
  aesthetic: ThemeAesthetic
  isLive: boolean
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
          width={158}
          minW={158}
          maxW={158}
          flex={0}
          mode="panel"
          tone="default"
          p="$2.5"
          gap="$2"
          borderColor={active ? '$borderAccent' : '$surfacePanelBorder'}
          borderWidth={active ? 2 : 1}
          cursor="pointer"
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          accessibilityLabel={`${label} ${mode} theme preset`}
          onPress={onPress}
          pressStyle={{ opacity: 0.94 }}
        >
          <ThemePresetTileContent
            active={active}
            aesthetic={aesthetic}
            isLive={isLive}
            label={label}
            mode={mode}
          />
        </SurfaceCard>
      </Theme>
    </ThemeSelectionOverrideProvider>
  )
}
