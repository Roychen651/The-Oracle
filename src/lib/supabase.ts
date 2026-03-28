import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js'
import type { SimulationParams } from './finance-engine'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
const isConfigured = supabaseUrl.length > 10 && !supabaseUrl.includes('placeholder')

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface AuthResult {
  user?: User | null
  session?: Session | null
  error?: string | null
}

// ─── Profile ────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  avatar_type: 'google' | 'preset' | 'upload'
  avatar_preset_id: string | null
  created_at: string
  updated_at: string
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  return data as UserProfile | null
}

export async function upsertProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { ...updates, user_id: userId, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single()
  if (error) {
    console.error('Error upserting profile:', error)
    return null
  }
  return data as UserProfile
}

// ─── Scenarios ───────────────────────────────────────────────────────────────

export interface SavedScenario {
  id: string
  user_id: string
  name: string
  description: string | null
  params: SimulationParams
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function fetchScenarios(userId: string): Promise<SavedScenario[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching scenarios:', error)
    return []
  }
  return (data as SavedScenario[]) ?? []
}

export async function saveScenario(
  userId: string,
  name: string,
  description: string,
  params: SimulationParams
): Promise<SavedScenario | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('scenarios')
    .insert({
      user_id: userId,
      name,
      description: description || null,
      params,
      is_active: false,
    })
    .select()
    .single()
  if (error) {
    console.error('Error saving scenario:', error)
    return null
  }
  return data as SavedScenario
}

export async function updateScenario(
  id: string,
  updates: Partial<SavedScenario>
): Promise<SavedScenario | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('scenarios')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    console.error('Error updating scenario:', error)
    return null
  }
  return data as SavedScenario
}

export async function deleteScenario(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('scenarios').delete().eq('id', id)
  if (error) {
    console.error('Error deleting scenario:', error)
  }
}

export async function setActiveScenario(userId: string, scenarioId: string): Promise<void> {
  if (!supabase) return
  // Deactivate all user scenarios first
  await supabase
    .from('scenarios')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  // Activate the selected one
  await supabase
    .from('scenarios')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', scenarioId)
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { error: 'Supabase not configured' }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data.user, session: data.session, error: error?.message ?? null }
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { error: 'Supabase not configured' }
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { user: data.user, session: data.session, error: error?.message ?? null }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (!supabase) return { error: 'Supabase not configured' }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/` },
  })
  return { error: error?.message ?? null }
}

export async function sendMagicLink(email: string): Promise<AuthResult> {
  if (!supabase) return { error: 'Supabase not configured' }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/` },
  })
  return { error: error?.message ?? null }
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  if (!supabase) return { error: 'Supabase not configured' }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/?reset=true`,
  })
  return { error: error?.message ?? null }
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  if (!supabase) return { error: 'Supabase not configured' }
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  return { user: data.user, error: error?.message ?? null }
}

export async function signOut(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signOut()
}

// ─── Simulation State ────────────────────────────────────────────────────────

export async function fetchSimulationState(userId: string): Promise<SimulationParams | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('simulations')
    .select('state')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data.state as SimulationParams
}

export async function saveSimulationState(userId: string, state: SimulationParams): Promise<void> {
  if (!supabase) return
  await supabase
    .from('simulations')
    .upsert({ user_id: userId, state, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
}

// ─── Realtime ────────────────────────────────────────────────────────────────

export function subscribeToSimulation(
  userId: string,
  onUpdate: (params: SimulationParams) => void
): () => void {
  if (!supabase) return () => {}

  const channel = supabase
    .channel('simulation-' + userId)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'simulations',
        filter: 'user_id=eq.' + userId,
      },
      (payload) => {
        const newState = (payload.new as { state: SimulationParams }).state
        if (newState) {
          onUpdate(newState)
        }
      }
    )
    .subscribe()

  return () => {
    supabase!.removeChannel(channel)
  }
}
