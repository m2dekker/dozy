import { createClient } from '@supabase/supabase-js';
import { Clone, JournalEntry } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client (will be null if env vars not set, triggering localStorage fallback)
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const USE_SUPABASE = !!supabase;

// LocalStorage fallback keys
const CLONES_KEY = 'clonewander_clones';
const JOURNALS_KEY = 'clonewander_journals';

/**
 * Generate a simple UUID that works in all environments
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Storage abstraction layer - uses Supabase if available, otherwise localStorage
 */

// ============ CLONES ============

export async function createClone(clone: Omit<Clone, 'id' | 'createdAt'>): Promise<Clone> {
  const newClone: Clone = {
    ...clone,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
  };

  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from('clones')
      .insert([newClone])
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // localStorage fallback
    const clones = getLocalClones();
    clones.push(newClone);
    localStorage.setItem(CLONES_KEY, JSON.stringify(clones));
    return newClone;
  }
}

export async function getClones(): Promise<Clone[]> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from('clones')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } else {
    return getLocalClones();
  }
}

export async function getClone(id: string): Promise<Clone | null> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from('clones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  } else {
    const clones = getLocalClones();
    return clones.find((c) => c.id === id) || null;
  }
}

export async function updateClone(
  id: string,
  updates: Partial<Clone>
): Promise<Clone | null> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from('clones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const clones = getLocalClones();
    const index = clones.findIndex((c) => c.id === id);
    if (index === -1) return null;

    clones[index] = { ...clones[index], ...updates };
    localStorage.setItem(CLONES_KEY, JSON.stringify(clones));
    return clones[index];
  }
}

// ============ JOURNAL ENTRIES ============

export async function createJournalEntry(
  entry: Omit<JournalEntry, 'id'>
): Promise<JournalEntry> {
  const newEntry: JournalEntry = {
    ...entry,
    id: generateUUID(),
  };

  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from('journals')
      .insert([newEntry])
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const journals = getLocalJournals();
    journals.push(newEntry);
    localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
    return newEntry;
  }
}

export async function getJournalEntries(cloneId?: string): Promise<JournalEntry[]> {
  if (USE_SUPABASE) {
    let query = supabase!.from('journals').select('*');

    if (cloneId) {
      query = query.eq('cloneId', cloneId);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  } else {
    let journals = getLocalJournals();
    if (cloneId) {
      journals = journals.filter((j) => j.cloneId === cloneId);
    }
    return journals.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

// ============ LocalStorage Helpers ============

function getLocalClones(): Clone[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CLONES_KEY);
  return data ? JSON.parse(data) : [];
}

function getLocalJournals(): JournalEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(JOURNALS_KEY);
  return data ? JSON.parse(data) : [];
}

// Export flag for UI to show which storage is being used
export const usingSupabase = USE_SUPABASE;
