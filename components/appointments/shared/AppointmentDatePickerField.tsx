import { Platform, Pressable } from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import Animated from 'react-native-reanimated'
import { CalendarDays, ChevronDown } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import { ErrorPulseBorder } from 'components/ui/controls'
import { type ExpandablePanel } from 'components/ui/useExpandablePanel'
import { FALLBACK_COLORS } from 'components/utils/color'

type AppointmentDatePickerFieldProps = {
  datePanel: ExpandablePanel
  displayValue: string
  fieldBackground?: '$background' | '$surfaceField'
  onDateChange: (event: DateTimePickerEvent, selectedDate?: Date) => void
  onFieldPress: () => void
  pickerDate: Date
  placeholder?: string
  pulseKey: number
  showDateError: boolean
  showDatePicker: boolean
}

function DatePickerPanelCard({
  onDateChange,
  pickerDate,
}: Pick<AppointmentDatePickerFieldProps, 'onDateChange' | 'pickerDate'>) {
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
      <DateTimePicker
        value={pickerDate}
        mode="date"
        display={Platform.OS === 'ios' ? 'inline' : 'default'}
        onChange={onDateChange}
      />
    </YStack>
  )
}

export function AppointmentDatePickerField({
  datePanel,
  displayValue,
  fieldBackground = '$background',
  onDateChange,
  onFieldPress,
  pickerDate,
  placeholder = 'Select appointment date',
  pulseKey,
  showDateError,
  showDatePicker,
}: AppointmentDatePickerFieldProps) {
  return (
    <>
      <YStack position="relative">
        <Pressable
          onPress={(event) => {
            event.stopPropagation?.()
            onFieldPress()
          }}
        >
          <XStack
            height={44}
            px="$3"
            rounded="$4"
            borderWidth={1}
            borderColor={showDateError ? '$red10' : showDatePicker ? '$accent' : '$borderSubtle'}
            bg={fieldBackground}
            items="center"
            justify="space-between"
          >
            <XStack items="center" gap="$2.5" flex={1}>
              <CalendarDays size={15} color={showDatePicker ? '$accent' : '$textSecondary'} />
              <Text
                fontSize={14}
                color={displayValue ? '$color' : '$textSecondary'}
                numberOfLines={1}
                flex={1}
              >
                {displayValue || placeholder}
              </Text>
            </XStack>
            <ChevronDown size={16} color="$textSecondary" />
          </XStack>
        </Pressable>
        <ErrorPulseBorder active={showDateError} pulseKey={pulseKey} />
      </YStack>
      {Platform.OS === 'android' && showDatePicker ? (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      ) : null}
      {Platform.OS !== 'android' && datePanel.showPanel ? (
        <YStack position="relative">
          <YStack
            position="absolute"
            l={0}
            r={0}
            t={0}
            opacity={0}
            pointerEvents="none"
            onLayout={(event) => {
              datePanel.setMeasured(event.nativeEvent.layout.height)
            }}
          >
            <DatePickerPanelCard pickerDate={pickerDate} onDateChange={onDateChange} />
          </YStack>
          <Animated.View style={[{ overflow: 'hidden' }, datePanel.animatedStyle]}>
            <Pressable
              onPress={(event) => {
                event.stopPropagation?.()
              }}
            >
              <DatePickerPanelCard pickerDate={pickerDate} onDateChange={onDateChange} />
            </Pressable>
          </Animated.View>
        </YStack>
      ) : null}
      {showDateError ? (
        <Text fontSize={11} color="$red10">
          Date is required.
        </Text>
      ) : null}
    </>
  )
}
