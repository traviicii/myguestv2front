import type { ReactNode } from 'react'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { XStack, YStack } from 'tamagui'
import { SecondaryButton } from './controls'

type ScreenTopBarProps = {
  topInset: number
  onBack: () => void
  rightAction?: ReactNode
}

export function ScreenTopBar({ topInset, onBack, rightAction }: ScreenTopBarProps) {
  return (
    <XStack px="$5" pt={topInset} pb="$2" items="center" justify="space-between">
      <SecondaryButton
        size="$2"
        height={36}
        width={38}
        px="$2"
        icon={<ChevronLeft size={16} />}
        onPress={onBack}
        accessibilityLabel="Go back"
      />
      {rightAction ? rightAction : <YStack width={38} />}
    </XStack>
  )
}
