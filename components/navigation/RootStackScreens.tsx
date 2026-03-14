import { Stack } from 'expo-router'

export function getRootStackScreens({ pageBackground }: { pageBackground: string }) {
  return [
    <Stack.Screen key="tabs" name="(tabs)" options={{ headerShown: false }} />,
    <Stack.Screen key="onboarding" name="onboarding/index" options={{ headerShown: false }} />,
    <Stack.Screen
      key="client-detail"
      name="client/[id]"
      options={{ title: 'Client Details', headerShown: false }}
    />,
    <Stack.Screen
      key="client-new-appointment"
      name="client/[id]/new-appointment"
      options={{ title: 'New Appointment Log', headerShown: false }}
    />,
    <Stack.Screen
      key="client-edit"
      name="client/[id]/edit"
      options={{ title: 'Edit Client', headerShown: false }}
    />,
    <Stack.Screen
      key="color-chart"
      name="client/[id]/color-chart/index"
      options={{ title: 'Color Chart', headerShown: false }}
    />,
    <Stack.Screen
      key="color-chart-edit"
      name="client/[id]/color-chart/edit"
      options={{ title: 'Edit Color Chart', headerShown: false }}
    />,
    <Stack.Screen key="clients-new" name="clients/new" options={{ title: 'New Client', headerShown: false }} />,
    <Stack.Screen key="appointments" name="appointments" options={{ title: 'Appointment History' }} />,
    <Stack.Screen
      key="appointments-new"
      name="appointments/new"
      options={{ title: 'New Appointment Log', headerShown: false }}
    />,
    <Stack.Screen key="recent-clients" name="recent-clients" options={{ title: 'Recent Clients' }} />,
    <Stack.Screen
      key="appointment-detail"
      name="appointment/[id]"
      options={{ title: 'Appointment', headerShown: false }}
    />,
    <Stack.Screen
      key="appointment-edit"
      name="appointment/[id]/edit"
      options={{ title: 'Edit Appointment Log', headerShown: false }}
    />,
    <Stack.Screen key="settings" name="settings" options={{ title: 'App Settings', headerShown: false }} />,
    <Stack.Screen
      key="account-delete"
      name="account-delete"
      options={{ title: 'Delete Account', headerShown: false }}
    />,
    <Stack.Screen
      key="modal"
      name="modal"
      options={{
        title: 'Tamagui + Expo',
        presentation: 'modal',
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        contentStyle: {
          backgroundColor: pageBackground,
        },
      }}
    />,
  ]
}
