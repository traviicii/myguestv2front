import { useEffect, useRef } from 'react'
import { Animated, Easing, Modal, Pressable, StyleSheet } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { ScrollView, Text, Theme, XStack, YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { ThemeSelectionOverrideProvider } from 'components/ThemePrefs'
import { StyleStudioPreview } from 'components/profile/StyleStudioPreview'
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
  ThemedSwitch,
  OptionChip,
  OptionChipLabel,
  PrimaryButton,
  PreviewContainer,
  SecondaryButton,
  SurfaceCard,
  ThemedHeadingText,
} from 'components/ui/controls'

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
  const stageOpacity = useRef(new Animated.Value(1)).current
  const stageScale = useRef(new Animated.Value(1)).current
  const statusTitle = model.hasPendingThemeChanges
    ? 'Previewing changes'
    : model.applyState === 'applied'
      ? 'Theme applied'
      : 'Current theme'
  const statusBody = model.hasPendingThemeChanges
    ? `${model.draftThemeLabel} is in preview. ${model.savedThemeLabel} is still live across the app.`
    : model.applyState === 'applied'
      ? `${model.savedThemeLabel} is now live across the app.`
      : `${model.savedThemeLabel} is currently live across the app.`
  const selectedAesthetic = AESTHETIC_OPTIONS.find(
    (option) => option.id === model.draftTheme.aesthetic
  )
  const selectedPalette = PALETTE_OPTIONS.find(
    (option) => option.id === model.draftTheme.palette
  )
  const selectedMode = MODE_OPTIONS.find((option) => option.id === model.draftTheme.mode)

  useEffect(() => {
    stageOpacity.setValue(0.92)
    stageScale.setValue(0.985)

    Animated.parallel([
      Animated.timing(stageOpacity, {
        toValue: 1,
        duration: 170,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(stageScale, {
        toValue: 1,
        duration: 170,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [model.previewThemeName, stageOpacity, stageScale])

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemeSelectionOverrideProvider value={model.controlsThemeSelection}>
        <Theme name={model.controlsThemeName as never}>
          <YStack testID="theme-preferences-screen" flex={1} bg="$surfacePage" position="relative">
            <AmbientBackdrop />
            <ScreenTopBar topInset={model.topInset} onBack={() => router.back()} />

            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: model.bottomInset + 132,
              } as never}
            >
              <YStack flex={1} px="$5" gap="$4">
                <XStack items="flex-start" justify="space-between" gap="$4">
                  <YStack flex={1} minW={0} gap="$1.5">
                    <ThemedHeadingText fontWeight="700" fontSize={20}>
                      Theme Preferences
                    </ThemedHeadingText>
                    <Text fontSize={12} color="$textSecondary">
                      Preview curated looks, then apply the one you want live across the
                      app.
                    </Text>
                    <XStack gap="$2" flexWrap="wrap">
                      <OptionChip pointerEvents="none" active={!model.hasPendingThemeChanges}>
                        <OptionChipLabel active={!model.hasPendingThemeChanges}>
                          Live · {model.savedThemeLabel}
                        </OptionChipLabel>
                      </OptionChip>
                      {model.hasPendingThemeChanges ? (
                        <OptionChip pointerEvents="none" active>
                          <OptionChipLabel active>
                            Preview · {model.draftThemeLabel}
                          </OptionChipLabel>
                        </OptionChip>
                      ) : null}
                    </XStack>
                  </YStack>

                  <YStack items="flex-end" pt="$1">
                    <ModeToggleRow
                      mode={model.draftTheme.mode}
                      onChange={model.handleToggleMode}
                      switchTestID="theme-mode-toggle-inline"
                    />
                  </YStack>
                </XStack>

                <ThemeSelectionOverrideProvider value={model.previewThemeSelection}>
                  <Theme name={model.previewThemeName as never}>
                    <YStack gap="$2">
                      <YStack gap="$1">
                        <FieldLabel>Preview</FieldLabel>
                        <Text fontSize={11} color="$textSecondary">
                          This stage updates while you experiment. Apply Theme makes it
                          live across the rest of the app.
                        </Text>
                      </YStack>
                      <Animated.View
                        style={{
                          opacity: stageOpacity,
                          transform: [{ scale: stageScale }],
                        }}
                      >
                        <PreviewContainer
                          testID="theme-preview-stage"
                          accessibilityLabel={model.draftThemeLabel}
                          minH={428}
                          p="$4"
                        >
                          <StyleStudioPreview />
                        </PreviewContainer>
                      </Animated.View>
                    </YStack>
                  </Theme>
                </ThemeSelectionOverrideProvider>

                <YStack gap="$2.5">
                  <XStack items="flex-start" justify="space-between" gap="$3">
                    <YStack gap="$1" flex={1} pr="$3">
                      <FieldLabel>Preset gallery</FieldLabel>
                      <Text fontSize={11} color="$textSecondary">
                        Start with a curated look, then fine-tune details if you want to.
                      </Text>
                    </YStack>
                    <GhostButton
                      testID="theme-customize-button"
                      onPress={model.handleOpenCustomize}
                    >
                      Fine-tune
                    </GhostButton>
                  </XStack>

                  <ScrollView
                    testID="theme-preset-rail"
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingRight: 20,
                    } as never}
                  >
                    <XStack gap="$3">
                      {model.presetOptions.map((preset) => (
                        <ThemePresetTile
                          key={preset.id}
                          active={model.selectedPresetId === preset.id}
                          aesthetic={preset.aesthetic}
                          label={preset.label}
                          mode={model.draftTheme.mode}
                          onPress={() => model.handleSelectPreset(preset.id)}
                          palette={preset.palette}
                          testID={`theme-preset-${preset.id}`}
                          themeName={preset.themeName}
                        />
                      ))}

                      <YStack justify="center">
                        <OptionChip
                          testID="theme-preset-custom"
                          active={model.isCustomDraft}
                          pointerEvents="none"
                          accessibilityState={{ selected: model.isCustomDraft }}
                        >
                          <OptionChipLabel active={model.isCustomDraft}>
                            Custom
                          </OptionChipLabel>
                        </OptionChip>
                      </YStack>
                    </XStack>
                  </ScrollView>
                </YStack>
              </YStack>
            </ScrollView>

            <SurfaceCard
              testID="theme-action-bar"
              mode="panel"
              tone="default"
              position="absolute"
              l="$4"
              r="$4"
              b={model.bottomInset}
              p="$3"
              gap="$2"
            >
              <YStack gap="$0.5">
                <Text
                  fontSize={12}
                  fontWeight="700"
                  color={model.applyState === 'applied' ? '$accent' : '$textPrimary'}
                >
                  {statusTitle}
                </Text>
                <Text fontSize={11} color="$textSecondary">
                  {statusBody}
                </Text>
              </YStack>

              <XStack gap="$2">
                <SecondaryButton
                  flex={1}
                  disabled={!model.hasPendingThemeChanges}
                  opacity={model.hasPendingThemeChanges ? 1 : 0.5}
                  onPress={model.handleResetThemeDraft}
                >
                  Reset Draft
                </SecondaryButton>
                <PrimaryButton
                  flex={1}
                  disabled={!model.hasPendingThemeChanges}
                  opacity={model.hasPendingThemeChanges ? 1 : 0.5}
                  onPress={model.handleApplyTheme}
                >
                  {model.applyState === 'applied' && !model.hasPendingThemeChanges
                    ? 'Applied'
                    : 'Apply Theme'}
                </PrimaryButton>
              </XStack>
            </SurfaceCard>

            <Modal
              transparent
              visible={model.customizeOpen}
              animationType="fade"
              onRequestClose={model.handleCloseCustomize}
            >
              <Theme name={model.controlsThemeName as never}>
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
                            Fine-tune preview
                          </ThemedHeadingText>
                          <Text fontSize={11} color="$textSecondary">
                            These controls only change the preview until you apply the
                            theme.
                          </Text>
                        </YStack>
                        <GhostButton onPress={model.handleCloseCustomize}>Done</GhostButton>
                      </XStack>

                      <YStack gap="$1.5">
                        <FieldLabel>Mode</FieldLabel>
                        <ModeToggleRow
                          mode={model.draftTheme.mode}
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
                              active={model.draftTheme.aesthetic === option.id}
                              onPress={() => model.handleSelectAesthetic(option.id)}
                            >
                              <OptionChipLabel
                                active={model.draftTheme.aesthetic === option.id}
                              >
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
                              active={model.draftTheme.palette === option.id}
                              onPress={() => model.handleSelectPalette(option.id)}
                            >
                              <OptionChipLabel
                                active={model.draftTheme.palette === option.id}
                              >
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
        </Theme>
      </ThemeSelectionOverrideProvider>
    </>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 24, 0.34)',
  },
})
