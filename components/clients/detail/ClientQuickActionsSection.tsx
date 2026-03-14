import { Mail, MessageCircle, Phone } from '@tamagui/lucide-icons'
import { XStack, YStack } from 'tamagui'

import {
  ClientDetailSectionTitle,
  ClientQuickActionButton,
} from './ClientDetailPrimitives'
import type { ClientDetailSectionProps, QuickActionConfig } from './sectionTypes'

export function ClientQuickActionsSection({ model }: ClientDetailSectionProps) {
  const actions: QuickActionConfig[] = [
    { label: 'Call', icon: <Phone size={14} color="$accent" />, url: model.phoneUrl },
    { label: 'Text', icon: <MessageCircle size={14} color="$accent" />, url: model.smsUrl },
    { label: 'Email', icon: <Mail size={14} color="$accent" />, url: model.emailUrl },
  ]

  return (
    <YStack gap="$3">
      <ClientDetailSectionTitle>Quick Actions</ClientDetailSectionTitle>
      <XStack gap="$2">
        {actions.map((action) => (
          <ClientQuickActionButton key={action.label} model={model} action={action} />
        ))}
      </XStack>
    </YStack>
  )
}
