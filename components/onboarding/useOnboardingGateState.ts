import { useEffect } from 'react'
import { usePathname, useRouter } from 'expo-router'

import { useAppointmentHistoryLite, useClients } from 'components/data/queries'
import { deriveOnboardingGateDecision } from './onboardingGateUtils'

export function useOnboardingGateState() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: clients = [], isError: clientsError, isLoading: clientsLoading } = useClients()
  const {
    data: appointments = [],
    isError: appointmentsError,
    isLoading: appointmentsLoading,
  } = useAppointmentHistoryLite()

  const { shouldRedirectToApp, shouldRedirectToOnboarding, showLoading } =
    deriveOnboardingGateDecision({
      appointmentsCount: appointments.length,
      appointmentsError,
      appointmentsLoading,
      clientsCount: clients.length,
      clientsError,
      clientsLoading,
      pathname,
    })

  useEffect(() => {
    if (shouldRedirectToOnboarding) {
      router.replace('/onboarding')
      return
    }
    if (shouldRedirectToApp) {
      router.replace('/')
    }
  }, [router, shouldRedirectToApp, shouldRedirectToOnboarding])

  return { showLoading }
}
