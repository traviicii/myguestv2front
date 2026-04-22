import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { useToastController } from '@tamagui/toast'
import { KeyboardAvoidingView, Platform } from 'react-native'
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

const DELETE_HOLD_DURATION_MS = 2000

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
  const deleteHoldRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deleteHoldProgressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const deleteHoldStartedAtRef = useRef<number | null>(null)
  const [deleteHoldProgress, setDeleteHoldProgress] = useState(0)
  const [isDeleteHoldActive, setIsDeleteHoldActive] = useState(false)

  const targetEmail = useMemo(
    () => (user?.email ?? profile.email ?? '').trim(),
    [profile.email, user?.email]
  )
  const emailMatches = targetEmail
    ? email.trim().toLowerCase() === targetEmail.toLowerCase()
    : false
  const canDelete = emailMatches && !deleteAccount.isPending
  const keyboardDismissMode = Platform.OS === 'ios' ? 'interactive' : 'on-drag'

  const clearDeleteHold = useCallback(() => {
    if (deleteHoldRef.current) {
      clearTimeout(deleteHoldRef.current)
      deleteHoldRef.current = null
    }
    if (deleteHoldProgressRef.current) {
      clearInterval(deleteHoldProgressRef.current)
      deleteHoldProgressRef.current = null
    }
    deleteHoldStartedAtRef.current = null
    setIsDeleteHoldActive(false)
    setDeleteHoldProgress(0)
  }, [])

  useEffect(() => clearDeleteHold, [clearDeleteHold])

  const handleDelete = async () => {
    if (!canDelete) {
      toast.show('Not ready yet', {
        message: 'Enter the matching account email first.',
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
    } catch (error) {
      toast.show('Delete failed', {
        message: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const handleDeletePressIn = () => {
    if (!canDelete) return
    clearDeleteHold()
    setIsDeleteHoldActive(true)
    deleteHoldStartedAtRef.current = Date.now()
    setDeleteHoldProgress(0.04)
    deleteHoldProgressRef.current = setInterval(() => {
      if (!deleteHoldStartedAtRef.current) return
      const elapsed = Date.now() - deleteHoldStartedAtRef.current
      setDeleteHoldProgress(Math.min(1, elapsed / DELETE_HOLD_DURATION_MS))
    }, 50)
    deleteHoldRef.current = setTimeout(() => {
      clearDeleteHold()
      void handleDelete()
    }, DELETE_HOLD_DURATION_MS)
  }

  const handleDeletePressOut = () => clearDeleteHold()

  const deleteInstruction = deleteAccount.isPending
    ? 'Deleting your account...'
    : !targetEmail
      ? 'Enter your account email to unlock deletion.'
      : !canDelete
        ? `Enter ${targetEmail} to unlock deletion.`
        : isDeleteHoldActive
          ? 'Keep holding. Your account will be deleted when the bar completes.'
          : 'Press and hold for 2 seconds to permanently delete your account.'

  const deleteButtonLabel = deleteAccount.isPending
    ? 'Deleting...'
    : isDeleteHoldActive
      ? 'Keep Holding...'
      : 'Hold to Delete Account'

  return (
    <YStack flex={1} bg="$surfacePage" position="relative">
      <AmbientBackdrop />
      <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          flex={1}
          contentContainerStyle={
            { paddingBottom: Math.max(24, insets.bottom + 24) } as any
          }
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={keyboardDismissMode}
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
                This permanently removes your account, clients, appointment logs, color
                charts, and hosted images.
              </Text>
            </SurfaceCard>

            <SurfaceCard tone={cardTone} p="$4" gap="$3">
              <Text fontSize={13} fontWeight="700" color="$textPrimary">
                Before you continue
              </Text>
              <Text fontSize={12} color="$textSecondary">
                If you want a copy of your records, use Export My Data in Data & Privacy
                first. Exports include CSV files only and do not include
                appointment images.
              </Text>
              <SecondaryButton onPress={() => router.push('/data-privacy')}>
                Back to Data & Privacy
              </SecondaryButton>
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
                returnKeyType="done"
              />
            </SurfaceCard>

            <SurfaceCard tone={cardTone} p="$4" gap="$3">
              <YStack gap="$2">
                <Text
                  fontSize={12}
                  color={isDeleteHoldActive ? '$danger' : '$textSecondary'}
                >
                  {deleteInstruction}
                </Text>
                <YStack
                  height={6}
                  rounded={999}
                  overflow="hidden"
                  bg="$surfaceChip"
                  borderWidth={1}
                  borderColor={isDeleteHoldActive ? '$danger' : '$borderSubtle'}
                >
                  <YStack
                    height="100%"
                    bg="$danger"
                    width={`${Math.min(100, Math.max(0, deleteHoldProgress * 100))}%`}
                  />
                </YStack>
              </YStack>
              <PrimaryButton
                width="100%"
                icon={<Trash2 size={16} />}
                bg="$danger"
                borderColor="$danger"
                pressStyle={{ bg: '$danger', opacity: 0.85 }}
                hoverStyle={{ bg: '$danger' }}
                onPressIn={handleDeletePressIn}
                onPressOut={handleDeletePressOut}
                disabled={!canDelete}
                opacity={canDelete ? 1 : 0.5}
              >
                {deleteButtonLabel}
              </PrimaryButton>
              <SecondaryButton onPress={() => router.back()}>
                Cancel
              </SecondaryButton>
            </SurfaceCard>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </YStack>
  )
}
