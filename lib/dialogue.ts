import { CloneData } from './travel';

export interface DialogueMessage {
  id: string;
  cloneId: string;
  cloneName: string;
  destination: string;
  message: string;
  timestamp: number;
  audioUrl?: string;
}

export interface GroupDialogue {
  id: string;
  participants: CloneData[];
  messages: DialogueMessage[];
  createdAt: number;
}

// Generate emoji avatar based on destination
export function getCloneAvatar(destination: string): string {
  const normalized = destination.toLowerCase();

  // Destination-based avatars
  if (normalized.includes('thailand') || normalized.includes('bangkok')) return '🏝️';
  if (normalized.includes('paris') || normalized.includes('france')) return '🗼';
  if (normalized.includes('japan') || normalized.includes('tokyo')) return '🗾';
  if (normalized.includes('italy') || normalized.includes('rome')) return '🍕';
  if (normalized.includes('spain') || normalized.includes('barcelona')) return '💃';
  if (normalized.includes('new york') || normalized.includes('usa')) return '🗽';
  if (normalized.includes('dubai')) return '🏜️';
  if (normalized.includes('australia') || normalized.includes('sydney')) return '🦘';
  if (normalized.includes('china') || normalized.includes('beijing')) return '🏮';
  if (normalized.includes('india') || normalized.includes('mumbai')) return '🕌';
  if (normalized.includes('london') || normalized.includes('england')) return '☕';
  if (normalized.includes('amsterdam') || normalized.includes('netherlands')) return '🌷';

  // Default avatars based on category
  return '✈️';
}

// Generate unique dialogue ID
export function generateDialogueId(): string {
  return `dialogue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Save dialogue to localStorage
export function saveDialogue(dialogue: GroupDialogue): void {
  if (typeof window === 'undefined') return;

  const dialogues = getDialogues();
  dialogues.push(dialogue);

  // Keep only last 10 dialogues
  const recent = dialogues.slice(-10);
  localStorage.setItem('dialogues', JSON.stringify(recent));
}

// Get all saved dialogues
export function getDialogues(): GroupDialogue[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('dialogues');
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Get latest dialogue
export function getLatestDialogue(): GroupDialogue | null {
  const dialogues = getDialogues();
  return dialogues.length > 0 ? dialogues[dialogues.length - 1] : null;
}

// Format clone list for API prompt
export function formatClonesForPrompt(clones: CloneData[]): string {
  return clones.map((clone, idx) =>
    `${idx + 1}. ${clone.name} (just arrived from ${clone.destination})`
  ).join('\n');
}

// Create shareable clone URL
export function createShareableUrl(cloneId: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/hub?guestClone=${cloneId}`;
}

// Parse guest clone from URL
export function parseGuestCloneFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  return params.get('guestClone');
}
