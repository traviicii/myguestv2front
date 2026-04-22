import { useEffect } from 'react'
import type { ComponentProps } from 'react'
import { StyleSheet } from 'react-native'
import { ArrowDown, ArrowUp, Trash2 } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'
import Animated, {
  Easing,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import {
  CurrencyField,
  FieldLabel,
  GhostButton,
  SecondaryButton,
  SurfaceCard,
  TextField,
} from 'components/ui/controls'

import type { SettingsSectionProps } from '../sectionTypes'
import { getServiceUsageLabel } from './utils'

const reorderRowTransition = LinearTransition.springify()
  .damping(18)
  .stiffness(220)
  .mass(0.55)

function ReorderButton({
  icon,
  disabled = false,
  onPress,
}: {
  icon: React.ReactNode
  disabled?: boolean
  onPress: () => void
}) {
  return (
    <GhostButton
      chromeless
      width={30}
      height={30}
      rounded="$3"
      disabled={disabled}
      onPress={onPress}
      pressStyle={{ bg: '$surfaceChipActive', opacity: 0.92 }}
      hoverStyle={{ bg: '$surfaceChipActive' }}
      disabledStyle={{ opacity: 0.4 }}
    >
      {icon}
    </GhostButton>
  )
}

export function ActiveServicesSection({ model }: SettingsSectionProps) {
  type PriceStatusColor = ComponentProps<typeof Text>['color']
  type RenameStatusColor = ComponentProps<typeof Text>['color']

  const getPriceStatusCopy = (serviceId: number) => {
    switch (model.priceSaveStates[serviceId]) {
      case 'saving':
        return {
          copy: 'Saving...',
          color: '$textSecondary' as PriceStatusColor,
        }
      case 'saved':
        return {
          copy: 'Saved',
          color: '$accent' as PriceStatusColor,
        }
      case 'error':
        return {
          copy: 'Not saved',
          color: '$red10' as PriceStatusColor,
        }
      default:
        return null
    }
  }

  const getRenameStatusCopy = (serviceId: number) => {
    switch (model.renameSaveStates[serviceId]) {
      case 'saving':
        return {
          copy: 'Saving...',
          color: '$textSecondary' as RenameStatusColor,
        }
      case 'saved':
        return {
          copy: 'Saved',
          color: '$accent' as RenameStatusColor,
        }
      case 'error':
        return {
          copy: 'Not saved',
          color: '$red10' as RenameStatusColor,
        }
      default:
        return null
    }
  }

  const getReturnStatusCopy = (serviceId: number) => {
    switch (model.returnWeeksSaveStates[serviceId]) {
      case 'saving':
        return {
          copy: 'Saving...',
          color: '$textSecondary' as RenameStatusColor,
        }
      case 'saved':
        return {
          copy: 'Saved',
          color: '$accent' as RenameStatusColor,
        }
      case 'error':
        return {
          copy: 'Not saved',
          color: '$red10' as RenameStatusColor,
        }
      default:
        return null
    }
  }

  return (
    <YStack gap="$3">
      <YStack gap="$1">
        <FieldLabel>Visible services</FieldLabel>
        <Text fontSize={11} color="$textSecondary">
          Available when logging appointments. Defaults prefill new visits and
          can be changed per log.
        </Text>
      </YStack>
      {model.activeServices.map((service, index) => (
        <ActiveServiceCard
          key={service.id}
          index={index}
          model={model}
          priceStatus={getPriceStatusCopy(service.id)}
          pulseTrigger={model.reorderPulseKeys[service.id] ?? 0}
          renameStatus={getRenameStatusCopy(service.id)}
          returnStatus={getReturnStatusCopy(service.id)}
          service={service}
        />
      ))}
    </YStack>
  )
}

function ActiveServiceCard({
  index,
  model,
  priceStatus,
  pulseTrigger,
  renameStatus,
  returnStatus,
  service,
}: {
  index: number
  model: SettingsSectionProps['model']
  priceStatus:
    | {
        copy: string
        color: ComponentProps<typeof Text>['color']
      }
    | null
  pulseTrigger: number
  renameStatus:
    | {
        copy: string
        color: ComponentProps<typeof Text>['color']
      }
    | null
  returnStatus:
    | {
        copy: string
        color: ComponentProps<typeof Text>['color']
      }
    | null
  service: SettingsSectionProps['model']['activeServices'][number]
}) {
  const pulseScale = useSharedValue(1)
  const pulseOffset = useSharedValue(0)
  const pulseGlow = useSharedValue(0)

  useEffect(() => {
    if (!pulseTrigger) return
    pulseScale.value = withSequence(
      withTiming(1.032, {
        duration: 150,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(1, {
        duration: 190,
        easing: Easing.out(Easing.cubic),
      })
    )
    pulseOffset.value = withSequence(
      withTiming(-4, {
        duration: 140,
        easing: Easing.out(Easing.cubic),
      }),
      withSpring(0, {
        damping: 16,
        stiffness: 220,
        mass: 0.6,
      })
    )
    pulseGlow.value = withSequence(
      withTiming(1, {
        duration: 120,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(0, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      })
    )
  }, [pulseGlow, pulseOffset, pulseScale, pulseTrigger])

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pulseOffset.value }, { scale: pulseScale.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: pulseGlow.value * 0.7,
  }))

  return (
    <Animated.View layout={reorderRowTransition} style={pulseStyle}>
      <YStack position="relative">
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, glowStyle]}
        >
          <YStack
            flex={1}
            rounded="$4"
            bg="$surfaceChipActive"
            borderWidth={1}
            borderColor="$borderAccent"
          />
        </Animated.View>
        <SurfaceCard
          mode="section"
          tone="default"
          p="$3.5"
          gap="$3"
          rounded="$5"
          borderWidth={1}
          borderColor="$borderSubtle"
        >
          <XStack items="flex-start" justify="space-between" gap="$3">
            <YStack flex={1} gap="$0.5">
              <Text fontSize={14} color="$textPrimary" fontWeight="700">
                {model.renameDrafts[service.id] ?? service.name}
              </Text>
              <Text fontSize={11} color="$textSecondary">
                {getServiceUsageLabel(service.usageCount)}
              </Text>
            </YStack>
            <XStack
              items="center"
              gap={0}
              bg="$surfaceChip"
              borderWidth={1}
              borderColor="$borderSubtle"
              rounded="$3"
              overflow="hidden"
            >
              <ReorderButton
                icon={<ArrowUp size={14} color="$textSecondary" />}
                disabled={index === 0}
                onPress={() => {
                  void model.handleMoveService(service.id, 'up')
                }}
              />
              <YStack width={1} self="stretch" bg="$borderSubtle" opacity={0.8} />
              <ReorderButton
                icon={<ArrowDown size={14} color="$textSecondary" />}
                disabled={index === model.activeServices.length - 1}
                onPress={() => {
                  void model.handleMoveService(service.id, 'down')
                }}
              />
            </XStack>
          </XStack>

          <YStack gap="$2.5">
            <YStack gap="$1">
              <FieldLabel>Service name</FieldLabel>
              <TextField
                value={model.renameDrafts[service.id] ?? service.name}
                onChangeText={(text) => model.handleRenameDraftChange(service.id, text)}
                onBlur={() => {
                  void model.handleRenameService(service.id, service.name)
                }}
              />
              {renameStatus ? (
                <Text fontSize={11} color={renameStatus.color}>
                  {renameStatus.copy}
                </Text>
              ) : null}
            </YStack>

            <XStack items="flex-start" gap="$3">
              <YStack flex={1} gap="$1">
                <FieldLabel>Default price</FieldLabel>
                <CurrencyField
                  containerProps={{ width: '100%' }}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={
                    model.priceDrafts[service.id] ??
                    model.formatPriceInput(service.defaultPriceCents)
                  }
                  onChangeText={(text) => model.handlePriceDraftChange(service.id, text)}
                  onBlur={() => {
                    void model.handlePriceBlur(service.id, service.defaultPriceCents)
                  }}
                />
                {priceStatus ? (
                  <Text fontSize={11} color={priceStatus.color}>
                    {priceStatus.copy}
                  </Text>
                ) : (
                  <Text fontSize={11} color="$textSecondary">
                    Optional
                  </Text>
                )}
              </YStack>

              <YStack width={128} gap="$1">
                <FieldLabel>Return every</FieldLabel>
                <TextField
                  width="100%"
                  placeholder="6"
                  keyboardType="number-pad"
                  value={
                    model.returnWeeksDrafts[service.id] ??
                    model.formatReturnWeeksInput(service.defaultReturnWeeks)
                  }
                  onChangeText={(text) => model.handleReturnWeeksDraftChange(service.id, text)}
                  onBlur={() => {
                    void model.handleReturnWeeksBlur(service.id, service.defaultReturnWeeks)
                  }}
                />
                {returnStatus ? (
                  <Text fontSize={11} color={returnStatus.color}>
                    {returnStatus.copy}
                  </Text>
                ) : (
                  <Text fontSize={11} color="$textSecondary">
                    Weeks
                  </Text>
                )}
              </YStack>
            </XStack>
          </YStack>

          <XStack items="center" gap="$2">
            <SecondaryButton
              size="$2"
              flex={1}
              px="$2"
              onPress={() => {
                void model.handleDeactivateService(service.id)
              }}
            >
              Archive
            </SecondaryButton>
            <SecondaryButton
              size="$2"
              flex={1}
              px="$2"
              disabled={service.usageCount > 0 || model.isDeletingService}
              opacity={service.usageCount > 0 ? 0.45 : 1}
              borderColor="$red8"
              bg="$red2"
              icon={<Trash2 size={14} />}
              onPress={() =>
                model.handlePermanentlyDeleteService(
                  service.id,
                  service.name,
                  service.usageCount
                )
              }
            >
              Delete
            </SecondaryButton>
          </XStack>
        </SurfaceCard>
      </YStack>
    </Animated.View>
  )
}
