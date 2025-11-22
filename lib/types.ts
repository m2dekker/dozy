export type Personality = 'efficient' | 'luxurious' | 'budget' | 'adventurous';

export interface CloneConfig {
  personality: Personality;
  budget: number;
  duration: string;
  destination: string;
}

export interface Activity {
  time: string;
  activity: string;
  location: string;
  cost: number;
  transport: string;
  notes: string;
}

export interface CostBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  misc: number;
  total: number;
}

export interface Mission {
  id: string;
  config: CloneConfig;
  overview: string;
  timeline: Activity[];
  costs: CostBreakdown;
  tips: string[];
  improvements: string[];
  createdAt: string;
  premium?: boolean;
}

export const PERSONALITIES: { value: Personality; label: string; description: string }[] = [
  { value: 'efficient', label: 'Efficient', description: 'Optimize logistics & time' },
  { value: 'luxurious', label: 'Luxurious', description: 'Premium experiences' },
  { value: 'budget', label: 'Budget', description: 'Maximize value' },
  { value: 'adventurous', label: 'Adventurous', description: 'Unique experiences' },
];

export const DURATIONS = [
  { value: '4h', label: '4 hours' },
  { value: '8h', label: '8 hours' },
  { value: '1d', label: '1 day' },
  { value: '2d', label: '2 days' },
  { value: '3d', label: '3 days' },
  { value: '1w', label: '1 week' },
];
