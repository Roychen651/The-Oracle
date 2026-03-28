import { createClient } from '@supabase/supabase-js';
import type { SimulationParams } from './finance-engine';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Create client only if env vars are configured
const isConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface SavedScenario {
  id: string;
  user_id: string;
  name: string;
  params: SimulationParams;
  created_at: string;
}

export async function saveScenario(
  name: string,
  params: SimulationParams
): Promise<SavedScenario | null> {
  if (!supabase) {
    console.warn('Supabase not configured. Cannot save scenario.');
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.warn('User not authenticated.');
    return null;
  }

  const { data, error } = await supabase
    .from('scenarios')
    .insert({
      user_id: user.id,
      name,
      params,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving scenario:', error);
    return null;
  }

  return data as SavedScenario;
}

export async function loadScenarios(): Promise<SavedScenario[]> {
  if (!supabase) {
    console.warn('Supabase not configured.');
    return [];
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading scenarios:', error);
    return [];
  }

  return (data as SavedScenario[]) ?? [];
}

export async function deleteScenario(id: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('scenarios').delete().eq('id', id);

  if (error) {
    console.error('Error deleting scenario:', error);
    return false;
  }

  return true;
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.auth.signUp({ email, password });
}

export async function signInWithGoogle() {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.auth.signInWithOAuth({ provider: 'google' });
}

export async function sendMagicLink(email: string) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.auth.signInWithOtp({ email });
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
