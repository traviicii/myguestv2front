import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { NewClientForm } from 'components/NewClientForm'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import { SectionDivider } from 'components/ui/controls'

export default function NewClientScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
      <YStack px="$5" pt="$6" gap="$4" flex={1}>
        <YStack gap="$2">
          <Text fontFamily="$heading" fontWeight="600" fontSize={18} color="$color">
            New Client
          </Text>
          <Text fontSize={12} color="$textSecondary">
            Add client details to keep their history and formulas organized.
          </Text>
        </YStack>
        <SectionDivider />
        <NewClientForm />
      </YStack>
    </YStack>
  )
}
