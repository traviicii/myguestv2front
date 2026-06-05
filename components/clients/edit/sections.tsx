import { Platform } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import { AppointmentDatePickerField } from 'components/appointments/shared/AppointmentDatePickerField'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'
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
  ThemedHeadingText,
} from 'components/ui/controls'
import { ClientGroupSelector } from 'components/clients/shared/ClientGroupSelector'
import { PHONE_INPUT_PLACEHOLDER, formatPhoneForInput } from 'components/utils/phone'

import type { EditClientScreenModel } from './useEditClientScreenModel'

type EditClientSectionProps = {
  model: EditClientScreenModel
}

export function EditClientTopBar({ model }: EditClientSectionProps) {
  return <ScreenTopBar topInset={model.topInset} onBack={model.handleBack} />
}

export function EditClientStateMessage({ message }: { message: string }) {
  return (
    <YStack flex={1} items="center" justify="center">
      <Text fontSize={13} color="$textSecondary">
        {message}
      </Text>
    </YStack>
  )
}

function EditClientHeader() {
  return (
    <YStack gap="$2">
      <ThemedHeadingText fontWeight="600" fontSize={16}>
        Edit Client
      </ThemedHeadingText>
      <Text fontSize={12} color="$textSecondary">
        Update core details, contact info, birthday, and client notes.
      </Text>
    </YStack>
  )
}

function EditClientInfoSection({ model }: EditClientSectionProps) {
  return (
    <YStack
      gap="$3.5"
      onLayout={(event) => {
        model.handleSectionLayout('name', event.nativeEvent.layout.y)
      }}
    >
      <InsetSectionHeader
        title="Client Info"
        subtitle="Keep the basics clean so search, contact actions, and birthday reminders stay reliable."
      />
      <InsetGroup
        onLayout={(event) => {
          model.handleGroupLayout('name', event.nativeEvent.layout.y)
        }}
      >
        <YStack
          px="$4"
          py="$3"
          gap="$2"
          onLayout={(event) => {
            model.handleKeyboardFieldLayout('firstName', event.nativeEvent.layout.y)
          }}
        >
          <FieldLabel>First name</FieldLabel>
          <YStack position="relative">
            <TextField
              ref={model.setInputRef('firstName')}
              value={model.form.firstName}
              placeholder="First name"
              inputAccessoryViewID={model.keyboardAccessoryId}
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => model.handleKeyboardFieldFocus('firstName')}
              onSubmitEditing={() => model.focusAdjacentKeyboardField('next')}
              onChangeText={(text) => model.updateField('firstName', text)}
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
            model.handleKeyboardFieldLayout('lastName', event.nativeEvent.layout.y)
          }}
        >
          <FieldLabel>Last name</FieldLabel>
          <YStack position="relative">
            <TextField
              ref={model.setInputRef('lastName')}
              value={model.form.lastName}
              placeholder="Last name"
              inputAccessoryViewID={model.keyboardAccessoryId}
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => model.handleKeyboardFieldFocus('lastName')}
              onSubmitEditing={() => model.focusAdjacentKeyboardField('next')}
              onChangeText={(text) => model.updateField('lastName', text)}
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

        <YStack
          px="$4"
          py="$3"
          gap="$2"
          onLayout={(event) => {
            model.handleKeyboardFieldLayout('email', event.nativeEvent.layout.y)
          }}
        >
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
            onChangeText={(text) => model.updateField('email', text)}
          />
        </YStack>

        <SectionDivider />

        <YStack
          px="$4"
          py="$3"
          gap="$2"
          onLayout={(event) => {
            model.handleKeyboardFieldLayout('phone', event.nativeEvent.layout.y)
          }}
        >
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
            onChangeText={(text) => model.updateField('phone', formatPhoneForInput(text))}
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
          {model.form.birthday ? (
            <Text
              color="$accent"
              fontSize={11}
              onPress={model.handleClearBirthday}
            >
              Clear birthday
            </Text>
          ) : (
            <Text fontSize={11} color="$textSecondary">
              Optional. Used for birthday reminders on Overview.
            </Text>
          )}
        </YStack>
      </InsetGroup>
    </YStack>
  )
}

function EditClientDetailsSection({ model }: EditClientSectionProps) {
  return (
    <YStack gap="$3.5">
      <InsetSectionHeader
        title="Details"
        subtitle="Keep flexible groups attached so filtering and client organization stay useful."
      />
      <InsetGroup p="$4">
        <YStack gap="$2.5">
          <FieldLabel>Client Groups</FieldLabel>
          <ClientGroupSelector
            canCreate
            createDraft={model.groupDraft}
            createError={model.groupCreateError}
            groups={model.clientGroups}
            isCreating={model.createClientGroup.isPending}
            onCreate={model.handleCreateClientGroup}
            onCreateDraftChange={model.setGroupDraft}
            onToggleGroup={model.toggleClientGroup}
            selectedGroupIds={model.selectedGroupIds}
          />
        </YStack>
      </InsetGroup>
    </YStack>
  )
}

function EditClientNotesSection({ model }: EditClientSectionProps) {
  return (
    <YStack
      gap="$3.5"
      onLayout={(event) => {
        model.handleSectionLayout('notes', event.nativeEvent.layout.y)
      }}
    >
      <InsetSectionHeader
        title="Notes"
        subtitle="Capture personal preferences, color history, and reminders in one place."
      />
      <InsetGroup
        onLayout={(event) => {
          model.handleGroupLayout('notes', event.nativeEvent.layout.y)
        }}
      >
        <YStack
          px="$4"
          py="$3"
          onLayout={(event) => {
            model.handleKeyboardFieldLayout('notes', event.nativeEvent.layout.y)
          }}
        >
          <TextAreaField
            inputRef={model.setInputRef('notes')}
            value={model.form.notes}
            inputAccessoryViewID={model.keyboardAccessoryId}
            onFocus={() => model.handleKeyboardFieldFocus('notes')}
            onChangeText={(text) => model.updateField('notes', text)}
            placeholder="Client preferences, color history, personal notes..."
          />
        </YStack>
      </InsetGroup>
    </YStack>
  )
}

function EditClientActions({ model }: EditClientSectionProps) {
  return (
    <>
      <XStack gap="$3">
        <SecondaryButton flex={1} onPress={model.handleBack}>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          flex={1}
          onPress={() => {
            void model.handleSave()
          }}
          disabled={!model.canSave}
          opacity={model.canSave ? 1 : 0.5}
        >
          {model.isSaving ? 'Saving…' : 'Save'}
        </PrimaryButton>
      </XStack>

      <SecondaryButton
        onPress={model.confirmDelete}
        disabled={model.isDeleting}
        borderColor="$red8"
        bg="$red2"
        pressStyle={{
          bg: '$red3',
          borderColor: '$red9',
          opacity: 0.92,
        }}
      >
        <Text fontWeight="700" color="$red11">
          {model.isDeleting ? 'Deleting…' : 'Delete Client'}
        </Text>
      </SecondaryButton>
    </>
  )
}

export function EditClientContent({ model }: EditClientSectionProps) {
  if (!model.client) return null

  return (
    <ScrollView
      ref={model.scrollRef as never}
      contentContainerStyle={{ paddingBottom: model.contentBottomPadding } as never}
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={model.keyboardDismissMode}
      onScroll={model.handleScroll as never}
      scrollEventThrottle={16}
      onScrollBeginDrag={model.handleScrollBeginDrag}
    >
      <YStack px="$5" pt="$6" gap="$4">
        <EditClientHeader />
        <EditClientInfoSection model={model} />
        <EditClientDetailsSection model={model} />
        <EditClientNotesSection model={model} />
        <EditClientActions model={model} />
      </YStack>
    </ScrollView>
  )
}
