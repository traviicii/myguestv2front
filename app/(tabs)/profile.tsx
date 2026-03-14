import { YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { ProfileContent } from 'components/profile/sections'
import { useProfileScreenModel } from 'components/profile/useProfileScreenModel'

export default function ProfileScreen() {
  const model = useProfileScreenModel()

  return (
    <YStack flex={1} bg="$surfacePage" position="relative">
      <AmbientBackdrop />
      <ProfileContent model={model} />
    </YStack>
  )
}
