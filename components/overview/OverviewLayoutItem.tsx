import { GripVertical } from '@tamagui/lucide-icons'
import { Pressable as RNPressable } from 'react-native'
import type { RenderItemParams } from 'react-native-draggable-flatlist'
import { Text, XStack } from 'tamagui'

import { cardSurfaceProps } from 'components/ui/controls'
import type { OverviewSectionId } from 'components/state/studioStore'

import type { OverviewLayoutItemModel } from './sectionTypes'

export function OverviewLayoutItem({
  item,
  drag,
  isActive,
  model,
}: RenderItemParams<OverviewSectionId> & {
  model: OverviewLayoutItemModel
}) {
  return (
    <RNPressable onLongPress={drag} delayLongPress={120}>
      <XStack
        {...cardSurfaceProps}
        rounded={model.sectionCardRadius}
        px="$4"
        py="$3"
        my="$1"
        items="center"
        justify="space-between"
        opacity={isActive ? 0.85 : 1}
        pressStyle={{ opacity: 0.8 }}
        overflow="visible"
      >
        <Text fontSize={14} fontWeight="600">
          {model.sectionLabels[item] ?? item}
        </Text>
        <XStack
          width={28}
          height={28}
          rounded={model.isCyberpunk ? 0 : 8}
          items="center"
          justify="center"
          onPressIn={drag}
        >
          <GripVertical size={18} color="$textMuted" />
        </XStack>
      </XStack>
    </RNPressable>
  )
}
