import { Link } from 'expo-router'
import { ArrowRight } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import { PreviewCard, ThemedHeadingText } from 'components/ui/controls'

import type { OverviewSectionProps } from './sectionTypes'

export function OverviewPinnedClientsSection({ model }: OverviewSectionProps) {
  return (
    <YStack gap="$3">
      <XStack items="center" justify="space-between">
        <ThemedHeadingText fontWeight="700" fontSize={16}>
          Pinned Clients
        </ThemedHeadingText>
      </XStack>
      {model.pinnedClients.length ? (
        <YStack gap="$3">
          {model.pinnedClients.slice(0, 3).map((client) => (
            <Link key={client.id} href={`/client/${client.id}`} asChild>
              <PreviewCard p="$4" pressStyle={{ opacity: 0.85 }}>
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
                  <ArrowRight size={14} color="$accent" />
                </XStack>
              </PreviewCard>
            </Link>
          ))}
        </YStack>
      ) : (
        <Text fontSize={12} color="$textSecondary">
          Pin clients from their profile to keep them handy here.
        </Text>
      )}
    </YStack>
  )
}
