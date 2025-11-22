'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Personality, PERSONALITIES, DURATIONS } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const [personality, setPersonality] = useState<Personality>('efficient');
  const [budget, setBudget] = useState(100);
  const [duration, setDuration] = useState('1d');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personality,
          budget,
          duration,
          destination: destination.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate mission');
      }

      const mission = await res.json();

      // Store mission in localStorage
      const missions = JSON.parse(localStorage.getItem('missions') || '[]');
      missions.unshift(mission);
      localStorage.setItem('missions', JSON.stringify(missions));

      // Navigate to mission page
      router.push(`/mission/${mission.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-slate-900">Lifestyle Clone</h1>
        <p className="text-sm text-slate-600 mt-1">
          Send your clone on a mission
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personality */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Personality
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PERSONALITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPersonality(p.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  personality === p.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="font-medium text-sm text-slate-900">{p.label}</div>
                <div className="text-xs text-slate-500">{p.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Budget: ${budget}
          </label>
          <input
            type="range"
            min="20"
            max="1000"
            step="10"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>$20</span>
            <span>$1000</span>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-200 bg-white text-slate-900"
          >
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Tokyo, Paris, New York"
            className="w-full p-3 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-lg bg-blue-600 text-white font-semibold disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Mission...
            </span>
          ) : (
            'Send Clone'
          )}
        </button>
      </form>
    </main>
  );
}
