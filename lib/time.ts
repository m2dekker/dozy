/**
 * Time conversion utilities for CloneWander
 * 1 simulated day = 1 hour real-time
 * Updates: 2-3 per simulated day, spread across the hour
 */

export const REAL_TIME_PER_DAY_MS = 60 * 60 * 1000; // 1 hour in milliseconds
export const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Calculate the current simulated day and time of day for a clone
 */
export function getSimulatedTime(startTime: string, duration: number) {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  const elapsed = now - start;

  // Calculate which simulated day we're on (0-indexed)
  const currentDay = Math.floor(elapsed / REAL_TIME_PER_DAY_MS);

  // If trip is complete
  if (currentDay >= duration) {
    return {
      isComplete: true,
      currentDay: duration,
      timeOfDay: 'evening' as const,
      progress: 100,
    };
  }

  // Calculate progress through current day (0-1)
  const dayProgress = (elapsed % REAL_TIME_PER_DAY_MS) / REAL_TIME_PER_DAY_MS;

  // Determine time of day based on progress
  let timeOfDay: 'morning' | 'afternoon' | 'evening';
  if (dayProgress < 0.33) {
    timeOfDay = 'morning';
  } else if (dayProgress < 0.66) {
    timeOfDay = 'afternoon';
  } else {
    timeOfDay = 'evening';
  }

  return {
    isComplete: false,
    currentDay: currentDay + 1, // 1-indexed for display
    timeOfDay,
    progress: Math.round((currentDay / duration) * 100),
  };
}

/**
 * Get update schedule for a trip (when to send updates)
 * Returns array of timestamps when updates should be generated
 */
export function getUpdateSchedule(startTime: string, duration: number): Array<{
  timestamp: number;
  day: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}> {
  const start = new Date(startTime).getTime();
  const updates: Array<{
    timestamp: number;
    day: number;
    timeOfDay: 'morning' | 'afternoon' | 'evening';
  }> = [];

  for (let day = 0; day < duration; day++) {
    const dayStart = start + day * REAL_TIME_PER_DAY_MS;

    // Morning update (at 10 minutes into the hour)
    updates.push({
      timestamp: dayStart + 10 * 60 * 1000,
      day: day + 1,
      timeOfDay: 'morning',
    });

    // Afternoon update (at 30 minutes into the hour)
    updates.push({
      timestamp: dayStart + 30 * 60 * 1000,
      day: day + 1,
      timeOfDay: 'afternoon',
    });

    // Evening update (at 50 minutes into the hour)
    updates.push({
      timestamp: dayStart + 50 * 60 * 1000,
      day: day + 1,
      timeOfDay: 'evening',
    });
  }

  // Add final summary update
  updates.push({
    timestamp: start + duration * REAL_TIME_PER_DAY_MS,
    day: duration,
    timeOfDay: 'evening',
  });

  return updates;
}

/**
 * Check if an update should be generated now
 */
export function shouldGenerateUpdate(
  lastUpdateTime: number | null,
  startTime: string,
  duration: number
): boolean {
  const now = Date.now();
  const schedule = getUpdateSchedule(startTime, duration);

  // Find the next update that should have happened
  const nextUpdate = schedule.find((update) => {
    if (lastUpdateTime) {
      return update.timestamp > lastUpdateTime && update.timestamp <= now;
    }
    return update.timestamp <= now;
  });

  return !!nextUpdate;
}

/**
 * Get a random weather condition
 * TODO: Replace with actual weather API integration
 */
export function getWeather(): string {
  const conditions = ['sunny', 'partly cloudy', 'cloudy', 'rainy', 'clear'];
  return conditions[Math.floor(Math.random() * conditions.length)];
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(startTime: string, duration: number): string {
  const start = new Date(startTime).getTime();
  const end = start + duration * REAL_TIME_PER_DAY_MS;
  const now = Date.now();
  const remaining = end - now;

  if (remaining <= 0) {
    return 'Trip complete';
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}
