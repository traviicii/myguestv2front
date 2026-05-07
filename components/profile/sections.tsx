import type { ReactNode } from 'react'
import { useRouter } from 'expo-router'
import {
  BarChart3,
  CalendarDays,
  Lock,
  LogOut,
  Paintbrush,
  Scissors,
  User,
  Users,
} from '@tamagui/lucide-icons'
import { Text, XStack, YStack, ScrollView } from 'tamagui'

import {
  GhostButton,
  InsetGroup,
  InsetRow,
  InsetSectionFooter,
  InsetSectionHeader,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  SurfaceCard,
  TextField,
  ThemedHeadingText,
} from 'components/ui/controls'
import { impactLightHaptic } from 'components/utils/haptics'
import { PHONE_INPUT_PLACEHOLDER, formatPhoneForInput } from 'components/utils/phone'

import type { ProfileSectionProps } from './sectionTypes'

function SummaryIcon({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </XStack>
  )
}

function PreferencesSection({ model }: ProfileSectionProps) {
  const router = useRouter()

  const rows = [
    {
      id: 'theme-preferences',
      title: 'Theme Preferences',
      subtitle: `${model.currentThemeLabel} · Choose a preset or customize the look.`,
      icon: <Paintbrush size={16} color="$accent" />,
      onPress: () => router.push('/theme-preferences'),
    },
    {
      id: 'client-display',
      title: 'Client Display',
      subtitle: model.clientStatusSummary,
      icon: <Users size={16} color="$accent" />,
      onPress: () => router.push('/settings/client-display'),
    },
    {
      id: 'overview-insights',
      title: 'Overview & Insights',
      subtitle: model.overviewSummary,
      icon: <BarChart3 size={16} color="$accent" />,
      onPress: () => router.push('/settings/overview-insights'),
    },
    {
      id: 'services-logs',
      title: 'Services & Appointment Logs',
      subtitle: model.servicesSummary,
      icon: <Scissors size={16} color="$accent" />,
      onPress: () => router.push('/settings/services-logs'),
    },
    {
      id: 'dates-formatting',
      title: 'Dates & Formatting',
      subtitle: model.datesSummary,
      icon: <CalendarDays size={16} color="$accent" />,
      onPress: () => router.push('/settings/dates-formatting'),
    },
    {
      id: 'data-privacy',
      title: 'Data & Privacy',
      subtitle: 'Export records, review privacy details, get support, and manage deletion.',
      icon: <Lock size={16} color="$accent" />,
      onPress: () => router.push('/data-privacy'),
    },
  ]

  return (
    <YStack gap="$2.5">
      <InsetSectionHeader
        title="App settings"
        subtitle="Update how MyGuest looks, tracks clients, summarizes work, and formats records."
      />
      <InsetGroup tone={model.cardTone}>
        {rows.map((row, index) => (
          <InsetRow
            key={row.id}
            testID={`control-row-${row.id}`}
            title={row.title}
            subtitle={row.subtitle}
            icon={row.icon}
            showSeparator={index < rows.length - 1}
            onPress={() => {
              void impactLightHaptic()
              row.onPress()
            }}
          />
        ))}
      </InsetGroup>
      <InsetSectionFooter>
        Account deletion is managed from Data & Privacy.
      </InsetSectionFooter>
    </YStack>
  )
}

function AccountSection({ model }: ProfileSectionProps) {
  return (
    <SurfaceCard p="$4" gap="$3" tone={model.cardTone}>
      <XStack items="center" justify="space-between" gap="$3">
        <XStack gap="$3" items="center" flex={1}>
          <SummaryIcon>
            <User size={16} color="$accent" />
          </SummaryIcon>
          <YStack flex={1} gap="$1">
            <ThemedHeadingText fontWeight="700" fontSize={16}>
              Account
            </ThemedHeadingText>
            <Text fontSize={12} color="$textSecondary">
              Update your profile details and manage your sign-in session.
            </Text>
          </YStack>
        </XStack>
        <GhostButton onPress={() => model.setIsEditing((prev) => !prev)}>
          {model.isEditing ? 'Close' : 'Edit'}
        </GhostButton>
      </XStack>

      <YStack gap="$2">
        {model.isEditing ? (
          <YStack gap="$2">
            <TextField
              placeholder="Name"
              value={model.draftProfile.name}
              onChangeText={(text) =>
                model.setDraftProfile((prev) => ({ ...prev, name: text }))
              }
            />
            <TextField
              placeholder="name@example.com"
              keyboardType="email-address"
              value={model.displayEmail}
              onChangeText={(text) =>
                model.setDraftProfile((prev) => ({ ...prev, email: text }))
              }
              disabled={Boolean(model.user?.email)}
              opacity={model.user?.email ? 0.6 : 1}
            />
            <TextField
              placeholder={PHONE_INPUT_PLACEHOLDER}
              keyboardType="phone-pad"
              value={model.draftProfile.phone}
              onChangeText={(text) =>
                model.setDraftProfile((prev) => ({
                  ...prev,
                  phone: formatPhoneForInput(text),
                }))
              }
            />
          </YStack>
        ) : (
          <YStack gap="$2">
            <Text fontSize={16} fontWeight="700" color="$textPrimary">
              {model.displayName}
            </Text>
            <YStack gap="$1">
              <Text fontSize={11} color="$textSecondary">
                Account email
              </Text>
              <Text fontSize={13} color="$textPrimary">
                {model.displayEmail || 'No email connected'}
              </Text>
            </YStack>
            {model.showPhone ? (
              <YStack gap="$1">
                <Text fontSize={11} color="$textSecondary">
                  Phone
                </Text>
                <Text fontSize={13} color="$textPrimary">
                  {model.displayPhone}
                </Text>
              </YStack>
            ) : null}
          </YStack>
        )}
      </YStack>

      {model.isEditing ? (
        <XStack gap="$2">
          <SecondaryButton flex={1} onPress={model.handleCancelProfile}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            flex={1}
            disabled={!model.canSaveProfile}
            opacity={model.canSaveProfile ? 1 : 0.5}
            onPress={model.handleSaveProfile}
          >
            Save
          </PrimaryButton>
        </XStack>
      ) : null}

      <SectionDivider />

      <YStack gap="$3">
        <YStack gap="$1">
          <Text fontSize={11} color="$textSecondary">
            Authentication
          </Text>
          <Text fontSize={12} color="$textSecondary">
            {model.displayEmail
              ? `Signed in as ${model.displayEmail}`
              : 'Sign in to connect an account email.'}
          </Text>
        </YStack>

        {model.canUseFirebaseAuth ? (
          <SecondaryButton
            icon={<LogOut size={16} />}
            disabled={model.isSigningOut}
            opacity={model.isSigningOut ? 0.6 : 1}
            onPress={() => {
              void model.handleSignOut()
            }}
          >
            {model.isSigningOut ? 'Signing out...' : 'Sign Out'}
          </SecondaryButton>
        ) : null}
      </YStack>
    </SurfaceCard>
  )
}

export function ProfileContent({ model }: ProfileSectionProps) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: model.contentPaddingBottom } as never}>
      <YStack px="$5" pt={model.topInset} gap={model.sectionGap}>
        <YStack gap="$1.5">
          <ThemedHeadingText fontWeight="700" fontSize={18}>
            Control Center
          </ThemedHeadingText>
          <Text fontSize={12} color="$textSecondary">
            Manage appearance, client display, Overview settings, appointment defaults,
            date formats, and account access.
          </Text>
        </YStack>

        <PreferencesSection model={model} />

        <AccountSection model={model} />
      </YStack>
    </ScrollView>
  )
}
