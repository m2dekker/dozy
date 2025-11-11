'use client';

import { useState, useEffect, useRef } from 'react';
import { Clone, CloneFormData, JournalEntry } from '@/lib/types';
import { hoursToRealMs, daysToRealMs, getCurrentMoment, getNextUpdateTime } from '@/lib/time';
import { saveClone, getClones, updateCloneStatus, deleteClone, saveJournalEntry, generateId } from '@/lib/storage';
import CloneForm from '@/components/CloneForm';
import CloneList from '@/components/CloneList';

export default function Home() {
  const [clones, setClones] = useState<Clone[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isGenerating, setIsGenerating] = useState<Set<string>>(new Set());
  const lastUpdateCheck = useRef<Record<string, number>>({});

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
      name: formData.name,
      destination: formData.destination,
      travel_time_hours: formData.travel_time_hours,
      activity_duration_days: formData.activity_duration_days,
      preferences: formData.preferences,
      budget: formData.budget,
      status: 'traveling',
      departure_time: now,
      arrival_time: now + travelDuration,
      activity_end_time: now + travelDuration + activityDuration,
      created_at: now
    };

    await saveClone(clone);
    await loadClones();
  }

  async function handleDeleteClone(id: string) {
    if (confirm('Delete this clone? This will also clear their journal.')) {
      await deleteClone(id);
      await loadClones();
    }
  }

  async function checkCloneStatuses() {
    const now = Date.now();
    let needsReload = false;

    for (const clone of clones) {
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
          moment: 'arrival'
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
          timestamp: Date.now(),
          created_at: Date.now()
        };

        await saveJournalEntry(entry);
        lastUpdateCheck.current[clone.id] = Date.now();
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

    const lastCheck = lastUpdateCheck.current[clone.id] || clone.arrival_time;
    const nextUpdate = getNextUpdateTime(lastCheck);

    if (now >= nextUpdate) {
      await generateJournalUpdate(clone, now);
    }
  }

  async function generateJournalUpdate(clone: Clone, now: number) {
    if (isGenerating.has(clone.id)) return;

    setIsGenerating(prev => new Set(prev).add(clone.id));

    try {
      const moment = getCurrentMoment(clone.arrival_time, now);

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
          moment
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
          timestamp: now,
          created_at: now
        };

        await saveJournalEntry(entry);
        lastUpdateCheck.current[clone.id] = now;
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

  const activeClones = clones.filter(c => c.status !== 'finished');

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
          CloneWander
        </h1>
        <p className="text-lg text-gray-700">
          Send AI clones on adventures • Get personalized recommendations • Experience parallel lives
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
      />
    </main>
  );
}
