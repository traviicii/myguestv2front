import type { RefObject } from 'react'
import { Animated, Image, Modal, Pressable, ScrollView as RNScrollView } from 'react-native'
import { ChevronLeft, ChevronRight, X } from '@tamagui/lucide-icons'
import { YStack } from 'tamagui'

import { FALLBACK_COLORS } from 'components/utils/color'

type AppointmentGalleryPreviewModalProps = {
  canGoNext: boolean
  canGoPrev: boolean
  controlsOpacity: Animated.Value
  images: string[]
  onClose: () => void
  onGoNext: () => void
  onGoPrev: () => void
  onLayoutWidth: (width: number) => void
  onMomentumScrollEnd: (offsetX: number) => void
  onToggleControls: () => void
  previewIndex: number | null
  previewScrollRef: RefObject<RNScrollView | null>
  previewWidth: number
  showPreviewControls: boolean
}

export function AppointmentGalleryPreviewModal({
  canGoNext,
  canGoPrev,
  controlsOpacity,
  images,
  onClose,
  onGoNext,
  onGoPrev,
  onLayoutWidth,
  onMomentumScrollEnd,
  onToggleControls,
  previewIndex,
  previewScrollRef,
  previewWidth,
  showPreviewControls,
}: AppointmentGalleryPreviewModalProps) {
  return (
    <Modal
      visible={previewIndex !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: FALLBACK_COLORS.overlayStrong,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(event) => {
            event?.stopPropagation?.()
            onToggleControls()
          }}
          style={{ width: '100%', maxWidth: 420, height: '70%' }}
          onLayout={(event) => onLayoutWidth(event.nativeEvent.layout.width)}
        >
          {previewIndex !== null ? (
            <RNScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              ref={previewScrollRef}
              onMomentumScrollEnd={(event) => {
                onMomentumScrollEnd(event.nativeEvent.contentOffset.x)
              }}
            >
              {images.map((uri, index) => (
                <YStack
                  key={`${uri}-preview-${index}`}
                  width={previewWidth || 1}
                  height="100%"
                  items="center"
                  justify="center"
                >
                  <Image
                    source={{ uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                </YStack>
              ))}
            </RNScrollView>
          ) : null}
          {previewIndex !== null && images.length > 1 ? (
            <Animated.View
              pointerEvents={showPreviewControls ? 'auto' : 'none'}
              style={{ opacity: controlsOpacity }}
            >
              <Pressable
                onPress={onGoPrev}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  marginTop: -22,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: FALLBACK_COLORS.overlayDim,
                  opacity: canGoPrev ? 1 : 0.3,
                }}
              >
                <ChevronLeft size={20} color="white" />
              </Pressable>
              <Pressable
                onPress={onGoNext}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  marginTop: -22,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: FALLBACK_COLORS.overlayDim,
                  opacity: canGoNext ? 1 : 0.3,
                }}
              >
                <ChevronRight size={20} color="white" />
              </Pressable>
            </Animated.View>
          ) : null}
        </Pressable>
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 48,
            right: 24,
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: FALLBACK_COLORS.overlayMedium,
          }}
        >
          <X size={16} color="white" />
        </Pressable>
      </Pressable>
    </Modal>
  )
}
