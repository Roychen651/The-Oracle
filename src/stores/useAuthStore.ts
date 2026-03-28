import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import {
  supabase,
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

  // Called once from App.tsx on mount. Returns cleanup fn.
  initialize: () => (() => void)

  // Clears local state immediately, invalidates session in background.
  signOut: () => void

  loadProfile: (userId: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  getAvatarUrl: () => string | null
  getDisplayName: () => string
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  profile: null,
  realtimeUnsubscribe: null,

  initialize: () => {
    // No Supabase — mark ready immediately and return no-op cleanup
    if (!supabase) {
      set({ loading: false, initialized: true })
      return () => {}
    }

    // Restore existing session on startup
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.warn('[AuthStore] getSession error:', error.message)
      }
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
      set({ session, user: session?.user ?? null })

      if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id

        // Load simulation state from Supabase and merge into local store
        try {
          const { useSimulationStore } = await import('./useSimulationStore')
          const state = await fetchSimulationState(userId)
          if (state) useSimulationStore.getState().loadParams(state)
        } catch {
          // Non-fatal — local state is the source of truth
        }

        // Load or auto-create profile
        await get().loadProfile(userId)

        // Subscribe to real-time simulation updates from other devices
        const unsub = subscribeToSimulation(userId, async (params) => {
          const { useSimulationStore: sim } = await import('./useSimulationStore')
          sim.getState().loadParams(params)
        })
        set({ realtimeUnsubscribe: unsub })
      }

      if (event === 'PASSWORD_RECOVERY') {
        // User arrived via a password-reset link.
        // The access token is now in the session; mark initialized so
        // App.tsx can detect the ?reset=true URL param and show the reset view.
        set({ loading: false, initialized: true })
      }

      if (event === 'SIGNED_OUT') {
        get().realtimeUnsubscribe?.()
        set({
          user: null,
          session: null,
          profile: null,
          realtimeUnsubscribe: null,
          loading: false,
        })
      }

      // Always mark initialized after the first auth event
      set((s) => (s.initialized ? s : { initialized: true, loading: false }))
    })

    return () => subscription.unsubscribe()
  },

  signOut: () => {
    // Clear local state FIRST — instant UI response, never blocked by network
    get().realtimeUnsubscribe?.()
    set({ user: null, session: null, profile: null, realtimeUnsubscribe: null, loading: false })

    // Fire server-side invalidation in background (best-effort, don't await)
    if (supabase) {
      supabase.auth.signOut().catch(() => {})
    }
  },

  loadProfile: async (userId: string) => {
    let profile = await fetchProfile(userId)

    if (!profile) {
      // First sign-in: create a profile seeded from OAuth metadata
      const { user } = get()
      const displayName =
        user?.user_metadata?.full_name ??
        user?.user_metadata?.name ??
        user?.email?.split('@')[0] ??
        null
      const avatarUrl =
        user?.user_metadata?.avatar_url ??
        user?.user_metadata?.picture ??
        null

      profile = await upsertProfile(userId, {
        user_id: userId,
        display_name: displayName,
        avatar_url: avatarUrl,
        avatar_type: avatarUrl ? 'google' : 'preset',
        avatar_preset_id: null,
      })
    }

    if (profile) set({ profile })
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

  getDisplayName: () => {
    const { profile, user } = get()
    return (
      profile?.display_name ??
      user?.user_metadata?.full_name ??
      user?.user_metadata?.name ??
      user?.email?.split('@')[0] ??
      'משתמש'
    )
  },
}))
