import { Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

const appointmentImagePickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.8,
}

const mapResultUris = (result: ImagePicker.ImagePickerResult) =>
  result.canceled ? [] : result.assets.map((asset) => asset.uri)

export async function pickAppointmentImagesFromCamera() {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') return []

    const result = await ImagePicker.launchCameraAsync(appointmentImagePickerOptions)
    return mapResultUris(result)
  } catch {
    Alert.alert(
      'Camera unavailable',
      'Camera is not available on the simulator. Use Upload instead.'
    )
    return []
  }
}

export async function pickAppointmentImagesFromLibrary() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== 'granted') return []

  const result = await ImagePicker.launchImageLibraryAsync(appointmentImagePickerOptions)
  return mapResultUris(result)
}
