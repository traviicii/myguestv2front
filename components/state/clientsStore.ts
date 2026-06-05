import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { zustandStorage } from './storage'

type StatusFilter = 'All' | 'Active' | 'Inactive'
type GroupFilter = 'All' | string
type VisitFilter = 'All' | 'Needs First Visit' | 'Returning'

type ClientsStore = {
  searchText: string
  statusFilter: StatusFilter
  tagFilter: string
  groupFilter: GroupFilter
  visitFilter: VisitFilter
  showFilters: boolean
  closeFilters: () => void
  openFilters: () => void
  resetFilterSelections: () => void
  setSearchText: (text: string) => void
  setStatusFilter: (status: StatusFilter) => void
  setTagFilter: (tag: string) => void
  setGroupFilter: (group: GroupFilter) => void
  setVisitFilter: (visit: VisitFilter) => void
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
      tagFilter: 'All',
      groupFilter: 'All',
      visitFilter: 'All',
      showFilters: false,
      closeFilters: () => set({ showFilters: false }),
      openFilters: () => set({ showFilters: true }),
      resetFilterSelections: () =>
        set((state) => ({
          showFilters: state.showFilters,
          statusFilter: 'All',
          tagFilter: 'All',
          groupFilter: 'All',
          visitFilter: 'All',
        })),
      setSearchText: (text) => set({ searchText: text }),
      setStatusFilter: (status) => set({ statusFilter: status }),
      setTagFilter: (tag) => set({ tagFilter: tag }),
      setGroupFilter: (group) => set({ groupFilter: group }),
      setVisitFilter: (visit) => set({ visitFilter: visit }),
      toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),
      resetFilters: () =>
        set({
          searchText: '',
          statusFilter: 'All',
          tagFilter: 'All',
          groupFilter: 'All',
          visitFilter: 'All',
          showFilters: false,
        }),
    }),
    {
      name: 'clients-store',
      storage: zustandStorage,
      partialize: (state) => ({
        searchText: state.searchText,
        statusFilter: state.statusFilter,
        tagFilter: state.tagFilter,
        groupFilter: state.groupFilter,
        visitFilter: state.visitFilter,
      }),
    }
  )
)
