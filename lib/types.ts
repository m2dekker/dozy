// Core type definitions for CloneWander

export type Budget = 'budget' | 'medium' | 'high' | 'luxury';

export type CloneStatus = 'traveling' | 'active' | 'finished';

export type JournalMoment = 'arrival' | 'mid-day' | 'evening';

export interface Clone {
  id: string;
  name: string;
  destination: string;
  travel_time_hours: number;
  activity_duration_days: number;
  preferences: string;
  budget: Budget;
  status: CloneStatus;
  departure_time: number; // Unix timestamp
  arrival_time: number; // Unix timestamp
  activity_end_time: number; // Unix timestamp
  created_at: number; // Unix timestamp
}

export interface JournalEntry {
  id: string;
  clone_id: string;
  clone_name: string;
  destination: string;
  moment: JournalMoment;
  message: string;
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
}
