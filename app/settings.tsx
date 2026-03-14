import { useRouter } from 'expo-router'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  AccountSettingsSection,
  AppointmentLogsSettingsSection,
  ClientsSettingsSection,
  DatesSettingsSection,
  MetricsSettingsSection,
  OverviewCountsSettingsSection,
  OverviewVisibilitySettingsSection,
} from 'components/settings/sections'
import { useSettingsScreenModel } from 'components/settings/useSettingsScreenModel'
import {
  SectionDivider,
  SecondaryButton,
  ThemedHeadingText,
} from 'components/ui/controls'

const settingsSections = [
  ['clients', ClientsSettingsSection],
  ['metrics', MetricsSettingsSection],
  ['dates', DatesSettingsSection],
  ['overview-counts', OverviewCountsSettingsSection],
  ['appointment-logs', AppointmentLogsSettingsSection],
  ['overview-visibility', OverviewVisibilitySettingsSection],
  ['account', AccountSettingsSection],
] as const

export default function SettingsScreen() {
  const router = useRouter()
  const model = useSettingsScreenModel()

  return (
    <YStack flex={1} bg="$surfacePage" position="relative">
      <AmbientBackdrop />
      <XStack px="$5" pt={model.topInset} pb="$2" items="center" justify="space-between">
        <SecondaryButton
          size="$2"
          height={36}
          width={38}
          px="$2"
          icon={<ChevronLeft size={16} />}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <YStack width={38} />
      </XStack>
      <ScrollView contentContainerStyle={{ pb: '$10' }}>
        <YStack px="$5" pt="$3" gap="$4">
          <YStack gap="$2">
            <ThemedHeadingText fontWeight="700" fontSize={16}>
              App Settings
            </ThemedHeadingText>
            <Text fontSize={12} color="$textSecondary">
              Configure how the app behaves day to day.
            </Text>
          </YStack>

          <SectionDivider />

          {settingsSections.map(([id, Section], index) => (
            <YStack key={id} gap="$4">
              <Section model={model} />
              {index < settingsSections.length - 1 ? <SectionDivider /> : null}
            </YStack>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
