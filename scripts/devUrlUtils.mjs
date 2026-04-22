import os from 'node:os'

export const defaultMetroPort = process.env.RCT_METRO_PORT?.trim() || '8081'

const isPrivateIpv4 = (address) =>
  /^10\.|^172\.(1[6-9]|2\d|3[0-1])\.|^192\.168\./.test(address)

const pickAddress = (entries = []) =>
  entries.find(
    (entry) =>
      entry &&
      entry.family === 'IPv4' &&
      !entry.internal &&
      isPrivateIpv4(entry.address)
  ) ??
  entries.find(
    (entry) => entry && entry.family === 'IPv4' && !entry.internal
  )

export const getPreferredLanIp = () => {
  const interfaces = os.networkInterfaces()
  const preferredNames = ['en0', 'en1', 'eth0', 'wlan0']

  for (const name of preferredNames) {
    const address = pickAddress(interfaces[name])
    if (address?.address) {
      return address.address
    }
  }

  for (const entries of Object.values(interfaces)) {
    const address = pickAddress(entries)
    if (address?.address) {
      return address.address
    }
  }

  return null
}

export const buildManualUrls = ({ host, scheme = 'myguest', port = defaultMetroPort }) => {
  const metroBase =
    host === 'localhost'
      ? `http://127.0.0.1:${port}`
      : host === 'lan'
        ? (() => {
            const lanIp = getPreferredLanIp()
            return lanIp ? `http://${lanIp}:${port}` : null
          })()
        : null

  if (!metroBase) {
    return null
  }

  return {
    metroBase,
    devClientUrl: `exp+${scheme}://expo-development-client/?url=${encodeURIComponent(metroBase)}`,
  }
}
