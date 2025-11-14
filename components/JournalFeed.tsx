'use client';

import { JournalEntry, Clone } from '@/lib/types';

interface JournalFeedProps {
  entries: JournalEntry[];
  clones: Clone[];
}

export default function JournalFeed({ entries, clones }: JournalFeedProps) {
  // Create a map of clone IDs to clones for quick lookup
  const cloneMap = new Map(clones.map((c) => [c.id, c]));

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Travel Journal</h2>
        <p className="text-gray-600">
          No journal entries yet. Your clones will start posting updates as they travel!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Travel Journal</h2>

      <div className="space-y-4">
        {entries.map((entry) => {
          const clone = cloneMap.get(entry.cloneId);
          if (!clone) return null;

          const timestamp = new Date(entry.timestamp);
          const isRecent = Date.now() - timestamp.getTime() < 60000; // Within last minute

          return (
            <div
              key={entry.id}
              className={`border-l-4 pl-4 py-3 transition-all ${
                isRecent
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {clone.travelerName} in {clone.destination}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Day {entry.dayNumber} • {entry.timeOfDay} •{' '}
                    {timestamp.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {isRecent && (
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded font-semibold">
                    NEW
                  </span>
                )}
              </div>

              {/* Message */}
              <p className="text-gray-700 mb-3 leading-relaxed">{entry.message}</p>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-white rounded p-2">
                  <p className="text-xs text-gray-500">Cost</p>
                  <p className="font-semibold text-gray-800">€{entry.cost}</p>
                </div>

                <div className="bg-white rounded p-2">
                  <p className="text-xs text-gray-500">Transport</p>
                  <p className="font-medium text-gray-800 capitalize">
                    {entry.transportation}
                  </p>
                </div>

                <div className="bg-white rounded p-2">
                  <p className="text-xs text-gray-500">Daily Spend</p>
                  <p className="font-semibold text-gray-800">€{entry.dailySpend}</p>
                </div>

                <div className="bg-white rounded p-2">
                  <p className="text-xs text-gray-500">Total Spend</p>
                  <p className="font-semibold text-gray-800">€{entry.totalSpend}</p>
                </div>
              </div>

              {/* Route */}
              {entry.route && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Route</p>
                  <p className="text-sm text-gray-700">{entry.route}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {entries.length > 10 && (
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Showing {entries.length} journal entries
          </p>
        </div>
      )}
    </div>
  );
}
