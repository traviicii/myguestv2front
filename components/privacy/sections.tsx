import { Link } from 'expo-router'
import { Download, LifeBuoy, Shield, Trash2 } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  ThemedHeadingText,
} from 'components/ui/controls'

import type { DataPrivacyScreenModel } from './useDataPrivacyScreenModel'

function PrivacyHighlightCard({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <SurfaceCard tone="secondary" p="$3" gap="$1.5">
      <Text fontSize={12} fontWeight="700" color="$textPrimary">
        {title}
      </Text>
      <Text fontSize={11} color="$textSecondary">
        {body}
      </Text>
    </SurfaceCard>
  )
}

function UtilityCard({
  title,
  body,
  actionLabel,
  disabled = false,
  icon,
  isPrimary = false,
  isLoading = false,
  onPress,
}: {
  title: string
  body: string
  actionLabel: string
  disabled?: boolean
  icon: React.ReactNode
  isPrimary?: boolean
  isLoading?: boolean
  onPress: () => void
}) {
  return (
    <SurfaceCard tone="secondary" p="$4" gap="$3" opacity={disabled ? 0.65 : 1}>
      <XStack gap="$3" items="flex-start">
        <XStack
          width={34}
          height={34}
          rounded={999}
          items="center"
          justify="center"
          bg="$surfaceChipActive"
          borderWidth={1}
          borderColor="$borderAccent"
        >
          {icon}
        </XStack>
        <YStack flex={1} gap="$1.5">
          <Text fontSize={13} fontWeight="700" color="$textPrimary">
            {title}
          </Text>
          <Text fontSize={11} color="$textSecondary">
            {body}
          </Text>
        </YStack>
      </XStack>

      {isPrimary ? (
        <PrimaryButton
          disabled={disabled || isLoading}
          opacity={disabled || isLoading ? 0.7 : 1}
          onPress={onPress}
        >
          {isLoading ? 'Working...' : actionLabel}
        </PrimaryButton>
      ) : (
        <SecondaryButton disabled={disabled || isLoading} onPress={onPress}>
          {isLoading ? 'Working...' : actionLabel}
        </SecondaryButton>
      )}
    </SurfaceCard>
  )
}

export function DataPrivacyContent({ model }: { model: DataPrivacyScreenModel }) {
  return (
    <YStack px="$5" gap="$4" pb={model.bottomInset}>
      <YStack gap="$2">
        <ThemedHeadingText fontSize={20} fontWeight="700">
          Data & Privacy
        </ThemedHeadingText>
        <Text fontSize={12} color="$textSecondary">
          Review what MyGuest stores, how exports work, how deletion works, and where to get
          support.
        </Text>
      </YStack>

      <SurfaceCard tone={model.cardTone} p="$4" gap="$2.5">
        <Text fontSize={13} fontWeight="700" color="$textPrimary">
          Your data, explained clearly
        </Text>
        <Text fontSize={11} color="$textSecondary">
          {model.privacySummary}
        </Text>
        <Text fontSize={11} color="$textSecondary">
          Exports are CSV-only. Appointment images stay inside MyGuest and are permanently
          removed if you delete your account.
        </Text>
      </SurfaceCard>

      <YStack gap="$2">
        {model.privacyHighlights.map((highlight) => (
          <PrivacyHighlightCard
            key={highlight.title}
            title={highlight.title}
            body={highlight.body}
          />
        ))}
      </YStack>

      <YStack gap="$3">
        <UtilityCard
          title="Privacy Policy"
          body={
            model.hasPrivacyPolicyUrl
              ? 'Read the current privacy policy that applies to this build.'
              : 'This build does not have a public privacy policy URL configured yet.'
          }
          actionLabel="Open Privacy Policy"
          disabled={!model.hasPrivacyPolicyUrl}
          icon={<Shield size={16} color="$accent" />}
          onPress={() => {
            void model.handleOpenPrivacyPolicy()
          }}
        />
        <Link href="/privacy-policy" asChild>
          <SecondaryButton>Read In-App Privacy Policy</SecondaryButton>
        </Link>

        <UtilityCard
          title="Support"
          body={
            model.hasSupportUrl
              ? 'Open support if you need help with sign-in, exports, or your account.'
              : 'This build does not have a public support URL configured yet.'
          }
          actionLabel="Contact Support"
          disabled={!model.hasSupportUrl}
          icon={<LifeBuoy size={16} color="$accent" />}
          onPress={() => {
            void model.handleOpenSupport()
          }}
        />
        <Link href="/support" asChild>
          <SecondaryButton>Open In-App Support Center</SecondaryButton>
        </Link>

        <UtilityCard
          title="Export My Data"
          body="Download or share a ZIP of CSV files for clients, services, appointment logs, and color-chart data."
          actionLabel="Export My Data"
          icon={<Download size={16} color="$accentContrast" />}
          isPrimary
          isLoading={model.isExportingData}
          onPress={() => {
            void model.handleExportMyData()
          }}
        />
      </YStack>

      <SurfaceCard tone={model.cardTone} p="$4" gap="$3">
        <Text fontSize={13} fontWeight="700" color="$textPrimary">
          Need to leave MyGuest?
        </Text>
        <Text fontSize={11} color="$textSecondary">
          Export your records first if you want a copy. Deleting your account removes hosted
          data and appointment images permanently.
        </Text>
        <Link href="/account-delete" asChild>
          <SecondaryButton icon={<Trash2 size={16} />}>Review Delete Account</SecondaryButton>
        </Link>
      </SurfaceCard>

      <SurfaceCard tone="secondary" p="$4" gap="$1">
        <Text fontSize={12} fontWeight="700" color="$textPrimary">
          Release details
        </Text>
        <Text fontSize={11} color="$textSecondary">
          {model.releaseLabel}
        </Text>
      </SurfaceCard>
    </YStack>
  )
}
