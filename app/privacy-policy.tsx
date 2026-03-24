import { useRouter } from 'expo-router'
import { ScrollView, YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { PrivacyPolicyContent } from 'components/privacy/policySections'
import { useDataPrivacyScreenModel } from 'components/privacy/useDataPrivacyScreenModel'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'

export default function PrivacyPolicyScreen() {
  const router = useRouter()
  const model = useDataPrivacyScreenModel()

  return (
    <YStack flex={1} bg="$surfacePage" position="relative">
      <AmbientBackdrop />
      <ScreenTopBar topInset={model.topInset} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingTop: '$3' } as never}>
        <PrivacyPolicyContent model={model} />
      </ScrollView>
    </YStack>
  )
}
