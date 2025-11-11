'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JournalEntry } from '@/lib/types';
import { getJournalEntries, clearJournalForClone } from '@/lib/storage';
import JournalFeed from '@/components/JournalFeed';

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    setLoading(true);
    const loaded = await getJournalEntries();
    setEntries(loaded);
    setLoading(false);
  }

  async function handleClearClone(cloneId: string, cloneName: string) {
    if (confirm(`Clear all journal entries for ${cloneName}?`)) {
      await clearJournalForClone(cloneId);
      await loadEntries();
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← Back to Clones
        </button>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            📔 Clone Journal
          </h1>
          <p className="text-gray-700">
            All your clones' adventures and discoveries in one place
          </p>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading journal entries...</p>
        </div>
      ) : (
        <JournalFeed
          entries={entries}
          onClearClone={handleClearClone}
        />
      )}
    </main>
  );
}
