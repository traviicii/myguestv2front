import { Text, XStack, YStack } from 'tamagui'

import {
  ClientDetailCard,
  ClientDetailSectionTitle,
} from './ClientDetailPrimitives'
import type { ClientDetailSectionProps } from './sectionTypes'

export function ClientRebookingSection({ model }: ClientDetailSectionProps) {
  const recommendation = model.rebookingRecommendation

  return (
    <ClientDetailCard model={model} p="$4" rounded={model.cardRadius} gap="$3">
      <XStack items="center" justify="space-between" gap="$3">
        <ClientDetailSectionTitle>Rebooking</ClientDetailSectionTitle>
        {recommendation ? (
          <Text
            fontSize={11}
            fontWeight="600"
            color={
              recommendation.status === 'overdue'
                ? '$red10'
                : recommendation.status === 'dueThisWeek'
                  ? '$orange10'
                  : '$green10'
            }
          >
            {recommendation.statusLabel}
          </Text>
        ) : null}
      </XStack>

      {recommendation ? (
        <YStack gap="$1.5">
          <Text fontSize={12} color="$textSecondary">
            Latest visit {model.formatAppointmentDate(recommendation.latestVisitDate)}
          </Text>
          <Text fontSize={14} fontWeight="700">
            Next suggested visit {model.formatAppointmentDate(recommendation.suggestedNextVisitDate)}
          </Text>
          <Text fontSize={12} color="$textSecondary">
            Driving service {recommendation.drivingServiceName}
          </Text>
          <Text fontSize={12} color="$textSecondary">
            {recommendation.basisLabel}
          </Text>
          <Text fontSize={12} color="$textMuted">
            {recommendation.secondaryLabel}
          </Text>
        </YStack>
      ) : (
        <YStack gap="$1.5">
          <Text fontSize={12} color="$textSecondary">
            {model.latestHistoryDate
              ? 'Set a recommended return on the services used for this client to see rebooking guidance here.'
              : 'Log an appointment first, then set a recommended return on your services to see rebooking guidance.'}
          </Text>
        </YStack>
      )}
    </ClientDetailCard>
  )
}
