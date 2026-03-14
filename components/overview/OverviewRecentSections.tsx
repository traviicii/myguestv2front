import { Link } from 'expo-router'
import { ArrowRight, CalendarDays } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  PreviewCard,
  SecondaryButton,
  SectionDivider,
  SurfaceCard,
  ThemedHeadingText,
} from 'components/ui/controls'
import { formatDateByStyle } from 'components/utils/date'
import { getServiceLabel } from 'components/utils/services'

import type { OverviewNavigableSectionProps } from './sectionTypes'

export function OverviewRecentAppointmentsSection({
  model,
  onNavigate,
}: OverviewNavigableSectionProps) {
  const hasAppointments = model.recentHistory.length > 0
  const canLogAppointment = model.clients.length > 0

  return (
    <YStack gap="$3">
      <XStack items="center" justify="space-between">
        <ThemedHeadingText fontWeight="700" fontSize={16}>
          Recent Appointments
        </ThemedHeadingText>
        <Link href="/appointments" asChild>
          <XStack items="center" gap="$1">
            <Text fontSize={12} color="$accent">
              Full history
            </Text>
            <ArrowRight size={14} color="$accent" />
          </XStack>
        </Link>
      </XStack>
      {hasAppointments ? (
        <YStack gap="$3">
          {model.recentHistory.map((entry, entryIndex) => {
            const clientName = model.clientMap.get(entry.clientId)?.name ?? 'Client'
            return (
              <YStack key={entry.id} gap={model.aesthetic === 'modern' ? '$2' : '$0'}>
                <Link href={`/appointment/${entry.id}`} asChild>
                  <PreviewCard p="$4">
                    <XStack items="center" justify="space-between" gap="$3">
                      <XStack items="center" gap="$3">
                        <XStack
                          bg="$accentSoft"
                          rounded={model.iconBadgeRadius}
                          p="$2.5"
                          items="center"
                          justify="center"
                        >
                          <CalendarDays size={18} color="$accent" />
                        </XStack>
                        <YStack gap="$1">
                          <Text fontSize={14} fontWeight="600">
                            {getServiceLabel(entry.services, entry.notes)}
                          </Text>
                          <XStack items="center" gap="$2">
                            <Text fontSize={12} color="$textSecondary">
                              {clientName}
                            </Text>
                            <Text fontSize={11} color="$textSecondary">
                              {formatDateByStyle(
                                entry.date,
                                model.appSettings.dateDisplayFormat,
                                {
                                  todayLabel: true,
                                  includeWeekday:
                                    model.appSettings.dateLongIncludeWeekday,
                                }
                              )}
                            </Text>
                          </XStack>
                        </YStack>
                      </XStack>
                      <Text fontSize={12} color="$textMuted">
                        ${entry.price}
                      </Text>
                    </XStack>
                  </PreviewCard>
                </Link>
                {model.aesthetic === 'modern' &&
                entryIndex < model.recentHistory.length - 1 ? (
                  <YStack items="center">
                    <SectionDivider width="88%" />
                  </YStack>
                ) : null}
              </YStack>
            )
          })}
        </YStack>
      ) : (
        <SurfaceCard p="$4" tone={model.isGlass ? 'secondary' : 'default'} gap="$2">
          <Text fontSize={12} color="$textSecondary">
            No appointment logs yet.
          </Text>
          <SecondaryButton
            onPress={() =>
              onNavigate(canLogAppointment ? '/appointments/new' : '/clients/new')
            }
          >
            {canLogAppointment ? 'Log appointment' : 'Add a client first'}
          </SecondaryButton>
        </SurfaceCard>
      )}
    </YStack>
  )
}

export function OverviewRecentClientsSection({
  model,
  onNavigate,
}: OverviewNavigableSectionProps) {
  return (
    <YStack gap="$3">
      <XStack items="center" justify="space-between">
        <ThemedHeadingText fontWeight="700" fontSize={16}>
          Recent Clients
        </ThemedHeadingText>
        <Link href="/recent-clients" asChild>
          <XStack items="center" gap="$1">
            <Text fontSize={12} color="$accent">
              View all
            </Text>
            <ArrowRight size={14} color="$accent" />
          </XStack>
        </Link>
      </XStack>
      {model.recentClients.length ? (
        <YStack gap="$3">
          {model.recentClients.map((client, clientIndex) => (
            <YStack key={client.id} gap={model.aesthetic === 'modern' ? '$2' : '$0'}>
              <Link href={`/client/${client.id}`} asChild>
                <PreviewCard p="$4">
                  <XStack items="center" justify="space-between" gap="$3">
                    <YStack>
                      <Text fontSize={14} fontWeight="600">
                        {client.name}
                      </Text>
                      <Text fontSize={12} color="$textSecondary">
                        {client.type} • Last visit{' '}
                        {model.formatLastVisitLabel(
                          model.resolveLastVisit(client.id, client.lastVisit)
                        )}
                      </Text>
                    </YStack>
                  </XStack>
                </PreviewCard>
              </Link>
              {model.aesthetic === 'modern' &&
              clientIndex < model.recentClients.length - 1 ? (
                <YStack items="center">
                  <SectionDivider width="88%" />
                </YStack>
              ) : null}
            </YStack>
          ))}
        </YStack>
      ) : (
        <SurfaceCard p="$4" tone={model.isGlass ? 'secondary' : 'default'} gap="$2">
          <Text fontSize={12} color="$textSecondary">
            No clients yet.
          </Text>
          <SecondaryButton onPress={() => onNavigate('/clients/new')}>
            Add your first client
          </SecondaryButton>
        </SurfaceCard>
      )}
    </YStack>
  )
}
