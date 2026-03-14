import { ScrollView, Text, XStack, YStack } from 'tamagui'

import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import {
  ErrorPulseBorder,
  FieldLabel,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  SurfaceCard,
  TextAreaField,
  TextField,
  ThemedHeadingText,
  cardSurfaceProps,
} from 'components/ui/controls'
import { ClientTypeOptions } from 'components/clients/shared/ClientTypeOptions'

import type { EditClientScreenModel } from './useEditClientScreenModel'

type EditClientSectionProps = {
  model: EditClientScreenModel
}

function EditClientCard({
  model,
  children,
  ...props
}: EditClientSectionProps & React.ComponentProps<typeof YStack>) {
  if (model.isGlass) {
    return (
      <SurfaceCard mode="alwaysCard" tone="secondary" p="$4" gap="$3" {...props}>
        {children}
      </SurfaceCard>
    )
  }

  return (
    <YStack {...cardSurfaceProps} rounded="$5" p="$4" gap="$3" {...props}>
      {children}
    </YStack>
  )
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

function EditClientDetailsSection({ model }: EditClientSectionProps) {
  return (
    <EditClientCard model={model}>
      <YStack
        gap="$2"
        onLayout={(event) => {
          model.handleNameLayout(event.nativeEvent.layout.y)
        }}
      >
        <FieldLabel>Name</FieldLabel>
        <YStack position="relative">
          <TextField
            value={model.form.name}
            inputAccessoryViewID={model.keyboardAccessoryId}
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
      <YStack gap="$2">
        <FieldLabel>Email</FieldLabel>
        <TextField
          value={model.form.email}
          inputAccessoryViewID={model.keyboardAccessoryId}
          onChangeText={(text) => model.updateField('email', text)}
        />
      </YStack>
      <YStack gap="$2">
        <FieldLabel>Phone</FieldLabel>
        <TextField
          value={model.form.phone}
          inputAccessoryViewID={model.keyboardAccessoryId}
          onChangeText={(text) => model.updateField('phone', text)}
        />
      </YStack>
      <YStack gap="$2">
        <FieldLabel>Client Type</FieldLabel>
        <ClientTypeOptions
          selectedType={model.form.type}
          onSelect={(type) => model.updateField('type', type)}
        />
      </YStack>
    </EditClientCard>
  )
}

function EditClientNotesSection({ model }: EditClientSectionProps) {
  return (
    <YStack gap="$3">
      <ThemedHeadingText fontWeight="600" fontSize={14}>
        Notes
      </ThemedHeadingText>
      <EditClientCard model={model} gap="$0">
        <TextAreaField
          value={model.form.notes}
          inputAccessoryViewID={model.keyboardAccessoryId}
          onChangeText={(text) => model.updateField('notes', text)}
          placeholder="Client preferences, color history, personal notes..."
        />
      </EditClientCard>
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
      contentContainerStyle={{ paddingBottom: 40 } as never}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={model.keyboardDismissMode}
      onScrollBeginDrag={model.handleScrollBeginDrag}
    >
      <YStack px="$5" pt="$6" gap="$4">
        <EditClientHeader />
        <SectionDivider />
        <EditClientDetailsSection model={model} />
        <EditClientNotesSection model={model} />
        <EditClientActions model={model} />
      </YStack>
    </ScrollView>
  )
}
