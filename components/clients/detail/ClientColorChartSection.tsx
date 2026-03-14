import { Link } from 'expo-router'
import { Palette } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import type { ClientDetailSectionProps } from './sectionTypes'
import { ClientDetailCard, ClientDetailSectionTitle } from './ClientDetailPrimitives'

export function ClientColorChartSection({ model }: ClientDetailSectionProps) {
  if (!model.client) return null

  return (
    <YStack gap="$3">
      <XStack items="center" justify="space-between">
        <ClientDetailSectionTitle>Color Chart</ClientDetailSectionTitle>
        <Link href={model.colorChartHref} asChild>
          <XStack items="center" gap="$1">
            <Palette size={14} color="$accent" />
            <Text fontSize={12} color="$accent">
              {model.hasColorChartData ? 'View Full Chart' : 'Start Color Chart'}
            </Text>
          </XStack>
        </Link>
      </XStack>
      <ClientDetailCard model={model} rounded={model.cardRadius} p="$4" gap="$2">
        {model.colorAnalysis ? (
          <>
            <XStack justify="space-between">
              <Text fontSize={12} color="$textSecondary">
                Porosity
              </Text>
              <Text fontSize={12}>{model.colorAnalysis.porosity}</Text>
            </XStack>
            <XStack justify="space-between">
              <Text fontSize={12} color="$textSecondary">
                Texture
              </Text>
              <Text fontSize={12}>{model.colorAnalysis.texture}</Text>
            </XStack>
            <XStack justify="space-between">
              <Text fontSize={12} color="$textSecondary">
                Elasticity
              </Text>
              <Text fontSize={12}>{model.colorAnalysis.elasticity}</Text>
            </XStack>
            <XStack justify="space-between">
              <Text fontSize={12} color="$textSecondary">
                Scalp
              </Text>
              <Text fontSize={12}>{model.colorAnalysis.scalpCondition}</Text>
            </XStack>
            <XStack justify="space-between">
              <Text fontSize={12} color="$textSecondary">
                Levels
              </Text>
              <Text fontSize={12}>
                {model.colorAnalysis.naturalLevel} → {model.colorAnalysis.desiredLevel}
              </Text>
            </XStack>
            <XStack justify="space-between">
              <Text fontSize={12} color="$textSecondary">
                Pigment
              </Text>
              <Text fontSize={12}>{model.colorAnalysis.contributingPigment}</Text>
            </XStack>
          </>
        ) : (
          <Text fontSize={12} color="$textSecondary">
            Color chart not recorded yet.
          </Text>
        )}
      </ClientDetailCard>
    </YStack>
  )
}
