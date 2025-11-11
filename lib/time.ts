// Time acceleration utilities for CloneWander
// All times are accelerated 10x for testing

const ACCELERATION_FACTOR = 10;

/**
 * Convert user-input hours to real-time milliseconds (10x faster)
 * Example: 12 hours travel = 72 minutes real-time
 */
export function hoursToRealMs(hours: number): number {
  return (hours * 60 * 60 * 1000) / ACCELERATION_FACTOR;
}

/**
 * Convert user-input days to real-time milliseconds (10x faster)
 * Example: 3 days activity = 7.2 hours real-time
 */
export function daysToRealMs(days: number): number {
  return (days * 24 * 60 * 60 * 1000) / ACCELERATION_FACTOR;
}

/**
 * Format milliseconds remaining into human-readable string
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Now';

  const totalMinutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
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
 * Updates happen every 2-4 hours (accelerated) = 12-24 minutes real-time
 */
export function getNextUpdateTime(lastUpdateTime: number): number {
  // Random interval between 2-4 hours (accelerated)
  const minInterval = hoursToRealMs(2);
  const maxInterval = hoursToRealMs(4);
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
  if (hourOfDay < 18) return 'mid-day';
  return 'evening';
}
