'use client';

import { JournalEntry } from '@/lib/types';
import { formatTimestamp } from '@/lib/time';

interface JournalFeedProps {
  entries: JournalEntry[];
  onClearClone?: (cloneId: string, cloneName: string) => void;
  selectedEntries?: Set<string>;
  onSelectEntry?: (entryId: string) => void;
}

export default function JournalFeed({ entries, onClearClone, selectedEntries, onSelectEntry }: JournalFeedProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        <div className="text-6xl mb-4">📔</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Journal Entries Yet</h3>
        <p className="text-gray-600">
          Send a clone on a journey and they'll start documenting their experiences!
        </p>
      </div>
    );
  }

  // Group entries by clone
  const cloneGroups = entries.reduce((acc, entry) => {
    if (!acc[entry.clone_id]) {
      acc[entry.clone_id] = {
        cloneName: entry.clone_name,
        destination: entry.destination,
        entries: [],
        totalSpend: 0
      };
    }
    acc[entry.clone_id].entries.push(entry);
    acc[entry.clone_id].totalSpend += entry.cost || 0;
    return acc;
  }, {} as Record<string, { cloneName: string; destination: string; entries: JournalEntry[]; totalSpend: number }>);

  return (
    <div className="space-y-8">
      {Object.entries(cloneGroups).map(([cloneId, group]) => (
        <div key={cloneId} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{group.cloneName}</h3>
              <p className="text-gray-600">📍 {group.destination}</p>
              <div className="flex gap-3 mt-2 flex-wrap">
                <p className="text-sm text-gray-500">{group.entries.length} entries</p>
                {group.totalSpend > 0 && (
                  <p className="text-sm font-medium text-green-600">
                    💰 Total: €{group.totalSpend.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            {onClearClone && (
              <button
                onClick={() => onClearClone(cloneId, group.cloneName)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                🗑️ Clear Journal
              </button>
            )}
          </div>

          <div className="space-y-4">
            {group.entries.map((entry) => (
              <div
                key={entry.id}
                className={`border-l-4 border-purple-500 pl-4 py-2 hover:bg-purple-50 transition-colors rounded-r ${selectedEntries?.has(entry.id) ? 'bg-purple-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap flex-1">
                    {onSelectEntry && (
                      <input
                        type="checkbox"
                        checked={selectedEntries?.has(entry.id) || false}
                        onChange={() => onSelectEntry(entry.id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                      />
                    )}
                    <span className="text-2xl">{getMomentEmoji(entry.moment)}</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {entry.moment.replace('-', ' ')}
                    </span>
                    {entry.cost > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        €{entry.cost.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{entry.message}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getMomentEmoji(moment: string): string {
  switch (moment) {
    case 'arrival':
      return '✈️';
    case 'mid-day':
      return '☀️';
    case 'evening':
      return '🌙';
    default:
      return '📝';
  }
}
