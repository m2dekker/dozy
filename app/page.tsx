'use client';

import { useState, useEffect, useRef } from 'react';
import {
  estimateTravelTime,
  formatTimeRemaining,
  createClone,
  addClone,
  getClones,
  updateClone,
  removeClone,
  CloneData
} from '@/lib/travel';

export default function Home() {
  const [cloneName, setCloneName] = useState('');
  const [destination, setDestination] = useState('');
  const [clones, setClones] = useState<CloneData[]>([]);
  const [selectedClone, setSelectedClone] = useState<CloneData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string>('');
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Load clones from localStorage on mount
  useEffect(() => {
    const stored = getClones();
    setClones(stored);
  }, []);

  // Polling effect - check all clones every 10 seconds
  useEffect(() => {
    // Update time remaining every second for smooth countdown
    const updateInterval = setInterval(() => {
      setClones(prevClones => [...prevClones]); // Force re-render
    }, 1000);

    // Check for arrivals every 10 seconds
    pollingInterval.current = setInterval(() => {
      checkArrivals();
    }, 10000);

    // Check immediately on mount
    checkArrivals();

    return () => {
      clearInterval(updateInterval);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [clones.length]);

  const checkArrivals = async () => {
    const currentClones = getClones();
    const now = Date.now();

    for (const clone of currentClones) {
      if (!clone.hasArrived && now >= clone.arrivalTime && !generatingFor) {
        // Clone has arrived!
        await handleCloneArrival(clone);
      }
    }
  };

  const handleCloneArrival = async (clone: CloneData) => {
    setGeneratingFor(clone.id);
    setError('');

    try {
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: clone.destination,
          cloneName: clone.name
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate message');
      }

      // Update clone with arrival message
      const updatedClones = updateClone(clone.id, {
        arrivalMessage: data.message,
        hasArrived: true
      });

      setClones(updatedClones);
      setSelectedClone({ ...clone, arrivalMessage: data.message, hasArrived: true });
      setShowModal(true);
    } catch (err: any) {
      console.error('Error:', err);
      const fallbackMessage = `${clone.name} has arrived in ${clone.destination}! (Couldn't generate witty message - check API)`;

      const updatedClones = updateClone(clone.id, {
        arrivalMessage: fallbackMessage,
        hasArrived: true
      });

      setClones(updatedClones);
      setSelectedClone({ ...clone, arrivalMessage: fallbackMessage, hasArrived: true });
      setShowModal(true);
      setError(err.message || 'Failed to generate arrival message');
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleSendClone = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cloneName.trim()) {
      setError('Please enter a clone name');
      return;
    }

    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    setError('');
    const estimate = estimateTravelTime(destination);
    const newClone = createClone(cloneName.trim(), destination.trim(), estimate.hours, estimate.category);

    const updatedClones = addClone(newClone);
    setClones(updatedClones);
    setCloneName('');
    setDestination('');
  };

  const handleCancelClone = (id: string) => {
    if (confirm('Are you sure you want to cancel this clone\'s journey?')) {
      const updatedClones = removeClone(id);
      setClones(updatedClones);
    }
  };

  const handleViewMessage = (clone: CloneData) => {
    setSelectedClone(clone);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedClone(null);
  };

  const handleDismissClone = (clone: CloneData) => {
    const updatedClones = removeClone(clone.id);
    setClones(updatedClones);
    setShowModal(false);
    setSelectedClone(null);
  };

  const activeClones = clones.filter(c => !c.hasArrived);
  const arrivedClones = clones.filter(c => c.hasArrived);

  return (
    <main className="container">
      <div className="card">
        <h1>🛫 AI Clone Traveler</h1>
        <p className="subtitle">Create and send AI clones on adventures around the world</p>

        {/* Send Clone Form */}
        <form onSubmit={handleSendClone} className="form">
          <div className="input-group">
            <label htmlFor="cloneName">Clone Name</label>
            <input
              id="cloneName"
              type="text"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              placeholder="e.g., Explorer Mike, Travel Sarah..."
              className="input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="destination">Destination</label>
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Thailand, Paris, Tokyo..."
              className="input"
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn btn-primary">
            Send Clone 🚀
          </button>
        </form>

        {/* Active Clones Section */}
        {activeClones.length > 0 && (
          <div className="clones-section">
            <h2 className="section-title">✈️ Traveling Clones ({activeClones.length})</h2>
            <div className="clones-grid">
              {activeClones.map((clone) => {
                const timeRemaining = clone.arrivalTime - Date.now();
                const progress = Math.max(0, Math.min(100,
                  ((Date.now() - clone.departureTime) / (clone.arrivalTime - clone.departureTime)) * 100
                ));

                return (
                  <div key={clone.id} className="clone-card">
                    <div className="clone-header">
                      <div className="clone-name">{clone.name}</div>
                      <div className="clone-category">{clone.category}</div>
                    </div>

                    <div className="clone-destination">📍 {clone.destination}</div>

                    <div className="time-remaining-small">
                      <div className="time-label">Arrives in</div>
                      <div className="time-value-small">
                        {formatTimeRemaining(timeRemaining)}
                      </div>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <button
                      onClick={() => handleCancelClone(clone.id)}
                      className="btn btn-small btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Arrived Clones Section */}
        {arrivedClones.length > 0 && (
          <div className="clones-section">
            <h2 className="section-title">🎉 Arrived Clones ({arrivedClones.length})</h2>
            <div className="clones-grid">
              {arrivedClones.map((clone) => (
                <div key={clone.id} className="clone-card arrived">
                  <div className="clone-header">
                    <div className="clone-name">{clone.name}</div>
                    <div className="clone-status">✓ Arrived</div>
                  </div>

                  <div className="clone-destination">📍 {clone.destination}</div>

                  <div className="clone-actions">
                    <button
                      onClick={() => handleViewMessage(clone)}
                      className="btn btn-small btn-primary"
                    >
                      View Message
                    </button>
                    <button
                      onClick={() => handleDismissClone(clone)}
                      className="btn btn-small btn-secondary"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {clones.length === 0 && (
          <div className="info-box">
            <p><strong>💡 How it works:</strong></p>
            <ul>
              <li>Give your clone a name</li>
              <li>Choose a destination</li>
              <li>Your clone will travel there (simulated time)</li>
              <li>Get a unique AI-generated arrival message</li>
              <li>Create multiple clones and send them everywhere!</li>
            </ul>
          </div>
        )}
      </div>

      {/* Arrival Modal */}
      {showModal && selectedClone && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎉 {selectedClone.name} Arrived!</h2>
            </div>
            <div className="modal-body">
              <div className="arrival-destination">
                📍 {selectedClone.destination}
              </div>
              <div className="arrival-message">
                {selectedClone.arrivalMessage}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseModal} className="btn btn-primary">
                Close
              </button>
              <button
                onClick={() => handleDismissClone(selectedClone)}
                className="btn btn-secondary"
              >
                Dismiss Clone
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>Powered by Claude AI • Travel times simulated for demo</p>
      </footer>
    </main>
  );
}
