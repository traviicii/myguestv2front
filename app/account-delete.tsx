import { useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { useToastController } from '@tamagui/toast'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AlertTriangle, Trash2 } from '@tamagui/lucide-icons'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useAuth } from 'components/auth/AuthProvider'
import { useDeleteAccount } from 'components/data/queries'
import { useStudioStore } from 'components/state/studioStore'
import {
  FieldLabel,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  TextField,
  ThemedHeadingText,
} from 'components/ui/controls'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import { useThemePrefs } from 'components/ThemePrefs'

export default function DeleteAccountScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToastController()
  const { user, signOutUser } = useAuth()
  const { profile } = useStudioStore()
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const cardTone = isGlass ? 'secondary' : 'default'
  const topInset = Math.max(insets.top + 8, 16)

  const deleteAccount = useDeleteAccount()

  const [email, setEmail] = useState('')

  const targetEmail = useMemo(
    () => (user?.email ?? profile.email ?? '').trim(),
    [profile.email, user?.email]
  )
  const emailMatches = targetEmail
    ? email.trim().toLowerCase() === targetEmail.toLowerCase()
    : false
  const canDelete = emailMatches && !deleteAccount.isPending

  const handleDelete = async () => {
    if (!canDelete) {
      toast.show('Not ready yet', {
        message: 'Confirm the phrase and matching email first.',
      })
      return
    }

    try {
      await deleteAccount.mutateAsync({
        email: email.trim(),
      })
      toast.show('Account deleted', {
        message: 'Your data has been removed. Signing out...',
      })
      await signOutUser()
      router.replace('/')
    } catch (error) {
      toast.show('Delete failed', {
        message: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  return (
    <YStack flex={1} bg="$surfacePage" position="relative">
      <AmbientBackdrop />
      <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(24, insets.bottom + 24),
        }}
      >
        <YStack px="$5" pt="$3" gap="$4">
          <YStack gap="$2">
            <ThemedHeadingText fontWeight="700" fontSize={18}>
              Delete Account
            </ThemedHeadingText>
            <Text fontSize={12} color="$textSecondary">
              This permanently removes your account, clients, appointment logs, and
              images. This action cannot be undone.
            </Text>
          </YStack>

          <SurfaceCard tone={cardTone} p="$4" gap="$3">
            <XStack items="center" gap="$2">
              <AlertTriangle size={16} color="$danger" />
              <Text fontSize={13} fontWeight="700" color="$danger">
                Permanent deletion
              </Text>
            </XStack>
            <Text fontSize={12} color="$textSecondary">
              This permanently removes your account, clients, appointment logs, and images.
            </Text>
          </SurfaceCard>

          <SurfaceCard tone={cardTone} p="$4" gap="$3">
            <FieldLabel>Re-enter your account email to confirm</FieldLabel>
            <TextField
              placeholder={targetEmail || 'name@example.com'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </SurfaceCard>

          <SurfaceCard tone={cardTone} p="$4" gap="$3">
            <Text fontSize={12} color="$textSecondary">
              Press and hold for 2 seconds to permanently delete your account.
            </Text>
            <PrimaryButton
              width="100%"
              icon={<Trash2 size={16} />}
              bg="$danger"
              borderColor="$danger"
              pressStyle={{ bg: '$danger', opacity: 0.85 }}
              hoverStyle={{ bg: '$danger' }}
              onPress={() => {
                toast.show('Press and hold', {
                  message: 'Hold for 2 seconds to confirm account deletion.',
                })
              }}
              onLongPress={handleDelete}
              delayLongPress={2000}
              disabled={!canDelete}
              opacity={canDelete ? 1 : 0.5}
            >
              Delete My Account
            </PrimaryButton>
            <SecondaryButton onPress={() => router.back()}>
              Cancel
            </SecondaryButton>
          </SurfaceCard>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
