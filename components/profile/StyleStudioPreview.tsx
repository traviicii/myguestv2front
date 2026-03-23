import { CalendarDays, ChevronDown } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  CurrencyField,
  FieldLabel,
  PreviewCard,
  PrimaryButton,
  TextAreaField,
  ThemedEyebrowText,
  ThemedHeadingText,
} from 'components/ui/controls'

export function StyleStudioPreview() {
  return (
    <YStack gap="$3.5" minH={372}>
      <YStack gap="$1">
        <ThemedEyebrowText>New Appointment Log</ThemedEyebrowText>
        <ThemedHeadingText fontWeight="700" fontSize={20}>
          Avery Stone
        </ThemedHeadingText>
      </YStack>

      <PreviewCard p="$4" gap="$2.5" minH={300}>
        <YStack gap="$2">
          <FieldLabel>Date</FieldLabel>
          <XStack
            height={44}
            px="$3"
            rounded="$4"
            borderWidth={1}
            borderColor="$borderSubtle"
            bg="$surfaceField"
            items="center"
            justify="space-between"
          >
            <XStack items="center" gap="$2.5" flex={1}>
              <CalendarDays size={15} color="$textSecondary" />
              <Text fontSize={14} color="$textPrimary" numberOfLines={1} flex={1}>
                03/21/2026
              </Text>
            </XStack>
            <ChevronDown size={16} color="$textSecondary" />
          </XStack>
        </YStack>

        <YStack gap="$2">
          <FieldLabel>Services</FieldLabel>
          <XStack
            height={44}
            px="$3"
            rounded="$4"
            borderWidth={1}
            borderColor="$borderSubtle"
            bg="$surfaceField"
            items="center"
            justify="space-between"
          >
            <Text fontSize={14} color="$textPrimary">
              Balayage +1
            </Text>
            <ChevronDown size={16} color="$textSecondary" />
          </XStack>
        </YStack>

        <YStack gap="$2">
          <FieldLabel>Price</FieldLabel>
          <CurrencyField
            placeholder="0.00"
            onChangeText={() => {}}
            pointerEvents="none"
            value="185.00"
          />
          <Text fontSize={11} color="$textSecondary">
            Suggested from services: $185
          </Text>
        </YStack>

        <YStack gap="$2">
          <FieldLabel>Formula / Notes</FieldLabel>
          <TextAreaField
            minH={92}
            onChangeText={() => {}}
            pointerEvents="none"
            value="Soft root melt with face-framing brightness."
          />
        </YStack>
      </PreviewCard>

      <PrimaryButton>Save Appointment</PrimaryButton>
    </YStack>
  )
}
