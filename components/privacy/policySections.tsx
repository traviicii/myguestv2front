import { Link } from 'expo-router'
import { ArrowUpRight, LifeBuoy, Shield } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  SecondaryButton,
  SurfaceCard,
  ThemedHeadingText,
} from 'components/ui/controls'

import type { DataPrivacyScreenModel } from './useDataPrivacyScreenModel'

type PolicySection = {
  title: string
  body: string
}

const policySections: PolicySection[] = [
  {
    title: 'Information we store',
    body:
      'MyGuest stores the account identity you sign in with, your client records, appointment logs, color-chart details, and any optional appointment photos you attach.',
  },
  {
    title: 'How the information is used',
    body:
      'The app uses this information to show client history, formulas, recent activity, metrics, and appointment detail inside your workspace.',
  },
  {
    title: 'Photos and permissions',
    body:
      'Photos are optional. Camera and photo-library access are only used when you choose to attach appointment images.',
  },
  {
    title: 'Exports and portability',
    body:
      'Export My Data creates CSV files for clients, services, appointment logs, and color-chart data. Appointment images are not included in exports.',
  },
  {
    title: 'Account deletion',
    body:
      'When you delete your account, MyGuest permanently removes hosted client data, appointment history, color charts, and appointment images tied to that account.',
  },
]

function PolicyCard({ title, body }: PolicySection) {
  return (
    <SurfaceCard tone="secondary" p="$4" gap="$1.5">
      <Text fontSize={13} fontWeight="700" color="$textPrimary">
        {title}
      </Text>
      <Text fontSize={11} color="$textSecondary">
        {body}
      </Text>
    </SurfaceCard>
  )
}

export function PrivacyPolicyContent({ model }: { model: DataPrivacyScreenModel }) {
  return (
    <YStack px="$5" gap="$4" pb={model.bottomInset}>
      <YStack gap="$2">
        <ThemedHeadingText fontSize={20} fontWeight="700">
          Privacy Policy
        </ThemedHeadingText>
        <Text fontSize={12} color="$textSecondary">
          This in-app summary explains how the current MyGuest build handles account,
          client, appointment, formula, and photo data.
        </Text>
      </YStack>

      <SurfaceCard tone={model.cardTone} p="$4" gap="$2">
        <XStack gap="$2" items="center">
          <Shield size={16} color="$accent" />
          <Text fontSize={13} fontWeight="700" color="$textPrimary">
            Current build summary
          </Text>
        </XStack>
        <Text fontSize={11} color="$textSecondary">
          {model.privacySummary}
        </Text>
      </SurfaceCard>

      <YStack gap="$2">
        {policySections.map((section) => (
          <PolicyCard key={section.title} title={section.title} body={section.body} />
        ))}
      </YStack>

      <SurfaceCard tone={model.cardTone} p="$4" gap="$3">
        <Text fontSize={13} fontWeight="700" color="$textPrimary">
          Need the public version?
        </Text>
        <Text fontSize={11} color="$textSecondary">
          The App Store build should also link to a hosted privacy policy URL. Until that is
          published, this in-app version is the clearest source of truth for the current build.
        </Text>
        {model.hasPrivacyPolicyUrl ? (
          <SecondaryButton
            iconAfter={<ArrowUpRight size={16} />}
            onPress={() => {
              void model.handleOpenPrivacyPolicy()
            }}
          >
            Open Hosted Privacy Policy
          </SecondaryButton>
        ) : null}
      </SurfaceCard>

      <SurfaceCard tone="secondary" p="$4" gap="$1">
        <Text fontSize={12} fontWeight="700" color="$textPrimary">
          Release details
        </Text>
        <Text fontSize={11} color="$textSecondary">
          {model.releaseLabel}
        </Text>
      </SurfaceCard>

      <Link href="/support" asChild>
        <SecondaryButton icon={<LifeBuoy size={16} />}>Open Support Center</SecondaryButton>
      </Link>
    </YStack>
  )
}
