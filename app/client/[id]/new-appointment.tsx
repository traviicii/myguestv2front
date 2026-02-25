import { useMemo, useRef, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { Camera, UploadCloud, X } from '@tamagui/lucide-icons'
import { Alert, Image, Modal, Pressable } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import * as ImagePicker from 'expo-image-picker'
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

export default function NewAppointmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: clients = [] } = useClients()
  const client = clients.find((item) => item.id === id) ?? clients[0]
  const scrollRef = useRef<any>(null)
  const requiredY = useRef<{ date?: number }>({})
  const [form, setForm] = useState({
    date: '',
    services: '',
    price: '',
    notes: '',
  })
  const [images, setImages] = useState<string[]>([])
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)

  const isDirty = useMemo(() => {
    const hasText =
      form.date.trim() ||
      form.services.trim() ||
      form.price.trim() ||
      form.notes.trim()
    return Boolean(hasText || images.length)
  }, [form, images.length])

  const hasRequired = useMemo(() => {
    return Boolean(form.date.trim())
  }, [form.date])

  const canSave = isDirty
  const showDateError = attemptedSave && !form.date.trim()

  const handleSave = () => {
    setAttemptedSave(true)
    if (!hasRequired) {
      if (typeof requiredY.current.date === 'number') {
        scrollRef.current?.scrollTo({
          y: Math.max(0, requiredY.current.date - 12),
          animated: true,
        })
      }
      const delay = typeof requiredY.current.date === 'number' ? 350 : 0
      setTimeout(() => {
        setPulseKey((count) => count + 1)
      }, delay)
      return
    }

    // Save persistence is intentionally not wired yet in this screen.
    // Validation behavior is complete so persistence can be plugged in next.
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

  if (!client) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <Text fontSize={13} color="$gray8">
          Client not found.
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
              NEW APPOINTMENT LOG
            </Text>
            <Text fontFamily="$heading" fontSize={20} fontWeight="700" color="$color">
              {client.name}
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

          <PrimaryButton
            size="$4"
            disabled={!canSave}
            opacity={canSave ? 1 : 0.5}
            onPress={handleSave}
          >
            Save Appointment
          </PrimaryButton>
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
