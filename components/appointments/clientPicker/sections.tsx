import { Link } from 'expo-router'
import { ChevronLeft, Search, UserPlus, X } from '@tamagui/lucide-icons'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  PreviewCard,
  SecondaryButton,
  SectionDivider,
  TextField,
  cardSurfaceProps,
} from 'components/ui/controls'

import type { NewAppointmentClientPickerScreenModel } from './useNewAppointmentClientPickerScreenModel'

type NewAppointmentClientPickerSectionProps = {
  model: NewAppointmentClientPickerScreenModel
}

function AppointmentClientPickerHeader({ model }: NewAppointmentClientPickerSectionProps) {
  return (
    <XStack px="$5" pt={model.topInset} pb="$2" items="center" justify="space-between">
      <SecondaryButton
        size="$2"
        height={36}
        width={38}
        px="$2"
        icon={<ChevronLeft size={16} />}
        onPress={model.handleBack}
        accessibilityLabel="Go back"
      />
      <YStack width={38} />
    </XStack>
  )
}

function AppointmentClientPickerSearch({ model }: NewAppointmentClientPickerSectionProps) {
  return (
    <XStack
      {...cardSurfaceProps}
      rounded={model.controlRadius}
      width="100%"
      px="$3"
      py="$2"
      items="center"
      gap="$2"
    >
      <Search size={16} color="$textSecondary" />
      <TextField
        ref={model.searchInputRef}
        flex={1}
        borderWidth={0}
        height={36}
        px="$0"
        pl="$2"
        placeholder="Search clients"
        value={model.searchText}
        onChangeText={model.setSearchText}
        fontSize={12}
        color="$color"
        placeholderTextColor="$textMuted"
      />
      <XStack
        width={28}
        height={28}
        rounded={999}
        items="center"
        justify="center"
        onPress={model.handleClearSearch}
        pressStyle={model.searchText ? { opacity: 0.7 } : undefined}
        opacity={model.searchText ? 1 : 0.35}
        pointerEvents={model.searchText ? 'auto' : 'none'}
      >
        <X size={14} color="$textSecondary" />
      </XStack>
    </XStack>
  )
}

function AppointmentClientPickerList({ model }: NewAppointmentClientPickerSectionProps) {
  if (model.filteredClients.length === 0) {
    return (
      <PreviewCard p="$4">
        <Text fontSize={12} color="$textSecondary">
          No clients match your search.
        </Text>
      </PreviewCard>
    )
  }

  return (
    <YStack gap="$3">
      {model.filteredClients.map((client) => (
        <Link key={client.id} href={`/client/${client.id}/new-appointment`} asChild>
          <PreviewCard p="$4" pressStyle={{ opacity: 0.88 }} cursor="pointer">
            <XStack items="center" justify="space-between" gap="$3">
              <YStack>
                <Text fontSize={14} fontWeight="600">
                  {client.name}
                </Text>
                <Text fontSize={12} color="$textSecondary">
                  {client.type} • Last visit{' '}
                  {model.formatLastVisitLabel(
                    model.derivedLastVisitByClient[client.id] ?? client.lastVisit
                  )}
                </Text>
              </YStack>
              <XStack items="center" gap="$2">
                <UserPlus size={16} color="$accent" />
                <Text fontSize={12} color="$accent">
                  Select
                </Text>
              </XStack>
            </XStack>
          </PreviewCard>
        </Link>
      ))}
    </YStack>
  )
}

export function NewAppointmentClientPickerContent({
  model,
}: NewAppointmentClientPickerSectionProps) {
  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <AppointmentClientPickerHeader model={model} />
      <ScrollView contentContainerStyle={{ pb: '$10' } as any} keyboardShouldPersistTaps="handled">
        <YStack px="$5" pt="$3" gap="$4">
          <YStack gap="$2">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              New Appointment Log
            </Text>
            <Text fontSize={12} color="$textSecondary">
              Choose a client to log an appointment.
            </Text>
          </YStack>

          <AppointmentClientPickerSearch model={model} />

          <SectionDivider />

          <AppointmentClientPickerList model={model} />
        </YStack>
      </ScrollView>
    </YStack>
  )
}
