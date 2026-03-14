import { Image } from 'react-native'
import { Link } from 'expo-router'
import { ChevronRight, List, Scissors } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import { PrimaryButton } from 'components/ui/controls'
import { getServiceLabel } from 'components/utils/services'

import {
  ActionText,
  ClientAppointmentActionLink,
  ClientDetailCard,
  ClientDetailSectionTitle,
} from './ClientDetailPrimitives'
import type { ClientDetailSectionProps } from './sectionTypes'

export function ClientAppointmentsSection({ model }: ClientDetailSectionProps) {
  if (!model.client) return null

  return (
    <YStack gap="$3">
      <ClientDetailSectionTitle>Appointment Logs</ClientDetailSectionTitle>
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
        {model.history.length === 0 ? (
          <ClientDetailCard model={model} rounded={model.cardRadius} p="$4">
            <Text fontSize={12} color="$textSecondary">
              No appointment logs yet.
            </Text>
          </ClientDetailCard>
        ) : (
          model.history.map((entry) => (
            <Link key={entry.id} href={model.appointmentDetailHref(entry.id)} asChild>
              <ClientDetailCard
                model={model}
                rounded={model.cardRadius}
                p="$4"
                pressStyle={{ opacity: 0.85 }}
              >
                <XStack items="center" justify="space-between" gap="$2">
                  <YStack flex={1} gap="$1">
                    <Text fontSize={13} fontWeight="600">
                      {getServiceLabel(entry.services, entry.notes)}
                    </Text>
                    <Text fontSize={12} color="$textSecondary">
                      {model.formatAppointmentDate(entry.date)}
                    </Text>
                  </YStack>
                  <XStack items="center" gap="$2">
                    <Text fontSize={12} fontWeight="700">
                      ${entry.price}
                    </Text>
                    {entry.images?.length ? (
                      <YStack
                        width={34}
                        height={34}
                        rounded={model.thumbRadius}
                        overflow="hidden"
                        borderWidth={1}
                        borderColor="$borderSubtle"
                      >
                        <Image
                          source={{ uri: entry.images[0] }}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </YStack>
                    ) : null}
                    <ChevronRight size={16} color="$textMuted" />
                  </XStack>
                </XStack>
              </ClientDetailCard>
            </Link>
          ))
        )}
      </YStack>
    </YStack>
  )
}
