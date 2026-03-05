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

const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, ' ')

const coerceIsoDate = (value: string | null | undefined, fallback: string) => {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return fallback
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return fallback
  return parsed.toISOString()
}

const sortFollowUps = (items: FollowUp[]) => {
  return [...items].sort((a, b) => {
    const aDone = Boolean(a.completedAt)
    const bDone = Boolean(b.completedAt)
    if (aDone !== bDone) return aDone ? 1 : -1
    const aDue = new Date(a.dueAt).getTime()
    const bDue = new Date(b.dueAt).getTime()
    if (aDue !== bDue) return aDue - bDue
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export const useFollowUpsStore = create<FollowUpsStore>()(
  persist(
    (set) => ({
      items: [],
      addFollowUp: (input) => {
        const createdAt = new Date().toISOString()
        const followUp: FollowUp = {
          id: createFollowUpId(),
          clientId: input.clientId.trim(),
          dueAt: coerceIsoDate(input.dueAt, createdAt),
          channel: input.channel === 'email' ? 'email' : 'sms',
          message: normalizeWhitespace(input.message),
          createdAt,
          completedAt: null,
        }
        set((state) => ({ items: sortFollowUps([followUp, ...state.items]) }))
        return followUp
      },
      markFollowUpCompleted: (id, completedAt = new Date().toISOString()) => {
        const resolvedCompletedAt = coerceIsoDate(completedAt, new Date().toISOString())
        set((state) => ({
          items: sortFollowUps(
            state.items.map((item) =>
              item.id === id ? { ...item, completedAt: resolvedCompletedAt } : item
            )
          ),
        }))
      },
      removeFollowUp: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
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
