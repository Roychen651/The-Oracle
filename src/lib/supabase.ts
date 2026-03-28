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

export interface SavedScenario {
  id: string
  user_id: string
  name: string
  params: SimulationParams
  created_at: string
}

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

export async function saveScenario(
  name: string,
  params: SimulationParams
): Promise<SavedScenario | null> {
  if (!supabase) {
    console.warn('Supabase not configured. Cannot save scenario.')
    return null
  }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.warn('User not authenticated.')
    return null
  }
  const { data, error } = await supabase
    .from('scenarios')
    .insert({ user_id: user.id, name, params })
    .select()
    .single()
  if (error) {
    console.error('Error saving scenario:', error)
    return null
  }
  return data as SavedScenario
}

export async function loadScenarios(): Promise<SavedScenario[]> {
  if (!supabase) return []
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error loading scenarios:', error)
    return []
  }
  return (data as SavedScenario[]) ?? []
}

export async function deleteScenario(id: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('scenarios').delete().eq('id', id)
  if (error) {
    console.error('Error deleting scenario:', error)
    return false
  }
  return true
}
