'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JournalEntry, Clone } from '@/lib/types';
import { getJournalEntries, clearJournalForClone, getClones } from '@/lib/storage';
import JournalFeed from '@/components/JournalFeed';

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [clones, setClones] = useState<Clone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [loadedEntries, loadedClones] = await Promise.all([
      getJournalEntries(),
      getClones()
    ]);
    setEntries(loadedEntries);
    setClones(loadedClones);
    setLoading(false);
  }

  async function loadEntries() {
    const loaded = await getJournalEntries();
    setEntries(loaded);
  }

  async function handleClearClone(cloneId: string, cloneName: string) {
    if (confirm(`Clear all journal entries for ${cloneName}?`)) {
      await clearJournalForClone(cloneId);
      await loadEntries();
    }
  }

  function handleSelectEntry(entryId: string) {
    setSelectedEntries(prev => {
      const next = new Set(prev);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  }

  function handleSelectAll() {
    if (selectedEntries.size === entries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(entries.map(e => e.id)));
    }
  }

  async function handleSendEmail() {
    if (selectedEntries.size === 0) {
      alert('Please select at least one journal entry to send.');
      return;
    }

    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    // Get the clone for the first selected entry to check premium status
    const selectedEntryIds = Array.from(selectedEntries);
    const firstEntry = entries.find(e => e.id === selectedEntryIds[0]);
    if (!firstEntry) return;

    const clone = clones.find(c => c.id === firstEntry.clone_id);
    const isPremium = clone?.isPremium || false;

    // Free tier: limit to 1 entry
    if (!isPremium && selectedEntries.size > 1) {
      alert('Free tier is limited to 1 journal entry per email. Enable Premium Mode to send unlimited entries.');
      return;
    }

    setSending(true);
    setEmailResult(null);

    try {
      const selectedEntriesData = entries.filter(e => selectedEntries.has(e.id));

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          entries: selectedEntriesData,
          cloneName: firstEntry.clone_name,
          destination: firstEntry.destination,
          isPremium
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEmailResult({
          success: true,
          message: `Email sent successfully to ${email}!`
        });
        setSelectedEntries(new Set());
        setEmail('');
        setTimeout(() => setShowEmailModal(false), 3000);
      } else {
        setEmailResult({
          success: false,
          message: data.error || data.details || 'Failed to send email. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Email send error:', error);
      setEmailResult({
        success: false,
        message: error.message || 'Network error. Please check your connection and try again.'
      });
    } finally {
      setSending(false);
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

      {/* Email Controls */}
      {!loading && entries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">📧 Email Journal</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                {selectedEntries.size === entries.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                disabled={selectedEntries.size === 0}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send {selectedEntries.size > 0 && `(${selectedEntries.size})`}
              </button>
            </div>
          </div>
          {selectedEntries.size > 0 && (
            <p className="text-sm text-gray-600">
              {selectedEntries.size} {selectedEntries.size === 1 ? 'entry' : 'entries'} selected
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading journal entries...</p>
        </div>
      ) : (
        <JournalFeed
          entries={entries}
          onClearClone={handleClearClone}
          selectedEntries={selectedEntries}
          onSelectEntry={handleSelectEntry}
        />
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => !sending && setShowEmailModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">📧 Email Journal Entries</h3>

            {emailResult ? (
              <div className={`p-4 rounded-lg mb-4 ${emailResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="font-medium">{emailResult.message}</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Send {selectedEntries.size} journal {selectedEntries.size === 1 ? 'entry' : 'entries'} to your email.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-800">
                    <strong>Free:</strong> 1 entry per email<br />
                    <strong>Premium:</strong> Unlimited entries
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSendEmail}
                    disabled={sending || !email}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {sending ? 'Sending...' : 'Send Email'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setEmailResult(null);
                    }}
                    disabled={sending}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
