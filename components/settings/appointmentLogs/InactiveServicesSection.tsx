import { RotateCcw, Trash2 } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import { FieldLabel, SecondaryButton, SurfaceCard } from 'components/ui/controls'

import type { SettingsSectionProps } from '../sectionTypes'
import { getServiceUsageLabel } from './utils'

export function InactiveServicesSection({ model }: SettingsSectionProps) {
  if (!model.inactiveServices.length) {
    return null
  }

  return (
    <YStack gap="$2.5">
      <YStack gap="$1">
        <FieldLabel>Archived services</FieldLabel>
        <Text fontSize={11} color="$textSecondary">
          Hidden from new logs. Past appointments stay unchanged.
        </Text>
      </YStack>
      <YStack gap="$2">
        {model.inactiveServices.map((service) => (
          <SurfaceCard
            key={service.id}
            mode="section"
            tone="default"
            p="$3"
            gap="$2.5"
            rounded="$5"
          >
            <YStack gap="$0.5">
              <XStack items="center" justify="space-between" gap="$2">
                <Text fontSize={13} fontWeight="700" color="$textPrimary" flex={1}>
                  {service.name}
                </Text>
                <Text fontSize={11} color="$textSecondary">
                  Archived
                </Text>
              </XStack>
              <Text fontSize={11} color="$textSecondary">
                {getServiceUsageLabel(service.usageCount)}
              </Text>
            </YStack>

            <XStack items="center" gap="$2">
              <SecondaryButton
                size="$2"
                flex={1}
                icon={<RotateCcw size={14} />}
                onPress={() => {
                  void model.handleReactivateService(service.id)
                }}
              >
                Restore
              </SecondaryButton>
              <SecondaryButton
                size="$2"
                flex={1}
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
          </SurfaceCard>
        ))}
      </YStack>
    </YStack>
  )
}
