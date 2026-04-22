import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, XStack, YStack } from 'tamagui'

import { GhostButton } from './buttons'
import { SurfaceCard } from './surfaces'
import { ThemedHeadingText } from './typography'
import { FALLBACK_COLORS } from 'components/utils/color'

type IOSBottomSheetProps = {
  children: ReactNode
  leadingAction?: ReactNode
  onClose: () => void
  open: boolean
  testID?: string
  title?: string
  trailingAction?: ReactNode
}

const OPEN_TRANSLATE_Y = 28

export function IOSBottomSheet({
  children,
  leadingAction,
  onClose,
  open,
  testID,
  title,
  trailingAction,
}: IOSBottomSheetProps) {
  const insets = useSafeAreaInsets()
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
            <YStack px="$4" pb={bottomPadding}>
              <SurfaceCard
                testID={testID}
                mode="panel"
                tone="default"
                p="$4"
                gap="$3.5"
                rounded="$6"
                maxH="88%"
              >
                <YStack items="center" gap="$2">
                  <YStack
                    width={38}
                    height={5}
                    rounded={999}
                    bg="$surfaceChipActive"
                    borderWidth={1}
                    borderColor="$borderSubtle"
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

                {children}
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
    backgroundColor: FALLBACK_COLORS.sheetOverlaySoft,
  },
})
