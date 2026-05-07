import { Link } from 'expo-router'
import { ArrowUpRight, Download, HelpCircle, Shield, Trash2 } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  SecondaryButton,
  SurfaceCard,
  ThemedHeadingText,
} from 'components/ui/controls'

import type { DataPrivacyScreenModel } from 'components/privacy/useDataPrivacyScreenModel'

type SupportTopic = {
  title: string
  body: string
}

const supportTopics: SupportTopic[] = [
  {
    title: 'Signing in',
    body:
      'Use Apple or Google sign-in to access your workspace. If sign-in fails, confirm you are using the intended account for this business data.',
  },
  {
    title: 'Exports',
    body:
      'Exports download or share a ZIP of CSV files. They include structured records only and do not include appointment images.',
  },
  {
    title: 'Deleting your account',
    body:
      'Delete Account permanently removes hosted records and images for that account. Export first if you want a copy of your structured data.',
  },
  {
    title: 'Photos and permissions',
    body:
      'Camera and photo-library permissions are optional. If access is denied, you can still log appointments and add photos later.',
  },
]

function TopicCard({ title, body }: SupportTopic) {
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

export function SupportContent({ model }: { model: DataPrivacyScreenModel }) {
  return (
    <YStack px="$5" gap="$4" pb={model.bottomInset}>
      <YStack gap="$2">
        <ThemedHeadingText fontSize={20} fontWeight="700">
          Support Center
        </ThemedHeadingText>
        <Text fontSize={12} color="$textSecondary">
          Find help for sign-in, exports, account deletion, and photo permissions.
        </Text>
      </YStack>

      <SurfaceCard tone={model.cardTone} p="$4" gap="$2">
        <XStack gap="$2" items="center">
          <HelpCircle size={16} color="$accent" />
          <Text fontSize={13} fontWeight="700" color="$textPrimary">
            What we can help with
          </Text>
        </XStack>
        <Text fontSize={11} color="$textSecondary">
          Start with the common support topics below, or use the account actions when you are signed in.
        </Text>
      </SurfaceCard>

      <YStack gap="$2">
        {supportTopics.map((topic) => (
          <TopicCard key={topic.title} title={topic.title} body={topic.body} />
        ))}
      </YStack>

      <SurfaceCard tone={model.cardTone} p="$4" gap="$3">
        <Text fontSize={13} fontWeight="700" color="$textPrimary">
          Quick actions
        </Text>
        {model.canManageAccount ? (
          <YStack gap="$2">
            <Link href="/account-delete" asChild>
              <SecondaryButton icon={<Trash2 size={16} />}>Review Delete Account</SecondaryButton>
            </Link>
            <SecondaryButton
              icon={<Download size={16} />}
              disabled={model.isExportingData}
              onPress={() => {
                void model.handleExportMyData()
              }}
            >
              {model.isExportingData ? 'Working...' : 'Export My Data'}
            </SecondaryButton>
          </YStack>
        ) : (
          <YStack gap="$2">
            <Text fontSize={11} color="$textSecondary">
              Sign in to export records or manage account deletion. Privacy Policy and Support
              remain available before login.
            </Text>
            <Link href="/privacy-policy" asChild>
              <SecondaryButton icon={<Shield size={16} />}>Open Privacy Policy</SecondaryButton>
            </Link>
          </YStack>
        )}
      </SurfaceCard>

      {model.hasSupportUrl ? (
        <SurfaceCard tone="secondary" p="$4" gap="$3">
          <Text fontSize={13} fontWeight="700" color="$textPrimary">
            Public support
          </Text>
          <Text fontSize={11} color="$textSecondary">
            Open the public support page when you need help outside the app.
          </Text>
          <SecondaryButton
            iconAfter={<ArrowUpRight size={16} />}
            onPress={() => {
              void model.handleOpenSupport()
            }}
          >
            Open Support
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
    </YStack>
  )
}
