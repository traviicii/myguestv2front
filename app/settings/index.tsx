import { useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  AllControlsContent,
  getSettingsSectionHref,
  isAllControlsSectionId,
} from 'components/settings/AllControlsContent'
import { useSettingsScreenModel } from 'components/settings/useSettingsScreenModel'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'

export default function SettingsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ focus?: string | string[] }>()
  const model = useSettingsScreenModel()
  const focusParam = Array.isArray(params.focus) ? params.focus[0] : params.focus
  const focusSection = isAllControlsSectionId(focusParam) ? focusParam : null

  useEffect(() => {
    if (focusParam === 'account-privacy') {
      router.replace('/data-privacy')
      return
    }
    if (!focusSection) return
    router.replace(getSettingsSectionHref(focusSection))
  }, [focusParam, focusSection, router])

  return (
    <YStack flex={1} bg="$surfacePage" position="relative">
      <AmbientBackdrop />
      <ScreenTopBar topInset={model.topInset} onBack={() => router.back()} />
      {focusSection ? null : (
        <ScrollView contentContainerStyle={{ paddingBottom: '$10' } as never}>
          <AllControlsContent model={model} />
        </ScrollView>
      )}
    </YStack>
  )
}
