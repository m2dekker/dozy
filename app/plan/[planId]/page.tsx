'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TravelPlan, getPlanById } from '@/lib/planner';
import Blueprint from '@/components/Blueprint';

export default function SharedPlanPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const planId = params.planId as string;

    if (planId) {
      // Load plan from localStorage
      const foundPlan = getPlanById(planId);

      if (foundPlan) {
        setPlan(foundPlan);
      }

      setLoading(false);
    }
  }, [params.planId]);

  const handleGoToPlanner = () => {
    router.push('/plan');
  };

  if (loading) {
    return (
      <main className="plan-container">
        <div className="plan-card">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading plan...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!plan) {
    return (
      <main className="plan-container">
        <div className="plan-card">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h2>Plan Not Found</h2>
            <p>This travel plan doesn't exist or has been removed.</p>
            <button onClick={handleGoToPlanner} className="btn btn-primary">
              Create Your Own Plan
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="plan-container">
      <div className="plan-card">
        <div className="shared-plan-header">
          <button onClick={handleGoToPlanner} className="btn-back">
            ← Create Your Own
          </button>
          <div className="shared-badge">
            🔗 Shared Plan
          </div>
        </div>

        <Blueprint plan={plan} />
      </div>
    </main>
  );
}
