import { Plus } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  CurrencyField,
  FieldLabel,
  PrimaryButton,
  TextField,
} from 'components/ui/controls'
import { normalizeServiceName } from 'components/utils/services'

import type { SettingsSectionProps } from '../sectionTypes'

export function AddServiceSection({ model }: SettingsSectionProps) {
  return (
    <YStack gap="$3">
      <YStack gap="$1">
        <FieldLabel>Add a service</FieldLabel>
        <Text fontSize={11} color="$textSecondary">
          New services show up in appointment logs right away. Default price is
          optional.
        </Text>
      </YStack>
      <YStack gap="$1">
        <FieldLabel>Service name</FieldLabel>
        <TextField
          flex={1}
          placeholder="Single process"
          value={model.serviceDraft}
          onChangeText={model.setServiceDraft}
          onBlur={() => {
            model.setServiceDraft((current) => normalizeServiceName(current))
          }}
          onSubmitEditing={() => {
            void model.handleAddService()
          }}
          returnKeyType="done"
        />
      </YStack>
      <XStack items="center" gap="$2">
        <YStack flex={1} gap="$0.5">
          <FieldLabel>Default price</FieldLabel>
          <Text fontSize={11} color="$textSecondary">
            Optional
          </Text>
        </YStack>
        <CurrencyField
          containerProps={{ width: 120 }}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={model.servicePriceDraft}
          onChangeText={model.setServicePriceDraft}
        />
      </XStack>
      <XStack items="center" gap="$2">
        <YStack flex={1} gap="$0.5">
          <FieldLabel>Recommended return</FieldLabel>
          <Text fontSize={11} color="$textSecondary">
            Optional weeks between visits
          </Text>
        </YStack>
        <TextField
          width={120}
          placeholder="6"
          keyboardType="number-pad"
          value={model.serviceReturnWeeksDraft}
          onChangeText={model.setServiceReturnWeeksDraft}
        />
      </XStack>
      <PrimaryButton
        icon={<Plus size={14} />}
        disabled={!model.canAddService || model.isCreatingService}
        onPress={() => {
          void model.handleAddService()
        }}
        opacity={model.canAddService && !model.isCreatingService ? 1 : 0.5}
      >
        {model.isCreatingService ? 'Adding...' : 'Add service'}
      </PrimaryButton>
    </YStack>
  )
}
