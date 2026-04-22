import { Modal, Pressable, StyleSheet } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { ScrollView, Text, Theme, XStack, YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { ThemePresetTile } from 'components/profile/ThemePresetTile'
import {
  AESTHETIC_OPTIONS,
  MODE_OPTIONS,
  PALETTE_OPTIONS,
} from 'components/profile/themeOptions'
import { useThemePickerScreenModel } from 'components/profile/useThemePickerScreenModel'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import {
  FieldLabel,
  GhostButton,
  OptionChip,
  OptionChipLabel,
  SecondaryButton,
  SurfaceCard,
  ThemedHeadingText,
  ThemedSwitch,
} from 'components/ui/controls'
import { FALLBACK_COLORS } from 'components/utils/color'

function ModeToggleRow({
  mode,
  onChange,
  switchTestID,
}: {
  mode: 'light' | 'dark'
  onChange: (nextMode: 'light' | 'dark') => void
  switchTestID: string
}) {
  return (
    <XStack items="center" gap="$3">
      <Text
        fontSize={12}
        fontWeight={mode === 'light' ? '700' : '500'}
        color={mode === 'light' ? '$textPrimary' : '$textSecondary'}
      >
        Light
      </Text>
      <ThemedSwitch
        testID={switchTestID}
        checked={mode === 'dark'}
        onCheckedChange={(checked) => onChange(checked ? 'dark' : 'light')}
      />
      <Text
        fontSize={12}
        fontWeight={mode === 'dark' ? '700' : '500'}
        color={mode === 'dark' ? '$textPrimary' : '$textSecondary'}
      >
        Dark
      </Text>
    </XStack>
  )
}

export default function ThemePreferencesScreen() {
  const router = useRouter()
  const model = useThemePickerScreenModel()
  const selectedAesthetic = AESTHETIC_OPTIONS.find((option) => option.id === model.aesthetic)
  const selectedPalette = PALETTE_OPTIONS.find((option) => option.id === model.palette)
  const selectedMode = MODE_OPTIONS.find((option) => option.id === model.mode)

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack testID="theme-preferences-screen" flex={1} bg="$surfacePage" position="relative">
        <AmbientBackdrop />
        <ScreenTopBar topInset={model.topInset} onBack={() => router.back()} />

        <ScrollView
          contentContainerStyle={{
            paddingBottom: model.bottomInset + 28,
          } as never}
        >
          <YStack px="$5" gap="$4">
            <XStack items="flex-start" justify="space-between" gap="$4">
              <YStack flex={1} minW={0} gap="$1.5">
                <ThemedHeadingText fontWeight="700" fontSize={20}>
                  Theme Preferences
                </ThemedHeadingText>
                <Text fontSize={12} color="$textSecondary">
                  Tap a full look to switch instantly, or use Customize when you
                  want to tune it yourself.
                </Text>

                <YStack gap="$0.5">
                  <FieldLabel>Current theme</FieldLabel>
                  <Text fontSize={13} fontWeight="700" color="$textPrimary">
                    {model.currentThemeLabel}
                  </Text>
                </YStack>
              </YStack>

              <SecondaryButton
                testID="theme-customize-button"
                onPress={model.handleOpenCustomize}
              >
                Customize
              </SecondaryButton>
            </XStack>

            <YStack gap="$1.5">
              <FieldLabel>Curated presets</FieldLabel>
              <Text fontSize={11} color="$textSecondary">
                Each card uses the actual aesthetic, mode, and palette it
                represents.
              </Text>
            </YStack>

            <YStack testID="theme-preset-gallery" gap="$3">
              {model.presetOptions.map((preset) => (
                <ThemePresetTile
                  key={preset.id}
                  current={model.currentPresetId === preset.id}
                  aesthetic={preset.aesthetic}
                  label={preset.label}
                  mode={preset.mode}
                  onPress={() => model.handleSelectPreset(preset.id)}
                  palette={preset.palette}
                  testID={`theme-preset-${preset.id}`}
                  themeName={preset.themeName}
                />
              ))}
            </YStack>
          </YStack>
        </ScrollView>

        <Modal
          transparent
          visible={model.customizeOpen}
          animationType="fade"
          onRequestClose={model.handleCloseCustomize}
        >
          <Theme name={model.currentThemeName as never}>
            <YStack flex={1} justify="flex-end">
              <Pressable
                testID="theme-customize-overlay"
                style={styles.overlay}
                onPress={model.handleCloseCustomize}
              />

              <YStack px="$4" pb="$4">
                <SurfaceCard
                  testID="theme-customize-sheet"
                  mode="panel"
                  tone="default"
                  p="$4"
                  gap="$3.5"
                  rounded="$6"
                >
                  <XStack items="center" justify="space-between" gap="$3">
                    <YStack flex={1} gap="$0.5">
                      <ThemedHeadingText fontWeight="700" fontSize={16}>
                        Customize
                      </ThemedHeadingText>
                      <Text fontSize={11} color="$textSecondary">
                        The sheet updates live as you change the look.
                      </Text>
                    </YStack>
                    <GhostButton onPress={model.handleCloseCustomize}>Done</GhostButton>
                  </XStack>

                  <YStack gap="$1.5">
                    <FieldLabel>Current</FieldLabel>
                    <XStack gap="$2" flexWrap="wrap">
                      <OptionChip pointerEvents="none" active>
                        <OptionChipLabel active>{model.currentThemeLabel}</OptionChipLabel>
                      </OptionChip>
                    </XStack>
                  </YStack>

                  <YStack gap="$1.5">
                    <FieldLabel>Mode</FieldLabel>
                    <ModeToggleRow
                      mode={model.mode}
                      onChange={model.handleToggleMode}
                      switchTestID="theme-mode-toggle"
                    />
                    {selectedMode ? (
                      <Text fontSize={11} color="$textSecondary">
                        {selectedMode.description}
                      </Text>
                    ) : null}
                  </YStack>

                  <YStack gap="$1.5">
                    <FieldLabel>Aesthetic</FieldLabel>
                    <XStack gap="$2" flexWrap="wrap">
                      {AESTHETIC_OPTIONS.map((option) => (
                        <OptionChip
                          key={option.id}
                          testID={`theme-customize-aesthetic-${option.id}`}
                          active={model.aesthetic === option.id}
                          onPress={() => model.handleSelectAesthetic(option.id)}
                        >
                          <OptionChipLabel active={model.aesthetic === option.id}>
                            {option.label}
                          </OptionChipLabel>
                        </OptionChip>
                      ))}
                    </XStack>
                    {selectedAesthetic ? (
                      <Text fontSize={11} color="$textSecondary">
                        {selectedAesthetic.description}
                      </Text>
                    ) : null}
                  </YStack>

                  <YStack gap="$1.5">
                    <FieldLabel>Palette</FieldLabel>
                    <XStack gap="$2" flexWrap="wrap">
                      {PALETTE_OPTIONS.map((option) => (
                        <OptionChip
                          key={option.id}
                          testID={`theme-customize-palette-${option.id}`}
                          active={model.palette === option.id}
                          onPress={() => model.handleSelectPalette(option.id)}
                        >
                          <OptionChipLabel active={model.palette === option.id}>
                            {option.label}
                          </OptionChipLabel>
                        </OptionChip>
                      ))}
                    </XStack>
                    {selectedPalette ? (
                      <Text fontSize={11} color="$textSecondary">
                        {selectedPalette.description}
                      </Text>
                    ) : null}
                  </YStack>
                </SurfaceCard>
              </YStack>
            </YStack>
          </Theme>
        </Modal>
      </YStack>
    </>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: FALLBACK_COLORS.modalOverlaySoft,
  },
})
