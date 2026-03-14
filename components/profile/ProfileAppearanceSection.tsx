import { Text, XStack, YStack } from 'tamagui'

import {
  FieldLabel,
  OptionChip,
  OptionChipLabel,
  PreviewContainer,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  ThemedHeadingText,
  ThemedSwitch,
} from 'components/ui/controls'

import {
  AESTHETIC_OPTIONS,
  PALETTE_OPTIONS,
} from './useProfileScreenModel'
import { ProfileSectionTitle } from './ProfileSectionPrimitives'
import type { ProfileSectionProps } from './sectionTypes'

export function ProfileAppearanceSection({ model }: ProfileSectionProps) {
  return (
    <YStack gap={model.sectionGap}>
      <ProfileSectionTitle>Appearance</ProfileSectionTitle>
      <SurfaceCard tone={model.cardTone}>
        <XStack items="center" justify="space-between">
          <Text fontSize={13} color="$textPrimary">
            Dark mode
          </Text>
          <ThemedSwitch
            size="$2"
            checked={model.mode === 'dark'}
            onCheckedChange={(checked) => model.setMode(checked ? 'dark' : 'light')}
          />
        </XStack>

        <YStack gap="$2">
          <FieldLabel>Color palette</FieldLabel>
          <XStack gap="$2" flexWrap="wrap">
            {PALETTE_OPTIONS.map((option) => {
              const isActive = model.palette === option.id
              return (
                <OptionChip
                  key={option.id}
                  active={isActive}
                  onPress={() => model.setPalette(option.id)}
                >
                  <OptionChipLabel active={isActive}>{option.label}</OptionChipLabel>
                </OptionChip>
              )
            })}
          </XStack>
        </YStack>

        <YStack gap="$2">
          <FieldLabel>Aesthetic</FieldLabel>
          <YStack gap="$2">
            {AESTHETIC_OPTIONS.map((option) => {
              const isActive = model.aesthetic === option.id
              return (
                <OptionChip
                  key={option.id}
                  active={isActive}
                  onPress={() => model.setAesthetic(option.id)}
                  justify="space-between"
                >
                  <OptionChipLabel active={isActive}>{option.label}</OptionChipLabel>
                  <Text
                    fontSize={11}
                    color="$textSecondary"
                    maxW="72%"
                    style={{ textAlign: 'right' }}
                  >
                    {option.description}
                  </Text>
                </OptionChip>
              )
            })}
          </YStack>
        </YStack>

        <PreviewContainer>
          <FieldLabel>Theme preview</FieldLabel>
          <ThemedHeadingText fontWeight="700" fontSize={13}>
            Section Header
          </ThemedHeadingText>
          <Text fontSize={11} color="$textSecondary">
            Surface, chips, toggles, and button contrast preview.
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            <OptionChip active>
              <OptionChipLabel active>Selected</OptionChipLabel>
            </OptionChip>
            <OptionChip>
              <OptionChipLabel>Idle chip</OptionChipLabel>
            </OptionChip>
            <ThemedSwitch checked />
          </XStack>
          <XStack gap="$2">
            <SecondaryButton flex={1} size="$3">
              Secondary
            </SecondaryButton>
            <PrimaryButton flex={1} size="$3">
              Primary
            </PrimaryButton>
          </XStack>
        </PreviewContainer>
      </SurfaceCard>
    </YStack>
  )
}
