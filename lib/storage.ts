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

export async function updateCloneJournalTime(id: string, timestamp: number): Promise<void> {
  if (useSupabase() && supabase) {
    const { error } = await supabase
      .from('clones')
      .update({ last_journal_update: timestamp })
      .eq('id', id);

    if (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      updateCloneJournalTimeInLocalStorage(id, timestamp);
    }
  } else {
    updateCloneJournalTimeInLocalStorage(id, timestamp);
  }
}

export async function updateCloneTotalSpend(id: string, additionalCost: number): Promise<void> {
  if (useSupabase() && supabase) {
    // Get current clone to add to total
    const { data } = await supabase
      .from('clones')
      .select('total_spend')
      .eq('id', id)
      .single();

    const currentSpend = data?.total_spend || 0;
    const newTotal = currentSpend + additionalCost;

    const { error } = await supabase
      .from('clones')
      .update({ total_spend: newTotal })
      .eq('id', id);

    if (error) {
      console.error('Supabase error, falling back to localStorage:', error);
      updateCloneTotalSpendInLocalStorage(id, additionalCost);
    }
  } else {
    updateCloneTotalSpendInLocalStorage(id, additionalCost);
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

export async function saveJournalEntry(entry: JournalEntry): Promise<boolean> {
  // Check for duplicates first
  const isDuplicate = await checkDuplicateEntry(entry.clone_id, entry.moment, entry.timestamp);
  if (isDuplicate) {
    console.log('Duplicate entry detected, skipping save');
    return false;
  }

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

  return true;
}

async function checkDuplicateEntry(cloneId: string, moment: string, timestamp: number): Promise<boolean> {
  const entries = await getJournalEntriesForClone(cloneId);

  // Check if there's an entry with same moment within 5 minutes
  const fiveMinutes = 5 * 60 * 1000;
  return entries.some(e =>
    e.moment === moment &&
    Math.abs(e.timestamp - timestamp) < fiveMinutes
  );
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

function updateCloneJournalTimeInLocalStorage(id: string, timestamp: number): void {
  const clones = getClonesFromLocalStorage();
  const clone = clones.find(c => c.id === id);

  if (clone) {
    clone.last_journal_update = timestamp;
    localStorage.setItem('clonewander_clones', JSON.stringify(clones));
  }
}

function updateCloneTotalSpendInLocalStorage(id: string, additionalCost: number): void {
  const clones = getClonesFromLocalStorage();
  const clone = clones.find(c => c.id === id);

  if (clone) {
    clone.total_spend = (clone.total_spend || 0) + additionalCost;
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
