'use client';

import { useState, useEffect, useRef } from 'react';
import {
  estimateTravelTime,
  formatTimeRemaining,
  saveClone,
  getActiveClone,
  clearClone,
  CloneData
} from '@/lib/travel';

export default function Home() {
  const [destination, setDestination] = useState('');
  const [activeClone, setActiveClone] = useState<CloneData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [arrivalMessage, setArrivalMessage] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Load clone from localStorage on mount
  useEffect(() => {
    const stored = getActiveClone();
    if (stored) {
      setActiveClone(stored);
      checkArrival(stored);
    }
  }, []);

  // Polling effect - check every 10 seconds
  useEffect(() => {
    if (activeClone && !showModal) {
      // Update time remaining every second for smooth countdown
      const updateInterval = setInterval(() => {
        const remaining = activeClone.arrivalTime - Date.now();
        setTimeRemaining(remaining);
      }, 1000);

      // Check for arrival every 10 seconds
      pollingInterval.current = setInterval(() => {
        checkArrival(activeClone);
      }, 10000);

      return () => {
        clearInterval(updateInterval);
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [activeClone, showModal]);

  const checkArrival = async (clone: CloneData) => {
    const now = Date.now();
    if (now >= clone.arrivalTime && !isGenerating) {
      // Clone has arrived!
      setIsGenerating(true);
      setError('');

      try {
        const response = await fetch('/api/generate-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destination: clone.destination
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate message');
        }

        setArrivalMessage(data.message);
        setShowModal(true);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message || 'Failed to generate arrival message');
        setArrivalMessage(`Your clone has arrived in ${clone.destination}! (But couldn't generate a witty message - check your API key)`);
        setShowModal(true);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleSendClone = (e: React.FormEvent) => {
    e.preventDefault();

    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    setError('');
    const estimate = estimateTravelTime(destination);
    const clone = saveClone(destination, estimate.hours, estimate.category);

    setActiveClone(clone);
    setTimeRemaining(clone.arrivalTime - Date.now());
    setDestination('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    clearClone();
    setActiveClone(null);
    setArrivalMessage('');
  };

  const handleCancelClone = () => {
    if (confirm('Are you sure you want to cancel this clone\'s journey?')) {
      clearClone();
      setActiveClone(null);
      setTimeRemaining(0);
    }
  };

  return (
    <main className="container">
      <div className="card">
        <h1>🛫 AI Clone Traveler</h1>
        <p className="subtitle">Send your AI clone on an adventure anywhere in the world</p>

        {!activeClone ? (
          <form onSubmit={handleSendClone} className="form">
            <div className="input-group">
              <label htmlFor="destination">Where should your clone travel?</label>
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

            <div className="info-box">
              <p><strong>💡 How it works:</strong></p>
              <ul>
                <li>Enter a destination</li>
                <li>Your clone will travel there (simulated time)</li>
                <li>When arrived, get a witty AI-generated arrival message</li>
                <li>Each message is unique and fun!</li>
              </ul>
            </div>
          </form>
        ) : (
          <div className="status-container">
            <div className="status-card">
              <div className="status-icon">✈️</div>
              <h2>Clone En Route</h2>
              <div className="destination-name">{activeClone.destination}</div>

              <div className="time-remaining">
                <div className="time-label">Arrival in</div>
                <div className="time-value">
                  {formatTimeRemaining(timeRemaining)}
                </div>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.max(0, Math.min(100, ((Date.now() - activeClone.departureTime) / (activeClone.arrivalTime - activeClone.departureTime)) * 100))}%`
                  }}
                />
              </div>

              <p className="status-message">
                {timeRemaining > 0
                  ? 'Your clone is traveling... We\'ll notify you upon arrival!'
                  : isGenerating
                  ? 'Generating arrival message...'
                  : 'Arrived! Generating message...'}
              </p>

              <button onClick={handleCancelClone} className="btn btn-secondary">
                Cancel Journey
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Arrival Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎉 Clone Arrived!</h2>
            </div>
            <div className="modal-body">
              <div className="arrival-destination">
                📍 {activeClone?.destination}
              </div>
              <div className="arrival-message">
                {arrivalMessage}
              </div>
              {error && <div className="error">{error}</div>}
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseModal} className="btn btn-primary">
                Start New Journey
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>Powered by Claude AI • Travel times are simulated for demo purposes</p>
      </footer>
    </main>
  );
}
