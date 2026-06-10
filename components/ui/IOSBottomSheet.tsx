import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, XStack, YStack, useTheme } from 'tamagui'

import { toAlpha } from 'components/ambientBackdropUtils'
import { useResolvedThemeSelection } from 'components/ThemePrefs'
import { GhostButton } from './buttons'
import type { SurfaceTone } from './controlShared'
import { SurfaceCard } from './surfaces'
import { ThemedHeadingText } from './typography'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'

type IOSBottomSheetProps = {
  children: ReactNode
  leadingAction?: ReactNode
  maxHeight?: number | string
  onClose: () => void
  open: boolean
  scrollable?: boolean
  testID?: string
  tone?: SurfaceTone
  title?: string
  trailingAction?: ReactNode
}

const OPEN_TRANSLATE_Y = 28

export function IOSBottomSheet({
  children,
  leadingAction,
  maxHeight,
  onClose,
  open,
  scrollable = true,
  testID,
  tone,
  title,
  trailingAction,
}: IOSBottomSheetProps) {
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const theme = useTheme()
  const { aesthetic, mode } = useResolvedThemeSelection()
  const [mounted, setMounted] = useState(open)
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const sheetTranslateY = useRef(new Animated.Value(OPEN_TRANSLATE_Y)).current

  useEffect(() => {
    if (open) {
      setMounted(true)
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start()
      return
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: OPEN_TRANSLATE_Y,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false)
      }
    })
  }, [backdropOpacity, open, sheetTranslateY])

  const bottomPadding = useMemo(
    () => Math.max(insets.bottom + 8, 20),
    [insets.bottom]
  )
  const horizontalPadding = aesthetic === 'cyberpunk' ? '$3' : '$4'
  const resolvedMaxHeight =
    maxHeight ??
    Math.max(
      320,
      Math.round(windowHeight * (aesthetic === 'glass' ? 0.94 : 0.92) - bottomPadding)
    )
  const resolvedTone = tone ?? (aesthetic === 'glass' ? 'tabGlass' : 'default')
  const handleRounded = aesthetic === 'cyberpunk' ? 1 : 999
  const handleWidth = aesthetic === 'glass' ? 44 : aesthetic === 'cyberpunk' ? 48 : 38
  const handleHeight = aesthetic === 'glass' ? 6 : aesthetic === 'cyberpunk' ? 4 : 5
  const handleBorderWidth = aesthetic === 'cyberpunk' ? 0 : 1
  const handleColor =
    aesthetic === 'glass' ? '$surfaceTabGlass' : aesthetic === 'cyberpunk' ? '$accent' : '$surfaceChipActive'
  const handleBorderColor =
    aesthetic === 'glass'
      ? '$surfaceTabGlassBorder'
      : aesthetic === 'cyberpunk'
        ? '$accent'
        : '$borderSubtle'
  const overlayBaseColor =
    aesthetic === 'glass'
      ? toNativeColor(
          theme.backdropAccent?.val,
          mode === 'dark' ? FALLBACK_COLORS.glassAccentDark : FALLBACK_COLORS.glassAccentLight
        )
      : aesthetic === 'cyberpunk'
        ? toNativeColor(
            theme.surfacePanel?.val,
            mode === 'dark' ? FALLBACK_COLORS.cyberSurfaceCard : FALLBACK_COLORS.surfacePage
          )
        : toNativeColor(theme.surfacePage?.val, FALLBACK_COLORS.surfacePage)
  const overlayColor = toAlpha(
    overlayBaseColor,
    aesthetic === 'glass'
      ? mode === 'dark'
        ? 0.22
        : 0.14
      : aesthetic === 'cyberpunk'
        ? mode === 'dark'
          ? 0.74
          : 0.18
        : mode === 'dark'
          ? 0.58
          : 0.26
  )

  if (!mounted) return null

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <YStack flex={1} justify="flex-end">
          <Animated.View
            pointerEvents="none"
            style={[
              styles.overlay,
              {
                backgroundColor: overlayColor,
                opacity: backdropOpacity,
              },
            ]}
          />
          <Pressable
            testID={testID ? `${testID}-overlay` : undefined}
            style={styles.overlay}
            onPress={onClose}
          />

          <Animated.View
            style={{
              transform: [{ translateY: sheetTranslateY }],
            }}
          >
            <YStack px={horizontalPadding} pb={bottomPadding}>
              <SurfaceCard
                testID={testID}
                mode="panel"
                tone={resolvedTone}
                p="$4"
                gap="$3.5"
                overflow="hidden"
                style={[
                  styles.sheetCard,
                  {
                    maxHeight: resolvedMaxHeight,
                  },
                ]}
              >
                <YStack items="center" gap="$2">
                  <YStack
                    width={handleWidth}
                    height={handleHeight}
                    rounded={handleRounded}
                    bg={handleColor}
                    borderWidth={handleBorderWidth}
                    borderColor={handleBorderColor}
                  />
                </YStack>

                {title || leadingAction || trailingAction ? (
                  <YStack>
                    <XStack items="center" justify="space-between" gap="$3">
                      <YStack minW={56} items="flex-start">
                        {leadingAction ?? null}
                      </YStack>

                      <YStack flex={1} items="center">
                        {title ? (
                          <ThemedHeadingText fontWeight="700" fontSize={16} numberOfLines={1}>
                            {title}
                          </ThemedHeadingText>
                        ) : null}
                      </YStack>

                      <YStack minW={56} items="flex-end">
                        {trailingAction ?? (
                          <GhostButton onPress={onClose}>
                            <Text fontSize={13} color="$accent">
                              Done
                            </Text>
                          </GhostButton>
                        )}
                      </YStack>
                    </XStack>
                  </YStack>
                ) : null}

                <YStack style={styles.contentWrapper}>
                  {/* Keep the sheet header visible while taller picker content scrolls inside the capped height. */}
                  {scrollable ? (
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      contentContainerStyle={styles.scrollContent}
                    >
                      {children}
                    </ScrollView>
                  ) : (
                    children
                  )}
                </YStack>
              </SurfaceCard>
            </YStack>
          </Animated.View>
        </YStack>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetCard: {
    maxHeight: '92%',
  },
  contentWrapper: {
    flexShrink: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingBottom: 4,
  },
})
