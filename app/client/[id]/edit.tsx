import { useMemo, useRef, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { useQueryClient } from '@tanstack/react-query'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useClients } from 'components/data/queries'
import {
  ErrorPulseBorder,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  TextAreaField,
  TextField,
} from 'components/ui/controls'
import type { ClientType } from 'components/mockData'

const cardBorder = {
  bg: '$gray1',
  borderWidth: 1,
  borderColor: '$gray3',
  shadowColor: 'rgba(15,23,42,0.08)',
  shadowRadius: 18,
  shadowOpacity: 1,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
}

const chipStyle = {
  bg: '$gray1',
  borderWidth: 1,
  borderColor: '$gray3',
}

const normalizeType = (value: string, fallback: ClientType) => {
  const trimmed = value.trim()
  if (trimmed === 'Cut' || trimmed === 'Color' || trimmed === 'Cut & Color') {
    return trimmed
  }
  return fallback
}

export default function EditClientScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: clients = [] } = useClients()
  const scrollRef = useRef<any>(null)
  const requiredY = useRef<{ name?: number }>({})

  const client = useMemo(
    () => clients.find((item) => item.id === id) ?? clients[0],
    [clients, id]
  )

  const initialForm = useMemo(
    () => ({
      name: client?.name ?? '',
      email: client?.email ?? '',
      phone: client?.phone ?? '',
      type: client?.type ?? 'Cut',
      tag: client?.tag ?? '',
      notes: client?.notes ?? '',
    }),
    [client]
  )

  const [form, setForm] = useState(initialForm)
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const typeOptions: ClientType[] = ['Cut', 'Color', 'Cut & Color']

  const isDirty = useMemo(() => {
    return (
      form.name !== initialForm.name ||
      form.email !== initialForm.email ||
      form.phone !== initialForm.phone ||
      form.type !== initialForm.type ||
      form.tag !== initialForm.tag ||
      form.notes !== initialForm.notes
    )
  }, [form, initialForm])

  const hasRequired = useMemo(() => {
    return Boolean(form.name.trim())
  }, [form.name])

  const canSave = isDirty
  const showNameError = attemptedSave && !form.name.trim()

  if (!client) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <Text fontSize={13} color="$gray8">
          Client not found.
        </Text>
      </YStack>
    )
  }

  const handleSave = () => {
    setAttemptedSave(true)
    if (!hasRequired || !isDirty) {
      if (!hasRequired && typeof requiredY.current.name === 'number') {
        scrollRef.current?.scrollTo({
          y: Math.max(0, requiredY.current.name - 12),
          animated: true,
        })
        setTimeout(() => {
          setPulseKey((count) => count + 1)
        }, 350)
      } else if (!hasRequired) {
        setPulseKey((count) => count + 1)
      }
      return
    }
    queryClient.setQueryData(['clients'], (current: typeof clients = []) => {
      return current.map((item) => {
        if (item.id !== client.id) return item
        return {
          ...item,
          name: form.name.trim() || item.name,
          email: form.email.trim() || item.email,
          phone: form.phone.trim() || item.phone,
          type: normalizeType(form.type, item.type),
          tag: form.tag.trim() || item.tag,
          notes: form.notes,
        }
      })
    })
    router.back()
  }

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack px="$5" pt="$6" gap="$4">
          <YStack gap="$2">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              Edit Client
            </Text>
            <Text fontSize={12} color="$gray8">
              Update contact info and client notes.
            </Text>
          </YStack>

          <SectionDivider />

          <YStack {...cardBorder} rounded="$5" p="$4" gap="$3">
            <YStack
              gap="$2"
              onLayout={(event) => {
                requiredY.current.name = event.nativeEvent.layout.y
              }}
            >
              <Text fontSize={12} color="$gray8">
                Name
              </Text>
              <YStack position="relative">
                <TextField
                  value={form.name}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, name: text }))
                  }
                  borderColor={showNameError ? '$red10' : '$gray3'}
                />
                <ErrorPulseBorder active={showNameError} pulseKey={pulseKey} />
              </YStack>
              {showNameError ? (
                <Text fontSize={11} color="$red10">
                  Name is required.
                </Text>
              ) : null}
            </YStack>
            <YStack gap="$2">
              <Text fontSize={12} color="$gray8">
                Email
              </Text>
              <TextField
                value={form.email}
                onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
              />
            </YStack>
            <YStack gap="$2">
              <Text fontSize={12} color="$gray8">
                Phone
              </Text>
              <TextField
                value={form.phone}
                onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
              />
            </YStack>
            <YStack gap="$2">
              <Text fontSize={12} color="$gray8">
                Client Type
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {typeOptions.map((type) => (
                  <XStack
                    key={type}
                    {...chipStyle}
                    rounded="$3"
                    px="$3"
                    py="$2"
                    items="center"
                    bg={form.type === type ? '$accentMuted' : '$background'}
                    borderColor={form.type === type ? '$accentSoft' : '$borderColor'}
                    onPress={() => setForm((prev) => ({ ...prev, type }))}
                  >
                    <Text fontSize={12} color={form.type === type ? '$accent' : '$gray8'}>
                      {type}
                    </Text>
                  </XStack>
                ))}
              </XStack>
            </YStack>
            <YStack gap="$2">
              <Text fontSize={12} color="$gray8">
                Tag
              </Text>
              <TextField
                value={form.tag}
                onChangeText={(text) => setForm((prev) => ({ ...prev, tag: text }))}
              />
            </YStack>
          </YStack>

          <YStack gap="$3">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Notes
            </Text>
            <YStack {...cardBorder} rounded="$5" p="$4">
              <TextAreaField
                value={form.notes}
                onChangeText={(text) => setForm((prev) => ({ ...prev, notes: text }))}
                placeholder="Client preferences, color history, personal notes..."
              />
            </YStack>
          </YStack>

          <XStack gap="$3">
            <SecondaryButton flex={1} onPress={() => router.back()}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              flex={1}
              onPress={handleSave}
              disabled={!canSave}
              opacity={canSave ? 1 : 0.5}
            >
              Save
            </PrimaryButton>
          </XStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
