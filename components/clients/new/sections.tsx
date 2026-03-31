import { Link } from 'expo-router'
import { Platform } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import { AppointmentDatePickerField } from 'components/appointments/shared/AppointmentDatePickerField'
import {
  ErrorPulseBorder,
  FieldLabel,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  TextAreaField,
  TextField,
  ThemedHeadingText,
} from 'components/ui/controls'
import { KeyboardDismissAccessory } from 'components/ui/KeyboardDismissAccessory'
import { ClientTypeOptions } from 'components/clients/shared/ClientTypeOptions'
import { PHONE_INPUT_PLACEHOLDER, formatPhoneForInput } from 'components/utils/phone'

import type { NewClientFormModel } from './useNewClientFormModel'

type NewClientFormSectionProps = {
  model: NewClientFormModel
}

function ClientIdentitySection({ model }: NewClientFormSectionProps) {
  return (
    <SurfaceCard
      p="$4"
      gap="$3"
      onLayout={(event) => {
        model.handleIdentityLayout(event.nativeEvent.layout.y)
      }}
    >
      <YStack
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
      <YStack
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
      <YStack gap="$2">
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
      <YStack gap="$2">
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
      <YStack
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
          pickerDate={model.birthdayPickerDate}
          placeholder="Select birthday"
          pulseKey={0}
          showDateError={false}
          showDatePicker={model.showBirthdayPicker}
        />
      </YStack>
    </SurfaceCard>
  )
}

function ClientTypeSection({ model }: NewClientFormSectionProps) {
  return (
    <SurfaceCard p="$4" gap="$3">
      <ThemedHeadingText fontWeight="700" fontSize={14}>
        Client Type
      </ThemedHeadingText>
      <ClientTypeOptions selectedType={model.clientType} onSelect={model.setClientType} />
    </SurfaceCard>
  )
}

function ClientNotesSection({ model }: NewClientFormSectionProps) {
  return (
    <SurfaceCard
      p="$4"
      gap="$3"
      onLayout={(event) => {
        model.handleNotesLayout(event.nativeEvent.layout.y)
      }}
    >
      <ThemedHeadingText fontWeight="700" fontSize={14}>
        Notes
      </ThemedHeadingText>
      <TextAreaField
        inputRef={model.setInputRef('notes')}
        placeholder="Client preferences, formulas, reminders..."
        value={model.form.notes}
        inputAccessoryViewID={model.keyboardAccessoryId}
        onFocus={() => model.handleKeyboardFieldFocus('notes')}
        onChangeText={(text) => model.setForm((prev) => ({ ...prev, notes: text }))}
      />
    </SurfaceCard>
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
          <ClientIdentitySection model={model} />
          <ClientTypeSection model={model} />
          <ClientNotesSection model={model} />
          <ClientFormActions model={model} />
        </YStack>
      </ScrollView>
    </>
  )
}
