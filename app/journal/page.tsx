'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClones } from '@/lib/travel';
import {
  getJournalEntries,
  getCloneJournalEntries,
  saveJournalEntry,
  getCloneBio,
  getNextMoment,
  getTodayEntryCount,
  generateJournalEntryId,
  JournalEntry,
  deleteCloneJournal
} from '@/lib/journal';
import JournalFeed from '@/components/JournalFeed';
import BioForm from '@/components/BioForm';

export default function JournalPage() {
  const router = useRouter();
  const [clones, setClones] = useState<any[]>([]);
  const [selectedCloneId, setSelectedCloneId] = useState<string | 'all'>('all');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'arrival' | 'mid-activity' | 'end-of-day'>('all');

  // Load clones and journal entries
  useEffect(() => {
    loadData();

    // Poll for new updates every 2 hours (7200000ms)
    // For demo purposes, using 5 minutes (300000ms)
    const pollInterval = setInterval(() => {
      checkAndGenerateUpdates();
    }, 300000); // 5 minutes

    // Initial check after 10 seconds
    const initialTimeout = setTimeout(() => {
      checkAndGenerateUpdates();
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(initialTimeout);
    };
  }, []);

  const loadData = () => {
    const allClones = getClones();
    setClones(allClones);

    const entries = getJournalEntries();
    setJournalEntries(entries);
  };

  const checkAndGenerateUpdates = async () => {
    const allClones = getClones();

    for (const clone of allClones) {
      // Only generate for clones that have arrived
      if (!clone.hasArrived) continue;

      // Check if clone has a bio
      const bio = getCloneBio(clone.id);
      if (!bio) continue;

      // Check daily limit
      const todayCount = getTodayEntryCount(clone.id);
      if (todayCount >= 10) continue;

      // Determine next moment
      const nextMoment = getNextMoment(clone.id, clone.hasArrived);
      if (!nextMoment) continue;

      // Generate update
      await generateUpdate(clone, nextMoment, bio.bio, bio.aiModel);
    }
  };

  const generateUpdate = async (
    clone: any,
    moment: string,
    bio: string,
    aiModel: string
  ) => {
    try {
      const response = await fetch('/api/generate-journal-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloneName: clone.name,
          destination: clone.destination,
          bio,
          moment,
          aiModel
        })
      });

      if (!response.ok) {
        console.error('Failed to generate journal update');
        return;
      }

      const data = await response.json();

      const entry: JournalEntry = {
        id: generateJournalEntryId(),
        cloneId: clone.id,
        cloneName: clone.name,
        destination: clone.destination,
        moment: moment as any,
        message: data.message,
        timestamp: Date.now(),
        aiModel: data.usedModel
      };

      saveJournalEntry(entry);
      loadData();
    } catch (error) {
      console.error('Error generating journal update:', error);
    }
  };

  const handleManualGenerate = async (cloneId: string) => {
    const clone = clones.find(c => c.id === cloneId);
    if (!clone) return;

    if (!clone.hasArrived) {
      alert('This clone hasn\'t arrived yet!');
      return;
    }

    const bio = getCloneBio(cloneId);
    if (!bio) {
      alert('Please set a personality for this clone first!');
      return;
    }

    const todayCount = getTodayEntryCount(cloneId);
    if (todayCount >= 10) {
      alert('Daily limit reached (10 updates per day)');
      return;
    }

    const nextMoment = getNextMoment(cloneId, clone.hasArrived);
    if (!nextMoment) {
      alert('All moments logged for today! Check back tomorrow.');
      return;
    }

    setIsGenerating(true);
    await generateUpdate(clone, nextMoment, bio.bio, bio.aiModel);
    setIsGenerating(false);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!confirm('Delete this journal entry?')) return;

    const entries = getJournalEntries().filter(e => e.id !== entryId);
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    loadData();
  };

  const handleDeleteCloneJournal = (cloneId: string) => {
    if (!confirm('Delete all journal entries and personality for this clone?')) return;

    deleteCloneJournal(cloneId);
    loadData();
  };

  // Filter entries based on selected clone and moment
  const filteredEntries = journalEntries.filter(entry => {
    const cloneMatch = selectedCloneId === 'all' || entry.cloneId === selectedCloneId;
    const momentMatch = filter === 'all' || entry.moment === filter;
    return cloneMatch && momentMatch;
  });

  const selectedClone = selectedCloneId !== 'all' ? clones.find(c => c.id === selectedCloneId) : null;

  return (
    <div className="journal-page">
      <div className="journal-header">
        <button onClick={() => router.push('/')} className="btn btn-back">
          ← Back
        </button>
        <div className="journal-title-section">
          <h1>📔 Parallel Life Journal</h1>
          <p>Your clones document their travels in real-time</p>
        </div>
      </div>

      {/* Clone Selector */}
      <div className="journal-controls">
        <div className="control-group">
          <label>View Journal For:</label>
          <select
            value={selectedCloneId}
            onChange={(e) => setSelectedCloneId(e.target.value)}
            className="clone-selector"
          >
            <option value="all">All Clones ({journalEntries.length} entries)</option>
            {clones.map(clone => {
              const count = getCloneJournalEntries(clone.id).length;
              return (
                <option key={clone.id} value={clone.id}>
                  {clone.name} - {clone.destination} ({count} entries)
                </option>
              );
            })}
          </select>
        </div>

        <div className="control-group">
          <label>Filter by Moment:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="moment-filter"
          >
            <option value="all">All Moments</option>
            <option value="arrival">✈️ Arrivals</option>
            <option value="mid-activity">🎯 Mid-Activity</option>
            <option value="end-of-day">🌙 End of Day</option>
          </select>
        </div>
      </div>

      {/* Bio Form for Selected Clone */}
      {selectedClone && (
        <div className="clone-journal-section">
          <BioForm
            cloneId={selectedClone.id}
            cloneName={selectedClone.name}
            onSave={loadData}
          />

          <div className="manual-generate-section">
            <button
              onClick={() => handleManualGenerate(selectedClone.id)}
              disabled={isGenerating || !selectedClone.hasArrived}
              className="btn btn-primary"
            >
              {isGenerating ? '✍️ Writing...' : '✍️ Generate Update Now'}
            </button>

            <button
              onClick={() => handleDeleteCloneJournal(selectedClone.id)}
              className="btn btn-danger"
            >
              🗑️ Clear All Entries
            </button>

            <div className="generate-info">
              <small>
                {!selectedClone.hasArrived && '⏳ Waiting for arrival...'}
                {selectedClone.hasArrived && getTodayEntryCount(selectedClone.id) >= 10 && '✅ Daily limit reached (10/10)'}
                {selectedClone.hasArrived && getTodayEntryCount(selectedClone.id) < 10 &&
                  `📊 Today: ${getTodayEntryCount(selectedClone.id)}/10 updates`}
              </small>
            </div>
          </div>
        </div>
      )}

      {/* No clones state */}
      {clones.length === 0 && (
        <div className="no-clones-message">
          <h3>🚀 No Clones Yet</h3>
          <p>Go to the main page to create and send your first clone!</p>
          <button onClick={() => router.push('/')} className="btn btn-primary">
            Create Clone
          </button>
        </div>
      )}

      {/* Clones without bios */}
      {clones.length > 0 && selectedCloneId === 'all' && (
        <div className="clones-summary">
          <h3>📋 Your Clones</h3>
          <div className="clones-grid">
            {clones.map(clone => {
              const bio = getCloneBio(clone.id);
              const entryCount = getCloneJournalEntries(clone.id).length;
              const todayCount = getTodayEntryCount(clone.id);

              return (
                <div key={clone.id} className="clone-card">
                  <div className="clone-card-header">
                    <h4>{clone.name}</h4>
                    <span className={`status-badge ${clone.hasArrived ? 'arrived' : 'traveling'}`}>
                      {clone.hasArrived ? '✅ Arrived' : '✈️ Traveling'}
                    </span>
                  </div>
                  <div className="clone-card-body">
                    <p className="destination">📍 {clone.destination}</p>
                    <p className="entry-stats">
                      📝 {entryCount} entries • Today: {todayCount}/10
                    </p>
                    {!bio && (
                      <p className="warning-text">⚠️ No personality set</p>
                    )}
                    {bio && (
                      <p className="bio-preview">{bio.bio.substring(0, 60)}...</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedCloneId(clone.id)}
                    className="btn btn-small btn-primary"
                  >
                    View Journal
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Journal Feed */}
      <div className="journal-feed-section">
        <h2>
          {selectedCloneId === 'all'
            ? `All Journal Entries (${filteredEntries.length})`
            : `${selectedClone?.name}'s Journal (${filteredEntries.length})`}
        </h2>
        <JournalFeed
          entries={filteredEntries}
          onDeleteEntry={handleDeleteEntry}
        />
      </div>
    </div>
  );
}
