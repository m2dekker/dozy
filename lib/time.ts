// Time acceleration utilities for CloneWander
// All times are accelerated 1600x for testing (1 minute total journey)

const ACCELERATION_FACTOR = 1600;

/**
 * Convert user-input hours to real-time milliseconds (1600x faster)
 * Example: 2 hours travel = ~4.5 seconds real-time
 */
export function hoursToRealMs(hours: number): number {
  return (hours * 60 * 60 * 1000) / ACCELERATION_FACTOR;
}

/**
 * Convert user-input days to real-time milliseconds (1600x faster)
 * Example: 1 day activity = ~54 seconds real-time
 */
export function daysToRealMs(days: number): number {
  return (days * 24 * 60 * 60 * 1000) / ACCELERATION_FACTOR;
}

/**
 * Format milliseconds remaining into human-readable string
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Now';

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Format timestamp to readable date/time
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Calculate when next journal update should occur
 * Updates happen every 3-5 hours (accelerated) for realistic daily routine
 */
export function getNextUpdateTime(lastUpdateTime: number): number {
  // Random interval between 3-5 hours (accelerated)
  const minInterval = hoursToRealMs(3);
  const maxInterval = hoursToRealMs(5);
  const randomInterval = minInterval + Math.random() * (maxInterval - minInterval);

  return lastUpdateTime + randomInterval;
}

/**
 * Determine which moment of the day it is for journal entry
 */
export function getCurrentMoment(activityStartTime: number, currentTime: number): 'arrival' | 'mid-day' | 'evening' {
  const timeInActivity = currentTime - activityStartTime;
  const acceleratedHours = (timeInActivity / (60 * 60 * 1000)) * ACCELERATION_FACTOR;

  const hourOfDay = acceleratedHours % 24;

  if (hourOfDay < 12) return 'arrival';
  if (hourOfDay < 17) return 'mid-day';
  return 'evening';
}

/**
 * Get detailed time-of-day information for realistic daily routines
 */
export function getTimeOfDay(activityStartTime: number, currentTime: number): {
  hour: number;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  description: string;
} {
  const timeInActivity = currentTime - activityStartTime;
  const acceleratedHours = (timeInActivity / (60 * 60 * 1000)) * ACCELERATION_FACTOR;
  const hourOfDay = Math.floor(acceleratedHours % 24);

  let period: 'morning' | 'afternoon' | 'evening' | 'night';
  let description: string;

  if (hourOfDay >= 6 && hourOfDay < 12) {
    period = 'morning';
    description = 'morning (breakfast, museums, cultural sites)';
  } else if (hourOfDay >= 12 && hourOfDay < 17) {
    period = 'afternoon';
    description = 'afternoon (lunch, outdoor activities, shopping)';
  } else if (hourOfDay >= 17 && hourOfDay < 22) {
    period = 'evening';
    description = 'evening (dinner, nightlife, entertainment)';
  } else {
    period = 'night';
    description = 'late night (bars, clubs, night markets)';
  }

  return { hour: hourOfDay, period, description };
}

/**
 * Get random weather condition for realistic variety
 */
export function getWeatherCondition(): {
  condition: string;
  temp: number;
  activityType: string;
} {
  const conditions = [
    { condition: 'sunny', temp: 22, activityType: 'outdoor activities, parks, walking tours' },
    { condition: 'partly cloudy', temp: 18, activityType: 'mix of indoor and outdoor activities' },
    { condition: 'overcast', temp: 16, activityType: 'indoor museums, cafes, covered markets' },
    { condition: 'light rain', temp: 14, activityType: 'museums, galleries, indoor attractions' },
    { condition: 'clear', temp: 20, activityType: 'outdoor sightseeing, parks, terraces' },
    { condition: 'warm', temp: 26, activityType: 'air-conditioned museums, shaded parks, indoor venues' }
  ];

  return conditions[Math.floor(Math.random() * conditions.length)];
}
