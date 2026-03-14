import { Check } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

type AppointmentServiceOption = {
  id: number
  name: string
}

type AppointmentServicePickerOptionsProps = {
  services: AppointmentServiceOption[]
  selectedServiceIds: number[]
  onClear: () => void
  onToggleService: (serviceId: number) => void
}

export function AppointmentServicePickerOptions({
  services,
  selectedServiceIds,
  onClear,
  onToggleService,
}: AppointmentServicePickerOptionsProps) {
  const selectedServiceSet = new Set(selectedServiceIds)

  return (
    <YStack gap="$1">
      <XStack
        px="$3"
        py="$2.5"
        rounded="$3"
        items="center"
        justify="space-between"
        bg={!selectedServiceIds.length ? '$accentMuted' : '$background'}
        borderWidth={1}
        borderColor={!selectedServiceIds.length ? '$accentSoft' : '$borderSubtle'}
        onPress={onClear}
      >
        <Text
          fontSize={13}
          color={!selectedServiceIds.length ? '$accent' : '$textSecondary'}
        >
          Clear all
        </Text>
        {!selectedServiceIds.length ? <Check size={14} color="$accent" /> : null}
      </XStack>
      {services.map((service) => {
        const isActive = selectedServiceSet.has(service.id)
        return (
          <XStack
            key={service.id}
            px="$3"
            py="$2.5"
            rounded="$3"
            items="center"
            justify="space-between"
            bg={isActive ? '$accentMuted' : '$background'}
            borderWidth={1}
            borderColor={isActive ? '$accentSoft' : '$borderSubtle'}
            onPress={() => {
              onToggleService(service.id)
            }}
          >
            <Text fontSize={13} color={isActive ? '$accent' : '$color'}>
              {service.name}
            </Text>
            {isActive ? <Check size={14} color="$accent" /> : null}
          </XStack>
        )
      })}
    </YStack>
  )
}
