import { Image } from 'react-native'
import { Link } from 'expo-router'
import { CalendarDays, UserRound } from '@tamagui/lucide-icons'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import {
  SecondaryButton,
  SectionDivider,
  SurfaceCard,
  ThemedHeadingText,
  cardSurfaceProps,
} from 'components/ui/controls'

import { AppointmentGalleryPreviewModal } from './AppointmentGalleryPreviewModal'
import type { AppointmentDetailScreenModel } from './useAppointmentDetailScreenModel'

type AppointmentDetailSectionProps = {
  model: AppointmentDetailScreenModel
}

function AppointmentDetailCard({
  model,
  children,
  ...props
}: AppointmentDetailSectionProps & React.ComponentProps<typeof YStack>) {
  if (model.isGlass) {
    return (
      <SurfaceCard mode="alwaysCard" tone="secondary" gap="$0" {...props}>
        {children}
      </SurfaceCard>
    )
  }

  return (
    <YStack {...cardSurfaceProps} {...props}>
      {children}
    </YStack>
  )
}

function AppointmentSectionTitle({ children }: { children: string }) {
  return (
    <ThemedHeadingText fontWeight="600" fontSize={14}>
      {children}
    </ThemedHeadingText>
  )
}

export function AppointmentDetailTopBar({ model }: AppointmentDetailSectionProps) {
  const rightAction = model.editHref ? (
    <SecondaryButton size="$2" height={36} width={72} px="$3" onPress={model.handleEdit}>
      <Text
        fontSize={12}
        lineHeight={14}
        fontWeight="700"
        letterSpacing={model.isCyberpunk ? 0.8 : 0}
        textTransform={model.isCyberpunk ? 'uppercase' : undefined}
        style={model.isCyberpunk ? ({ fontFamily: 'SpaceMono' } as never) : undefined}
        color="$buttonSecondaryFg"
      >
        Edit
      </Text>
    </SecondaryButton>
  ) : undefined

  return <ScreenTopBar topInset={model.topInset} onBack={model.handleBack} rightAction={rightAction} />
}

export function AppointmentDetailStateMessage({ message }: { message: string }) {
  return (
    <YStack flex={1} items="center" justify="center" bg="$background">
      <Text fontSize={13} color="$textSecondary">
        {message}
      </Text>
    </YStack>
  )
}

function AppointmentHeroSection({ model }: AppointmentDetailSectionProps) {
  return (
    <YStack gap="$2">
      <Text fontSize={20} fontWeight="700">
        {model.serviceLabel}
      </Text>
      <XStack items="center" gap="$2">
        <CalendarDays size={14} color="$textSecondary" />
        <Text fontSize={12} color="$textSecondary">
          {model.formattedDate}
        </Text>
      </XStack>
    </YStack>
  )
}

function AppointmentSummarySection({ model }: AppointmentDetailSectionProps) {
  if (!model.appointment) return null

  return (
    <AppointmentDetailCard model={model} rounded={model.cardRadius} p="$4" gap="$3">
      <XStack items="center" justify="space-between">
        <Text fontSize={12} color="$textSecondary">
          Service
        </Text>
        <Text fontSize={12}>{model.serviceLabel}</Text>
      </XStack>
      <XStack items="center" justify="space-between">
        <Text fontSize={12} color="$textSecondary">
          Price
        </Text>
        <Text fontSize={12}>${model.appointment.price}</Text>
      </XStack>
      <XStack items="center" justify="space-between">
        <Text fontSize={12} color="$textSecondary">
          Client
        </Text>
        <Text fontSize={12}>{model.client?.name ?? 'Client'}</Text>
      </XStack>
    </AppointmentDetailCard>
  )
}

function AppointmentNotesSection({ model }: AppointmentDetailSectionProps) {
  if (!model.appointment) return null

  return (
    <YStack gap="$3">
      <AppointmentSectionTitle>Formula / Notes</AppointmentSectionTitle>
      <AppointmentDetailCard model={model} rounded={model.cardRadius} p="$4">
        <Text fontSize={12} color="$textSecondary">
          {model.appointment.notes || 'No notes recorded.'}
        </Text>
      </AppointmentDetailCard>
    </YStack>
  )
}

function AppointmentPhotosSection({ model }: AppointmentDetailSectionProps) {
  return (
    <YStack gap="$3">
      <AppointmentSectionTitle>Photos</AppointmentSectionTitle>
      <AppointmentDetailCard model={model} rounded={model.cardRadius} p="$4">
        {model.images.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$2">
              {model.images.map((uri, index) => (
                <YStack
                  key={`${uri}-${index}`}
                  width={72}
                  height={72}
                  rounded={model.thumbRadius}
                  overflow="hidden"
                  onPress={() => model.openPreview(index)}
                  cursor="pointer"
                  pressStyle={{ opacity: 0.85 }}
                >
                  <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                </YStack>
              ))}
            </XStack>
          </ScrollView>
        ) : (
          <Text fontSize={12} color="$textSecondary">
            No photos added yet.
          </Text>
        )}
      </AppointmentDetailCard>
    </YStack>
  )
}

function AppointmentViewClientAction({ model }: AppointmentDetailSectionProps) {
  if (model.hideViewClient || !model.viewClientHref || !model.appointment) return null

  return (
    <Link href={model.viewClientHref} asChild>
      <SecondaryButton height={40} px="$4" icon={<UserRound size={16} />}>
        View Client
      </SecondaryButton>
    </Link>
  )
}

export function AppointmentDetailContent({ model }: AppointmentDetailSectionProps) {
  if (!model.appointment) return null

  return (
    <>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 } as never}>
        <YStack px="$5" pt="$3" gap="$4">
          <AppointmentHeroSection model={model} />
          <SectionDivider />
          <AppointmentSummarySection model={model} />
          <AppointmentNotesSection model={model} />
          <AppointmentPhotosSection model={model} />
          <AppointmentViewClientAction model={model} />
        </YStack>
      </ScrollView>
      <AppointmentGalleryPreviewModal
        canGoNext={model.canGoNext}
        canGoPrev={model.canGoPrev}
        controlsOpacity={model.controlsOpacity}
        images={model.images}
        onClose={model.closePreview}
        onGoNext={model.goToNextPreview}
        onGoPrev={model.goToPreviousPreview}
        onLayoutWidth={model.handlePreviewLayout}
        onMomentumScrollEnd={model.handlePreviewScrollEnd}
        onToggleControls={model.handlePreviewToggleControls}
        previewIndex={model.previewIndex}
        previewScrollRef={model.previewScrollRef}
        previewWidth={model.previewWidth}
        showPreviewControls={model.showPreviewControls}
      />
    </>
  )
}
