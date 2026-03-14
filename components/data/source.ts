import { USE_MOCK_DATA } from './config'
import { apiDataSource } from './sources/api'
import { mockDataSource } from './sources/mock'

export const DATA_SOURCE_KIND = USE_MOCK_DATA ? 'mock' : 'api'

export const dataSource = DATA_SOURCE_KIND === 'mock' ? mockDataSource : apiDataSource
