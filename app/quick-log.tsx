import { YStack } from 'tamagui'

import { QuickLogContent } from 'components/quick-log/sections'
import { useQuickLogScreenModel } from 'components/quick-log/useQuickLogScreenModel'

export default function QuickLogScreen() {
  const model = useQuickLogScreenModel()

  return (
    <YStack flex={1} bg="$background" position="relative">
      <QuickLogContent model={model} />
    </YStack>
  )
}
