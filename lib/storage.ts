// Storage utilities with Supabase + localStorage fallback
import { Clone, JournalEntry } from './types';
import { supabase, useSupabase } from './supabase';

// ============================================
// CLONE STORAGE
// ============================================

export async function saveClone(clone: Clone): Promise<void> {
  if (useSupabase() && supabase) {
    const { error } = await supabase
      .from('clones')
      .upsert(clone);

    if (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      saveCloneToLocalStorage(clone);
    }
  } else {
    saveCloneToLocalStorage(clone);
  }
}

export async function getClones(): Promise<Clone[]> {
  if (useSupabase() && supabase) {
    const { data, error } = await supabase
      .from('clones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      return getClonesFromLocalStorage();
    }

    return data || [];
  } else {
    return getClonesFromLocalStorage();
  }
}

export async function updateCloneStatus(id: string, status: Clone['status']): Promise<void> {
  if (useSupabase() && supabase) {
    const { error } = await supabase
      .from('clones')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      updateCloneStatusInLocalStorage(id, status);
    }
  } else {
    updateCloneStatusInLocalStorage(id, status);
  }
}

export async function deleteClone(id: string): Promise<void> {
  if (useSupabase() && supabase) {
    const { error } = await supabase
      .from('clones')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      deleteCloneFromLocalStorage(id);
    }
  } else {
    deleteCloneFromLocalStorage(id);
  }
}

// ============================================
// JOURNAL ENTRY STORAGE
// ============================================

export async function saveJournalEntry(entry: JournalEntry): Promise<void> {
  if (useSupabase() && supabase) {
    const { error } = await supabase
      .from('journal_entries')
      .insert(entry);

    if (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      saveJournalEntryToLocalStorage(entry);
    }
  } else {
    saveJournalEntryToLocalStorage(entry);
  }
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  if (useSupabase() && supabase) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      return getJournalEntriesFromLocalStorage();
    }

    return data || [];
  } else {
    return getJournalEntriesFromLocalStorage();
  }
}

export async function getJournalEntriesForClone(cloneId: string): Promise<JournalEntry[]> {
  if (useSupabase() && supabase) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('clone_id', cloneId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      return getJournalEntriesFromLocalStorage().filter(e => e.clone_id === cloneId);
    }

    return data || [];
  } else {
    return getJournalEntriesFromLocalStorage().filter(e => e.clone_id === cloneId);
  }
}

export async function clearJournalForClone(cloneId: string): Promise<void> {
  if (useSupabase() && supabase) {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('clone_id', cloneId);

    if (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      clearJournalForCloneInLocalStorage(cloneId);
    }
  } else {
    clearJournalForCloneInLocalStorage(cloneId);
  }
}

// ============================================
// LOCALSTORAGE HELPERS
// ============================================

function saveCloneToLocalStorage(clone: Clone): void {
  if (typeof window === 'undefined') return;

  const clones = getClonesFromLocalStorage();
  const index = clones.findIndex(c => c.id === clone.id);

  if (index >= 0) {
    clones[index] = clone;
  } else {
    clones.push(clone);
  }

  localStorage.setItem('clonewander_clones', JSON.stringify(clones));
}

function getClonesFromLocalStorage(): Clone[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('clonewander_clones');
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function updateCloneStatusInLocalStorage(id: string, status: Clone['status']): void {
  const clones = getClonesFromLocalStorage();
  const clone = clones.find(c => c.id === id);

  if (clone) {
    clone.status = status;
    localStorage.setItem('clonewander_clones', JSON.stringify(clones));
  }
}

function deleteCloneFromLocalStorage(id: string): void {
  const clones = getClonesFromLocalStorage().filter(c => c.id !== id);
  localStorage.setItem('clonewander_clones', JSON.stringify(clones));
}

function saveJournalEntryToLocalStorage(entry: JournalEntry): void {
  if (typeof window === 'undefined') return;

  const entries = getJournalEntriesFromLocalStorage();
  entries.push(entry);

  localStorage.setItem('clonewander_journal', JSON.stringify(entries));
}

function getJournalEntriesFromLocalStorage(): JournalEntry[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('clonewander_journal');
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function clearJournalForCloneInLocalStorage(cloneId: string): void {
  const entries = getJournalEntriesFromLocalStorage().filter(e => e.clone_id !== cloneId);
  localStorage.setItem('clonewander_journal', JSON.stringify(entries));
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
