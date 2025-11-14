'use client';

import Link from 'next/link';
import { Clone } from '@/lib/types';
import { formatTimeRemaining, getSimulatedTime } from '@/lib/time';

interface ActiveClonesProps {
  clones: Clone[];
}

export default function ActiveClones({ clones }: ActiveClonesProps) {
  if (clones.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Active Clones</h2>
        <p className="text-gray-600">No active clones. Send someone on an adventure!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Active Clones</h2>
        <Link
          href="/journal"
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          View Full Journal →
        </Link>
      </div>

      <div className="space-y-4">
        {clones.map((clone) => {
          const simTime = getSimulatedTime(clone.startTime, clone.duration);

          return (
            <div
              key={clone.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {clone.travelerName} in {clone.destination}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {clone.duration}-day trip ({clone.duration} hour{clone.duration !== 1 ? 's' : ''} real-time)
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      clone.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {clone.status === 'active' ? 'Traveling' : 'Completed'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-500">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${simTime.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {simTime.progress}%
                    </span>
                  </div>
                  {clone.status === 'active' && !simTime.isComplete && (
                    <p className="text-xs text-gray-600 mt-1">
                      Day {simTime.currentDay} of {clone.duration} • {simTime.timeOfDay}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="text-lg font-bold text-gray-800">
                    €{clone.totalSpend.toFixed(0)}
                  </p>
                </div>
              </div>

              {clone.status === 'active' && !simTime.isComplete && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    ⏱️ {formatTimeRemaining(clone.startTime, clone.duration)}
                  </p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-1">
                {clone.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
