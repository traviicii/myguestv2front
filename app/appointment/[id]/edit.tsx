import { useMemo, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { Alert, Image, Modal, Pressable } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useQueryClient } from '@tanstack/react-query'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useAppointmentHistory, useClients } from 'components/data/queries'
import { formatDateMMDDYYYY } from 'components/utils/date'
import {
  ErrorPulseBorder,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  TextAreaField,
  TextField,
} from 'components/ui/controls'
import { Camera, UploadCloud, X } from '@tamagui/lucide-icons'

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

const parsePrice = (value: string) => {
  const cleaned = value.replace(/[^\d.]/g, '')
  const parsed = Number(cleaned)
  return Number.isNaN(parsed) ? null : parsed
}

export default function EditAppointmentScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: appointmentHistory = [] } = useAppointmentHistory()
  const { data: clients = [] } = useClients()
  const scrollRef = useRef<any>(null)
  const requiredY = useRef<{ date?: number }>({})
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)

  const appointment = appointmentHistory.find((item) => item.id === id)

  const client =
    clients.find((item) => item.id === appointment?.clientId) ?? clients[0]

  const initialForm = useMemo(
    () => ({
      date: appointment ? formatDateMMDDYYYY(appointment.date) : '',
      services: appointment?.services ?? '',
      price: appointment ? String(appointment.price) : '',
      notes: appointment?.notes ?? '',
    }),
    [appointment]
  )

  const [form, setForm] = useState(initialForm)
  const [images, setImages] = useState<string[]>(appointment?.images ?? [])
  const [previewUri, setPreviewUri] = useState<string | null>(null)

  const isDirty = useMemo(() => {
    return (
      form.date !== initialForm.date ||
      form.services !== initialForm.services ||
      form.price !== initialForm.price ||
      form.notes !== initialForm.notes ||
      images.join('|') !== (appointment?.images ?? []).join('|')
    )
  }, [form, images, initialForm, appointment?.images])

  const hasRequired = useMemo(() => {
    return Boolean(form.date.trim())
  }, [form.date])

  const canSave = isDirty
  const showDateError = attemptedSave && !form.date.trim()

  const handleSave = () => {
    setAttemptedSave(true)
    if (!hasRequired || !isDirty) {
      if (!hasRequired && typeof requiredY.current.date === 'number') {
        scrollRef.current?.scrollTo({
          y: Math.max(0, requiredY.current.date - 12),
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

    if (!appointment) return

    queryClient.setQueryData(['appointments'], (current: typeof appointmentHistory = []) => {
      return current.map((item) => {
        if (item.id !== appointment.id) return item
        const parsedPrice = parsePrice(form.price)
        return {
          ...item,
          date: form.date.trim(),
          services: form.services.trim() || item.services,
          price: parsedPrice ?? item.price,
          notes: form.notes,
          images,
        }
      })
    })

    router.back()
  }

  const addImages = (uris: string[]) => {
    if (!uris.length) return
    setImages((current) => [...uris, ...current])
  }

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, idx) => idx !== index))
  }

  const handleCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') return

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: [ImagePicker.MediaType.Images],
        allowsEditing: true,
        quality: 0.8,
      })
      if (!result.canceled) {
        addImages(result.assets.map((asset) => asset.uri))
      }
    } catch (error) {
      Alert.alert('Camera unavailable', 'Camera is not available on the simulator. Use Upload instead.')
    }
  }

  const handleUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: true,
      quality: 0.8,
    })
    if (!result.canceled) {
      addImages(result.assets.map((asset) => asset.uri))
    }
  }

  if (!appointment) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <Text fontSize={13} color="$gray8">
          Appointment not found.
        </Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack px="$5" pt="$5" gap="$3">
          <YStack gap="$1">
            <Text fontSize={11} letterSpacing={1} color="$gray7">
              EDIT APPOINTMENT LOG
            </Text>
            <Text fontFamily="$heading" fontSize={20} fontWeight="700" color="$color">
              {client?.name ?? 'Client'}
            </Text>
          </YStack>

          <SectionDivider />

          <YStack {...cardBorder} rounded="$5" p="$4" gap="$2.5">
            <YStack
              gap="$2"
              onLayout={(event) => {
                requiredY.current.date = event.nativeEvent.layout.y
              }}
            >
              <Text fontSize={12} color="$gray8">
                Date
              </Text>
              <YStack position="relative">
                <TextField
                  placeholder="MM/DD/YYYY"
                  value={form.date}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, date: text }))
                  }
                  borderColor={showDateError ? '$red10' : '$gray3'}
                />
                <ErrorPulseBorder active={showDateError} pulseKey={pulseKey} />
              </YStack>
              {showDateError ? (
                <Text fontSize={11} color="$red10">
                  Date is required.
                </Text>
              ) : null}
            </YStack>
            <YStack gap="$2">
              <Text fontSize={12} color="$gray8">
                Services
              </Text>
              <TextField
                placeholder="Balayage, Glaze, Cut..."
                value={form.services}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, services: text }))
                }
              />
            </YStack>
            <YStack gap="$2">
              <Text fontSize={12} color="$gray8">
                Price
              </Text>
              <TextField
                placeholder="$0.00"
                value={form.price}
                onChangeText={(text) => setForm((prev) => ({ ...prev, price: text }))}
              />
            </YStack>
            <YStack gap="$2">
              <Text fontSize={12} color="$gray8">
                Formula / Notes
              </Text>
              <TextAreaField
                placeholder="Color formula, technique, notes..."
                value={form.notes}
                onChangeText={(text) => setForm((prev) => ({ ...prev, notes: text }))}
              />
            </YStack>
          </YStack>

          <YStack {...cardBorder} rounded="$5" p="$4" gap="$2.5">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Photos
            </Text>
            <XStack gap="$3" flexWrap="wrap">
              <SecondaryButton icon={<Camera size={16} />} size="$4" onPress={handleCapture}>
                Capture
              </SecondaryButton>
              <SecondaryButton icon={<UploadCloud size={16} />} size="$4" onPress={handleUpload}>
                Upload
              </SecondaryButton>
            </XStack>
            {images.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2" pt="$2">
                  {images.map((uri, index) => (
                    <YStack
                      key={`${uri}-${index}`}
                      width={72}
                      height={72}
                      rounded="$4"
                      overflow="hidden"
                      position="relative"
                      onPress={() => setPreviewUri(uri)}
                      cursor="pointer"
                      pressStyle={{ opacity: 0.85 }}
                    >
                      <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                      <XStack
                        position="absolute"
                        top={4}
                        right={4}
                        width={20}
                        height={20}
                        rounded={10}
                        items="center"
                        justify="center"
                        bg="rgba(0,0,0,0.6)"
                        onPress={(event) => {
                          event?.stopPropagation?.()
                          removeImage(index)
                        }}
                      >
                        <X size={12} color="white" />
                      </XStack>
                    </YStack>
                  ))}
                </XStack>
              </ScrollView>
            ) : (
              <Text fontSize={11} color="$gray8">
                No images added yet.
              </Text>
            )}
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
      <Modal
        visible={Boolean(previewUri)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.85)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onPress={() => setPreviewUri(null)}
        >
          <Pressable
            onPress={(event) => event?.stopPropagation?.()}
            style={{ width: '100%', maxWidth: 420, height: '70%' }}
          >
            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            ) : null}
          </Pressable>
          <Pressable
            onPress={() => setPreviewUri(null)}
            style={{
              position: 'absolute',
              top: 48,
              right: 24,
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
          >
            <X size={16} color="white" />
          </Pressable>
        </Pressable>
      </Modal>
    </YStack>
  )
}
