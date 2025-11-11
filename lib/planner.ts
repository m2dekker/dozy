export interface TravelPreferences {
  food: boolean;
  culture: boolean;
  adventure: boolean;
  lowCrowds: boolean;
  shopping: boolean;
  nightlife: boolean;
  nature: boolean;
  history: boolean;
}

export interface Activity {
  time: string;
  title: string;
  location: string;
  description: string;
  tip?: string;
  placeId?: string;
}

export interface DayItinerary {
  day: number;
  date?: string;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
}

export interface TravelPlan {
  id: string;
  destination: string;
  tripLength: number;
  preferences: TravelPreferences;
  scoutName: string;
  itinerary: DayItinerary[];
  summary: string;
  voiceUrl?: string;
  imageUrls?: string[];
  createdAt: number;
  status: 'scouting' | 'ready' | 'failed';
}

export interface ScoutClone {
  id: string;
  name: string;
  destination: string;
  status: 'scouting' | 'ready';
  planId: string;
}

// Generate plan ID
export function generatePlanId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Save plan to localStorage
export function savePlan(plan: TravelPlan): void {
  if (typeof window === 'undefined') return;

  const plans = getPlans();
  const existing = plans.findIndex(p => p.id === plan.id);

  if (existing >= 0) {
    plans[existing] = plan;
  } else {
    plans.push(plan);
  }

  // Keep only last 20 plans
  const recent = plans.slice(-20);
  localStorage.setItem('travelPlans', JSON.stringify(recent));
}

// Get all plans
export function getPlans(): TravelPlan[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('travelPlans');
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Get plan by ID
export function getPlanById(id: string): TravelPlan | null {
  const plans = getPlans();
  return plans.find(p => p.id === id) || null;
}

// Get active scouts
export function getActiveScouts(): ScoutClone[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('activeScouts');
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Save scout
export function saveScout(scout: ScoutClone): void {
  if (typeof window === 'undefined') return;

  const scouts = getActiveScouts();
  scouts.push(scout);

  // Limit to 3 active scouts
  const limited = scouts.slice(-3);
  localStorage.setItem('activeScouts', JSON.stringify(limited));
}

// Remove scout
export function removeScout(id: string): void {
  if (typeof window === 'undefined') return;

  const scouts = getActiveScouts().filter(s => s.id !== id);
  localStorage.setItem('activeScouts', JSON.stringify(scouts));
}

// Update scout status
export function updateScout(id: string, status: 'scouting' | 'ready'): void {
  if (typeof window === 'undefined') return;

  const scouts = getActiveScouts();
  const scout = scouts.find(s => s.id === id);

  if (scout) {
    scout.status = status;
    localStorage.setItem('activeScouts', JSON.stringify(scouts));
  }
}

// Format preferences for display
export function formatPreferences(prefs: TravelPreferences): string[] {
  const labels: Record<keyof TravelPreferences, string> = {
    food: 'Food & Dining',
    culture: 'Culture & Arts',
    adventure: 'Adventure',
    lowCrowds: 'Low Crowds',
    shopping: 'Shopping',
    nightlife: 'Nightlife',
    nature: 'Nature & Parks',
    history: 'Historical Sites'
  };

  return Object.entries(prefs)
    .filter(([_, value]) => value)
    .map(([key]) => labels[key as keyof TravelPreferences]);
}

// Create shareable URL
export function createShareableUrl(planId: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/plan/${planId}`;
}

// Generate scout name
export function generateScoutName(destination: string): string {
  const prefixes = ['Scout', 'Explorer', 'Navigator', 'Pathfinder', 'Guide'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix} ${destination.split(' ')[0]}`;
}
