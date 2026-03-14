import { MOCK_APPOINTMENT_HISTORY } from './appointmentHistory'

export { MOCK_APPOINTMENT_HISTORY } from './appointmentHistory'
export { MOCK_CLIENTS } from './clients'
export { MOCK_COLOR_ANALYSIS_BY_CLIENT } from './colorAnalysis'


export const MOCK_IMAGES_BY_CLIENT = MOCK_APPOINTMENT_HISTORY.reduce<Record<string, number>>(
  (acc, entry) => {
    if (!entry.images?.length) return acc
    acc[entry.clientId] = (acc[entry.clientId] ?? 0) + entry.images.length
    return acc
  },
  {}
)
