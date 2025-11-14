'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import JournalFeed from '@/components/JournalFeed';
import { Clone, JournalEntry } from '@/lib/types';
import { getClones, getJournalEntries } from '@/lib/supabase';
import { POLL_INTERVAL_MS } from '@/lib/time';

export default function JournalPage() {
  const [clones, setClones] = useState<Clone[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCloneId, setFilterCloneId] = useState<string>('');

  useEffect(() => {
    loadData();

    // Poll for new entries
    const interval = setInterval(loadData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [filterCloneId]);

  const loadData = async () => {
    try {
      const [allClones, allEntries] = await Promise.all([
        getClones(),
        getJournalEntries(filterCloneId || undefined),
      ]);

      setClones(allClones);
      setEntries(allEntries);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading journal...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            📔 Travel Journal
          </h1>
          <p className="text-gray-600">
            Live updates from your traveling clones
          </p>
        </header>

        {/* Filter */}
        {clones.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <label
              htmlFor="filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filter by Clone
            </label>
            <select
              id="filter"
              value={filterCloneId}
              onChange={(e) => setFilterCloneId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
            >
              <option value="">All Clones</option>
              {clones.map((clone) => (
                <option key={clone.id} value={clone.id}>
                  {clone.travelerName} in {clone.destination} ({clone.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Journal Feed */}
        <JournalFeed entries={entries} clones={clones} />

        {/* Stats */}
        {entries.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Journal Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{entries.length}</p>
                <p className="text-sm text-gray-600">Total Updates</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{clones.length}</p>
                <p className="text-sm text-gray-600">Total Clones</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {clones.filter((c) => c.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">Active Trips</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  €{clones.reduce((sum, c) => sum + c.totalSpend, 0).toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-600">
          <p>Auto-refreshing every 5 minutes</p>
        </footer>
      </div>
    </main>
  );
}
