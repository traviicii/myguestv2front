import { Pressable } from 'react-native'
import Animated from 'react-native-reanimated'
import { YStack } from 'tamagui'

import {
  SurfaceCard,
} from 'components/ui/controls'
import { FALLBACK_COLORS } from 'components/utils/color'

import { AppointmentServicePickerOptions } from './AppointmentServicePickerOptions'
import type { AppointmentInteractiveUiState } from './useAppointmentInteractiveUi'

type AppointmentServicePickerPanelProps = {
  cardMode?: 'section' | 'panel' | 'alwaysCard'
  cardTone?: 'default' | 'secondary' | 'tabGlass'
  isGlass?: boolean
  servicePanel: AppointmentInteractiveUiState['servicePanel']
  services: { id: number; name: string }[]
  selectedServiceIds: number[]
  onClear: () => void
  onToggleService: (serviceId: number) => void
  trapPress?: boolean
}

function AppointmentServicePickerCard({
  cardMode,
  cardTone,
  isGlass = false,
  services,
  selectedServiceIds,
  onClear,
  onToggleService,
}: Omit<AppointmentServicePickerPanelProps, 'servicePanel' | 'trapPress'>) {
  if (isGlass) {
    return (
      <SurfaceCard mode={cardMode ?? 'alwaysCard'} tone={cardTone ?? 'secondary'} p="$2" gap="$0">
        <AppointmentServicePickerOptions
          services={services}
          selectedServiceIds={selectedServiceIds}
          onClear={onClear}
          onToggleService={onToggleService}
        />
      </SurfaceCard>
    )
  }

  return (
    <YStack
      rounded="$4"
      borderWidth={1}
      borderColor="$borderSubtle"
      p="$2"
      bg="$background"
      shadowColor={FALLBACK_COLORS.shadowSoft}
      shadowRadius={14}
      shadowOpacity={1}
      shadowOffset={{ width: 0, height: 6 }}
      elevation={2}
    >
      <AppointmentServicePickerOptions
        services={services}
        selectedServiceIds={selectedServiceIds}
        onClear={onClear}
        onToggleService={onToggleService}
      />
    </YStack>
  )
}

export function AppointmentServicePickerPanel({
  cardMode,
  cardTone,
  isGlass,
  servicePanel,
  services,
  selectedServiceIds,
  onClear,
  onToggleService,
  trapPress = false,
}: AppointmentServicePickerPanelProps) {
  if (!servicePanel.showPanel) {
    return null
  }

  const card = (
    <AppointmentServicePickerCard
      cardMode={cardMode}
      cardTone={cardTone}
      isGlass={isGlass}
      services={services}
      selectedServiceIds={selectedServiceIds}
      onClear={onClear}
      onToggleService={onToggleService}
    />
  )

  const wrappedCard = trapPress ? (
    <Pressable
      onPress={(event) => {
        event.stopPropagation?.()
      }}
    >
      {card}
    </Pressable>
  ) : (
    card
  )

  return (
    <YStack position="relative">
      <YStack
        position="absolute"
        l={0}
        r={0}
        t={0}
        opacity={0}
        pointerEvents="none"
        onLayout={(event) => {
          servicePanel.setMeasured(event.nativeEvent.layout.height)
        }}
      >
        {card}
      </YStack>
      <Animated.View style={[{ overflow: 'hidden' }, servicePanel.animatedStyle]}>
        {wrappedCard}
      </Animated.View>
    </YStack>
  )
}
