import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { zustandStorage } from './storage'

type StatusFilter = 'All' | 'Active' | 'Inactive'
type TypeFilter = 'All' | 'Cut' | 'Color' | 'Cut & Color'

type ClientsStore = {
  searchText: string
  statusFilter: StatusFilter
  typeFilter: TypeFilter
  showFilters: boolean
  setSearchText: (text: string) => void
  setStatusFilter: (status: StatusFilter) => void
  setTypeFilter: (type: TypeFilter) => void
  toggleFilters: () => void
  resetFilters: () => void
}

// UI-only state for the Clients tab. Data records stay in React Query,
// while filter/search preferences persist here across app launches.
export const useClientsStore = create<ClientsStore>()(
  persist(
    (set) => ({
      searchText: '',
      statusFilter: 'All',
      typeFilter: 'All',
      showFilters: false,
      setSearchText: (text) => set({ searchText: text }),
      setStatusFilter: (status) => set({ statusFilter: status }),
      setTypeFilter: (type) => set({ typeFilter: type }),
      toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),
      resetFilters: () =>
        set({
          searchText: '',
          statusFilter: 'All',
          typeFilter: 'All',
          showFilters: false,
        }),
    }),
    {
      name: 'clients-store',
      storage: zustandStorage,
      partialize: (state) => ({
        searchText: state.searchText,
        statusFilter: state.statusFilter,
        typeFilter: state.typeFilter,
      }),
    }
  )
)
