import { ScrollView, YStack } from 'tamagui'

import { SectionDivider } from 'components/ui/controls'

import { ClientAppointmentsSection } from './ClientAppointmentsSection'
import { ClientColorChartSection } from './ClientColorChartSection'
import { ClientContactSection } from './ClientContactSection'
import { ClientHeroSection } from './ClientHeroSection'
import { ClientNotesSection } from './ClientNotesSection'
import { ClientQuickActionsSection } from './ClientQuickActionsSection'
import { ClientDetailStateMessage } from './ClientDetailPrimitives'
import { ClientDetailTopBar } from './ClientDetailTopBar'
import type { ClientDetailSectionProps } from './sectionTypes'

export { ClientDetailStateMessage, ClientDetailTopBar }

export function ClientDetailContent({ model }: ClientDetailSectionProps) {
  if (!model.client) return null

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 } as never}>
      <YStack px="$5" pt="$3" gap="$4">
        <ClientHeroSection model={model} />
        <ClientContactSection model={model} />
        <SectionDivider />
        <ClientQuickActionsSection model={model} />
        <SectionDivider />
        <ClientNotesSection model={model} />
        <SectionDivider />
        <ClientAppointmentsSection model={model} />
        <SectionDivider />
        <ClientColorChartSection model={model} />
      </YStack>
    </ScrollView>
  )
}
