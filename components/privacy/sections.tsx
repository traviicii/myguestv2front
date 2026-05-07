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
          One place to understand, export, and remove the data tied to your MyGuest account.
        </Text>
      </YStack>

      <SurfaceCard tone={model.cardTone} p="$4" gap="$3">
        <XStack gap="$2" items="center">
          <Shield size={16} color="$accent" />
          <Text fontSize={13} fontWeight="700" color="$textPrimary">
            Data summary
          </Text>
        </XStack>
        <Text fontSize={11} color="$textSecondary">
          {model.privacySummary}
        </Text>
      </SurfaceCard>

      <SurfaceCard tone="secondary" p="$4" gap="$3">
        <Text fontSize={13} fontWeight="700" color="$textPrimary">
          How your data is handled
        </Text>
        {model.privacyHighlights.map((highlight) => (
          <YStack key={highlight.title} gap="$1.5">
            <Text fontSize={12} fontWeight="700" color="$textPrimary">
              {highlight.title}
            </Text>
            <Text fontSize={11} color="$textSecondary">
              {highlight.body}
            </Text>
          </YStack>
        ))}
      </SurfaceCard>

      <YStack gap="$3">
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

        {model.hasPrivacyPolicyUrl ? (
          <UtilityCard
            title="Privacy Policy"
            body="Open the public policy when you need the formal, shareable version."
            actionLabel="Open Privacy Policy"
            icon={<Shield size={16} color="$accent" />}
            onPress={() => {
              void model.handleOpenPrivacyPolicy()
            }}
          />
        ) : null}

        <UtilityCard
          title="Support"
          body={
            model.hasSupportUrl
              ? 'Get help with sign-in, exports, or account access.'
              : 'Open the in-app support center.'
          }
          actionLabel={model.hasSupportUrl ? 'Open Support' : 'Open Support Center'}
          icon={<LifeBuoy size={16} color="$accent" />}
          onPress={() => {
            void model.handleOpenSupport()
          }}
        />
      </YStack>

      <SurfaceCard tone={model.cardTone} p="$4" gap="$3">
        <Text fontSize={13} fontWeight="700" color="$textPrimary">
          Delete account
        </Text>
        <Text fontSize={11} color="$textSecondary">
          Export your records first if you want a copy. Deletion permanently removes hosted data
          and appointment images.
        </Text>
        <Link href="/account-delete" asChild>
          <SecondaryButton icon={<Trash2 size={16} />}>Review Delete Account</SecondaryButton>
        </Link>
      </SurfaceCard>

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
