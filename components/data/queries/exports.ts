import { useMutation } from '@tanstack/react-query'

import { dataSource } from './shared'

export function useExportMyData() {
  return useMutation({
    mutationFn: () => dataSource.exportMyData(),
  })
}
