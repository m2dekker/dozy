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
import { Language, getTranslations, saveLanguage, getLanguage } from '@/lib/translations';

export default function Home() {
  const [cloneName, setCloneName] = useState('');
  const [destination, setDestination] = useState('');
  const [clones, setClones] = useState<CloneData[]>([]);
  const [selectedClone, setSelectedClone] = useState<CloneData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string>('');
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const t = getTranslations(language);

  // Load clones and language from localStorage on mount
  useEffect(() => {
    const stored = getClones();
    setClones(stored);
    const savedLang = getLanguage();
    setLanguage(savedLang);
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
      setError(t.errorCloneName);
      return;
    }

    if (!destination.trim()) {
      setError(t.errorDestination);
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

  const handleLanguageToggle = () => {
    const newLang: Language = language === 'en' ? 'th' : 'en';
    setLanguage(newLang);
    saveLanguage(newLang);
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'local': return t.local;
      case 'regional': return t.regional;
      case 'international': return t.international;
      case 'intercontinental': return t.intercontinental;
      default: return category;
    }
  };

  const activeClones = clones.filter(c => !c.hasArrived);
  const arrivedClones = clones.filter(c => c.hasArrived);

  return (
    <main className="container">
      <div className="card">
        {/* Language Toggle */}
        <div className="language-toggle">
          <button onClick={handleLanguageToggle} className="btn-language">
            {language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
          </button>
        </div>

        <h1>{t.title}</h1>
        <p className="subtitle">{t.subtitle}</p>

        {/* Hub Link */}
        {arrivedClones.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <a href="/hub" className="btn-hub-link">
              🌐 Visit CloneSync Hub ({arrivedClones.length} clones waiting)
            </a>
          </div>
        )}

        {/* Send Clone Form */}
        <form onSubmit={handleSendClone} className="form">
          <div className="input-group">
            <label htmlFor="cloneName">{t.cloneNameLabel}</label>
            <input
              id="cloneName"
              type="text"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              placeholder={t.cloneNamePlaceholder}
              className="input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="destination">{t.destinationLabel}</label>
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t.destinationPlaceholder}
              className="input"
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn btn-primary">
            {t.sendCloneButton}
          </button>
        </form>

        {/* Active Clones Section */}
        {activeClones.length > 0 && (
          <div className="clones-section">
            <h2 className="section-title">{t.travelingClones} ({activeClones.length})</h2>
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
                      <div className="clone-category">{getCategoryLabel(clone.category)}</div>
                    </div>

                    <div className="clone-destination">📍 {clone.destination}</div>

                    <div className="time-remaining-small">
                      <div className="time-label">{t.arrivesIn}</div>
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
                      {t.cancel}
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
            <h2 className="section-title">{t.arrivedClones} ({arrivedClones.length})</h2>
            <div className="clones-grid">
              {arrivedClones.map((clone) => (
                <div key={clone.id} className="clone-card arrived">
                  <div className="clone-header">
                    <div className="clone-name">{clone.name}</div>
                    <div className="clone-status">{t.arrived}</div>
                  </div>

                  <div className="clone-destination">📍 {clone.destination}</div>

                  <div className="clone-actions">
                    <button
                      onClick={() => handleViewMessage(clone)}
                      className="btn btn-small btn-primary"
                    >
                      {t.viewMessage}
                    </button>
                    <button
                      onClick={() => handleDismissClone(clone)}
                      className="btn btn-small btn-secondary"
                    >
                      {t.dismiss}
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
            <p><strong>{t.howItWorks}</strong></p>
            <ul>
              <li>{t.step1}</li>
              <li>{t.step2}</li>
              <li>{t.step3}</li>
              <li>{t.step4}</li>
              <li>{t.step5}</li>
            </ul>
          </div>
        )}
      </div>

      {/* Arrival Modal */}
      {showModal && selectedClone && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎉 {selectedClone.name} {t.arrivedTitle}</h2>
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
                {t.close}
              </button>
              <button
                onClick={() => handleDismissClone(selectedClone)}
                className="btn btn-secondary"
              >
                {t.dismissClone}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>{t.footer}</p>
      </footer>
    </main>
  );
}
