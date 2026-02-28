import {
  useEffect,
  useMemo,
  useState } from 'react'
import { Link } from 'expo-router'
import { LogOut,
  Mail,
  Phone,
  Settings } from '@tamagui/lucide-icons'
import { ScrollView,
  Text,
  XStack,
  YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { FieldLabel,
  OptionChip,
  OptionChipLabel,
  PreviewContainer,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  SurfaceCard,
  TextField,
  ThemedHeadingText,
  ThemedSwitch,
} from 'components/ui/controls'
import {
  useThemePrefs,
  type ThemeAesthetic,
  type ThemePalette,
} from 'components/ThemePrefs'
import { useStudioStore } from 'components/state/studioStore'
import { useAuth } from 'components/auth/AuthProvider'

const PALETTE_OPTIONS: Array<{ id: ThemePalette; label: string }> = [
  { id: 'signal', label: 'Signal' },
  { id: 'alloy', label: 'Alloy' },
  { id: 'pearl', label: 'Pearl' },
]

const AESTHETIC_OPTIONS: Array<{
  id: ThemeAesthetic
  label: string
  description: string
}> = [
  {
    id: 'modern',
    label: 'Modern',
    description: 'Balanced neutral depth for day-to-day use.',
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Higher contrast with bolder accent energy.',
  },
  {
    id: 'glass',
    label: 'Glass',
    description: 'Lighter layered surfaces with a polished feel.',
  },
]

export default function ProfileScreen() {
  const {
    mode,
    palette,
    aesthetic,
    setMode,
    setPalette,
    setAesthetic,
  } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const isModern = aesthetic === 'modern'
  const sectionGap = isModern ? '$4' : '$3'
  const cardTone = isGlass ? 'secondary' : 'default'
  const { profile, preferences, setProfile, setPreferences } = useStudioStore()
  const { user, signOutUser, canUseFirebaseAuth } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [draftProfile, setDraftProfile] = useState(profile)

  useEffect(() => {
    setDraftProfile(profile)
  }, [profile])

  const isProfileDirty = useMemo(() => {
    return (
      draftProfile.name !== profile.name ||
      draftProfile.email !== profile.email ||
      draftProfile.phone !== profile.phone
    )
  }, [draftProfile, profile])

  const canSaveProfile = isProfileDirty

  const handleSaveProfile = () => {
    if (!isProfileDirty) return
    setProfile({
      name: draftProfile.name.trim(),
      email: draftProfile.email.trim(),
      phone: draftProfile.phone.trim(),
    })
    setIsEditing(false)
  }

  const handleCancelProfile = () => {
    setDraftProfile(profile)
    setIsEditing(false)
  }

  const preferenceOptions = {
    autoRebook: ['Off', 'Weekly', 'Monthly'] as const,
    dataExports: ['Off', 'Monthly', 'Quarterly'] as const,
  }

  return (
    <YStack flex={1} bg="$surfacePage" position="relative">
      <AmbientBackdrop />
      <ScrollView contentContainerStyle={{ pb: '$10' }}>
        <YStack px="$5" pt="$6" gap={isModern ? '$5' : '$4'}>
          <SurfaceCard p={isModern ? '$6' : '$5'} gap={sectionGap} tone={cardTone}>
            <XStack items="center" justify="space-between">
              <ThemedHeadingText fontWeight="700" fontSize={16}>
                Profile
              </ThemedHeadingText>
              <XStack
                px="$2"
                py="$1"
                rounded="$3"
                pressStyle={{ opacity: 0.7 }}
                onPress={() => setIsEditing((prev) => !prev)}
              >
                <Text fontSize={12} color="$accent">
                  {isEditing ? 'Close' : 'Edit'}
                </Text>
              </XStack>
            </XStack>
            <Text fontSize={13} color="$textSecondary">
              Your personal contact details.
            </Text>
            <YStack gap="$2">
              {isEditing ? (
                <YStack gap="$2">
                  <TextField
                    placeholder="Name"
                    value={draftProfile.name}
                    onChangeText={(text) =>
                      setDraftProfile((prev) => ({ ...prev, name: text }))
                    }
                  />
                  <TextField
                    placeholder="Email"
                    keyboardType="email-address"
                    value={draftProfile.email}
                    onChangeText={(text) =>
                      setDraftProfile((prev) => ({ ...prev, email: text }))
                    }
                  />
                  <TextField
                    placeholder="Phone"
                    keyboardType="phone-pad"
                    value={draftProfile.phone}
                    onChangeText={(text) =>
                      setDraftProfile((prev) => ({ ...prev, phone: text }))
                    }
                  />
                </YStack>
              ) : (
                <>
                  <Text fontSize={16} fontWeight="700" color="$textPrimary">
                    {profile.name}
                  </Text>
                  <XStack items="center" gap="$2">
                    <Mail size={14} color="$textSecondary" />
                    <Text fontSize={12} color="$textSecondary">
                      {profile.email}
                    </Text>
                  </XStack>
                  <XStack items="center" gap="$2">
                    <Phone size={14} color="$textSecondary" />
                    <Text fontSize={12} color="$textSecondary">
                      {profile.phone}
                    </Text>
                  </XStack>
                </>
              )}
            </YStack>
            {isEditing ? (
              <XStack gap="$3" pt="$1">
                <SecondaryButton flex={1} onPress={handleCancelProfile}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  flex={1}
                  onPress={handleSaveProfile}
                  disabled={!canSaveProfile}
                  opacity={canSaveProfile ? 1 : 0.5}
                >
                  Save
                </PrimaryButton>
              </XStack>
            ) : null}
          </SurfaceCard>

          <SectionDivider />

          <YStack gap={sectionGap}>
            <ThemedHeadingText fontWeight="700" fontSize={14}>
              Preferences
            </ThemedHeadingText>
            <SurfaceCard tone={cardTone}>
              <XStack items="center" justify="space-between">
                <Text fontSize={13} color="$textPrimary">
                  Notifications
                </Text>
                <ThemedSwitch
                  size="$2"
                  checked={preferences.notificationsEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ notificationsEnabled: Boolean(checked) })
                  }
                />
              </XStack>
              <YStack gap="$2">
                <FieldLabel>Auto rebook prompts</FieldLabel>
                <XStack gap="$2" flexWrap="wrap">
                  {preferenceOptions.autoRebook.map((option) => {
                    const isActive = preferences.autoRebook === option
                    return (
                      <OptionChip
                        key={option}
                        active={isActive}
                        onPress={() => setPreferences({ autoRebook: option })}
                      >
                        <OptionChipLabel active={isActive}>{option}</OptionChipLabel>
                      </OptionChip>
                    )
                  })}
                </XStack>
              </YStack>
              <YStack gap="$2">
                <FieldLabel>Data exports</FieldLabel>
                <XStack gap="$2" flexWrap="wrap">
                  {preferenceOptions.dataExports.map((option) => {
                    const isActive = preferences.dataExports === option
                    return (
                      <OptionChip
                        key={option}
                        active={isActive}
                        onPress={() => setPreferences({ dataExports: option })}
                      >
                        <OptionChipLabel active={isActive}>{option}</OptionChipLabel>
                      </OptionChip>
                    )
                  })}
                </XStack>
              </YStack>
            </SurfaceCard>
          </YStack>

          <SectionDivider />

          <YStack gap={sectionGap}>
            <ThemedHeadingText fontWeight="700" fontSize={14}>
              Appearance
            </ThemedHeadingText>
            <SurfaceCard tone={cardTone}>
              <XStack items="center" justify="space-between">
                <Text fontSize={13} color="$textPrimary">
                  Dark mode
                </Text>
                <ThemedSwitch
                  size="$2"
                  checked={mode === 'dark'}
                  onCheckedChange={(checked) => setMode(checked ? 'dark' : 'light')}
                />
              </XStack>

              <YStack gap="$2">
                <FieldLabel>Color palette</FieldLabel>
                <XStack gap="$2" flexWrap="wrap">
                  {PALETTE_OPTIONS.map((option) => {
                    const isActive = palette === option.id
                    return (
                      <OptionChip
                        key={option.id}
                        active={isActive}
                        onPress={() => setPalette(option.id)}
                      >
                        <OptionChipLabel active={isActive}>{option.label}</OptionChipLabel>
                      </OptionChip>
                    )
                  })}
                </XStack>
              </YStack>

              <YStack gap="$2">
                <FieldLabel>Aesthetic</FieldLabel>
                <YStack gap="$2">
                  {AESTHETIC_OPTIONS.map((option) => {
                    const isActive = aesthetic === option.id
                    return (
                      <OptionChip
                        key={option.id}
                        active={isActive}
                        onPress={() => setAesthetic(option.id)}
                        justify="space-between"
                      >
                        <OptionChipLabel active={isActive}>
                          {option.label}
                        </OptionChipLabel>
                        <Text
                          fontSize={11}
                          color="$textSecondary"
                          maxW="72%"
                          style={{ textAlign: 'right' }}
                        >
                          {option.description}
                        </Text>
                      </OptionChip>
                    )
                  })}
                </YStack>
              </YStack>

              <PreviewContainer>
                <FieldLabel>Theme preview</FieldLabel>
                <ThemedHeadingText fontWeight="700" fontSize={13}>
                  Section Header
                </ThemedHeadingText>
                <Text fontSize={11} color="$textSecondary">
                  Surface, chips, toggles, and button contrast preview.
                </Text>
                <XStack gap="$2" flexWrap="wrap">
                  <OptionChip active>
                    <OptionChipLabel active>Selected</OptionChipLabel>
                  </OptionChip>
                  <OptionChip>
                    <OptionChipLabel>Idle chip</OptionChipLabel>
                  </OptionChip>
                  <ThemedSwitch checked />
                </XStack>
                <XStack gap="$2">
                  <SecondaryButton flex={1} size="$3">
                    Secondary
                  </SecondaryButton>
                  <PrimaryButton flex={1} size="$3">
                    Primary
                  </PrimaryButton>
                </XStack>
              </PreviewContainer>
            </SurfaceCard>
          </YStack>

          <SectionDivider />

          {canUseFirebaseAuth ? (
            <>
              <YStack gap={sectionGap}>
                <ThemedHeadingText fontWeight="700" fontSize={14}>
                  Session
                </ThemedHeadingText>
                <SurfaceCard tone={cardTone}>
                  <Text fontSize={12} color="$textSecondary">
                    Signed in as {user?.email ?? profile.email}
                  </Text>
                  <SecondaryButton
                    icon={<LogOut size={16} />}
                    disabled={isSigningOut}
                    onPress={async () => {
                      setIsSigningOut(true)
                      try {
                        await signOutUser()
                      } finally {
                        setIsSigningOut(false)
                      }
                    }}
                  >
                    {isSigningOut ? 'Signing out...' : 'Sign out'}
                  </SecondaryButton>
                </SurfaceCard>
              </YStack>
              <SectionDivider />
            </>
          ) : null}

          <Link href="/settings" asChild>
            <SurfaceCard mode="section" p="$4" tone={cardTone}>
              <XStack items="center" gap="$3">
                <Settings size={16} color="$textSecondary" />
                <Text fontSize={13} color="$textSecondary">
                  App settings
                </Text>
              </XStack>
            </SurfaceCard>
          </Link>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
