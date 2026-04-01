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

function ThemePresetMiniAction() {
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
        New client
      </Text>
    </YStack>
  )
}

function ThemePresetMiniMetric() {
  const profile = useAestheticProfile()

  return (
    <YStack
      rounded={Math.max(profile.panelRadius - 4, profile.controlRadius)}
      bg="$surfacePanel"
      borderWidth={1}
      borderColor="$surfacePanelBorder"
      p="$2"
      gap="$1"
    >
      <Text fontSize={10} color="$textSecondary">
        Overview
      </Text>
      <XStack items="flex-end" justify="space-between" gap="$2">
        <YStack gap="$0.5">
          <Text fontSize={10} color="$textMuted">
            Active clients
          </Text>
          <Text fontSize={18} fontWeight="700" color="$textPrimary">
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
            +3
          </Text>
        </YStack>
      </XStack>
    </YStack>
  )
}

function ThemePresetMiniClientRow() {
  const profile = useAestheticProfile()

  return (
    <YStack
      rounded={Math.max(profile.cardRadius - 6, profile.controlRadius)}
      bg="$surfaceCardRaised"
      borderWidth={1}
      borderColor="$surfaceCardBorder"
      p="$2"
      gap="$0.75"
    >
      <XStack items="center" justify="space-between" gap="$2">
        <YStack flex={1} minW={0} gap="$0.5">
          <Text numberOfLines={1} fontSize={11} fontWeight="600" color="$textPrimary">
            Avery Stone
          </Text>
          <Text numberOfLines={1} fontSize={10} color="$textSecondary">
            Balayage • Mar 21
          </Text>
        </YStack>
        <YStack
          width={8}
          height={8}
          rounded={profile.controlRadius === 0 ? 0 : 999}
          bg="$accent"
        />
      </XStack>
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
        <ThemePresetMiniMetric />
        <ThemePresetMiniClientRow />
        <ThemePresetMiniAction />
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
