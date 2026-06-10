import { ArrowRight, CalendarDays, Camera } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  PreviewCard,
  SecondaryButton,
  SurfaceCard,
  ThemedHeadingText,
} from 'components/ui/controls'

import type { OverviewNavigableSectionProps } from './sectionTypes'

const TODAY_PREVIEW_LIMIT = 4

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

function TodaySectionAction({
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

export function OverviewTodaySection({
  model,
  onNavigate,
}: OverviewNavigableSectionProps) {
  const appointments = model.todayAppointments
  const visibleAppointments = appointments.slice(0, TODAY_PREVIEW_LIMIT)
  const hiddenCount = Math.max(0, appointments.length - visibleAppointments.length)
  const hasAppointments = appointments.length > 0
  const canLogAppointment = model.clients.length > 0
  const sectionGap = model.isCyberpunk ? '$2' : '$3'

  return (
    <YStack gap={sectionGap}>
      <XStack items="center" justify="space-between">
        <YStack gap="$1">
          <ThemedHeadingText fontWeight="700" fontSize={16}>
            Today
          </ThemedHeadingText>
          {hasAppointments ? (
            <Text fontSize={12} color="$textSecondary">
              {pluralize(appointments.length, 'appointment log')} dated today
            </Text>
          ) : null}
        </YStack>
        {hasAppointments ? (
          <TodaySectionAction
            label="Full history"
            controlRadius={model.controlRadius}
            onPress={() => onNavigate('/appointments')}
          />
        ) : null}
      </XStack>

      {hasAppointments ? (
        <YStack gap="$3">
          {visibleAppointments.map((appointment) => (
            <PreviewCard
              key={appointment.id}
              p="$3.5"
              onPress={() => onNavigate(`/appointment/${appointment.id}`)}
            >
              <XStack items="center" justify="space-between" gap="$3">
                <XStack items="center" gap="$3" flex={1}>
                  <XStack
                    bg="$accentSoft"
                    rounded={model.iconBadgeRadius}
                    p="$2.5"
                    items="center"
                    justify="center"
                  >
                    <CalendarDays size={18} color="$accent" />
                  </XStack>
                  <YStack flex={1} gap="$1">
                    <Text fontSize={14} fontWeight="700" numberOfLines={1}>
                      {appointment.clientName}
                    </Text>
                    <Text fontSize={12} color="$textSecondary" numberOfLines={1}>
                      {appointment.serviceLabel}
                    </Text>
                    {appointment.noteSnippet ? (
                      <Text fontSize={11} color="$textMuted" numberOfLines={1}>
                        {appointment.noteSnippet}
                      </Text>
                    ) : null}
                  </YStack>
                </XStack>
                <YStack items="flex-end" gap="$1">
                  <Text fontSize={12} fontWeight="700" color="$textPrimary">
                    {appointment.priceLabel}
                  </Text>
                  {appointment.photoCount > 0 ? (
                    <XStack items="center" gap="$1">
                      <Camera size={12} color="$textMuted" />
                      <Text fontSize={11} color="$textMuted">
                        {appointment.photoCount}
                      </Text>
                    </XStack>
                  ) : null}
                </YStack>
              </XStack>
            </PreviewCard>
          ))}
          {hiddenCount > 0 ? (
            <SurfaceCard
              p="$3"
              tone={model.isGlass ? 'secondary' : 'default'}
              rounded={model.sectionCardRadius}
              onPress={() => onNavigate('/appointments')}
              pressStyle={{ opacity: 0.84 }}
            >
              <Text fontSize={12} color="$accent" style={{ textAlign: 'center' }}>
                View {pluralize(hiddenCount, 'more appointment')} from today
              </Text>
            </SurfaceCard>
          ) : null}
        </YStack>
      ) : (
        <SurfaceCard
          p="$4"
          tone={model.isGlass ? 'secondary' : 'default'}
          rounded={model.sectionCardRadius}
          gap="$2.5"
        >
          <YStack gap="$1">
            <Text fontSize={13} fontWeight="700" color="$textPrimary">
              Nothing dated today yet.
            </Text>
            <Text fontSize={12} color="$textSecondary">
              Appointment logs added ahead of time will appear here on their service date.
            </Text>
          </YStack>
          <SecondaryButton
            onPress={() =>
              onNavigate(canLogAppointment ? '/appointments/new' : '/clients/new')
            }
          >
            {canLogAppointment ? "Add today's log" : 'Add a client first'}
          </SecondaryButton>
        </SurfaceCard>
      )}
    </YStack>
  )
}
