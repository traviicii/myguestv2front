import { ArrowRight, CalendarDays, UserPlus } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  PreviewCard,
  SecondaryButton,
  SurfaceCard,
  ThemedHeadingText,
} from 'components/ui/controls'
import { formatDateByStyle } from 'components/utils/date'
import { getClientGroupSummary } from 'components/utils/clientGroups'
import { getServiceLabel } from 'components/utils/services'

import type { OverviewNavigableSectionProps } from './sectionTypes'

function OverviewSectionAction({
  label,
  onPress,
  controlRadius,
}: {
  label: string
  onPress: () => void
  controlRadius: number
}) {
  return (
    <XStack
      items="center"
      gap="$1"
      px="$2"
      py="$1"
      mx="$-2"
      rounded={controlRadius}
      cursor="pointer"
      onPress={onPress}
      pressStyle={{ opacity: 0.78, bg: '$surfaceChipActive' }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text fontSize={12} color="$accent">
        {label}
      </Text>
      <ArrowRight size={14} color="$accent" />
    </XStack>
  )
}

export function OverviewRecentAppointmentsSection({
  model,
  onNavigate,
}: OverviewNavigableSectionProps) {
  const hasAppointments = model.recentHistory.length > 0
  const canLogAppointment = model.clients.length > 0
  const sectionGap = model.isCyberpunk ? '$2' : '$3'

  return (
    <YStack gap={sectionGap}>
      <XStack items="center" justify="space-between">
        <ThemedHeadingText fontWeight="700" fontSize={16}>
          Recent Appointments
        </ThemedHeadingText>
        <OverviewSectionAction
          label="Full history"
          controlRadius={model.controlRadius}
          onPress={() => onNavigate('/appointments')}
        />
      </XStack>
      {hasAppointments ? (
        <YStack gap="$3">
          {model.recentHistory.map((entry) => {
            const clientName = model.clientMap.get(entry.clientId)?.name ?? 'Client'
            return (
              <YStack key={entry.id}>
                <PreviewCard p="$4" onPress={() => onNavigate(`/appointment/${entry.id}`)}>
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
                          {clientName}
                        </Text>
                        <XStack items="center" gap="$2">
                          <Text fontSize={12} color="$textSecondary">
                            {getServiceLabel(entry.services, entry.notes)}
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
  const sectionGap = model.isCyberpunk ? '$2' : '$3'

  return (
    <YStack gap={sectionGap}>
      <XStack items="center" justify="space-between">
        <ThemedHeadingText fontWeight="700" fontSize={16}>
          Recently Added
        </ThemedHeadingText>
        <OverviewSectionAction
          label="View all"
          controlRadius={model.controlRadius}
          onPress={() => onNavigate('/recent-clients')}
        />
      </XStack>
      {model.recentClients.length ? (
        <YStack gap="$3">
          {model.recentClients.map((client) => (
            <YStack key={client.id}>
              <PreviewCard p="$4" onPress={() => onNavigate(`/client/${client.id}`)}>
                <XStack items="center" justify="space-between" gap="$3">
                  <XStack items="center" gap="$3" flex={1}>
                    <XStack
                      bg="$accentSoft"
                      rounded={model.iconBadgeRadius}
                      p="$2.5"
                      items="center"
                      justify="center"
                    >
                      <UserPlus size={18} color="$accent" />
                    </XStack>
                    <YStack flex={1} gap="$1">
                      <Text fontSize={14} fontWeight="600" numberOfLines={1}>
                        {client.name}
                      </Text>
                      <Text fontSize={12} color="$textSecondary" numberOfLines={1}>
                        {getClientGroupSummary(client)} • Last visit{' '}
                        {model.formatLastVisitLabel(
                          model.resolveLastVisit(client.id, client.lastVisit)
                        )}
                      </Text>
                    </YStack>
                  </XStack>
                </XStack>
              </PreviewCard>
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
