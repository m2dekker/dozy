'use client';

import { useState, useEffect } from 'react';
import { Clone, CloneFormData, JournalEntry } from '@/lib/types';
import { hoursToRealMs, daysToRealMs, getCurrentMoment, getNextUpdateTime, getTimeOfDay, getWeatherCondition } from '@/lib/time';
import { saveClone, getClones, updateCloneStatus, deleteClone, saveJournalEntry, generateId, updateCloneJournalTime, clearJournalForClone, updateCloneTotalSpend } from '@/lib/storage';
import CloneForm from '@/components/CloneForm';
import CloneList from '@/components/CloneList';

export default function Home() {
  const [clones, setClones] = useState<Clone[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isGenerating, setIsGenerating] = useState<Set<string>>(new Set());

  // Load clones on mount
  useEffect(() => {
    loadClones();
  }, []);

  // Update current time every second for smooth countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Poll for clone status changes and journal updates
  useEffect(() => {
    const interval = setInterval(() => {
      checkCloneStatuses();
    }, 10000); // Check every 10 seconds

    // Immediate check on mount
    checkCloneStatuses();

    return () => clearInterval(interval);
  }, [clones]);

  async function loadClones() {
    const loaded = await getClones();
    setClones(loaded);
  }

  async function handleCreateClone(formData: CloneFormData) {
    const now = Date.now();
    const travelDuration = hoursToRealMs(formData.travel_time_hours);
    const activityDuration = daysToRealMs(formData.activity_duration_days);

    const clone: Clone = {
      id: generateId(),
      name: 'Dart', // All clones are named Dart
      destination: formData.destination,
      travel_time_hours: formData.travel_time_hours,
      activity_duration_days: formData.activity_duration_days,
      preferences: formData.preferences,
      budget: formData.budget,
      pack: formData.pack,
      isPremium: formData.isPremium,
      status: 'traveling',
      departure_time: now,
      arrival_time: now + travelDuration,
      activity_end_time: now + travelDuration + activityDuration,
      created_at: now,
      total_spend: 0
    };

    await saveClone(clone);
    await loadClones();
  }

  async function handleDeleteClone(id: string) {
    if (confirm('Delete this clone? This will also clear their journal.')) {
      await clearJournalForClone(id);
      await deleteClone(id);
      await loadClones();
    }
  }

  async function handleDismissClone(id: string) {
    if (confirm('Dismiss this clone? They will stop generating updates.')) {
      await updateCloneStatus(id, 'dismissed');
      await loadClones();
    }
  }

  async function checkCloneStatuses() {
    const now = Date.now();
    let needsReload = false;

    for (const clone of clones) {
      // Skip dismissed clones
      if (clone.status === 'dismissed') continue;

      // Check if traveling clone has arrived
      if (clone.status === 'traveling' && now >= clone.arrival_time) {
        await updateCloneStatus(clone.id, 'active');
        await generateArrivalUpdate(clone);
        needsReload = true;
      }

      // Check if active clone needs a journal update
      if (clone.status === 'active' && now < clone.activity_end_time) {
        await checkForJournalUpdate(clone, now);
      }

      // Check if active clone has finished
      if (clone.status === 'active' && now >= clone.activity_end_time) {
        await updateCloneStatus(clone.id, 'finished');
        await generateTripSummary(clone);
        needsReload = true;
      }
    }

    if (needsReload) {
      await loadClones();
    }
  }

  async function generateArrivalUpdate(clone: Clone) {
    if (isGenerating.has(clone.id)) return;

    setIsGenerating(prev => new Set(prev).add(clone.id));

    try {
      const timeInfo = getTimeOfDay(clone.arrival_time, Date.now());
      const weather = getWeatherCondition();

      const response = await fetch('/api/generate-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloneName: clone.name,
          destination: clone.destination,
          travelTimeHours: clone.travel_time_hours,
          activityDurationDays: clone.activity_duration_days,
          preferences: clone.preferences,
          budget: clone.budget,
          moment: 'arrival',
          isSummary: false,
          timeOfDay: timeInfo,
          weather: weather
        })
      });

      if (response.ok) {
        const data = await response.json();
        const entry: JournalEntry = {
          id: generateId(),
          clone_id: clone.id,
          clone_name: clone.name,
          destination: clone.destination,
          moment: 'arrival',
          message: data.message,
          cost: data.cost || 0,
          timestamp: Date.now(),
          created_at: Date.now()
        };

        const saved = await saveJournalEntry(entry);
        if (saved) {
          // Update the clone's last journal time and total spend
          await updateCloneJournalTime(clone.id, Date.now());
          await updateCloneTotalSpend(clone.id, entry.cost);
        }
      }
    } catch (error) {
      console.error('Failed to generate arrival update:', error);
    } finally {
      setIsGenerating(prev => {
        const next = new Set(prev);
        next.delete(clone.id);
        return next;
      });
    }
  }

  async function checkForJournalUpdate(clone: Clone, now: number) {
    if (isGenerating.has(clone.id)) return;

    // Use last_journal_update from clone data, or arrival_time as fallback
    const lastUpdate = clone.last_journal_update || clone.arrival_time;
    const nextUpdate = getNextUpdateTime(lastUpdate);

    // Only generate if enough time has passed
    if (now >= nextUpdate) {
      await generateJournalUpdate(clone, now);
    }
  }

  async function generateJournalUpdate(clone: Clone, now: number) {
    if (isGenerating.has(clone.id)) return;

    setIsGenerating(prev => new Set(prev).add(clone.id));

    try {
      const moment = getCurrentMoment(clone.arrival_time, now);
      const timeInfo = getTimeOfDay(clone.arrival_time, now);
      const weather = getWeatherCondition();

      const response = await fetch('/api/generate-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloneName: clone.name,
          destination: clone.destination,
          travelTimeHours: clone.travel_time_hours,
          activityDurationDays: clone.activity_duration_days,
          preferences: clone.preferences,
          budget: clone.budget,
          moment,
          isSummary: false,
          timeOfDay: timeInfo,
          weather: weather
        })
      });

      if (response.ok) {
        const data = await response.json();
        const entry: JournalEntry = {
          id: generateId(),
          clone_id: clone.id,
          clone_name: clone.name,
          destination: clone.destination,
          moment,
          message: data.message,
          cost: data.cost || 0,
          timestamp: now,
          created_at: now
        };

        const saved = await saveJournalEntry(entry);
        if (saved) {
          // Update the clone's last journal time and total spend
          await updateCloneJournalTime(clone.id, now);
          await updateCloneTotalSpend(clone.id, entry.cost);
        }
      }
    } catch (error) {
      console.error('Failed to generate journal update:', error);
    } finally {
      setIsGenerating(prev => {
        const next = new Set(prev);
        next.delete(clone.id);
        return next;
      });
    }
  }

  async function generateTripSummary(clone: Clone) {
    if (isGenerating.has(clone.id)) return;

    setIsGenerating(prev => new Set(prev).add(clone.id));

    try {
      const response = await fetch('/api/generate-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloneName: clone.name,
          destination: clone.destination,
          activityDurationDays: clone.activity_duration_days,
          budget: clone.budget,
          isSummary: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        const entry: JournalEntry = {
          id: generateId(),
          clone_id: clone.id,
          clone_name: clone.name,
          destination: clone.destination,
          moment: 'evening', // Use evening for summary
          message: `Trip Summary: ${data.message}`,
          cost: 0, // No additional cost for summary
          timestamp: Date.now(),
          created_at: Date.now()
        };

        await saveJournalEntry(entry);
        await updateCloneJournalTime(clone.id, Date.now());
      }
    } catch (error) {
      console.error('Failed to generate trip summary:', error);
    } finally {
      setIsGenerating(prev => {
        const next = new Set(prev);
        next.delete(clone.id);
        return next;
      });
    }
  }

  const activeClones = clones.filter(c => c.status !== 'finished' && c.status !== 'dismissed');

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
          CloneWander
        </h1>
        <p className="text-lg text-gray-700">
          Send AI clones on adventures • Get personalized recommendations • Track expenses • Experience parallel lives
        </p>
      </header>

      <CloneForm
        onSubmit={handleCreateClone}
        activeCloneCount={activeClones.length}
      />

      <CloneList
        clones={clones}
        currentTime={currentTime}
        onDelete={handleDeleteClone}
        onDismiss={handleDismissClone}
      />
    </main>
  );
}
