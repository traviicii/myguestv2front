import { Image } from 'react-native'
import { Link } from 'expo-router'
import { ChevronRight, List, Palette, Scissors } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import { PrimaryButton } from 'components/ui/controls'

import {
  ActionText,
  ClientAppointmentActionLink,
  ClientDetailCard,
  ClientDetailSectionTitle,
} from './ClientDetailPrimitives'
import type { ClientDetailSectionProps } from './sectionTypes'
import type { ClientTimelineEntry } from './timelineUtils'

function TimelineEntryGlyph({
  entry,
  model,
}: {
  entry: ClientTimelineEntry
  model: ClientDetailSectionProps['model']
}) {
  return (
    <YStack
      width={32}
      height={32}
      items="center"
      justify="center"
      rounded={model.thumbRadius}
      bg="$surfacePanel"
      borderWidth={1}
      borderColor="$borderSubtle"
      shrink={0}
    >
      {entry.kind === 'appointment' ? (
        <Scissors size={15} color="$accent" />
      ) : (
        <Palette size={15} color="$accent" />
      )}
    </YStack>
  )
}

function TimelineMetaRail({
  entry,
  model,
}: {
  entry: ClientTimelineEntry
  model: ClientDetailSectionProps['model']
}) {
  const railWidth = model.isGlass ? 86 : 78

  return (
    <YStack
      width={railWidth}
      shrink={0}
      items="flex-end"
      gap="$2"
      pl="$2"
      borderLeftWidth={1}
      borderColor="$borderSubtle"
    >
      <XStack items="center" gap="$1.5">
        <Text
          fontSize={entry.kind === 'appointment' ? 13 : 10.5}
          fontWeight={entry.kind === 'appointment' ? '700' : '600'}
          color={entry.kind === 'appointment' ? '$color' : '$textSecondary'}
          textTransform={entry.kind === 'appointment' ? undefined : 'uppercase'}
          letterSpacing={entry.kind === 'appointment' ? undefined : 0.6}
        >
          {entry.kind === 'appointment' ? entry.priceLabel : entry.metaLabel}
        </Text>
        <ChevronRight size={16} color="$textMuted" />
      </XStack>

      {entry.kind === 'appointment' ? <TimelinePhotoMeta entry={entry} model={model} /> : null}
    </YStack>
  )
}

function TimelinePhotoMeta({
  entry,
  model,
}: {
  entry: Extract<ClientTimelineEntry, { kind: 'appointment' }>
  model: ClientDetailSectionProps['model']
}) {
  const imageUri = entry.imageUrl ?? ''

  if (!imageUri) {
    if (!entry.photoLabel) return null
    return (
      <Text fontSize={11} color="$textMuted" numberOfLines={1}>
        {entry.photoLabel}
      </Text>
    )
  }

  return (
    <YStack items="flex-end" gap="$1.5">
      <YStack
        width={44}
        height={44}
        rounded={model.thumbRadius}
        overflow="hidden"
        borderWidth={1}
        borderColor="$borderSubtle"
      >
        <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} />
      </YStack>
      {entry.photoCount > 1 ? (
        <Text fontSize={11} color="$textMuted" numberOfLines={1}>
          {entry.photoLabel}
        </Text>
      ) : null}
    </YStack>
  )
}

export function ClientTimelineSection({ model }: ClientDetailSectionProps) {
  if (!model.client) return null

  return (
    <YStack gap="$3">
      <XStack items="center" justify="space-between" gap="$3">
        <ClientDetailSectionTitle>Client Timeline</ClientDetailSectionTitle>
        <Text fontSize={11} color="$textMuted">
          Recent moments
        </Text>
      </XStack>
      <XStack gap="$2">
        <Link href={model.newAppointmentHref} asChild>
          {model.isGlass ? (
            <PrimaryButton size="$2" height={36} px="$3" flex={1} icon={<Scissors size={14} />}>
              <Text
                fontSize={12}
                fontWeight="700"
                color="$buttonPrimaryFg"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                New Appointment Log
              </Text>
            </PrimaryButton>
          ) : (
            <ClientDetailCard model={model} rounded={model.controlRadius} px="$3" py="$2.5" flex={1}>
              <XStack items="center" gap="$2" justify="center">
                <Scissors size={14} color="$accent" />
                <ActionText label="New Appointment Log" />
              </XStack>
            </ClientDetailCard>
          )}
        </Link>
        <ClientAppointmentActionLink href={model.appointmentsHref}>
          {model.isGlass ? (
            <PrimaryButton size="$2" height={36} px="$3" flex={1} icon={<List size={14} />}>
              View All
            </PrimaryButton>
          ) : (
            <ClientDetailCard model={model} rounded={model.controlRadius} px="$3" py="$2.5" flex={1}>
              <XStack items="center" gap="$2" justify="center">
                <List size={14} color="$accent" />
                <ActionText label="View All" />
              </XStack>
            </ClientDetailCard>
          )}
        </ClientAppointmentActionLink>
      </XStack>

      <YStack gap="$3">
        {model.timelineEntries.length === 0 ? (
          <ClientDetailCard model={model} rounded={model.cardRadius} p="$4">
            <Text fontSize={12} color="$textSecondary">
              No client history recorded yet.
            </Text>
          </ClientDetailCard>
        ) : (
          model.timelineEntries.map((entry) => {
            const href =
              entry.kind === 'appointment'
                ? model.appointmentDetailHref(entry.sourceId)
                : model.colorChartHref

            return (
              <Link key={entry.id} href={href} asChild>
                <ClientDetailCard
                  model={model}
                  rounded={model.cardRadius}
                  px="$3"
                  py="$3"
                  pressStyle={{ opacity: 0.85 }}
                >
                  <XStack items="flex-start" justify="space-between" gap="$3">
                    <XStack items="flex-start" gap="$3" flex={1}>
                      <TimelineEntryGlyph entry={entry} model={model} />
                      <YStack flex={1} gap="$1.5">
                        {entry.kind === 'appointment' ? (
                          <Text
                            fontSize={10.5}
                            color="$textMuted"
                            textTransform="uppercase"
                            letterSpacing={0.6}
                            numberOfLines={1}
                          >
                            {entry.eventLabel}
                          </Text>
                        ) : null}
                        <Text
                          fontSize={11}
                          color="$textSecondary"
                          numberOfLines={2}
                          lineHeight={14}
                        >
                          {model.formatAppointmentDate(entry.date)}
                        </Text>
                        <Text fontSize={13} fontWeight="700">
                          {entry.title}
                        </Text>
                        {entry.supportingLine ? (
                          <Text fontSize={12} color="$textSecondary" numberOfLines={2}>
                            {entry.supportingLine}
                          </Text>
                        ) : null}
                        {entry.tertiaryLine ? (
                          <Text fontSize={11.5} color="$textMuted" numberOfLines={2}>
                            {entry.tertiaryLine}
                          </Text>
                        ) : null}
                      </YStack>
                    </XStack>
                    <TimelineMetaRail entry={entry} model={model} />
                  </XStack>
                </ClientDetailCard>
              </Link>
            )
          })
        )}
      </YStack>
    </YStack>
  )
}
