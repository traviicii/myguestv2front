import { Stack } from 'expo-router'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  COLOR_CHART_FIELD_LABELS,
  COLOR_CHART_GROUPS,
  COLOR_CHART_OPTIONS,
  type ColorChartFieldKey,
  type ColorChartPicklistFieldKey,
} from 'components/colorChart/config'
import {
  FieldLabel,
  OptionChip,
  OptionChipLabel,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  SurfaceCard,
  TextField,
  ThemedEyebrowText,
  ThemedHeadingText,
} from 'components/ui/controls'
import { KeyboardDismissAccessory } from 'components/ui/KeyboardDismissAccessory'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'

import {
  getColorChartFieldPlaceholder,
  isPicklistField,
} from './modelUtils'
import type { EditColorChartScreenModel } from './useEditColorChartScreenModel'

type ColorChartEditSectionProps = {
  model: EditColorChartScreenModel
}

function ColorChartEditStateScreen({
  message,
  model,
}: ColorChartEditSectionProps & { message: string }) {
  return (
    <YStack flex={1} bg="$background" items="center" justify="center">
      <AmbientBackdrop />
      <ScreenTopBar topInset={model.topInset} onBack={model.handleBack} />
      <Text fontSize={13} color="$textSecondary">
        {message}
      </Text>
    </YStack>
  )
}

function ColorChartPicklistField({
  field,
  model,
}: {
  field: ColorChartPicklistFieldKey
  model: EditColorChartScreenModel
}) {
  const options = COLOR_CHART_OPTIONS[field]
  const showOtherInput = model.otherInputs[field]

  return (
    <YStack gap="$2.5">
      <FieldLabel>{COLOR_CHART_FIELD_LABELS[field]}</FieldLabel>
      <XStack gap="$2" flexWrap="wrap">
        {options.map((option) => {
          const isActive = model.form[field] === option
          return (
            <OptionChip
              key={`${field}-${option}`}
              active={isActive}
              onPress={() => model.selectPicklistOption(field, option)}
            >
              <OptionChipLabel active={isActive}>{option}</OptionChipLabel>
            </OptionChip>
          )
        })}
        <OptionChip
          active={showOtherInput}
          onPress={() => model.enableOtherInput(field)}
        >
          <OptionChipLabel active={showOtherInput}>Other</OptionChipLabel>
        </OptionChip>
      </XStack>
      {showOtherInput ? (
        <TextField
          placeholder={getColorChartFieldPlaceholder(field)}
          value={model.form[field]}
          inputAccessoryViewID={model.keyboardAccessoryId}
          onChangeText={(text) => model.setField(field, text)}
        />
      ) : null}
    </YStack>
  )
}

function ColorChartTextField({
  field,
  model,
}: {
  field: ColorChartFieldKey
  model: EditColorChartScreenModel
}) {
  return (
    <YStack gap="$2">
      <FieldLabel>{COLOR_CHART_FIELD_LABELS[field]}</FieldLabel>
      <TextField
        placeholder={getColorChartFieldPlaceholder(field)}
        value={model.form[field]}
        inputAccessoryViewID={model.keyboardAccessoryId}
        onChangeText={(text) => model.setField(field, text)}
      />
    </YStack>
  )
}

function ColorChartFieldGroupSection({
  group,
  index,
  model,
}: ColorChartEditSectionProps & {
  group: (typeof COLOR_CHART_GROUPS)[number]
  index: number
}) {
  return (
    <YStack key={group.id} gap="$3">
      <ThemedHeadingText fontWeight="700" fontSize={14}>
        {group.title}
      </ThemedHeadingText>
      <SurfaceCard p="$4" gap="$3" tone={model.isGlass ? 'secondary' : 'default'} mode="alwaysCard">
        {group.fields.map((field) =>
          isPicklistField(field) ? (
            <ColorChartPicklistField key={field} field={field} model={model} />
          ) : (
            <ColorChartTextField key={field} field={field} model={model} />
          )
        )}
      </SurfaceCard>
      {index < COLOR_CHART_GROUPS.length - 1 ? <SectionDivider /> : null}
    </YStack>
  )
}

function ColorChartEditContent({ model }: ColorChartEditSectionProps) {
  if (!model.client) return null

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScreenTopBar topInset={model.topInset} onBack={model.handleBack} />
      <KeyboardDismissAccessory nativeID={model.keyboardAccessoryId} />
      <ScrollView
        contentContainerStyle={{ pb: '$10' }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={model.keyboardDismissMode as 'interactive' | 'on-drag'}
        onScrollBeginDrag={model.dismissKeyboard}
      >
        <YStack px="$5" pt="$6" gap="$4">
          <YStack gap="$1">
            <ThemedEyebrowText>EDIT COLOR CHART</ThemedEyebrowText>
            <ThemedHeadingText fontSize={20} fontWeight="700">
              {model.client.name}
            </ThemedHeadingText>
          </YStack>

          {COLOR_CHART_GROUPS.map((group, index) => (
            <ColorChartFieldGroupSection
              key={group.id}
              group={group}
              index={index}
              model={model}
            />
          ))}

          <XStack gap="$3">
            <SecondaryButton flex={1} onPress={model.handleBack}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              flex={1}
              onPress={() => {
                void model.handleSave()
              }}
              disabled={!model.isDirty || model.upsertColorChart.isPending}
              opacity={model.isDirty && !model.upsertColorChart.isPending ? 1 : 0.5}
            >
              {model.upsertColorChart.isPending ? 'Saving…' : 'Save'}
            </PrimaryButton>
          </XStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}

export function EditColorChartScreen({ model }: ColorChartEditSectionProps) {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {model.isBootstrapping ? (
        <ColorChartEditStateScreen model={model} message="Loading client..." />
      ) : !model.client ? (
        <ColorChartEditStateScreen model={model} message="Client not found." />
      ) : (
        <ColorChartEditContent model={model} />
      )}
    </>
  )
}
