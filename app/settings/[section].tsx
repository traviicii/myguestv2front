import { useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  SettingsSectionScreenContent,
  isAllControlsSectionId,
} from 'components/settings/AllControlsContent'
import { useSettingsScreenModel } from 'components/settings/useSettingsScreenModel'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'

export default function SettingsSectionScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ section?: string | string[] }>()
  const model = useSettingsScreenModel()
  const sectionId = isAllControlsSectionId(params.section) ? params.section : null

  useEffect(() => {
    if (sectionId) return
    router.replace('/settings')
  }, [router, sectionId])

  return (
    <YStack flex={1} bg="$surfacePage" position="relative">
      <AmbientBackdrop />
      <ScreenTopBar topInset={model.topInset} onBack={() => router.back()} />
      {sectionId ? (
        <ScrollView contentContainerStyle={{ paddingBottom: '$10' } as never}>
          <SettingsSectionScreenContent model={model} sectionId={sectionId} />
        </ScrollView>
      ) : null}
    </YStack>
  )
}
