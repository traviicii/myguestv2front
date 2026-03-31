import { Platform } from 'react-native'
import { File, Paths } from 'expo-file-system'

import { getApiBaseUrl } from '../config'

import { ApiRequestError, getAuthorizedHeaders, requestResponse } from './core'

export type DataExportResult = {
  fileName: string
  method: 'download' | 'share'
}

function buildFallbackFileName() {
  const parts = new Date().toISOString().replace(/[^\d]/g, '').slice(0, 14)
  return `myguest_export_${parts}.zip`
}

function resolveDownloadName(contentDisposition: string | null) {
  const fallback = buildFallbackFileName()
  if (!contentDisposition) return fallback
  const match = contentDisposition.match(/filename="?([^"]+)"?/)
  return match?.[1] || fallback
}

async function exportMyDataForWeb(): Promise<DataExportResult> {
  const response = await requestResponse('/exports/data', { method: 'GET' }, 'application/zip')
  if (!response.ok) {
    throw new ApiRequestError('Unable to export your data right now.', response.status, null)
  }

  const fileName = resolveDownloadName(response.headers.get('Content-Disposition'))
  const blob = await response.blob()
  const downloadUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = downloadUrl
  anchor.download = fileName
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)

  return {
    fileName,
    method: 'download',
  }
}

async function exportMyDataForNative(): Promise<DataExportResult> {
  const headers = await getAuthorizedHeaders('application/zip')
  const fileName = buildFallbackFileName()
  const destination = new File(Paths.cache, fileName)
  const file = await File.downloadFileAsync(
    `${getApiBaseUrl()}/exports/data`,
    destination,
    {
      headers,
      idempotent: true,
    }
  )

  let Sharing: typeof import('expo-sharing')
  try {
    Sharing = await import('expo-sharing')
  } catch {
    throw new Error('Data export requires a newer iPhone build. Run `npm run ios:rebuild:clean` and try again.')
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      dialogTitle: 'Export My Data',
      mimeType: 'application/zip',
      UTI: 'public.zip-archive',
    })
  }

  return {
    fileName,
    method: 'share',
  }
}

export async function exportMyDataViaApi(): Promise<DataExportResult> {
  if (Platform.OS === 'web') {
    return exportMyDataForWeb()
  }
  return exportMyDataForNative()
}
