import { Platform } from 'react-native'
import { Search } from '@tamagui/lucide-icons'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import {
  OptionChip,
  OptionChipLabel,
  PreviewCard,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  TextAreaField,
  TextField,
  ThemedHeadingText,
} from 'components/ui/controls'
import { KeyboardDismissAccessory } from 'components/ui/KeyboardDismissAccessory'

import type { QuickLogScreenModel } from './useQuickLogScreenModel'

type QuickLogSectionProps = {
  model: QuickLogScreenModel
}

type FollowUpChannel = QuickLogScreenModel['followUpChannel']

export function QuickLogHeader() {
  return (
    <>
      <ThemedHeadingText fontSize={18} fontWeight="700">
        Quick Log
      </ThemedHeadingText>
      <Text fontSize={12} color="$textSecondary">
        Log an appointment in under a minute.
      </Text>
    </>
  )
}

function QuickLogClientSearch({ model }: QuickLogSectionProps) {
  return (
    <PreviewCard
      p="$0"
      gap="$0"
      px="$3"
      py="$2"
      onLayout={(event) => {
        model.handleKeyboardFieldLayout('searchText', event.nativeEvent.layout.y)
      }}
    >
      <XStack items="center" gap="$2">
        <Search size={16} color="$textSecondary" />
        <TextField
          ref={model.setInputRef('searchText')}
          flex={1}
          borderWidth={0}
          height={36}
          px="$0"
          placeholder="Search clients"
          value={model.searchText}
          inputAccessoryViewID={model.keyboardAccessoryId}
          returnKeyType={model.getKeyboardReturnKeyType('searchText')}
          onFocus={() => model.handleKeyboardFieldFocus('searchText')}
          onSubmitEditing={() => model.handleKeyboardFieldSubmit('searchText')}
          onChangeText={model.setSearchText}
          fontSize={12}
          color="$color"
          placeholderTextColor="$textMuted"
          accessibilityLabel="Search clients"
        />
      </XStack>
    </PreviewCard>
  )
}

function QuickLogClientList({ model }: QuickLogSectionProps) {
  return (
    <YStack gap="$2">
      {model.filteredClients.map((client) => (
        <PreviewCard
          key={client.id}
          p="$4"
          pressStyle={{ opacity: 0.88 }}
          cursor="pointer"
          onPress={() => model.handleSelectClient(client.id)}
        >
          <Text fontSize={14} fontWeight="600">
            {client.name}
          </Text>
          <Text fontSize={12} color="$textSecondary">
            {client.type}
          </Text>
        </PreviewCard>
      ))}
    </YStack>
  )
}

export function QuickLogClientPicker({ model }: QuickLogSectionProps) {
  return (
    <YStack gap="$3">
      <QuickLogClientSearch model={model} />
      <QuickLogClientList model={model} />
    </YStack>
  )
}

function QuickLogFollowUpChannelOptions({ model }: QuickLogSectionProps) {
  return (
    <XStack gap="$2">
      {(['sms', 'email'] as FollowUpChannel[]).map((channel) => (
        <OptionChip
          key={channel}
          active={model.followUpChannel === channel}
          onPress={() => model.setFollowUpChannel(channel)}
        >
          <OptionChipLabel active={model.followUpChannel === channel}>
            {channel === 'sms' ? 'Text' : 'Email'}
          </OptionChipLabel>
        </OptionChip>
      ))}
    </XStack>
  )
}

export function QuickLogForm({ model }: QuickLogSectionProps) {
  if (!model.selectedClient) return null

  return (
    <YStack gap="$3">
      <Text fontSize={14} fontWeight="600">
        {model.selectedClient.name}
      </Text>

      <SectionDivider />

      <YStack
        onLayout={(event) => {
          model.handleKeyboardFieldLayout('date', event.nativeEvent.layout.y)
        }}
      >
        <TextField
          ref={model.setInputRef('date')}
          placeholder="Date (MM/DD/YYYY)"
          value={model.date}
          inputAccessoryViewID={model.keyboardAccessoryId}
          returnKeyType={model.getKeyboardReturnKeyType('date')}
          onFocus={() => model.handleKeyboardFieldFocus('date')}
          onSubmitEditing={() => model.handleKeyboardFieldSubmit('date')}
          onChangeText={model.setDate}
          accessibilityLabel="Appointment date"
        />
      </YStack>

      <Text fontSize={12} color="$textSecondary">
        Choose a service
      </Text>
      <XStack gap="$2" flexWrap="wrap">
        {model.serviceOptions.map((service) => (
          <OptionChip
            key={service.id}
            active={model.selectedServiceId === service.id}
            onPress={() => model.setSelectedServiceId(service.id)}
          >
            <OptionChipLabel active={model.selectedServiceId === service.id}>
              {service.name}
            </OptionChipLabel>
          </OptionChip>
        ))}
      </XStack>

      <YStack
        onLayout={(event) => {
          model.handleKeyboardFieldLayout('newServiceName', event.nativeEvent.layout.y)
        }}
      >
        <TextField
          ref={model.setInputRef('newServiceName')}
          placeholder="Or add a new service"
          value={model.newServiceName}
          inputAccessoryViewID={model.keyboardAccessoryId}
          returnKeyType={model.getKeyboardReturnKeyType('newServiceName')}
          onFocus={() => model.handleKeyboardFieldFocus('newServiceName')}
          onSubmitEditing={() => model.handleKeyboardFieldSubmit('newServiceName')}
          onChangeText={model.setNewServiceName}
        />
      </YStack>
      <SecondaryButton onPress={() => void model.handleSaveNewService()}>
        Save as preset
      </SecondaryButton>

      <YStack
        onLayout={(event) => {
          model.handleKeyboardFieldLayout('price', event.nativeEvent.layout.y)
        }}
      >
        <TextField
          ref={model.setInputRef('price')}
          placeholder="Price (optional)"
          keyboardType="decimal-pad"
          value={model.price}
          inputAccessoryViewID={model.keyboardAccessoryId}
          returnKeyType={model.getKeyboardReturnKeyType('price')}
          onFocus={() => model.handleKeyboardFieldFocus('price')}
          onSubmitEditing={() => model.handleKeyboardFieldSubmit('price')}
          onChangeText={model.setPrice}
        />
      </YStack>
      <YStack
        onLayout={(event) => {
          model.handleKeyboardFieldLayout('notes', event.nativeEvent.layout.y)
        }}
      >
        <TextField
          ref={model.setInputRef('notes')}
          placeholder="Notes (optional)"
          value={model.notes}
          inputAccessoryViewID={model.keyboardAccessoryId}
          returnKeyType={model.getKeyboardReturnKeyType('notes')}
          onFocus={() => model.handleKeyboardFieldFocus('notes')}
          onSubmitEditing={() => model.handleKeyboardFieldSubmit('notes')}
          onChangeText={model.setNotes}
        />
      </YStack>

      <Text fontSize={12} color="$textSecondary">
        Follow-up channel
      </Text>
      <QuickLogFollowUpChannelOptions model={model} />

      <Text fontSize={12} color="$textSecondary">
        Follow-up date
      </Text>
      <YStack
        onLayout={(event) => {
          model.handleKeyboardFieldLayout('followUpDate', event.nativeEvent.layout.y)
        }}
      >
        <TextField
          ref={model.setInputRef('followUpDate')}
          placeholder="MM/DD/YYYY"
          value={model.followUpDate}
          inputAccessoryViewID={model.keyboardAccessoryId}
          returnKeyType={model.getKeyboardReturnKeyType('followUpDate')}
          onFocus={() => model.handleKeyboardFieldFocus('followUpDate')}
          onSubmitEditing={() => model.handleKeyboardFieldSubmit('followUpDate')}
          onChangeText={model.setFollowUpDate}
          accessibilityLabel="Follow-up date"
        />
      </YStack>

      <Text fontSize={12} color="$textSecondary">
        Follow-up message
      </Text>
      <YStack
        onLayout={(event) => {
          model.handleKeyboardFieldLayout('followUpMessage', event.nativeEvent.layout.y)
        }}
      >
        <TextAreaField
          inputRef={model.setInputRef('followUpMessage')}
          minH={120}
          value={model.followUpMessage}
          inputAccessoryViewID={model.keyboardAccessoryId}
          onFocus={() => model.handleKeyboardFieldFocus('followUpMessage')}
          onChangeText={model.setFollowUpMessage}
          placeholder="Add your follow-up message"
        />
      </YStack>

      <XStack gap="$3" pt="$2">
        <SecondaryButton flex={1} onPress={() => void model.handleSave(false)}>
          Save
        </SecondaryButton>
        <PrimaryButton flex={1} onPress={() => void model.handleSave(true)}>
          Save + Follow-up
        </PrimaryButton>
      </XStack>
    </YStack>
  )
}

export function QuickLogContent({ model }: QuickLogSectionProps) {
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
        contentContainerStyle={{ paddingBottom: model.contentPaddingBottom } as never}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={model.keyboardDismissMode}
        onScroll={model.handleScroll as never}
        scrollEventThrottle={16}
        onScrollBeginDrag={model.handleScrollBeginDrag}
      >
      <YStack px="$5" pt={model.topPadding} gap="$4">
        <QuickLogHeader />
        {model.hasSelectedClient ? <QuickLogForm model={model} /> : <QuickLogClientPicker model={model} />}
      </YStack>
      </ScrollView>
    </>
  )
}
