'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TravelPlan,
  TravelPreferences,
  generatePlanId,
  savePlan,
  getPlans,
  saveScout,
  updateScout,
  getActiveScouts,
  generateScoutName
} from '@/lib/planner';
import Blueprint from '@/components/Blueprint';
import jsPDF from 'jspdf';

export default function PlanPage() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [tripLength, setTripLength] = useState(3);
  const [preferences, setPreferences] = useState<TravelPreferences>({
    food: false,
    culture: false,
    adventure: false,
    lowCrowds: false,
    shopping: false,
    nightlife: false,
    nature: false,
    history: false
  });

  const [currentPlan, setCurrentPlan] = useState<TravelPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [error, setError] = useState('');
  const [savedPlans, setSavedPlans] = useState<TravelPlan[]>([]);
  const [activeScouts, setActiveScouts] = useState<any[]>([]);

  useEffect(() => {
    // Load saved plans and active scouts
    setSavedPlans(getPlans());
    setActiveScouts(getActiveScouts());
  }, []);

  const handlePreferenceToggle = (key: keyof TravelPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDispatchScout = async () => {
    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    if (tripLength < 1 || tripLength > 14) {
      setError('Trip length must be between 1 and 14 days');
      return;
    }

    // Check active scouts limit
    if (activeScouts.length >= 3) {
      setError('Maximum 3 scouts active. Wait for one to finish or cancel it.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const planId = generatePlanId();
      const scoutName = generateScoutName(destination);

      // Create scout
      const scout = {
        id: planId,
        name: scoutName,
        destination: destination,
        status: 'scouting' as const,
        planId: planId
      };

      saveScout(scout);
      setActiveScouts(prev => [...prev, scout]);

      // Step 1: Fetch places
      const placesResponse = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, preferences })
      });

      const placesData = await placesResponse.json();
      if (!placesResponse.ok) {
        throw new Error(placesData.error || 'Failed to fetch places');
      }

      // Step 2: Generate itinerary
      const itineraryResponse = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          tripLength,
          preferences,
          places: placesData.places,
          scoutName
        })
      });

      const itineraryData = await itineraryResponse.json();
      if (!itineraryResponse.ok) {
        throw new Error(itineraryData.error || 'Failed to generate itinerary');
      }

      // Create plan
      const plan: TravelPlan = {
        id: planId,
        destination,
        tripLength,
        preferences,
        scoutName,
        itinerary: itineraryData.itinerary.itinerary,
        summary: itineraryData.itinerary.summary,
        createdAt: Date.now(),
        status: 'ready'
      };

      // Step 3: Generate voice (optional)
      await generateVoiceForPlan(plan);

      // Save plan
      savePlan(plan);
      setCurrentPlan(plan);
      setSavedPlans(getPlans());

      // Update scout status
      updateScout(planId, 'ready');
      setActiveScouts(getActiveScouts());

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to generate travel plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVoiceForPlan = async (plan: TravelPlan) => {
    setIsGeneratingVoice(true);

    try {
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: plan.summary,
          voiceId: null
        })
      });

      const data = await response.json();

      if (response.ok && data.audioUrl) {
        plan.voiceUrl = data.audioUrl;
        savePlan(plan);
      }
    } catch (err) {
      console.error('Failed to generate voice:', err);
      // Continue without voice
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!currentPlan) return;

    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text('Holiday Blueprint', 20, yPos);
    yPos += 10;

    // Destination
    doc.setFontSize(16);
    doc.text(currentPlan.destination, 20, yPos);
    yPos += 10;

    // Meta
    doc.setFontSize(12);
    doc.text(`${currentPlan.tripLength} Days | By ${currentPlan.scoutName}`, 20, yPos);
    yPos += 15;

    // Summary
    doc.setFontSize(14);
    doc.text('Summary:', 20, yPos);
    yPos += 7;
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(currentPlan.summary, 170);
    doc.text(summaryLines, 20, yPos);
    yPos += summaryLines.length * 5 + 10;

    // Itinerary
    doc.setFontSize(14);
    doc.text('Itinerary:', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    currentPlan.itinerary.forEach((day) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.text(`Day ${day.day}`, 20, yPos);
      yPos += 7;

      const allActivities = [
        ...(day.morning || []),
        ...(day.afternoon || []),
        ...(day.evening || [])
      ];

      allActivities.forEach((activity) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(10);
        doc.text(`${activity.time} - ${activity.title}`, 25, yPos);
        yPos += 5;
        const descLines = doc.splitTextToSize(activity.description, 160);
        doc.text(descLines, 30, yPos);
        yPos += descLines.length * 5 + 3;
      });

      yPos += 5;
    });

    doc.save(`${currentPlan.destination}-blueprint.pdf`);
  };

  const handleViewPlan = (plan: TravelPlan) => {
    setCurrentPlan(plan);
  };

  const handleBackHome = () => {
    router.push('/');
  };

  return (
    <main className="plan-container">
      <div className="plan-card">
        {/* Header */}
        <div className="plan-header">
          <button onClick={handleBackHome} className="btn-back">
            ← Back
          </button>
          <h1 className="plan-title">🗺️ CloneScout Travel Planner</h1>
        </div>

        <p className="plan-subtitle">
          Dispatch an AI scout to plan your perfect holiday itinerary
        </p>

        {/* Active Scouts */}
        {activeScouts.length > 0 && (
          <div className="active-scouts">
            <h3>🔍 Active Scouts</h3>
            <div className="scouts-list">
              {activeScouts.map(scout => (
                <div key={scout.id} className="scout-badge">
                  <span className="scout-name">{scout.name}</span>
                  <span className="scout-status">
                    {scout.status === 'scouting' ? '⏳ Scouting...' : '✓ Ready'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!currentPlan && (
          <>
            {/* Planning Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleDispatchScout(); }} className="plan-form">
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="destination">Destination</label>
                  <input
                    id="destination"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., Bali, Phuket, Barcelona..."
                    className="input"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="tripLength">Trip Length (days)</label>
                  <input
                    id="tripLength"
                    type="number"
                    min="1"
                    max="14"
                    value={tripLength}
                    onChange={(e) => setTripLength(parseInt(e.target.value))}
                    className="input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Preferences</label>
                <div className="preferences-grid">
                  {Object.entries(preferences).map(([key, value]) => (
                    <label key={key} className="preference-checkbox">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => handlePreferenceToggle(key as keyof TravelPreferences)}
                      />
                      <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && <div className="error">{error}</div>}

              <button
                type="submit"
                disabled={isGenerating || activeScouts.length >= 3}
                className="btn btn-primary btn-large"
              >
                {isGenerating ? '🔍 Scouting...' : '🚀 Dispatch Scout'}
              </button>

              {isGeneratingVoice && (
                <div className="voice-status">
                  🎙️ Generating voice narration...
                </div>
              )}
            </form>

            {/* Saved Plans */}
            {savedPlans.length > 0 && (
              <div className="saved-plans">
                <h3>📚 Previous Plans</h3>
                <div className="plans-grid">
                  {savedPlans.slice().reverse().map((plan) => (
                    <div key={plan.id} className="plan-card-mini" onClick={() => handleViewPlan(plan)}>
                      <h4>{plan.destination}</h4>
                      <div className="plan-meta">
                        {plan.tripLength} Days • {plan.scoutName}
                      </div>
                      <button className="btn btn-small btn-secondary">View Plan</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Blueprint Display */}
        {currentPlan && (
          <div className="blueprint-section">
            <button
              onClick={() => setCurrentPlan(null)}
              className="btn btn-secondary"
              style={{ marginBottom: '20px' }}
            >
              ← Back to Planner
            </button>
            <Blueprint
              plan={currentPlan}
              onDownloadPDF={handleDownloadPDF}
            />
          </div>
        )}
      </div>
    </main>
  );
}
