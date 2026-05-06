import { Platform } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import {
  ErrorPulseBorder,
  FieldLabel,
  InsetGroup,
  InsetSectionHeader,
  PrimaryButton,
  SecondaryButton,
  TextAreaField,
  TextField,
  ThemedHeadingText,
} from 'components/ui/controls'
import { ClientTypeOptions } from 'components/clients/shared/ClientTypeOptions'
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
        Update contact info and client notes.
      </Text>
    </YStack>
  )
}

function EditClientNameSection({ model }: EditClientSectionProps) {
  return (
    <YStack
      gap="$3.5"
      onLayout={(event) => {
        model.handleSectionLayout('name', event.nativeEvent.layout.y)
      }}
    >
      <InsetSectionHeader
        title="Name"
        subtitle="Keep the client name clean so search and lists stay readable."
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
            model.handleKeyboardFieldLayout('name', event.nativeEvent.layout.y)
          }}
        >
          <FieldLabel>Name</FieldLabel>
          <YStack position="relative">
            <TextField
              ref={model.setInputRef('name')}
              value={model.form.name}
              placeholder="Client name"
              inputAccessoryViewID={model.keyboardAccessoryId}
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => model.handleKeyboardFieldFocus('name')}
              onSubmitEditing={() => model.focusAdjacentKeyboardField('next')}
              onChangeText={(text) => model.updateField('name', text)}
              borderColor={model.showNameError ? '$red10' : '$borderSubtle'}
            />
            <ErrorPulseBorder active={model.showNameError} pulseKey={model.pulseKey} />
          </YStack>
          {model.showNameError ? (
            <Text fontSize={11} color="$red10">
              Name is required.
            </Text>
          ) : null}
        </YStack>
      </InsetGroup>
    </YStack>
  )
}

function EditClientContactSection({ model }: EditClientSectionProps) {
  return (
    <YStack
      gap="$3.5"
      onLayout={(event) => {
        model.handleSectionLayout('contact', event.nativeEvent.layout.y)
      }}
    >
      <InsetSectionHeader
        title="Contact"
        subtitle="Refine contact details without the form feeling heavy."
      />
      <InsetGroup
        onLayout={(event) => {
          model.handleGroupLayout('contact', event.nativeEvent.layout.y)
        }}
      >
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
        <YStack
          px="$4"
          py="$3"
          gap="$2"
          borderTopWidth={1}
          borderTopColor="$divider"
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
      </InsetGroup>
    </YStack>
  )
}

function EditClientDetailsSection({ model }: EditClientSectionProps) {
  return (
    <YStack gap="$3.5">
      <InsetSectionHeader
        title="Details"
        subtitle="Adjust the client type to keep reporting and filters aligned."
      />
      <InsetGroup p="$4">
        <YStack gap="$2.5">
          <FieldLabel>Client Type</FieldLabel>
          <ClientTypeOptions
            selectedType={model.form.type}
            onSelect={(type) => model.updateField('type', type)}
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
        <EditClientNameSection model={model} />
        <EditClientContactSection model={model} />
        <EditClientDetailsSection model={model} />
        <EditClientNotesSection model={model} />
        <EditClientActions model={model} />
      </YStack>
    </ScrollView>
  )
}
