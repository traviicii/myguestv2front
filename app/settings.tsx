import { useEffect, useRef } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  AllControlsContent,
  type AllControlsSectionId,
} from 'components/settings/AllControlsContent'
import { useSettingsScreenModel } from 'components/settings/useSettingsScreenModel'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'

export default function SettingsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ focus?: AllControlsSectionId }>()
  const model = useSettingsScreenModel()
  const scrollRef = useRef<any>(null)
  const sectionOffsets = useRef<Partial<Record<AllControlsSectionId, number>>>({})

  const captureSection = (sectionId: AllControlsSectionId, y: number) => {
    sectionOffsets.current[sectionId] = y
  }

  useEffect(() => {
    const focusSection = params.focus
    if (!focusSection) return

    const timer = setTimeout(() => {
      const targetY = sectionOffsets.current[focusSection]
      if (typeof targetY !== 'number') return
      scrollRef.current?.scrollTo?.({
        y: Math.max(0, targetY - 12),
        animated: true,
      })
    }, 120)

    return () => clearTimeout(timer)
  }, [params.focus])

  return (
    <YStack flex={1} bg="$surfacePage" position="relative">
      <AmbientBackdrop />
      <ScreenTopBar topInset={model.topInset} onBack={() => router.back()} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: '$10' } as never}
      >
        <AllControlsContent captureSection={captureSection} model={model} />
      </ScrollView>
    </YStack>
  )
}
