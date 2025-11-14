'use client';

import { useState, useEffect } from 'react';
import CloneForm from '@/components/CloneForm';
import ActiveClones from '@/components/ActiveClones';
import { Clone } from '@/lib/types';
import { getClones, getJournalEntries, createJournalEntry, updateClone } from '@/lib/supabase';
import { getSimulatedTime, getUpdateSchedule, POLL_INTERVAL_MS } from '@/lib/time';

export default function Home() {
  const [clones, setClones] = useState<Clone[]>([]);
  const [loading, setLoading] = useState(true);

  // Load clones on mount
  useEffect(() => {
    loadClones();
  }, []);

  // Set up polling for updates
  useEffect(() => {
    const interval = setInterval(() => {
      checkForUpdates();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [clones]);

  const loadClones = async () => {
    try {
      const allClones = await getClones();
      setClones(allClones);
    } catch (error) {
      console.error('Error loading clones:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForUpdates = async () => {
    try {
      const allClones = await getClones();
      const activeClones = allClones.filter((c) => c.status === 'active');

      for (const clone of activeClones) {
        const simTime = getSimulatedTime(clone.startTime, clone.duration);

        // Check if trip is complete
        if (simTime.isComplete) {
          // Generate final summary if not already done
          const entries = await getJournalEntries(clone.id);
          const hasFinalSummary = entries.some(
            (e) => e.message.includes('trip') && e.message.includes('summary')
          );

          if (!hasFinalSummary) {
            await generateFinalSummary(clone, entries);
          }

          // Mark clone as completed
          await updateClone(clone.id, { status: 'completed' });
          continue;
        }

        // Check if we need to generate an update
        const schedule = getUpdateSchedule(clone.startTime, clone.duration);
        const entries = await getJournalEntries(clone.id);

        // Find next scheduled update that hasn't been generated yet
        const now = Date.now();
        const nextUpdate = schedule.find((update) => {
          const alreadyGenerated = entries.some(
            (entry) =>
              entry.dayNumber === update.day && entry.timeOfDay === update.timeOfDay
          );
          return !alreadyGenerated && update.timestamp <= now;
        });

        if (nextUpdate) {
          await generateUpdate(clone, nextUpdate.day, nextUpdate.timeOfDay, entries);
        }
      }

      // Reload clones to reflect any changes
      await loadClones();
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const generateUpdate = async (
    clone: Clone,
    dayNumber: number,
    timeOfDay: 'morning' | 'afternoon' | 'evening',
    existingEntries: any[]
  ) => {
    try {
      // Get previous locations from existing entries
      const previousLocations = existingEntries
        .map((e) => e.route)
        .filter(Boolean)
        .slice(0, 5);

      // Call API to generate update
      const response = await fetch('/api/generate-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          travelerType: clone.travelerType,
          destination: clone.destination,
          duration: clone.duration,
          categories: clone.categories,
          timeOfDay,
          dayNumber,
          isFinalSummary: false,
          totalSpend: clone.totalSpend,
          previousLocations,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate update');

      const data = await response.json();

      // Calculate daily spend for this day
      const todayEntries = existingEntries.filter((e) => e.dayNumber === dayNumber);
      const dailySpend = todayEntries.reduce((sum, e) => sum + e.cost, 0) + data.cost;
      const totalSpend = clone.totalSpend + data.cost;

      // Create journal entry
      await createJournalEntry({
        cloneId: clone.id,
        timestamp: new Date().toISOString(),
        message: data.message,
        cost: data.cost,
        route: data.location,
        transportation: data.transportation,
        dailySpend,
        totalSpend,
        dayNumber,
        timeOfDay,
      });

      // Update clone's total spend
      await updateClone(clone.id, { totalSpend });
    } catch (error) {
      console.error('Error generating update:', error);
    }
  };

  const generateFinalSummary = async (clone: Clone, entries: any[]) => {
    try {
      const locations = [...new Set(entries.map((e) => e.route).filter(Boolean))];

      const response = await fetch('/api/generate-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          travelerType: clone.travelerType,
          destination: clone.destination,
          duration: clone.duration,
          categories: clone.categories,
          timeOfDay: 'evening',
          dayNumber: clone.duration,
          isFinalSummary: true,
          totalSpend: clone.totalSpend,
          previousLocations: locations,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate summary');

      const data = await response.json();

      await createJournalEntry({
        cloneId: clone.id,
        timestamp: new Date().toISOString(),
        message: data.message,
        cost: 0,
        route: 'Trip Complete',
        transportation: 'N/A',
        dailySpend: 0,
        totalSpend: clone.totalSpend,
        dayNumber: clone.duration,
        timeOfDay: 'evening',
      });
    } catch (error) {
      console.error('Error generating final summary:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CloneWander...</p>
        </div>
      </div>
    );
  }

  const activeClones = clones.filter((c) => c.status === 'active');

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            🌍 CloneWander
          </h1>
          <p className="text-gray-600">
            Send AI clones on adventures and get real-time travel updates
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Time accelerated: 1 simulated day = 1 hour real-time
          </p>
        </header>

        {/* Clone Form */}
        <CloneForm
          onCloneCreated={loadClones}
          activeCloneCount={activeClones.length}
        />

        {/* Active Clones */}
        <ActiveClones clones={clones} />

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-600">
          <p>
            Updates poll every 5 minutes • 2-3 updates per simulated day •{' '}
            <a href="/journal" className="text-blue-600 hover:underline">
              View Full Journal
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
