import { useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Platform } from 'react-native'
import { ScrollView, YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  SettingsSectionScreenContent,
  isAllControlsSectionId,
} from 'components/settings/AllControlsContent'
import { useSettingsScreenModel } from 'components/settings/useSettingsScreenModel'
import { KeyboardDismissAccessory } from 'components/ui/KeyboardDismissAccessory'
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
      <KeyboardDismissAccessory
        nativeID={model.keyboardAccessoryId}
        canGoPrevious={model.canGoToPreviousServiceField}
        canGoNext={model.canGoToNextServiceField}
        onPrevious={() => model.focusAdjacentKeyboardField('previous')}
        onNext={() => model.focusAdjacentKeyboardField('next')}
      />
      {sectionId ? (
        <ScrollView
          ref={model.settingsScrollRef}
          contentContainerStyle={{ paddingBottom: '$10' } as never}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={model.keyboardDismissMode}
          onScroll={model.handleServicesScreenScroll as never}
          scrollEventThrottle={16}
          onScrollBeginDrag={model.handleServicesScreenScrollBeginDrag}
        >
          <SettingsSectionScreenContent model={model} sectionId={sectionId} />
        </ScrollView>
      ) : null}
    </YStack>
  )
}
