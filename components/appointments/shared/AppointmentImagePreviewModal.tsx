import { Image, Modal, Pressable } from 'react-native'
import { X } from '@tamagui/lucide-icons'

import { FALLBACK_COLORS } from 'components/utils/color'

type AppointmentImagePreviewModalProps = {
  previewUri: string | null
  onClose: () => void
}

export function AppointmentImagePreviewModal({
  previewUri,
  onClose,
}: AppointmentImagePreviewModalProps) {
  return (
    <Modal
      visible={Boolean(previewUri)}
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
          onPress={(event) => event?.stopPropagation?.()}
          style={{ width: '100%', maxWidth: 420, height: '70%' }}
        >
          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
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
