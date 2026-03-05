import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { zustandStorage } from './storage'

export type FollowUpChannel = 'sms' | 'email'

export type FollowUp = {
  id: string
  clientId: string
  dueAt: string
  channel: FollowUpChannel
  message: string
  createdAt: string
  completedAt?: string | null
}

type FollowUpInput = {
  clientId: string
  dueAt: string
  channel: FollowUpChannel
  message: string
}

type FollowUpsStore = {
  items: FollowUp[]
  addFollowUp: (input: FollowUpInput) => FollowUp
  markFollowUpCompleted: (id: string, completedAt?: string | null) => void
  removeFollowUp: (id: string) => void
  clearCompleted: () => void
}

const createFollowUpId = () =>
  `fu-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const useFollowUpsStore = create<FollowUpsStore>()(
  persist(
    (set, get) => ({
      items: [],
      addFollowUp: (input) => {
        const followUp: FollowUp = {
          id: createFollowUpId(),
          clientId: input.clientId,
          dueAt: input.dueAt,
          channel: input.channel,
          message: input.message,
          createdAt: new Date().toISOString(),
          completedAt: null,
        }
        set((state) => ({ items: [followUp, ...state.items] }))
        return followUp
      },
      markFollowUpCompleted: (id, completedAt = new Date().toISOString()) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, completedAt } : item
          ),
        }))
      },
      removeFollowUp: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
      },
      clearCompleted: () => {
        set((state) => ({
          items: state.items.filter((item) => !item.completedAt),
        }))
      },
    }),
    {
      name: 'follow-ups-store',
      storage: zustandStorage,
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
)
