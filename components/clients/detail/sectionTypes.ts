import type { ComponentProps, ReactNode } from 'react'

import type { ClientDetailScreenModel } from './useClientDetailScreenModel'

type QuickActionIcon = ComponentProps<
  typeof import('components/ui/controls').PrimaryButton
>['icon']

export type ClientDetailSectionProps = {
  model: ClientDetailScreenModel
}

export type QuickActionConfig = {
  icon: QuickActionIcon
  label: string
  url: string
}

export type ClientAppointmentActionLinkProps = {
  children: ReactNode
  href: ClientDetailScreenModel['appointmentsHref']
}
