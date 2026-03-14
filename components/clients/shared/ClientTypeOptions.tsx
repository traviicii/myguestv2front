import { XStack } from 'tamagui'

import type { ClientType } from 'components/data/models'
import { OptionChip, OptionChipLabel } from 'components/ui/controls'

export const CLIENT_TYPE_OPTIONS: ClientType[] = ['Cut', 'Color', 'Cut & Color']

type ClientTypeOptionsProps = {
  onSelect: (type: ClientType) => void
  selectedType: ClientType
}

export function ClientTypeOptions({
  onSelect,
  selectedType,
}: ClientTypeOptionsProps) {
  return (
    <XStack gap="$2" flexWrap="wrap">
      {CLIENT_TYPE_OPTIONS.map((type) => (
        <OptionChip key={type} active={selectedType === type} onPress={() => onSelect(type)}>
          <OptionChipLabel active={selectedType === type}>{type}</OptionChipLabel>
        </OptionChip>
      ))}
    </XStack>
  )
}
