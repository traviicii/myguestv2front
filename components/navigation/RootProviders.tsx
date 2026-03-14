import type { ReactNode } from 'react'

import { Provider } from 'components/Provider'

export function RootProviders({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>
}
