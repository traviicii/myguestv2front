import { Pin, PinOff } from '@tamagui/lucide-icons'
import { Text, XStack } from 'tamagui'

import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import { SecondaryButton } from 'components/ui/controls'

import type { ClientDetailSectionProps } from './sectionTypes'

export function ClientDetailTopBar({ model }: ClientDetailSectionProps) {
  const rightAction = model.resolvedClientId ? (
    <XStack gap="$2">
      <SecondaryButton
        size="$2"
        height={36}
        width={38}
        px="$2"
        icon={model.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
        onPress={model.handleTogglePinned}
        accessibilityLabel={model.isPinned ? 'Unpin client' : 'Pin client'}
      />
      <SecondaryButton size="$2" height={36} width={72} px="$3" onPress={model.handleEdit}>
        <Text
          fontSize={12}
          lineHeight={14}
          fontWeight="700"
          letterSpacing={model.isCyberpunk ? 0.8 : 0}
          textTransform={model.isCyberpunk ? 'uppercase' : undefined}
          style={model.isCyberpunk ? ({ fontFamily: 'SpaceMono' } as never) : undefined}
          color="$buttonSecondaryFg"
        >
          Edit
        </Text>
      </SecondaryButton>
    </XStack>
  ) : undefined

  return (
    <ScreenTopBar
      topInset={model.topInset}
      onBack={model.handleBack}
      rightAction={rightAction}
    />
  )
}
