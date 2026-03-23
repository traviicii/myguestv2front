import type { ReactNode } from 'react'
import { Link, type Href } from 'expo-router'
import {
  ArrowRight,
  BarChart3,
  Lock,
  LogOut,
  Paintbrush,
  Scissors,
  Settings2,
  Trash2,
  User,
  Users,
} from '@tamagui/lucide-icons'
import { Text, XStack, YStack, ScrollView } from 'tamagui'

import {
  GhostButton,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  SurfaceCard,
  TextField,
  ThemedHeadingText,
} from 'components/ui/controls'

import type { ProfileSectionProps } from './sectionTypes'

function SummaryIcon({ children }: { children: ReactNode }) {
  return (
    <XStack
      width={36}
      height={36}
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

function SummaryRow({
  title,
  body,
  href,
  icon,
  cta,
  tone,
}: {
  title: string
  body: string
  href: Href
  icon: React.ReactNode
  cta: string
  tone: 'default' | 'secondary'
}) {
  return (
    <SurfaceCard tone={tone} p="$4" gap="$3">
      <XStack gap="$3" items="flex-start">
        <SummaryIcon>{icon}</SummaryIcon>
        <YStack flex={1} gap="$1.5">
          <ThemedHeadingText fontWeight="700" fontSize={15}>
            {title}
          </ThemedHeadingText>
          <Text fontSize={12} color="$textSecondary">
            {body}
          </Text>
        </YStack>
      </XStack>
      <Link href={href} asChild>
        <SecondaryButton iconAfter={<ArrowRight size={16} />}>{cta}</SecondaryButton>
      </Link>
    </SurfaceCard>
  )
}

function ThemePreferencesRow({ model }: ProfileSectionProps) {
  return (
    <SummaryRow
      tone={model.cardTone}
      title="Theme Preferences"
      body={`${model.currentThemeLabel} · Try curated presets, flip light or dark, and apply the vibe that feels right.`}
      cta="Open Theme Picker"
      href="/theme-preferences"
      icon={<Paintbrush size={16} color="$accent" />}
    />
  )
}

function AccountSection({ model }: ProfileSectionProps) {
  return (
    <SurfaceCard p="$5" gap="$4" tone={model.cardTone}>
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
              Keep your identity details accurate and your account secure.
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
              placeholder="Add phone number"
              keyboardType="phone-pad"
              value={model.draftProfile.phone}
              onChangeText={(text) =>
                model.setDraftProfile((prev) => ({ ...prev, phone: text }))
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
              : 'Connect an authenticated account to lock in your email identity.'}
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

        <Link href="/account-delete" asChild>
          <SecondaryButton icon={<Trash2 size={16} />}>
            Delete Account
          </SecondaryButton>
        </Link>
      </YStack>
    </SurfaceCard>
  )
}

export function ProfileContent({ model }: ProfileSectionProps) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: model.contentPaddingBottom } as never}>
      <YStack px="$5" pt={model.topInset} gap={model.sectionGap}>
        <YStack gap="$2">
          <ThemedHeadingText fontWeight="700" fontSize={18}>
            Control Center
          </ThemedHeadingText>
          <Text fontSize={12} color="$textSecondary">
            Shape how MyGuest works for you — appearance, client visibility, insight rules,
            service tools, and account access.
          </Text>
        </YStack>

        <Link href="/settings" asChild>
          <SurfaceCard p="$4" gap="$2" tone={model.cardTone} pressStyle={{ opacity: 0.92 }}>
            <XStack items="center" justify="space-between" gap="$3">
              <XStack items="center" gap="$3" flex={1}>
                <SummaryIcon>
                  <Settings2 size={16} color="$accent" />
                </SummaryIcon>
                <YStack flex={1} gap="$1">
                  <ThemedHeadingText fontWeight="700" fontSize={15}>
                    All Controls
                  </ThemedHeadingText>
                  <Text fontSize={12} color="$textSecondary">
                    Open the full control surface for deeper customization.
                  </Text>
                </YStack>
              </XStack>
              <ArrowRight size={18} color="$textSecondary" />
            </XStack>
          </SurfaceCard>
        </Link>

        <ThemePreferencesRow model={model} />

        <SummaryRow
          tone={model.cardTone}
          title="Clients & Status"
          body={model.clientStatusSummary}
          cta="Open Client Display"
          href={{ pathname: '/settings', params: { focus: 'client-display' } }}
          icon={<Users size={16} color="$accent" />}
        />

        <SummaryRow
          tone={model.cardTone}
          title="Overview & Insights"
          body={model.overviewSummary}
          cta="Open Overview Controls"
          href={{ pathname: '/settings', params: { focus: 'overview-insights' } }}
          icon={<BarChart3 size={16} color="$accent" />}
        />

        <SummaryRow
          tone={model.cardTone}
          title="Services & Appointment Logs"
          body={model.servicesSummary}
          cta="Open Service Controls"
          href={{ pathname: '/settings', params: { focus: 'services-logs' } }}
          icon={<Scissors size={16} color="$accent" />}
        />

        <SummaryRow
          tone={model.cardTone}
          title="Data & Privacy"
          body="Open privacy policy, support, export, and account removal controls from one place."
          cta="Open Data & Privacy"
          href={{ pathname: '/settings', params: { focus: 'account-privacy' } }}
          icon={<Lock size={16} color="$accent" />}
        />

        <AccountSection model={model} />
      </YStack>
    </ScrollView>
  )
}
