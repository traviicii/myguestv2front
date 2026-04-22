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
          Learn what MyGuest stores, how that data is used, and what happens when an account is deleted.
        </Text>
      </YStack>

      <SurfaceCard tone={model.cardTone} p="$4" gap="$2">
        <XStack gap="$2" items="center">
          <Shield size={16} color="$accent" />
          <Text fontSize={13} fontWeight="700" color="$textPrimary">
            Summary
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

      {model.hasPrivacyPolicyUrl ? (
        <SurfaceCard tone={model.cardTone} p="$4" gap="$3">
          <Text fontSize={13} fontWeight="700" color="$textPrimary">
            Public policy
          </Text>
          <Text fontSize={11} color="$textSecondary">
            Open the public privacy policy when you need a shareable version outside the app.
          </Text>
          <SecondaryButton
            iconAfter={<ArrowUpRight size={16} />}
            onPress={() => {
              void model.handleOpenPrivacyPolicy()
            }}
          >
            Open Privacy Policy
          </SecondaryButton>
        </SurfaceCard>
      ) : null}

      <SurfaceCard tone="secondary" p="$4" gap="$1">
        <Text fontSize={12} fontWeight="700" color="$textPrimary">
          App version
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
