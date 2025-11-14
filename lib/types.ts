export type TravelerType = 'budget' | 'normal' | 'luxury';

export type Category =
  | 'Food'
  | 'History'
  | 'Entertainment'
  | 'Hiking'
  | 'Adventure'
  | 'Culture'
  | 'Relaxation'
  | 'Shopping'
  | 'Nightlife';

export const TRAVELER_PROFILES = {
  budget: {
    name: 'Lila',
    type: 'budget' as TravelerType,
    description: 'Budget traveler - cheap eats, hostels, public transport',
    transportModes: ['bus', 'metro', 'walking', 'bike'],
    costRange: { min: 5, max: 20 },
    currency: '€',
  },
  normal: {
    name: 'Evan',
    type: 'normal' as TravelerType,
    description: 'Normal traveler - mid-range hotels, balanced activities, taxis',
    transportModes: ['taxi', 'metro', 'walking', 'rental car'],
    costRange: { min: 20, max: 50 },
    currency: '€',
  },
  luxury: {
    name: 'Sofia',
    type: 'luxury' as TravelerType,
    description: 'Luxury traveler - 5-star dining, private tours, private cars',
    transportModes: ['private car', 'Uber', 'limousine', 'helicopter'],
    costRange: { min: 100, max: 500 },
    currency: '€',
  },
} as const;

export const CATEGORIES: Category[] = [
  'Food',
  'History',
  'Entertainment',
  'Hiking',
  'Adventure',
  'Culture',
  'Relaxation',
  'Shopping',
  'Nightlife',
];

export interface Clone {
  id: string;
  travelerName: string;
  travelerType: TravelerType;
  destination: string;
  duration: number; // in days
  categories: Category[];
  status: 'active' | 'completed';
  totalSpend: number;
  startTime: string; // ISO timestamp
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  cloneId: string;
  timestamp: string;
  message: string;
  cost: number;
  route: string;
  transportation: string;
  dailySpend: number;
  totalSpend: number;
  dayNumber: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}
