import { ArrowDown, ArrowUp, Trash2 } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  FieldLabel,
  SecondaryButton,
  TextField,
} from 'components/ui/controls'

import type { SettingsSectionProps } from '../sectionTypes'
import { getServiceUsageLabel } from './utils'

export function ActiveServicesSection({ model }: SettingsSectionProps) {
  return (
    <YStack gap="$2">
      <FieldLabel>Active services</FieldLabel>
      {model.activeServices.map((service, index) => (
        <YStack
          key={service.id}
          gap="$2"
          borderWidth={1}
          borderColor="$borderSubtle"
          rounded="$4"
          p="$2.5"
        >
          <XStack items="center" justify="space-between" gap="$2">
            <Text fontSize={11} color="$textSecondary">
              {getServiceUsageLabel(service.usageCount)}
            </Text>
            <XStack gap="$1.5">
              <SecondaryButton
                size="$2"
                px="$2"
                icon={<ArrowUp size={14} />}
                disabled={index === 0}
                opacity={index === 0 ? 0.45 : 1}
                onPress={() => {
                  void model.handleMoveService(service.id, 'up')
                }}
              />
              <SecondaryButton
                size="$2"
                px="$2"
                icon={<ArrowDown size={14} />}
                disabled={index === model.activeServices.length - 1}
                opacity={index === model.activeServices.length - 1 ? 0.45 : 1}
                onPress={() => {
                  void model.handleMoveService(service.id, 'down')
                }}
              />
            </XStack>
          </XStack>
          <XStack items="center" gap="$2">
            <TextField
              flex={1}
              value={model.renameDrafts[service.id] ?? service.name}
              onChangeText={(text) =>
                model.setRenameDrafts((prev) => ({
                  ...prev,
                  [service.id]: text,
                }))
              }
              onBlur={() => {
                void model.handleRenameService(service.id, service.name)
              }}
            />
            <TextField
              width={120}
              placeholder="Price (opt.)"
              keyboardType="decimal-pad"
              value={
                model.priceDrafts[service.id] ??
                model.formatPriceInput(service.defaultPriceCents)
              }
              onChangeText={(text) =>
                model.setPriceDrafts((prev) => ({
                  ...prev,
                  [service.id]: text,
                }))
              }
              onBlur={() => {
                void model.handlePriceBlur(service.id, service.defaultPriceCents)
              }}
            />
          </XStack>
          <XStack items="center" justify="space-between" gap="$2">
            <SecondaryButton
              size="$2"
              px="$2"
              onPress={() => {
                void model.handleDeactivateService(service.id)
              }}
            >
              Remove
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
  )
}
