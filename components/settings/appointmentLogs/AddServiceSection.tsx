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
    <SurfaceCard
      mode="section"
      tone="secondary"
      p="$3.5"
      gap="$3"
      onLayout={(event) => {
        model.handleAddServiceSectionLayout(event.nativeEvent.layout.y)
      }}
    >
      <YStack gap="$1">
        <FieldLabel>Add service</FieldLabel>
        <Text fontSize={11} color="$textSecondary">
          Add a service to appointment logs. Price and return timing are optional.
        </Text>
      </YStack>

      <YStack
        gap="$1"
        onLayout={(event) => {
          model.handleServiceFieldLayout('new-service-name', event.nativeEvent.layout.y)
        }}
      >
        <FieldLabel>Service name</FieldLabel>
        <TextField
          ref={model.setServiceInputRef('new-service-name')}
          flex={1}
          placeholder="Single process"
          value={model.serviceDraft}
          inputAccessoryViewID={model.keyboardAccessoryId}
          returnKeyType={model.getServiceFieldReturnKeyType('new-service-name')}
          blurOnSubmit={false}
          onFocus={() => model.handleServiceFieldFocus('new-service-name')}
          onSubmitEditing={() => model.handleServiceFieldSubmit('new-service-name')}
          onChangeText={model.setServiceDraft}
          onBlur={() => {
            model.setServiceDraft((current) => normalizeServiceName(current))
          }}
        />
      </YStack>

      <XStack items="flex-start" gap="$3">
        <YStack
          flex={1}
          gap="$1"
          onLayout={(event) => {
            model.handleServiceFieldLayout('new-service-price', event.nativeEvent.layout.y)
          }}
        >
          <FieldLabel>Default price</FieldLabel>
          <CurrencyField
            ref={model.setServiceInputRef('new-service-price')}
            containerProps={{ width: '100%' }}
            placeholder="0.00"
            keyboardType="decimal-pad"
            inputAccessoryViewID={model.keyboardAccessoryId}
            returnKeyType={model.getServiceFieldReturnKeyType('new-service-price')}
            blurOnSubmit={false}
            onFocus={() => model.handleServiceFieldFocus('new-service-price')}
            onSubmitEditing={() => model.handleServiceFieldSubmit('new-service-price')}
            value={model.servicePriceDraft}
            onChangeText={model.setServicePriceDraft}
          />
          <Text fontSize={11} color="$textSecondary">
            Optional
          </Text>
        </YStack>

        <YStack
          width={128}
          gap="$1"
          onLayout={(event) => {
            model.handleServiceFieldLayout('new-service-return', event.nativeEvent.layout.y)
          }}
        >
          <FieldLabel>Return every</FieldLabel>
          <TextField
            ref={model.setServiceInputRef('new-service-return')}
            width="100%"
            placeholder="6"
            keyboardType="number-pad"
            inputAccessoryViewID={model.keyboardAccessoryId}
            returnKeyType={model.getServiceFieldReturnKeyType('new-service-return')}
            blurOnSubmit={false}
            onFocus={() => model.handleServiceFieldFocus('new-service-return')}
            onSubmitEditing={() => model.handleServiceFieldSubmit('new-service-return')}
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
