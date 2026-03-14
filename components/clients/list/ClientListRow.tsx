import { PlusCircle } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  OptionChip,
  OptionChipLabel,
  PreviewCard,
  SectionDivider,
  cardSurfaceProps,
} from 'components/ui/controls'

import type { ClientsScreenModel } from '../useClientsScreenModel'
import type { ClientRow } from './sectionTypes'

const statusColors = {
  Active: '$green10',
  Inactive: '$orange10',
} as const

type ClientListRowProps = {
  model: ClientsScreenModel
  client: ClientRow
  index: number
  totalCount: number
  onOpenClient: () => void
  onNewAppointment: () => void
}

function ClientStatus({ model, client }: { model: ClientsScreenModel; client: ClientRow }) {
  if (!model.showStatus) return null
  const status = model.isActive(client.id) ? 'Active' : 'Inactive'
  return (
    <Text fontSize={11} color={statusColors[status]}>
      {status}
    </Text>
  )
}

function ClientQuickAction({ model, onNewAppointment }: Pick<ClientListRowProps, 'model' | 'onNewAppointment'>) {
  if (model.isGlass) {
    return (
      <OptionChip
        active={!model.isGlassLight}
        gap="$1.5"
        onPress={(event) => {
          event?.stopPropagation?.()
          onNewAppointment()
        }}
      >
        <PlusCircle size={12} color="$accent" />
        <OptionChipLabel active={!model.isGlassLight}>New Appointment Log</OptionChipLabel>
      </OptionChip>
    )
  }

  return (
    <XStack
      {...cardSurfaceProps}
      rounded={model.chipRadius}
      px="$2.5"
      py="$1.5"
      items="center"
      gap="$1.5"
      cursor="pointer"
      onPress={(event) => {
        event?.stopPropagation?.()
        onNewAppointment()
      }}
    >
      <PlusCircle size={14} color="$accent" />
      <Text fontSize={11} color="$accent">
        New Appointment Log
      </Text>
    </XStack>
  )
}

export function ClientListRow({
  model,
  client,
  index,
  totalCount,
  onOpenClient,
  onNewAppointment,
}: ClientListRowProps) {
  return (
    <YStack px="$5" mb="$3" gap={model.aesthetic === 'modern' ? '$2' : '$0'}>
      <PreviewCard
        p="$4"
        pressStyle={{ opacity: 0.88 }}
        hoverStyle={{ opacity: 0.92 }}
        cursor="pointer"
        onPress={onOpenClient}
      >
        <XStack items="center" justify="space-between" gap="$3">
          <YStack gap="$1" flex={1}>
            <Text fontSize={15} fontWeight="600">
              {client.name}
            </Text>
            <Text fontSize={12} color="$textSecondary">
              {client.type} • Last visit{' '}
              {model.formatLastVisitLabel(
                model.resolveLastVisit(client.id, client.lastVisit)
              )}
            </Text>
            <XStack items="center" gap="$2">
              <ClientStatus model={model} client={client} />
              {client.tag && client.tag !== client.type ? (
                <Text fontSize={11} color="$textMuted">
                  {client.tag}
                </Text>
              ) : null}
            </XStack>
          </YStack>
          <YStack items="flex-end" gap="$1">
            <ClientQuickAction model={model} onNewAppointment={onNewAppointment} />
          </YStack>
        </XStack>
      </PreviewCard>
      {model.aesthetic === 'modern' && index < totalCount - 1 ? (
        <YStack items="center">
          <SectionDivider width="88%" />
        </YStack>
      ) : null}
    </YStack>
  )
}
