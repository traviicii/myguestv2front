import { Alert, Linking, type AlertButton } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

const MAX_LIBRARY_IMAGE_SELECTION = 20

const cameraImagePickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.8,
}

const libraryImagePickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsMultipleSelection: true,
  orderedSelection: true,
  quality: 0.8,
  selectionLimit: MAX_LIBRARY_IMAGE_SELECTION,
}

const mapResultUris = (result: ImagePicker.ImagePickerResult) =>
  result.canceled ? [] : result.assets.map((asset) => asset.uri)

function openAppSettings() {
  void Linking.openSettings().catch(() => {
    // If settings cannot be opened, the user has already seen the alert copy
    // that explains they can continue without attaching a photo.
  })
}

function showPermissionAlert({
  canAskAgain,
  resourceLabel,
  title,
}: {
  canAskAgain: boolean
  resourceLabel: 'camera' | 'photo library'
  title: string
}) {
  const message = canAskAgain
    ? `MyGuest can keep saving appointments without ${resourceLabel} access. If you want to add photos later, try again from the photo section.`
    : `MyGuest can keep saving appointments without ${resourceLabel} access. To attach photos later, turn ${resourceLabel} access back on in Settings.`

  const buttons: AlertButton[] = [{ text: 'Continue', style: 'cancel' }]

  if (!canAskAgain) {
    buttons.push({
      text: 'Open Settings',
      onPress: openAppSettings,
    })
  }

  Alert.alert(title, message, buttons)
}

export async function pickAppointmentImagesFromCamera() {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (permission.status !== 'granted') {
      showPermissionAlert({
        canAskAgain: permission.canAskAgain,
        resourceLabel: 'camera',
        title: 'Camera access is off',
      })
      return []
    }

    const result = await ImagePicker.launchCameraAsync(cameraImagePickerOptions)
    return mapResultUris(result)
  } catch {
    Alert.alert(
      'Camera unavailable',
      'MyGuest can still save the appointment without a photo. If you are on a simulator, use Upload instead.'
    )
    return []
  }
}

export async function pickAppointmentImagesFromLibrary() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (permission.status !== 'granted') {
    showPermissionAlert({
      canAskAgain: permission.canAskAgain,
      resourceLabel: 'photo library',
      title: 'Photo access is off',
    })
    return []
  }

  const result = await ImagePicker.launchImageLibraryAsync(libraryImagePickerOptions)
  return mapResultUris(result)
}
