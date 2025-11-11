// Simple travel time estimation based on destination
// This is a rough approximation for the prototype

interface TravelEstimate {
  hours: number;
  category: 'local' | 'regional' | 'international' | 'intercontinental';
}

// Hardcoded estimates for common destinations and patterns
const destinationEstimates: Record<string, TravelEstimate> = {
  // Local/nearby (1-2 hours)
  'nearby': { hours: 0.02, category: 'local' }, // 1 minute for testing
  'downtown': { hours: 0.02, category: 'local' },
  'airport': { hours: 0.02, category: 'local' },

  // Cities/Regional (3-6 hours)
  'amsterdam': { hours: 0.05, category: 'regional' }, // 3 minutes for testing
  'brussels': { hours: 0.05, category: 'regional' },
  'paris': { hours: 0.05, category: 'regional' },
  'london': { hours: 0.05, category: 'regional' },
  'berlin': { hours: 0.05, category: 'regional' },

  // International Europe/nearby (6-10 hours)
  'spain': { hours: 0.08, category: 'international' }, // 5 minutes for testing
  'italy': { hours: 0.08, category: 'international' },
  'rome': { hours: 0.08, category: 'international' },
  'barcelona': { hours: 0.08, category: 'international' },
  'madrid': { hours: 0.08, category: 'international' },

  // Intercontinental (10-16 hours)
  'thailand': { hours: 0.15, category: 'intercontinental' }, // 9 minutes for testing
  'bangkok': { hours: 0.15, category: 'intercontinental' },
  'japan': { hours: 0.15, category: 'intercontinental' },
  'tokyo': { hours: 0.15, category: 'intercontinental' },
  'new york': { hours: 0.15, category: 'intercontinental' },
  'newyork': { hours: 0.15, category: 'intercontinental' },
  'usa': { hours: 0.15, category: 'intercontinental' },
  'america': { hours: 0.15, category: 'intercontinental' },
  'australia': { hours: 0.2, category: 'intercontinental' },
  'sydney': { hours: 0.2, category: 'intercontinental' },
  'dubai': { hours: 0.12, category: 'intercontinental' },
  'singapore': { hours: 0.15, category: 'intercontinental' },
  'china': { hours: 0.15, category: 'intercontinental' },
  'beijing': { hours: 0.15, category: 'intercontinental' },
  'india': { hours: 0.13, category: 'intercontinental' },
  'mumbai': { hours: 0.13, category: 'intercontinental' },
};

export function estimateTravelTime(destination: string): TravelEstimate {
  const normalized = destination.toLowerCase().trim();

  // Check for exact match
  if (destinationEstimates[normalized]) {
    return destinationEstimates[normalized];
  }

  // Check for partial matches
  for (const [key, estimate] of Object.entries(destinationEstimates)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return estimate;
    }
  }

  // Default to regional if unknown (medium distance)
  return { hours: 0.05, category: 'regional' }; // 3 minutes for testing
}

export function formatTimeRemaining(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);

  if (totalSeconds < 0) return 'Arrived!';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export interface CloneData {
  id: string;
  name: string;
  destination: string;
  departureTime: number;
  arrivalTime: number;
  category: string;
  arrivalMessage?: string;
  hasArrived?: boolean;
}

function generateCloneId(): string {
  return `clone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createClone(name: string, destination: string, travelHours: number, category: string): CloneData {
  const departureTime = Date.now();
  const arrivalTime = departureTime + (travelHours * 60 * 60 * 1000);

  return {
    id: generateCloneId(),
    name,
    destination,
    departureTime,
    arrivalTime,
    category,
    hasArrived: false
  };
}

export function saveClones(clones: CloneData[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('clones', JSON.stringify(clones));
  }
}

export function getClones(): CloneData[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('clones');
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addClone(clone: CloneData): CloneData[] {
  const clones = getClones();
  clones.push(clone);
  saveClones(clones);
  return clones;
}

export function updateClone(id: string, updates: Partial<CloneData>): CloneData[] {
  const clones = getClones();
  const index = clones.findIndex(c => c.id === id);

  if (index !== -1) {
    clones[index] = { ...clones[index], ...updates };
    saveClones(clones);
  }

  return clones;
}

export function removeClone(id: string): CloneData[] {
  const clones = getClones().filter(c => c.id !== id);
  saveClones(clones);
  return clones;
}

export function clearAllClones(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('clones');
  }
}

export function getActiveClones(): CloneData[] {
  return getClones().filter(clone => !clone.hasArrived);
}

export function getArrivedClones(): CloneData[] {
  return getClones().filter(clone => clone.hasArrived);
}
