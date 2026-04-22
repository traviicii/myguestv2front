import { Plus } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  CurrencyField,
  FieldLabel,
  PrimaryButton,
  SurfaceCard,
  TextField,
} from 'components/ui/controls'
import { normalizeServiceName } from 'components/utils/services'

import type { SettingsSectionProps } from '../sectionTypes'

export function AddServiceSection({ model }: SettingsSectionProps) {
  return (
    <SurfaceCard mode="section" tone="secondary" p="$3.5" gap="$3">
      <YStack gap="$1">
        <FieldLabel>Add service</FieldLabel>
        <Text fontSize={11} color="$textSecondary">
          Add a service to appointment logs. Price and return timing are optional.
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

      <XStack items="flex-start" gap="$3">
        <YStack flex={1} gap="$1">
          <FieldLabel>Default price</FieldLabel>
          <CurrencyField
            containerProps={{ width: '100%' }}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={model.servicePriceDraft}
            onChangeText={model.setServicePriceDraft}
          />
          <Text fontSize={11} color="$textSecondary">
            Optional
          </Text>
        </YStack>

        <YStack width={128} gap="$1">
          <FieldLabel>Return every</FieldLabel>
          <TextField
            width="100%"
            placeholder="6"
            keyboardType="number-pad"
            value={model.serviceReturnWeeksDraft}
            onChangeText={model.setServiceReturnWeeksDraft}
          />
          <Text fontSize={11} color="$textSecondary">
            Weeks
          </Text>
        </YStack>
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
    </SurfaceCard>
  )
}
