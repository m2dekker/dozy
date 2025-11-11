export type AIModel = 'claude' | 'chatgpt';

export type JournalMoment = 'arrival' | 'mid-activity' | 'end-of-day';

export interface JournalEntry {
  id: string;
  cloneId: string;
  cloneName: string;
  destination: string;
  moment: JournalMoment;
  message: string;
  timestamp: number;
  aiModel: AIModel;
}

export interface CloneBio {
  cloneId: string;
  bio: string;
  aiModel: AIModel;
}

// Generate unique journal entry ID
export function generateJournalEntryId(): string {
  return `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Save journal entry to localStorage
export function saveJournalEntry(entry: JournalEntry): void {
  if (typeof window === 'undefined') return;

  const entries = getJournalEntries();
  entries.push(entry);

  // Keep only last 1000 entries
  const recent = entries.slice(-1000);
  localStorage.setItem('journalEntries', JSON.stringify(recent));
}

// Get all journal entries
export function getJournalEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('journalEntries');
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Get journal entries for a specific clone
export function getCloneJournalEntries(cloneId: string): JournalEntry[] {
  return getJournalEntries().filter(entry => entry.cloneId === cloneId);
}

// Count today's entries for a clone
export function getTodayEntryCount(cloneId: string): number {
  const today = new Date().setHours(0, 0, 0, 0);
  return getJournalEntries().filter(
    entry => entry.cloneId === cloneId && entry.timestamp >= today
  ).length;
}

// Save clone bio and AI model preference
export function saveCloneBio(cloneBio: CloneBio): void {
  if (typeof window === 'undefined') return;

  const bios = getCloneBios();
  const existing = bios.findIndex(b => b.cloneId === cloneBio.cloneId);

  if (existing >= 0) {
    bios[existing] = cloneBio;
  } else {
    bios.push(cloneBio);
  }

  localStorage.setItem('cloneBios', JSON.stringify(bios));
}

// Get all clone bios
export function getCloneBios(): CloneBio[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('cloneBios');
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Get bio for a specific clone
export function getCloneBio(cloneId: string): CloneBio | null {
  const bios = getCloneBios();
  return bios.find(b => b.cloneId === cloneId) || null;
}

// Get moment description for prompts
export function getMomentDescription(moment: JournalMoment): string {
  switch (moment) {
    case 'arrival':
      return 'just arrived at the destination';
    case 'mid-activity':
      return 'in the middle of exploring';
    case 'end-of-day':
      return 'reflecting on the day as evening sets in';
    default:
      return 'experiencing the destination';
  }
}

// Get moment emoji
export function getMomentEmoji(moment: JournalMoment): string {
  switch (moment) {
    case 'arrival':
      return '✈️';
    case 'mid-activity':
      return '🎯';
    case 'end-of-day':
      return '🌙';
    default:
      return '📝';
  }
}

// Format timestamp
export function formatJournalTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

// Check if clone should generate update
export function shouldGenerateUpdate(cloneId: string, arrivalTime: number): boolean {
  const now = Date.now();
  const timeSinceDeparture = now - arrivalTime;
  const todayCount = getTodayEntryCount(cloneId);

  // Don't generate if already at daily limit
  if (todayCount >= 10) return false;

  // Don't generate if clone hasn't departed yet
  if (timeSinceDeparture < 0) return false;

  return true;
}

// Determine next moment to generate
export function getNextMoment(cloneId: string, hasArrived: boolean): JournalMoment | null {
  const entries = getCloneJournalEntries(cloneId);

  if (!hasArrived) return null;

  // Check what moments we already have today
  const today = new Date().setHours(0, 0, 0, 0);
  const todayEntries = entries.filter(e => e.timestamp >= today);

  const hasArrival = todayEntries.some(e => e.moment === 'arrival');
  const hasMidActivity = todayEntries.some(e => e.moment === 'mid-activity');
  const hasEndOfDay = todayEntries.some(e => e.moment === 'end-of-day');

  if (!hasArrival) return 'arrival';
  if (!hasMidActivity) return 'mid-activity';
  if (!hasEndOfDay) return 'end-of-day';

  return null; // All moments generated for today
}

// Delete all journal entries for a clone
export function deleteCloneJournal(cloneId: string): void {
  if (typeof window === 'undefined') return;

  const entries = getJournalEntries().filter(e => e.cloneId !== cloneId);
  localStorage.setItem('journalEntries', JSON.stringify(entries));

  const bios = getCloneBios().filter(b => b.cloneId !== cloneId);
  localStorage.setItem('cloneBios', JSON.stringify(bios));
}
