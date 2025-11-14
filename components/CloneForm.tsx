'use client';

import { useState } from 'react';
import { TRAVELER_PROFILES, CATEGORIES, Category, TravelerType } from '@/lib/types';
import { createClone } from '@/lib/supabase';

interface CloneFormProps {
  onCloneCreated: () => void;
  activeCloneCount: number;
}

export default function CloneForm({ onCloneCreated, activeCloneCount }: CloneFormProps) {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [travelerType, setTravelerType] = useState<TravelerType>('budget');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCategoryToggle = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    if (duration < 1) {
      setError('Trip duration must be at least 1 day');
      return;
    }

    if (selectedCategories.length === 0) {
      setError('Please select at least one interest category');
      return;
    }

    if (activeCloneCount >= 5) {
      setError('Maximum 5 active clones allowed. Please wait for some to complete.');
      return;
    }

    setIsSubmitting(true);

    try {
      const profile = TRAVELER_PROFILES[travelerType];

      await createClone({
        travelerName: profile.name,
        travelerType,
        destination: destination.trim(),
        duration,
        categories: selectedCategories,
        status: 'active',
        totalSpend: 0,
        startTime: new Date().toISOString(),
      });

      // Reset form
      setDestination('');
      setDuration(3);
      setSelectedCategories([]);
      onCloneCreated();
    } catch (err) {
      let errorMessage = 'Failed to create clone. ';

      if (err instanceof Error) {
        errorMessage += err.message;
      } else if (typeof err === 'string') {
        errorMessage += err;
      } else {
        errorMessage += 'Unknown error. Check console for details.';
      }

      setError(errorMessage);
      console.error('Clone creation error:', err);
      console.error('Error type:', typeof err);
      console.error('Error stringified:', JSON.stringify(err, null, 2));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProfile = TRAVELER_PROFILES[travelerType];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Send a Clone on Adventure</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Destination */}
      <div className="mb-4">
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
          Destination
        </label>
        <input
          type="text"
          id="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g., Paris, Tokyo, New York"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
        />
      </div>

      {/* Trip Duration */}
      <div className="mb-4">
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
          Trip Duration (days) - 1 day = 1 hour real-time
        </label>
        <input
          type="number"
          id="duration"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
          min="1"
          max="7"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
        />
        <p className="text-sm text-gray-500 mt-1">
          {duration} day{duration !== 1 ? 's' : ''} = {duration} hour{duration !== 1 ? 's' : ''} real-time
        </p>
      </div>

      {/* Traveler Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose Your Traveler
        </label>
        <div className="space-y-2">
          {Object.entries(TRAVELER_PROFILES).map(([key, profile]) => (
            <label
              key={key}
              className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                travelerType === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="travelerType"
                value={key}
                checked={travelerType === key}
                onChange={(e) => setTravelerType(e.target.value as TravelerType)}
                className="mr-3"
              />
              <div>
                <div className="font-semibold text-gray-800">{profile.name}</div>
                <div className="text-sm text-gray-600">{profile.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Budget: {profile.currency}{profile.costRange.min}-{profile.costRange.max} per activity
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Interest Categories */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interest Categories (select at least one)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className={`flex items-center p-2 border rounded-md cursor-pointer transition-colors ${
                selectedCategories.includes(category)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="mr-2"
              />
              <span className="text-sm text-gray-800">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Creating Clone...' : `Send ${selectedProfile.name} to ${destination || 'Adventure'}`}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Travel is instant! Your clone will start sending updates immediately.
      </p>
    </form>
  );
}
