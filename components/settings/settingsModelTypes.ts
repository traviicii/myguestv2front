import type {
  AppointmentDateFormat,
  AppSettings,
  AvgTicketRange,
  OverviewSectionId,
  PhotoCoverageRange,
} from 'components/state/studioStore'

export type PreviewCountSettingKey =
  | 'overviewRecentAppointmentsCount'
  | 'overviewRecentClientsCount'
  | 'clientDetailsAppointmentLogsCount'

export type Option<T extends string> = {
  id: T
  label: string
}

export type OverviewSectionOption = {
  id: OverviewSectionId
  label: string
  help: string
}

export type SettingsDisplayRow = {
  id: PreviewCountSettingKey
  label: string
  help: string
  value: number
}

export type SettingsCardTone = 'secondary' | 'default'

export type SettingsOptionSet = {
  appointmentDateOptions: Option<AppointmentDateFormat>[]
  avgTicketOptions: Option<AvgTicketRange>[]
  overviewSectionOptions: OverviewSectionOption[]
  photoCoverageOptions: Option<PhotoCoverageRange>[]
}

export type SettingsDisplayCounts = Pick<
  AppSettings,
  | 'clientDetailsAppointmentLogsCount'
  | 'overviewRecentAppointmentsCount'
  | 'overviewRecentClientsCount'
>
