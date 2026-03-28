import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase, signOut as supabaseSignOut, fetchSimulationState } from '../lib/supabase'

interface AuthStore {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean

  initialize: () => (() => void)
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

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
        const { useSimulationStore } = await import('./useSimulationStore')
        const state = await fetchSimulationState(session.user.id)
        if (state) useSimulationStore.getState().loadParams(state)
      }
    })

    return () => subscription.unsubscribe()
  },

  signOut: async () => {
    await supabaseSignOut()
    set({ user: null, session: null })
  },
}))
