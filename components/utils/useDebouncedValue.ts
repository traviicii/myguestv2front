import { useEffect, useState } from 'react'

export const useDebouncedValue = <T,>(value: T, delayMs = 200) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    if (value === '' || value === null || value === undefined) {
      setDebouncedValue(value)
      return
    }

    const handle = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => {
      clearTimeout(handle)
    }
  }, [delayMs, value])

  return debouncedValue
}
