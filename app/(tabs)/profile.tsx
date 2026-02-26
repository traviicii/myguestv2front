import { useEffect, useMemo, useState } from 'react'
import { Link } from 'expo-router'
import { LogOut, Mail, Phone, Settings } from '@tamagui/lucide-icons'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  TextField,
  ThemedSwitch,
} from 'components/ui/controls'
import { useThemePrefs } from 'components/ThemePrefs'
import { useStudioStore } from 'components/state/studioStore'
import { useAuth } from 'components/auth/AuthProvider'

const cardBorder = {
  bg: '$gray1',
  borderWidth: 1,
  borderColor: '$gray3',
  shadowColor: 'rgba(15,23,42,0.08)',
  shadowRadius: 18,
  shadowOpacity: 1,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
} as const

export default function ProfileScreen() {
  const { mode, palette, setMode, setPalette } = useThemePrefs()
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
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScrollView contentContainerStyle={{ pb: "$10" }}>
        <YStack px="$5" pt="$6" gap="$4">
          <YStack
            {...cardBorder}
            rounded="$5"
            p="$5"
            gap="$3"
                                  >
            <XStack items="center" justify="space-between">
              <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
                Profile
              </Text>
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
            <Text fontSize={13} color="$gray8">
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
                  <Text fontSize={16} fontWeight="700">
                    {profile.name}
                  </Text>
                  <XStack items="center" gap="$2">
                    <Mail size={14} color="$gray8" />
                    <Text fontSize={12} color="$gray8">
                      {profile.email}
                    </Text>
                  </XStack>
                  <XStack items="center" gap="$2">
                    <Phone size={14} color="$gray8" />
                    <Text fontSize={12} color="$gray8">
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
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Preferences
            </Text>
            <YStack {...cardBorder} rounded="$5" p="$4" gap="$3">
              <XStack items="center" justify="space-between">
                <Text fontSize={13}>Notifications</Text>
                <ThemedSwitch
                  size="$2"
                  checked={preferences.notificationsEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ notificationsEnabled: Boolean(checked) })
                  }
                />
              </XStack>
              <YStack gap="$2">
                <Text fontSize={12} color="$gray8">
                  Auto rebook prompts
                </Text>
                <XStack gap="$2" flexWrap="wrap">
                  {preferenceOptions.autoRebook.map((option) => {
                    const isActive = preferences.autoRebook === option
                    return (
                      <XStack
                        key={option}
                        {...cardBorder}
                        rounded="$3"
                        px="$2.5"
                        py="$1.5"
                        items="center"
                        bg={isActive ? '$accentMuted' : '$background'}
                        borderColor={isActive ? '$accentSoft' : '$borderColor'}
                        onPress={() => setPreferences({ autoRebook: option })}
                      >
                        <Text fontSize={11} color={isActive ? '$accent' : '$gray8'}>
                          {option}
                        </Text>
                      </XStack>
                    )
                  })}
                </XStack>
              </YStack>
              <YStack gap="$2">
                <Text fontSize={12} color="$gray8">
                  Data exports
                </Text>
                <XStack gap="$2" flexWrap="wrap">
                  {preferenceOptions.dataExports.map((option) => {
                    const isActive = preferences.dataExports === option
                    return (
                      <XStack
                        key={option}
                        {...cardBorder}
                        rounded="$3"
                        px="$2.5"
                        py="$1.5"
                        items="center"
                        bg={isActive ? '$accentMuted' : '$background'}
                        borderColor={isActive ? '$accentSoft' : '$borderColor'}
                        onPress={() => setPreferences({ dataExports: option })}
                      >
                        <Text fontSize={11} color={isActive ? '$accent' : '$gray8'}>
                          {option}
                        </Text>
                      </XStack>
                    )
                  })}
                </XStack>
              </YStack>
            </YStack>
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
              <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
                Appearance
              </Text>
            <YStack {...cardBorder} rounded="$5" p="$4" gap="$3">
              <XStack items="center" justify="space-between">
                <Text fontSize={13}>Dark mode</Text>
                <ThemedSwitch
                  size="$2"
                  checked={mode === 'dark'}
                  onCheckedChange={(checked) => setMode(checked ? 'dark' : 'light')}
                />
              </XStack>
              <Text fontSize={12} color="$gray8">
                Color palette
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {[
                  { id: 'studio', label: 'Studio' },
                  { id: 'slate', label: 'Slate' },
                  { id: 'sand', label: 'Sand' },
                ].map((option) => {
                  const isActive = palette === option.id
                  return (
                    <XStack
                      key={option.id}
                      {...cardBorder}
                      rounded="$3"
                      px="$2.5"
                      py="$1.5"
                      items="center"
                      bg={isActive ? '$accentMuted' : '$background'}
                      borderColor={isActive ? '$accentSoft' : '$borderColor'}
                      onPress={() => setPalette(option.id as any)}
                    >
                      <Text fontSize={11} color={isActive ? '$accent' : '$gray8'}>
                        {option.label}
                      </Text>
                    </XStack>
                  )
                })}
              </XStack>
            </YStack>
          </YStack>

          <SectionDivider />

          {canUseFirebaseAuth ? (
            <>
              <YStack gap="$3">
                <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
                  Session
                </Text>
                <YStack {...cardBorder} rounded="$5" p="$4" gap="$3">
                  <Text fontSize={12} color="$gray8">
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
                </YStack>
              </YStack>
              <SectionDivider />
            </>
          ) : null}

          <Link href="/settings" asChild>
            <XStack {...cardBorder} rounded="$5" p="$4" items="center" gap="$3">
              <Settings size={16} color="$gray8" />
              <Text fontSize={13} color="$gray8">
                App settings
              </Text>
            </XStack>
          </Link>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
