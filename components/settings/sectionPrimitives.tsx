import type { ReactNode } from 'react'
import { Pressable } from 'react-native'
import { HelpCircle } from '@tamagui/lucide-icons'
import { YStack } from 'tamagui'

import { ThemedHeadingText } from 'components/ui/controls'

import type { SettingsScreenModel } from './useSettingsScreenModel'

export function SettingsInfoButton({
  title,
  message,
  onShowInfo,
}: {
  title: string
  message: string
  onShowInfo: SettingsScreenModel['showInfo']
}) {
  return (
    <Pressable
      onPress={() => onShowInfo(title, message)}
      style={{ paddingHorizontal: 4, paddingVertical: 2 }}
      hitSlop={6}
    >
      <HelpCircle size={14} color="$textSecondary" />
    </Pressable>
  )
}

export function SettingsSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <YStack gap="$3">
      <ThemedHeadingText fontWeight="700" fontSize={14}>
        {title}
      </ThemedHeadingText>
      {children}
    </YStack>
  )
}
