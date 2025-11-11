'use client';

import { Clone } from '@/lib/types';
import { formatTimeRemaining } from '@/lib/time';
import { useRouter } from 'next/navigation';

interface CloneListProps {
  clones: Clone[];
  currentTime: number;
  onDelete: (id: string) => void;
}

export default function CloneList({ clones, currentTime, onDelete }: CloneListProps) {
  const router = useRouter();

  if (clones.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🌎</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Clones</h3>
        <p className="text-gray-600">Create your first clone above to start wandering!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Your Clones</h2>
        <button
          onClick={() => router.push('/journal')}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          📔 View Journal
        </button>
      </div>

      {clones.map((clone) => {
        const status = getCloneStatus(clone, currentTime);

        return (
          <div
            key={clone.id}
            className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{clone.name}</h3>
                <p className="text-gray-600">📍 {clone.destination}</p>
              </div>
              <button
                onClick={() => onDelete(clone.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-3 py-1 rounded transition-colors"
              >
                🗑️ Delete
              </button>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(clone.status)}`}>
                {status.label}
              </span>
              {status.timeRemaining && (
                <span className="text-sm text-gray-600">
                  {status.timeRemaining}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
              <div>💰 Budget: <span className="font-medium">{clone.budget}</span></div>
              <div>⏱️ Duration: <span className="font-medium">{clone.activity_duration_days} days</span></div>
              {clone.preferences && (
                <div className="col-span-2">
                  🎯 Interests: <span className="font-medium">{clone.preferences}</span>
                </div>
              )}
            </div>

            {clone.status === 'active' && (
              <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <p className="text-sm text-blue-800">
                  ✍️ Journaling in progress... Check the journal for updates!
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getCloneStatus(clone: Clone, currentTime: number) {
  if (clone.status === 'traveling') {
    const timeUntilArrival = clone.arrival_time - currentTime;
    return {
      label: '✈️ Traveling',
      timeRemaining: `Arrives in ${formatTimeRemaining(timeUntilArrival)}`
    };
  }

  if (clone.status === 'active') {
    const timeUntilEnd = clone.activity_end_time - currentTime;
    return {
      label: '🎯 Exploring',
      timeRemaining: `${formatTimeRemaining(timeUntilEnd)} left`
    };
  }

  return {
    label: '✅ Finished',
    timeRemaining: null
  };
}

function getStatusColor(status: Clone['status']): string {
  switch (status) {
    case 'traveling':
      return 'bg-yellow-100 text-yellow-800';
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'finished':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
