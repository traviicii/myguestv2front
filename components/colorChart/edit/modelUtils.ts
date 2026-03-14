import {
  COLOR_CHART_FIELDS,
  COLOR_CHART_PICKLIST_FIELDS,
  isOtherColorChartValue,
  normalizeColorChartValue,
  normalizePicklistValue,
} from 'components/colorChart/form'
import {
  COLOR_CHART_FIELD_LABELS,
  type ColorChartFieldKey,
  type ColorChartFormState,
  type ColorChartPicklistFieldKey,
} from 'components/colorChart/config'

export type OtherInputState = Record<ColorChartPicklistFieldKey, boolean>

export const buildOtherInputState = (form: ColorChartFormState): OtherInputState =>
  COLOR_CHART_PICKLIST_FIELDS.reduce((acc, field) => {
    acc[field] = isOtherColorChartValue(field, form[field])
    return acc
  }, {} as OtherInputState)

export const normalizeFormState = (form: ColorChartFormState): ColorChartFormState =>
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

export function isPicklistField(
  field: ColorChartFieldKey
): field is ColorChartPicklistFieldKey {
  return COLOR_CHART_PICKLIST_FIELDS.includes(field as ColorChartPicklistFieldKey)
}

export function getColorChartFieldPlaceholder(field: ColorChartFieldKey) {
  if (field === 'eye_color') return 'Enter eye color'

  if (isPicklistField(field)) {
    return `Enter custom ${COLOR_CHART_FIELD_LABELS[field].toLowerCase()}`
  }

  const placeholderMap: Partial<Record<ColorChartFieldKey, string>> = {
    natural_level: 'Natural level',
    desired_level: 'Desired level',
    gray_front: '0%',
    gray_sides: '0%',
    gray_back: '0%',
  }

  return placeholderMap[field] ?? 'Enter value'
}
