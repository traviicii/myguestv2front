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
    <PreviewCard p="$0" gap="$0" px="$3" py="$2">
      <XStack items="center" gap="$2">
        <Search size={16} color="$textSecondary" />
        <TextField
          flex={1}
          borderWidth={0}
          height={36}
          px="$0"
          placeholder="Search clients"
          value={model.searchText}
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
          onPress={() => model.setSelectedClientId(client.id)}
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

      <TextField
        placeholder="Date (MM/DD/YYYY)"
        value={model.date}
        onChangeText={model.setDate}
        accessibilityLabel="Appointment date"
      />

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

      <TextField
        placeholder="Or add a new service"
        value={model.newServiceName}
        onChangeText={model.setNewServiceName}
      />
      <SecondaryButton onPress={() => void model.handleSaveNewService()}>
        Save as preset
      </SecondaryButton>

      <TextField
        placeholder="Price (optional)"
        keyboardType="decimal-pad"
        value={model.price}
        onChangeText={model.setPrice}
      />
      <TextField placeholder="Notes (optional)" value={model.notes} onChangeText={model.setNotes} />

      <Text fontSize={12} color="$textSecondary">
        Follow-up channel
      </Text>
      <QuickLogFollowUpChannelOptions model={model} />

      <Text fontSize={12} color="$textSecondary">
        Follow-up date
      </Text>
      <TextField
        placeholder="MM/DD/YYYY"
        value={model.followUpDate}
        onChangeText={model.setFollowUpDate}
        accessibilityLabel="Follow-up date"
      />

      <Text fontSize={12} color="$textSecondary">
        Follow-up message
      </Text>
      <TextAreaField
        minH={120}
        value={model.followUpMessage}
        onChangeText={model.setFollowUpMessage}
        placeholder="Add your follow-up message"
      />

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
    <ScrollView contentContainerStyle={{ paddingBottom: model.contentPaddingBottom } as never}>
      <YStack px="$5" pt={model.topPadding} gap="$4">
        <QuickLogHeader />
        {model.hasSelectedClient ? <QuickLogForm model={model} /> : <QuickLogClientPicker model={model} />}
      </YStack>
    </ScrollView>
  )
}
