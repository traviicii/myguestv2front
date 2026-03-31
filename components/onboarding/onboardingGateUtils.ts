type OnboardingGateDecisionInput = {
  appointmentsCount: number
  appointmentsError: boolean
  appointmentsLoading: boolean
  clientsCount: number
  clientsError: boolean
  clientsLoading: boolean
  pathname: string
}

const ONBOARDING_GATE_BYPASS_ROUTES = new Set(['/privacy-policy', '/support'])

export function deriveOnboardingGateDecision({
  appointmentsCount,
  appointmentsError,
  appointmentsLoading,
  clientsCount,
  clientsError,
  clientsLoading,
  pathname,
}: OnboardingGateDecisionInput) {
  if (ONBOARDING_GATE_BYPASS_ROUTES.has(pathname)) {
    return {
      shouldRedirectToApp: false,
      shouldRedirectToOnboarding: false,
      showLoading: false,
    }
  }

  const isOnboardingRoute = pathname.startsWith('/onboarding')
  const hasBootstrapError = clientsError || appointmentsError
  const isBootstrapping = !hasBootstrapError && (clientsLoading || appointmentsLoading)
  const shouldOnboard =
    !hasBootstrapError &&
    !isBootstrapping &&
    clientsCount === 0 &&
    appointmentsCount === 0

  const shouldRedirectToOnboarding = shouldOnboard && !isOnboardingRoute
  const shouldRedirectToApp = !shouldOnboard && isOnboardingRoute

  return {
    shouldRedirectToApp,
    shouldRedirectToOnboarding,
    showLoading: isBootstrapping || shouldRedirectToApp || shouldRedirectToOnboarding,
  }
}
