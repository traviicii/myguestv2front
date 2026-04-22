import { Link } from 'expo-router'
import { Platform } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import { AppointmentDatePickerField } from 'components/appointments/shared/AppointmentDatePickerField'
import {
  ErrorPulseBorder,
  FieldLabel,
  InsetGroup,
  InsetSectionHeader,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  TextAreaField,
  TextField,
} from 'components/ui/controls'
import { KeyboardDismissAccessory } from 'components/ui/KeyboardDismissAccessory'
import { ClientTypeOptions } from 'components/clients/shared/ClientTypeOptions'
import { PHONE_INPUT_PLACEHOLDER, formatPhoneForInput } from 'components/utils/phone'

import type { NewClientFormModel } from './useNewClientFormModel'

type NewClientFormSectionProps = {
  model: NewClientFormModel
}

// Keep the first-run intake form visually continuous. A stylist usually thinks
// in terms of "client info" first, then optional classification and notes.
function ClientInfoSection({ model }: NewClientFormSectionProps) {
  return (
    <YStack gap="$3.5">
      <InsetSectionHeader
        title="Client Info"
        subtitle="Start with the core details you need to recognize, contact, and revisit this client later."
      />
      <InsetGroup
        onLayout={(event) => {
          model.handleIdentityLayout(event.nativeEvent.layout.y)
        }}
      >
        <YStack
          px="$4"
          py="$3"
          gap="$2"
          onLayout={(event) => {
            model.requiredY.current.firstName = event.nativeEvent.layout.y
          }}
        >
          <FieldLabel>First name</FieldLabel>
          <YStack position="relative" pointerEvents="box-none">
            <TextField
              ref={model.setInputRef('firstName')}
              placeholder="First name"
              value={model.form.firstName}
              inputAccessoryViewID={model.keyboardAccessoryId}
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => model.handleKeyboardFieldFocus('firstName')}
              onSubmitEditing={() => model.focusAdjacentKeyboardField('next')}
              onChangeText={(text) =>
                model.setForm((prev) => ({ ...prev, firstName: text }))
              }
              borderColor={model.showFirstNameError ? '$red10' : '$borderSubtle'}
            />
            <ErrorPulseBorder active={model.showFirstNameError} pulseKey={model.pulseKey} />
          </YStack>
          {model.showFirstNameError ? (
            <Text fontSize={11} color="$red10">
              First name is required.
            </Text>
          ) : null}
        </YStack>

        <SectionDivider />

        <YStack
          px="$4"
          py="$3"
          gap="$2"
          onLayout={(event) => {
            model.requiredY.current.lastName = event.nativeEvent.layout.y
          }}
        >
          <FieldLabel>Last name</FieldLabel>
          <YStack position="relative" pointerEvents="box-none">
            <TextField
              ref={model.setInputRef('lastName')}
              placeholder="Last name"
              value={model.form.lastName}
              inputAccessoryViewID={model.keyboardAccessoryId}
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => model.handleKeyboardFieldFocus('lastName')}
              onSubmitEditing={() => model.focusAdjacentKeyboardField('next')}
              onChangeText={(text) =>
                model.setForm((prev) => ({ ...prev, lastName: text }))
              }
              borderColor={model.showLastNameError ? '$red10' : '$borderSubtle'}
            />
            <ErrorPulseBorder active={model.showLastNameError} pulseKey={model.pulseKey} />
          </YStack>
          {model.showLastNameError ? (
            <Text fontSize={11} color="$red10">
              Last name is required.
            </Text>
          ) : null}
        </YStack>

        <SectionDivider />

        <YStack px="$4" py="$3" gap="$2">
          <FieldLabel>Email</FieldLabel>
          <TextField
            ref={model.setInputRef('email')}
            placeholder="email@example.com"
            keyboardType="email-address"
            value={model.form.email}
            inputAccessoryViewID={model.keyboardAccessoryId}
            returnKeyType="next"
            blurOnSubmit={false}
            onFocus={() => model.handleKeyboardFieldFocus('email')}
            onSubmitEditing={() => model.focusAdjacentKeyboardField('next')}
            onChangeText={(text) => model.setForm((prev) => ({ ...prev, email: text }))}
          />
        </YStack>

        <SectionDivider />

        <YStack px="$4" py="$3" gap="$2">
          <FieldLabel>Phone</FieldLabel>
          <TextField
            ref={model.setInputRef('phone')}
            placeholder={PHONE_INPUT_PLACEHOLDER}
            keyboardType="phone-pad"
            value={model.form.phone}
            inputAccessoryViewID={model.keyboardAccessoryId}
            returnKeyType="next"
            blurOnSubmit={false}
            onFocus={() => model.handleKeyboardFieldFocus('phone')}
            onSubmitEditing={() => model.focusAdjacentKeyboardField('next')}
            onChangeText={(text) =>
              model.setForm((prev) => ({ ...prev, phone: formatPhoneForInput(text) }))
            }
          />
        </YStack>

        <SectionDivider />

        <YStack
          px="$4"
          py="$3"
          gap="$2"
          onLayout={(event) => {
            model.handleBirthdayLayout(event.nativeEvent.layout.y)
          }}
        >
          <FieldLabel>Birthday</FieldLabel>
          <AppointmentDatePickerField
            datePanel={model.birthdayPanel}
            displayValue={model.birthdayDisplayValue}
            fieldBackground="$surfaceField"
            onDateChange={model.handleBirthdayChange}
            onFieldPress={model.handleBirthdayFieldPress}
            onPickerDismiss={model.closeBirthdayPicker}
            pickerDate={model.birthdayPickerDate}
            placeholder="Select birthday"
            pulseKey={0}
            sheetTitle="Birthday"
            showDateError={false}
            showDatePicker={model.showBirthdayPicker}
          />
        </YStack>
      </InsetGroup>
    </YStack>
  )
}

function ClientTypeSection({ model }: NewClientFormSectionProps) {
  return (
    <YStack gap="$3.5">
      <InsetSectionHeader
        title="Client Type"
        subtitle="Choose the default relationship for this client so filtering and organization stay consistent."
      />
      <InsetGroup p="$4">
        <YStack gap="$2.5">
          <FieldLabel>Client Type</FieldLabel>
          <ClientTypeOptions selectedType={model.clientType} onSelect={model.setClientType} />
        </YStack>
      </InsetGroup>
    </YStack>
  )
}

function ClientNotesSection({ model }: NewClientFormSectionProps) {
  return (
    <YStack gap="$3.5">
      <InsetSectionHeader
        title="Notes"
        subtitle="Keep any preferences, reminders, or formula context close to the profile."
      />
      <InsetGroup
        onLayout={(event) => {
          model.handleNotesLayout(event.nativeEvent.layout.y)
        }}
      >
        <YStack px="$4" py="$3">
          <TextAreaField
            inputRef={model.setInputRef('notes')}
            placeholder="Client preferences, formulas, reminders..."
            value={model.form.notes}
            inputAccessoryViewID={model.keyboardAccessoryId}
            onFocus={() => model.handleKeyboardFieldFocus('notes')}
            onChangeText={(text) => model.setForm((prev) => ({ ...prev, notes: text }))}
          />
        </YStack>
      </InsetGroup>
    </YStack>
  )
}

function ClientFormActions({ model }: NewClientFormSectionProps) {
  return (
    <XStack gap="$3">
      <Link href="/(tabs)/clients" asChild>
        <SecondaryButton flex={1}>Cancel</SecondaryButton>
      </Link>
      <PrimaryButton
        flex={1}
        disabled={!model.canSave || model.createClient.isPending}
        opacity={model.canSave && !model.createClient.isPending ? 1 : 0.5}
        onPress={() => {
          void model.handleSave()
        }}
      >
        {model.createClient.isPending ? 'Saving...' : 'Save Client'}
      </PrimaryButton>
    </XStack>
  )
}

export function NewClientFormContent({ model }: NewClientFormSectionProps) {
  return (
    <>
      <KeyboardDismissAccessory
        nativeID={model.keyboardAccessoryId}
        canGoPrevious={model.canGoToPreviousKeyboardField}
        canGoNext={model.canGoToNextKeyboardField}
        onPrevious={() => model.focusAdjacentKeyboardField('previous')}
        onNext={() => model.focusAdjacentKeyboardField('next')}
      />
      <ScrollView
        ref={model.scrollRef}
        flex={1}
        contentContainerStyle={{
          pb: 40 + model.insets.bottom,
        }}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={model.keyboardDismissMode}
        onScroll={model.handleScroll as never}
        scrollEventThrottle={16}
        onScrollBeginDrag={model.onScrollBeginDrag}
      >
        <YStack pt="$2" gap="$4">
          <ClientInfoSection model={model} />
          <ClientTypeSection model={model} />
          <ClientNotesSection model={model} />
          <ClientFormActions model={model} />
        </YStack>
      </ScrollView>
    </>
  )
}
