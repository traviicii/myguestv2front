export const getServiceUsageLabel = (usageCount: number) =>
  usageCount > 0
    ? `Used in ${usageCount} log${usageCount === 1 ? '' : 's'}`
    : 'Unused'
