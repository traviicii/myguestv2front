import { LogOut } from '@tamagui/lucide-icons'
import { Text, YStack } from 'tamagui'

import { SecondaryButton, SectionDivider, SurfaceCard } from 'components/ui/controls'

import { ProfileSectionTitle } from './ProfileSectionPrimitives'
import type { ProfileSectionProps } from './sectionTypes'

export function ProfileSessionSection({ model }: ProfileSectionProps) {
  if (!model.canUseFirebaseAuth) return null

  return (
    <>
      <YStack gap={model.sectionGap}>
        <ProfileSectionTitle>Session</ProfileSectionTitle>
        <SurfaceCard tone={model.cardTone}>
          <Text fontSize={12} color="$textSecondary">
            Signed in as {model.user?.email ?? model.profile.email}
          </Text>
          <SecondaryButton
            icon={<LogOut size={16} />}
            disabled={model.isSigningOut}
            onPress={() => {
              void model.handleSignOut()
            }}
          >
            {model.isSigningOut ? 'Signing out...' : 'Sign out'}
          </SecondaryButton>
        </SurfaceCard>
      </YStack>
      <SectionDivider />
    </>
  )
}
