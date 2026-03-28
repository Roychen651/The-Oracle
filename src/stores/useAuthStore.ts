import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import {
  supabase,
  signOut as supabaseSignOut,
  fetchSimulationState,
  fetchProfile,
  upsertProfile,
  subscribeToSimulation,
} from '../lib/supabase'
import type { UserProfile } from '../lib/supabase'

interface AuthStore {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  profile: UserProfile | null
  realtimeUnsubscribe: (() => void) | null

  initialize: () => (() => void)
  signOut: () => Promise<void>
  loadProfile: (userId: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  getAvatarUrl: () => string | null
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  profile: null,
  realtimeUnsubscribe: null,

  initialize: () => {
    if (!supabase) {
      set({ loading: false, initialized: true })
      return () => {}
    }

    supabase.auth.getSession().then(({ data }) => {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
        initialized: true,
      })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session, user: session?.user ?? null, loading: false })
      if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id

        // Load simulation state
        const { useSimulationStore } = await import('./useSimulationStore')
        const state = await fetchSimulationState(userId)
        if (state) useSimulationStore.getState().loadParams(state)

        // Load profile
        await get().loadProfile(userId)

        // Set up realtime subscription
        const unsub = subscribeToSimulation(userId, (params) => {
          import('./useSimulationStore').then(({ useSimulationStore: sim }) => {
            sim.getState().loadParams(params)
          })
        })
        set({ realtimeUnsubscribe: unsub })
      }

      if (event === 'SIGNED_OUT') {
        get().realtimeUnsubscribe?.()
        set({ profile: null, realtimeUnsubscribe: null })
      }
    })

    return () => subscription.unsubscribe()
  },

  signOut: async () => {
    get().realtimeUnsubscribe?.()
    await supabaseSignOut()
    set({ user: null, session: null, profile: null, realtimeUnsubscribe: null })
  },

  loadProfile: async (userId: string) => {
    let profile = await fetchProfile(userId)
    if (!profile) {
      // Create a default profile from Google metadata
      const { user } = get()
      const googleName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? null
      const googleAvatar = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null
      profile = await upsertProfile(userId, {
        user_id: userId,
        display_name: googleName,
        avatar_url: googleAvatar,
        avatar_type: googleAvatar ? 'google' : 'preset',
        avatar_preset_id: null,
      })
    }
    set({ profile })
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const { user, profile } = get()
    if (!user) return
    const updated = await upsertProfile(user.id, updates)
    if (updated) {
      set({ profile: { ...(profile ?? ({} as UserProfile)), ...updated } })
    }
  },

  getAvatarUrl: () => {
    const { profile, user } = get()
    return (
      profile?.avatar_url ??
      user?.user_metadata?.avatar_url ??
      user?.user_metadata?.picture ??
      null
    )
  },
}))
