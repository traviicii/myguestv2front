import { type ReactNode } from 'react'
import { Image } from 'react-native'
import { Camera, UploadCloud, X } from '@tamagui/lucide-icons'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import {
  SecondaryButton,
  SurfaceCard,
} from 'components/ui/controls'
import { FALLBACK_COLORS } from 'components/utils/color'

type CardMode = 'section' | 'panel' | 'alwaysCard'
type SurfaceTone = 'default' | 'secondary' | 'tabGlass'

type AppointmentPhotoSectionProps = {
  title: ReactNode
  cardMode: CardMode
  cardTone: SurfaceTone
  images: string[]
  onCapture: () => void
  onUpload: () => void
  onOpenPreview: (uri: string) => void
  onRemoveImage: (index: number) => void
  onSetCoverImage: (index: number) => void
}

export function AppointmentPhotoSection({
  title,
  cardMode,
  cardTone,
  images,
  onCapture,
  onUpload,
  onOpenPreview,
  onRemoveImage,
  onSetCoverImage,
}: AppointmentPhotoSectionProps) {
  return (
    <SurfaceCard mode={cardMode} tone={cardTone} p="$4" gap="$2.5">
      {title}
      <XStack gap="$3" flexWrap="wrap">
        <SecondaryButton icon={<Camera size={16} />} size="$4" onPress={onCapture}>
          Capture
        </SecondaryButton>
        <SecondaryButton icon={<UploadCloud size={16} />} size="$4" onPress={onUpload}>
          Upload
        </SecondaryButton>
      </XStack>
      {images.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" pt="$2">
            {images.map((uri, index) => (
              <YStack key={`${uri}-${index}`} gap="$1.5" items="center">
                <YStack
                  width={72}
                  height={72}
                  rounded="$4"
                  overflow="hidden"
                  position="relative"
                  onPress={() => onOpenPreview(uri)}
                  cursor="pointer"
                  pressStyle={{ opacity: 0.85 }}
                >
                  <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                  <XStack
                    position="absolute"
                    t={4}
                    r={4}
                    width={20}
                    height={20}
                    rounded={10}
                    items="center"
                    justify="center"
                    bg={FALLBACK_COLORS.overlayMedium}
                    onPress={(event) => {
                      event?.stopPropagation?.()
                      onRemoveImage(index)
                    }}
                  >
                    <X size={12} color="white" />
                  </XStack>
                  {index === 0 ? (
                    <XStack
                      position="absolute"
                      l={4}
                      t={4}
                      px="$1.5"
                      py="$0.5"
                      rounded="$2"
                      bg="$accent"
                    >
                      <Text fontSize={9} color="white" fontWeight="700">
                        Cover
                      </Text>
                    </XStack>
                  ) : null}
                </YStack>
                {index !== 0 ? (
                  <SecondaryButton
                    size="$1"
                    height={24}
                    px="$2"
                    onPress={(event) => {
                      event?.stopPropagation?.()
                      onSetCoverImage(index)
                    }}
                  >
                    <Text fontSize={10} color="$buttonSecondaryFg" fontWeight="700">
                      Set Cover
                    </Text>
                  </SecondaryButton>
                ) : null}
              </YStack>
            ))}
          </XStack>
        </ScrollView>
      ) : (
        <Text fontSize={11} color="$textSecondary">
          No images added yet.
        </Text>
      )}
    </SurfaceCard>
  )
}
