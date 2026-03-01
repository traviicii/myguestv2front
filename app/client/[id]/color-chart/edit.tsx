import {
  useEffect,
  useMemo,
  useState } from 'react'
import { Stack,
  useLocalSearchParams,
  useRouter } from 'expo-router'
import { useToastController } from '@tamagui/toast'
import { Keyboard, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView,
  Text,
  XStack,
  YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useClients,
  useColorAnalysisByClient,
  useColorAnalysisForClient,
  useUpsertColorAnalysisForClient,
  } from 'components/data/queries'
import { COLOR_CHART_FIELD_LABELS,
  COLOR_CHART_GROUPS,
  COLOR_CHART_OPTIONS,
  type ColorChartFormState,
  type ColorChartPicklistFieldKey,
  } from 'components/colorChart/config'
import { COLOR_CHART_FIELDS,
  COLOR_CHART_PICKLIST_FIELDS,
  createColorChartFormState,
  isColorChartDirty,
  isOtherColorChartValue,
  normalizeColorChartValue,
  normalizePicklistValue,
  } from 'components/colorChart/form'
import { PrimaryButton,
  SecondaryButton,
  SectionDivider,
  FieldLabel,
  OptionChip,
  OptionChipLabel,
  SurfaceCard,
  TextField,
  ThemedEyebrowText,
  ThemedHeadingText,
} from 'components/ui/controls'
import { KeyboardDismissAccessory } from 'components/ui/KeyboardDismissAccessory'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import { useThemePrefs } from 'components/ThemePrefs'

type OtherInputState = Record<ColorChartPicklistFieldKey, boolean>

const buildOtherInputState = (form: ColorChartFormState): OtherInputState =>
  COLOR_CHART_PICKLIST_FIELDS.reduce((acc, field) => {
    acc[field] = isOtherColorChartValue(field, form[field])
    return acc
  }, {} as OtherInputState)

const normalizeFormState = (form: ColorChartFormState): ColorChartFormState =>
  COLOR_CHART_FIELDS.reduce((acc, field) => {
    const trimmed = normalizeColorChartValue(form[field])
    if (COLOR_CHART_PICKLIST_FIELDS.includes(field as ColorChartPicklistFieldKey)) {
      const picklistField = field as ColorChartPicklistFieldKey
      acc[field] = normalizePicklistValue(picklistField, trimmed) ?? trimmed
      return acc
    }
    acc[field] = trimmed
    return acc
  }, {} as ColorChartFormState)

export default function EditClientColorChartScreen() {
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const toast = useToastController()
  const upsertColorChart = useUpsertColorAnalysisForClient()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: colorAnalysisByClient = {} } = useColorAnalysisByClient()

  const client = clients.find((item) => item.id === id)
  const clientId = client?.id
  const { data: colorAnalysisForClient } = useColorAnalysisForClient(clientId)
  const colorAnalysis = client
    ? colorAnalysisForClient ?? colorAnalysisByClient[client.id]
    : undefined

  const sourceForm = useMemo(
    () => createColorChartFormState(colorAnalysis),
    [colorAnalysis]
  )
  const sourceSignature = useMemo(() => JSON.stringify(sourceForm), [sourceForm])

  const [form, setForm] = useState<ColorChartFormState>(() => sourceForm)
  const [initialSnapshot, setInitialSnapshot] = useState<ColorChartFormState>(
    () => sourceForm
  )
  const [otherInputs, setOtherInputs] = useState<OtherInputState>(() =>
    buildOtherInputState(sourceForm)
  )
  const isBootstrapping = clientsLoading && !clients.length

  useEffect(() => {
    const nextState = normalizeFormState(sourceForm)
    setForm(nextState)
    setInitialSnapshot(nextState)
    setOtherInputs(buildOtherInputState(nextState))
  }, [sourceSignature, client?.id])

  const isDirty = useMemo(
    () => isColorChartDirty(form, initialSnapshot),
    [form, initialSnapshot]
  )

  if (isBootstrapping) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <AmbientBackdrop />
        <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
        <Text fontSize={13} color="$textSecondary">
          Loading client...
        </Text>
      </YStack>
    )
  }

  if (!client) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <AmbientBackdrop />
        <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
        <Text fontSize={13} color="$textSecondary">
          Client not found.
        </Text>
      </YStack>
    )
  }

  const keyboardAccessoryId = 'color-chart-edit-keyboard-dismiss'
  const keyboardDismissMode = Platform.OS === 'ios' ? 'interactive' : 'on-drag'

  const setField = (field: keyof ColorChartFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    if (!isDirty) return
    const nextBaseline = normalizeFormState(form)
    try {
      await upsertColorChart.mutateAsync({
        clientId: client.id,
        input: nextBaseline,
      })
      setForm(nextBaseline)
      setInitialSnapshot(nextBaseline)
      setOtherInputs(buildOtherInputState(nextBaseline))
      toast.show('Saved', {
        message: 'Color chart updated.',
      })
      router.back()
    } catch (error) {
      toast.show('Save failed', {
        message:
          error instanceof Error
            ? error.message
            : 'Unable to save color chart. Please try again.',
      })
    }
  }

  const renderPicklistField = (
    field: ColorChartPicklistFieldKey,
    placeholder = 'Enter custom value'
  ) => {
    const options = COLOR_CHART_OPTIONS[field]
    const selectedPreset = normalizePicklistValue(field, form[field])
    const showOtherInput = otherInputs[field]
    const fieldLabel = COLOR_CHART_FIELD_LABELS[field]

    return (
      <YStack key={field} gap="$2.5">
        <FieldLabel>{fieldLabel}</FieldLabel>
        <XStack gap="$2" flexWrap="wrap">
          {options.map((option) => {
            const isActive = selectedPreset === option
            return (
              <OptionChip
                key={`${field}-${option}`}
                active={isActive}
                onPress={() => {
                  setField(field, option)
                  setOtherInputs((prev) => ({ ...prev, [field]: false }))
                }}
              >
                <OptionChipLabel active={isActive}>
                  {option}
                </OptionChipLabel>
              </OptionChip>
            )
          })}
          <OptionChip
            active={showOtherInput}
            onPress={() => {
              setOtherInputs((prev) => ({ ...prev, [field]: true }))
              if (selectedPreset) {
                setField(field, '')
              }
            }}
          >
            <OptionChipLabel active={showOtherInput}>
              Other
            </OptionChipLabel>
          </OptionChip>
        </XStack>
        {showOtherInput ? (
          <TextField
            placeholder={placeholder}
            value={form[field]}
            inputAccessoryViewID={keyboardAccessoryId}
            onChangeText={(text) => setField(field, text)}
          />
        ) : null}
      </YStack>
    )
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} bg="$background" position="relative">
        <AmbientBackdrop />
        <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
        <KeyboardDismissAccessory nativeID={keyboardAccessoryId} />
        <ScrollView
          contentContainerStyle={{ pb: '$10' }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={keyboardDismissMode}
          onScrollBeginDrag={Keyboard.dismiss}
        >
          <YStack px="$5" pt="$6" gap="$4">
          <YStack gap="$1">
            <ThemedEyebrowText>
              EDIT COLOR CHART
            </ThemedEyebrowText>
            <ThemedHeadingText fontSize={20} fontWeight="700">
              {client.name}
            </ThemedHeadingText>
          </YStack>

          {COLOR_CHART_GROUPS.map((group, index) => (
            <YStack key={group.id} gap="$3">
              <ThemedHeadingText fontWeight="700" fontSize={14}>
                {group.title}
              </ThemedHeadingText>
              <SurfaceCard
                p="$4"
                gap="$3"
                tone={isGlass ? 'secondary' : 'default'}
                mode="alwaysCard"
              >
                {group.fields.map((field) => {
                  if (
                    field === 'porosity' ||
                    field === 'hair_texture' ||
                    field === 'elasticity' ||
                    field === 'scalp_condition' ||
                    field === 'contrib_pigment' ||
                    field === 'skin_depth' ||
                    field === 'skin_tone' ||
                    field === 'eye_color'
                  ) {
                    const placeholder =
                      field === 'eye_color'
                        ? 'Enter eye color'
                        : `Enter custom ${COLOR_CHART_FIELD_LABELS[field].toLowerCase()}`
                    return renderPicklistField(field, placeholder)
                  }

                  const placeholderMap: Partial<Record<keyof ColorChartFormState, string>> = {
                    natural_level: 'Natural level',
                    desired_level: 'Desired level',
                    gray_front: '0%',
                    gray_sides: '0%',
                    gray_back: '0%',
                  }

                  return (
                    <YStack key={field} gap="$2">
                      <FieldLabel>{COLOR_CHART_FIELD_LABELS[field]}</FieldLabel>
                      <TextField
                        placeholder={placeholderMap[field] ?? 'Enter value'}
                        value={form[field]}
                        inputAccessoryViewID={keyboardAccessoryId}
                        onChangeText={(text) => setField(field, text)}
                      />
                    </YStack>
                  )
                })}
              </SurfaceCard>
              {index < COLOR_CHART_GROUPS.length - 1 ? <SectionDivider /> : null}
            </YStack>
          ))}

          <XStack gap="$3">
            <SecondaryButton flex={1} onPress={() => router.back()}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              flex={1}
              onPress={() => void handleSave()}
              disabled={!isDirty || upsertColorChart.isPending}
              opacity={isDirty && !upsertColorChart.isPending ? 1 : 0.5}
            >
              {upsertColorChart.isPending ? 'Saving…' : 'Save'}
            </PrimaryButton>
          </XStack>
          </YStack>
        </ScrollView>
      </YStack>
    </>
  )
}
