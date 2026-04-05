import { useMemo } from 'react'
import { useRouter } from 'expo-router'
import { Linking, Platform } from 'react-native'
import Constants from 'expo-constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useToastController } from '@tamagui/toast'

import { useThemePrefs } from 'components/ThemePrefs'
import { useAuth } from 'components/auth/AuthProvider'
import { PRIVACY_POLICY_URL, SUPPORT_URL } from 'components/data/config'
import { useExportMyData } from 'components/data/queries'
import type { SurfaceTone } from 'components/ui/controlShared'

import { privacyHighlights, privacySummary } from './content'

export function useDataPrivacyScreenModel() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToastController()
  const { aesthetic } = useThemePrefs()
  const { user } = useAuth()
  const exportMyData = useExportMyData()

  const topInset = Math.max(insets.top + 8, 16)
  const bottomInset = Math.max(insets.bottom + 24, 24)
  const cardTone: SurfaceTone = aesthetic === 'glass' ? 'secondary' : 'default'

  const openConfiguredUrl = async ({
    fallbackHref,
    url,
    label,
  }: {
    fallbackHref: '/privacy-policy' | '/support'
    url: string
    label: string
  }) => {
    if (!url) {
      router.push(fallbackHref)
      return
    }

    try {
      await Linking.openURL(url)
    } catch (error) {
      toast.show(`Unable to open ${label.toLowerCase()}`, {
        message: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const handleOpenPrivacyPolicy = async () => {
    await openConfiguredUrl({
      fallbackHref: '/privacy-policy',
      url: PRIVACY_POLICY_URL,
      label: 'Privacy Policy',
    })
  }

  const handleOpenSupport = async () => {
    await openConfiguredUrl({
      fallbackHref: '/support',
      url: SUPPORT_URL,
      label: 'Support',
    })
  }

  const handleExportMyData = async () => {
    try {
      const result = await exportMyData.mutateAsync()
      toast.show('Export ready', {
        message:
          result.method === 'share'
            ? `${result.fileName} is ready to share or save.`
            : `${result.fileName} downloaded successfully.`,
      })
    } catch (error) {
      toast.show('Export failed', {
        message: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const releaseLabel = useMemo(() => {
    const version = Constants.expoConfig?.version ?? 'Unknown'
    const iosBuild = Constants.expoConfig?.ios?.buildNumber ?? '—'
    const androidBuild =
      typeof Constants.expoConfig?.android?.versionCode === 'number'
        ? String(Constants.expoConfig.android.versionCode)
        : '—'

    return Platform.OS === 'ios'
      ? `Version ${version} · iOS build ${iosBuild}`
      : `Version ${version} · Android build ${androidBuild}`
  }, [])

  return {
    bottomInset,
    canManageAccount: Boolean(user),
    cardTone,
    handleExportMyData,
    handleOpenPrivacyPolicy,
    handleOpenSupport,
    hasPrivacyPolicyUrl: Boolean(PRIVACY_POLICY_URL),
    hasSupportUrl: Boolean(SUPPORT_URL),
    isExportingData: exportMyData.isPending,
    privacyHighlights,
    privacySummary,
    releaseLabel,
    topInset,
  }
}

export type DataPrivacyScreenModel = ReturnType<typeof useDataPrivacyScreenModel>
