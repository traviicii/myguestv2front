import { Platform, Pressable, StyleSheet } from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { CalendarDays, ChevronDown } from '@tamagui/lucide-icons'
import { Text, XStack, YStack, useTheme } from 'tamagui'

import { useResolvedThemeSelection } from 'components/ThemePrefs'
import { ErrorPulseBorder, IOSBottomSheet } from 'components/ui/controls'
import { type ExpandablePanel } from 'components/ui/useExpandablePanel'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'
import { selectionHaptic } from 'components/utils/haptics'

type AppointmentDatePickerFieldProps = {
  datePanel: ExpandablePanel
  displayValue: string
  fieldBackground?: '$background' | '$surfaceField'
  onDateChange: (event: DateTimePickerEvent, selectedDate?: Date) => void
  onFieldPress: () => void
  onPickerDismiss?: () => void
  pickerDate: Date
  placeholder?: string
  pulseKey: number
  sheetTitle?: string
  showDateError: boolean
  showDatePicker: boolean
}

function DatePickerPanelCard({
  accentColor,
  mode,
  onDateChange,
  pickerDate,
  textColor,
}: Pick<AppointmentDatePickerFieldProps, 'onDateChange' | 'pickerDate'> & {
  accentColor: string
  mode: 'light' | 'dark'
  textColor: string
}) {
  return (
    <YStack
      px="$1.5"
      pt="$1"
      pb="$0.5"
    >
      <XStack justify="center" width="100%">
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              void selectionHaptic()
            }
            onDateChange(event, selectedDate)
          }}
          style={Platform.OS === 'ios' ? styles.inlinePicker : undefined}
          {...(Platform.OS === 'ios'
            ? {
                accentColor,
                textColor,
                themeVariant: mode,
              }
            : {})}
        />
      </XStack>
    </YStack>
  )
}

export function AppointmentDatePickerField({
  datePanel,
  displayValue,
  fieldBackground = '$background',
  onDateChange,
  onFieldPress,
  onPickerDismiss,
  pickerDate,
  placeholder = 'Select appointment date',
  pulseKey,
  sheetTitle = 'Choose date',
  showDateError,
  showDatePicker,
}: AppointmentDatePickerFieldProps) {
  const theme = useTheme()
  const { mode } = useResolvedThemeSelection()
  const pickerAccentColor = toNativeColor(theme.accent?.val, FALLBACK_COLORS.textPrimary)
  const pickerTextColor = toNativeColor(theme.textPrimary?.val, FALLBACK_COLORS.textPrimary)

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
        <IOSBottomSheet
          open={showDatePicker}
          onClose={onPickerDismiss ?? onFieldPress}
          title={sheetTitle}
          testID="appointment-date-picker-sheet"
        >
          <Pressable
            onPress={(event) => {
              event.stopPropagation?.()
            }}
          >
            <DatePickerPanelCard
              pickerDate={pickerDate}
              onDateChange={onDateChange}
              accentColor={pickerAccentColor}
              textColor={pickerTextColor}
              mode={mode}
            />
          </Pressable>
        </IOSBottomSheet>
      ) : null}
      {showDateError ? (
        <Text fontSize={11} color="$red10">
          Date is required.
        </Text>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  inlinePicker: {
    alignSelf: 'center',
    transform: [{ scale: 0.93 }],
  },
})
