// Core type definitions for CloneWander

export type Budget = 'budget' | 'medium' | 'high' | 'luxury';

export type CloneStatus = 'traveling' | 'active' | 'finished' | 'dismissed';

export type JournalMoment = 'arrival' | 'mid-day' | 'evening';

export type AdventurePack =
  | 'standard'
  | 'foodie-explorer'
  | 'art-culture'
  | 'night-owl'
  | 'budget-backpacker'
  | 'luxury-escape'
  | 'nature-seeker';

export interface Clone {
  id: string;
  name: string;
  destination: string;
  travel_time_hours: number;
  activity_duration_days: number;
  preferences: string;
  budget: Budget;
  pack: AdventurePack;
  isPremium: boolean;
  status: CloneStatus;
  departure_time: number; // Unix timestamp
  arrival_time: number; // Unix timestamp
  activity_end_time: number; // Unix timestamp
  created_at: number; // Unix timestamp
  last_journal_update?: number; // Unix timestamp of last journal entry
  total_spend: number; // Total estimated expenses in local currency
}

export interface JournalEntry {
  id: string;
  clone_id: string;
  clone_name: string;
  destination: string;
  moment: JournalMoment;
  message: string;
  cost: number; // Estimated cost for this activity
  timestamp: number; // Unix timestamp
  created_at: number; // Unix timestamp
}

// Form data for creating new clones
export interface CloneFormData {
  name: string;
  destination: string;
  travel_time_hours: number;
  activity_duration_days: number;
  preferences: string;
  budget: Budget;
  pack: AdventurePack;
  isPremium: boolean;
}

// Helper function to get pack details
export function getPackDetails(pack: AdventurePack): {
  name: string;
  description: string;
  isPremium: boolean;
} {
  const packs = {
    standard: {
      name: 'Standard Explorer',
      description: 'Balanced mix of activities for all travelers',
      isPremium: false,
    },
    'foodie-explorer': {
      name: 'Foodie Explorer',
      description: 'Culinary adventures, local markets, cooking experiences',
      isPremium: true,
    },
    'art-culture': {
      name: 'Art & Culture',
      description: 'Museums, galleries, historical sites, cultural events',
      isPremium: true,
    },
    'night-owl': {
      name: 'Night Owl',
      description: 'Nightlife, bars, clubs, evening entertainment',
      isPremium: true,
    },
    'budget-backpacker': {
      name: 'Budget Backpacker',
      description: 'Free attractions, street food, hostel culture',
      isPremium: true,
    },
    'luxury-escape': {
      name: 'Luxury Escape',
      description: 'Michelin dining, 5-star experiences, exclusive venues',
      isPremium: true,
    },
    'nature-seeker': {
      name: 'Nature Seeker',
      description: 'Parks, gardens, hiking, outdoor adventures',
      isPremium: true,
    },
  };
  return packs[pack];
}
