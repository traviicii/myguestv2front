import { Mail, Phone } from '@tamagui/lucide-icons'
import { Text, XStack } from 'tamagui'

import type { ClientDetailSectionProps } from './sectionTypes'
import { ClientDetailCard } from './ClientDetailPrimitives'

export function ClientContactSection({ model }: ClientDetailSectionProps) {
  if (!model.client) return null

  return (
    <ClientDetailCard model={model} rounded={model.cardRadius} p="$4" gap="$2">
      <XStack items="center" gap="$2">
        <Mail size={14} color="$textSecondary" />
        <Text fontSize={12} color="$textSecondary">
          {model.client.email}
        </Text>
      </XStack>
      <XStack items="center" gap="$2">
        <Phone size={14} color="$textSecondary" />
        <Text fontSize={12} color="$textSecondary">
          {model.client.phone}
        </Text>
      </XStack>
    </ClientDetailCard>
  )
}
