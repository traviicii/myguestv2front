import { useEffect, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

import {
  useThemePrefs,
  type ThemeAesthetic,
  type ThemePalette,
} from 'components/ThemePrefs'
import { useAuth } from 'components/auth/AuthProvider'
import { useStudioStore } from 'components/state/studioStore'

export const PALETTE_OPTIONS: { id: ThemePalette; label: string }[] = [
  { id: 'signal', label: 'Signal' },
  { id: 'alloy', label: 'Alloy' },
  { id: 'pearl', label: 'Pearl' },
]

export const AESTHETIC_OPTIONS: {
  description: string
  id: ThemeAesthetic
  label: string
}[] = [
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

export function useProfileScreenModel() {
  const insets = useSafeAreaInsets()
  const tabBarHeight = useBottomTabBarHeight()
  const topInset = Math.max(insets.top + 8, 24)
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
  const sectionGap: '$4' | '$3' = isModern ? '$4' : '$3'
  const cardTone: 'secondary' | 'default' = isGlass ? 'secondary' : 'default'
  const { profile, preferences, setProfile, setPreferences } = useStudioStore()
  const { user, signOutUser, canUseFirebaseAuth } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [draftProfile, setDraftProfile] = useState(profile)

  useEffect(() => {
    setDraftProfile(profile)
  }, [profile])

  useEffect(() => {
    if (user?.email && user.email !== profile.email) {
      setProfile({ email: user.email })
    }
  }, [profile.email, setProfile, user?.email])

  const isProfileDirty = useMemo(
    () =>
      draftProfile.name !== profile.name ||
      draftProfile.email !== profile.email ||
      draftProfile.phone !== profile.phone,
    [draftProfile, profile]
  )

  const displayEmail = user?.email ?? profile.email
  const showPhone = Boolean(profile.phone?.trim())
  const preferenceOptions = {
    autoRebook: ['Off', 'Weekly', 'Monthly'] as const,
    dataExports: ['Off', 'Monthly', 'Quarterly'] as const,
  }

  const handleSaveProfile = () => {
    if (!isProfileDirty) return
    setProfile({
      name: draftProfile.name.trim(),
      email: user?.email ?? draftProfile.email.trim(),
      phone: draftProfile.phone.trim(),
    })
    setIsEditing(false)
  }

  const handleCancelProfile = () => {
    setDraftProfile(profile)
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOutUser()
    } finally {
      setIsSigningOut(false)
    }
  }

  return {
    aesthetic,
    canSaveProfile: isProfileDirty,
    canUseFirebaseAuth,
    cardTone,
    contentPaddingBottom: Math.max(24, tabBarHeight + insets.bottom + 12),
    displayEmail,
    draftProfile,
    handleCancelProfile,
    handleSaveProfile,
    handleSignOut,
    isEditing,
    isGlass,
    isModern,
    isSigningOut,
    mode,
    palette,
    preferences,
    preferenceOptions,
    profile,
    sectionGap,
    setAesthetic,
    setDraftProfile,
    setIsEditing,
    setMode,
    setPalette,
    setPreferences,
    showPhone,
    topInset,
    user,
  }
}

export type ProfileScreenModel = ReturnType<typeof useProfileScreenModel>
