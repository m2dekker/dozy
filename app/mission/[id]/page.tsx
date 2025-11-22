'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Mission } from '@/lib/types';

export default function MissionPage() {
  const params = useParams();
  const router = useRouter();
  const [mission, setMission] = useState<Mission | null>(null);

  useEffect(() => {
    const missions = JSON.parse(localStorage.getItem('missions') || '[]');
    const found = missions.find((m: Mission) => m.id === params.id);
    if (found) {
      setMission(found);
    }
  }, [params.id]);

  if (!mission) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600">Mission not found</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-blue-600 font-medium"
          >
            Create New Mission
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 -ml-2 text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-slate-900 truncate">
              {mission.config.destination}
            </h1>
            <p className="text-xs text-slate-500">
              {mission.config.personality} · {mission.config.duration} · ${mission.config.budget}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Overview */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-2">Overview</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {mission.overview}
          </p>
        </section>

        {/* Timeline */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-3">Timeline</h2>
          <div className="space-y-4">
            {mission.timeline.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-16 text-xs font-medium text-slate-500 pt-0.5">
                  {item.time}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900">
                    {item.activity}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.location}
                  </div>
                  {item.transport && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      {item.transport}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-green-600">
                      ${item.cost}
                    </span>
                    {item.notes && (
                      <span className="text-xs text-slate-400 truncate">
                        · {item.notes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Costs */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-3">Cost Breakdown</h2>
          <div className="space-y-2">
            {mission.costs.accommodation > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Accommodation</span>
                <span className="text-slate-900">${mission.costs.accommodation}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Food</span>
              <span className="text-slate-900">${mission.costs.food}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Transport</span>
              <span className="text-slate-900">${mission.costs.transport}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Activities</span>
              <span className="text-slate-900">${mission.costs.activities}</span>
            </div>
            {mission.costs.misc > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Misc</span>
                <span className="text-slate-900">${mission.costs.misc}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-100">
              <span className="text-slate-900">Total</span>
              <span className="text-slate-900">${mission.costs.total}</span>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-3">Tips</h2>
          <ul className="space-y-2">
            {mission.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-blue-500 flex-shrink-0">•</span>
                <span className="text-slate-600">{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Improvements */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-3">
            What I&apos;d Do Differently
          </h2>
          <ul className="space-y-2">
            {mission.improvements.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-amber-500 flex-shrink-0">↻</span>
                <span className="text-slate-600">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* New Mission Button */}
        <button
          onClick={() => router.push('/')}
          className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-medium"
        >
          New Mission
        </button>
      </div>
    </main>
  );
}
