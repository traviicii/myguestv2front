import { ScrollView, YStack } from 'tamagui'

import { SectionDivider } from 'components/ui/controls'

import { ProfileAppearanceSection } from './ProfileAppearanceSection'
import { ProfilePreferencesSection } from './ProfilePreferencesSection'
import { ProfileSessionSection } from './ProfileSessionSection'
import { ProfileSettingsLink } from './ProfileSettingsLink'
import { ProfileSummaryCard } from './ProfileSummaryCard'
import type { ProfileSectionProps } from './sectionTypes'

export function ProfileContent({ model }: ProfileSectionProps) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: model.contentPaddingBottom } as never}>
      <YStack px="$5" pt={model.topInset} gap={model.isModern ? '$5' : '$4'}>
        <ProfileSummaryCard model={model} />
        <SectionDivider />
        <ProfilePreferencesSection model={model} />
        <SectionDivider />
        <ProfileAppearanceSection model={model} />
        <SectionDivider />
        <ProfileSessionSection model={model} />
        <ProfileSettingsLink model={model} />
      </YStack>
    </ScrollView>
  )
}
