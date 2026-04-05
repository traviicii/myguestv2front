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
                  p="$4"
                  gap="$3"
                  pressStyle={{ opacity: 0.85 }}
                >
                  <XStack items="flex-start" justify="space-between" gap="$3">
                    <XStack items="center" gap="$2.5" flex={1}>
                      {entry.kind === 'appointment' ? (
                        <Scissors size={15} color="$accent" />
                      ) : (
                        <Palette size={15} color="$accent" />
                      )}
                      <YStack flex={1} gap="$1">
                        <Text fontSize={13} fontWeight="700">
                          {entry.title}
                        </Text>
                        <Text fontSize={12} color="$textSecondary">
                          {model.formatAppointmentDate(entry.date)}
                        </Text>
                      </YStack>
                    </XStack>
                    <XStack items="center" gap="$2">
                      {entry.kind === 'appointment' && entry.imageUrl ? (
                        <YStack
                          width={34}
                          height={34}
                          rounded={model.thumbRadius}
                          overflow="hidden"
                          borderWidth={1}
                          borderColor="$borderSubtle"
                        >
                          <Image
                            source={{ uri: entry.imageUrl }}
                            style={{ width: '100%', height: '100%' }}
                          />
                        </YStack>
                      ) : null}
                      <ChevronRight size={16} color="$textMuted" />
                    </XStack>
                  </XStack>

                  <YStack gap="$1.5">
                    <Text fontSize={12} fontWeight="600">
                      {entry.detail}
                    </Text>
                    {entry.secondaryDetail ? (
                      <Text fontSize={12} color="$textSecondary" numberOfLines={2}>
                        {entry.secondaryDetail}
                      </Text>
                    ) : null}
                    {entry.notePreview ? (
                      <Text fontSize={12} color="$textMuted" numberOfLines={2}>
                        {entry.notePreview}
                      </Text>
                    ) : null}
                  </YStack>
                </ClientDetailCard>
              </Link>
            )
          })
        )}
      </YStack>
    </YStack>
  )
}
