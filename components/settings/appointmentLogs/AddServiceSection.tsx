import { Plus } from '@tamagui/lucide-icons'
import { XStack, YStack } from 'tamagui'

import {
  FieldLabel,
  PrimaryButton,
  TextField,
} from 'components/ui/controls'
import { normalizeServiceName } from 'components/utils/services'

import type { SettingsSectionProps } from '../sectionTypes'

export function AddServiceSection({ model }: SettingsSectionProps) {
  return (
    <YStack gap="$2">
      <FieldLabel>Add service</FieldLabel>
      <XStack gap="$2">
        <TextField
          flex={1}
          placeholder="ex: single process"
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
        <TextField
          width={120}
          placeholder="Price (opt.)"
          keyboardType="decimal-pad"
          value={model.servicePriceDraft}
          onChangeText={model.setServicePriceDraft}
        />
        <PrimaryButton
          icon={<Plus size={14} />}
          disabled={!model.canAddService || model.isCreatingService}
          onPress={() => {
            void model.handleAddService()
          }}
          opacity={model.canAddService && !model.isCreatingService ? 1 : 0.5}
        >
          {model.isCreatingService ? 'Adding...' : 'Add'}
        </PrimaryButton>
      </XStack>
    </YStack>
  )
}
