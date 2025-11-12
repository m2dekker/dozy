'use client';

import { useState } from 'react';
import { Budget, CloneFormData } from '@/lib/types';

interface CloneFormProps {
  onSubmit: (data: CloneFormData) => void;
  activeCloneCount: number;
}

export default function CloneForm({ onSubmit, activeCloneCount }: CloneFormProps) {
  const [name, setName] = useState('Dart');
  const [destination, setDestination] = useState('');
  const [travelTimeHours, setTravelTimeHours] = useState(2);
  const [activityDurationDays, setActivityDurationDays] = useState(1);
  const [preferences, setPreferences] = useState('');
  const [budget, setBudget] = useState<Budget>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !destination.trim()) {
      alert('Please fill in clone name and destination');
      return;
    }

    if (travelTimeHours < 0.5 || travelTimeHours > 24) {
      alert('Travel time must be between 0.5-24 hours');
      return;
    }

    if (activityDurationDays < 1 || activityDurationDays > 7) {
      alert('Activity duration must be between 1-7 days');
      return;
    }

    if (activeCloneCount >= 5) {
      alert('Maximum 5 active clones allowed. Please wait for some to finish.');
      return;
    }

    onSubmit({
      name: name.trim(),
      destination: destination.trim(),
      travel_time_hours: travelTimeHours,
      activity_duration_days: activityDurationDays,
      preferences: preferences.trim(),
      budget
    });

    // Reset form
    setName('Dart');
    setDestination('');
    setTravelTimeHours(2);
    setActivityDurationDays(1);
    setPreferences('');
    setBudget('medium');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🌍 Send a Clone</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clone Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Wanderer Alex"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={30}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Paris, France"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Time (hours)
            <span className="text-xs text-gray-500 ml-2">
              1600x faster: {travelTimeHours}h = {Math.round(travelTimeHours * 3600 / 1600)}s real-time
            </span>
          </label>
          <input
            type="number"
            value={travelTimeHours}
            onChange={(e) => setTravelTimeHours(Number(e.target.value))}
            min={0.5}
            max={24}
            step={0.5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Duration (days)
            <span className="text-xs text-gray-500 ml-2">
              1600x faster: {activityDurationDays}d = {Math.round(activityDurationDays * 24 * 3600 / 1600)}s real-time
            </span>
          </label>
          <input
            type="number"
            value={activityDurationDays}
            onChange={(e) => setActivityDurationDays(Number(e.target.value))}
            min={1}
            max={7}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferences (optional)
        </label>
        <input
          type="text"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          placeholder="e.g., food, art, nature, low crowds, history"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Comma-separated interests to personalize recommendations
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Budget Level
        </label>
        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value as Budget)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="budget">💰 Budget (Street food, free attractions)</option>
          <option value="medium">💳 Medium (Casual dining, paid attractions)</option>
          <option value="high">💎 High (Fine dining, premium experiences)</option>
          <option value="luxury">👑 Luxury (Michelin stars, exclusive access)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={activeCloneCount >= 5}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {activeCloneCount >= 5 ? '⚠️ Max Clones Reached (5/5)' : '🚀 Send Clone'}
      </button>

      {activeCloneCount > 0 && (
        <p className="text-center text-sm text-gray-600 mt-3">
          Active clones: {activeCloneCount}/5
        </p>
      )}
    </form>
  );
}
