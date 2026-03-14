import { RotateCcw, Trash2 } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import { FieldLabel, SecondaryButton } from 'components/ui/controls'

import type { SettingsSectionProps } from '../sectionTypes'
import { getServiceUsageLabel } from './utils'

export function InactiveServicesSection({ model }: SettingsSectionProps) {
  if (!model.inactiveServices.length) {
    return null
  }

  return (
    <YStack gap="$2">
      <FieldLabel>Inactive services</FieldLabel>
      <YStack gap="$1.5">
        {model.inactiveServices.map((service) => (
          <YStack
            key={service.id}
            gap="$2"
            borderWidth={1}
            borderColor="$borderSubtle"
            rounded="$4"
            p="$2.5"
          >
            <XStack items="center" justify="space-between">
              <Text fontSize={12} color="$textSecondary">
                {service.name}
              </Text>
              <Text fontSize={11} color="$textSecondary">
                {getServiceUsageLabel(service.usageCount)}
              </Text>
            </XStack>
            <XStack items="center" justify="space-between" gap="$2">
              <SecondaryButton
                size="$2"
                icon={<RotateCcw size={14} />}
                onPress={() => {
                  void model.handleReactivateService(service.id)
                }}
              >
                Reactivate
              </SecondaryButton>
              <SecondaryButton
                size="$2"
                px="$2"
                disabled={service.usageCount > 0 || model.isDeletingService}
                opacity={service.usageCount > 0 ? 0.45 : 1}
                borderColor="$red8"
                bg="$red2"
                icon={<Trash2 size={14} />}
                onPress={() =>
                  model.handlePermanentlyDeleteService(
                    service.id,
                    service.name,
                    service.usageCount
                  )
                }
              >
                Delete
              </SecondaryButton>
            </XStack>
          </YStack>
        ))}
      </YStack>
    </YStack>
  )
}
