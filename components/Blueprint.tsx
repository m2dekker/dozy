import React, { useState } from 'react';
import { TravelPlan, formatPreferences, createShareableUrl } from '@/lib/planner';
import ItineraryDay from './ItineraryDay';

interface BlueprintProps {
  plan: TravelPlan;
  onDownloadPDF?: () => void;
}

export default function Blueprint({ plan, onDownloadPDF }: BlueprintProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const shareUrl = createShareableUrl(plan.id);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  const prefs = formatPreferences(plan.preferences);

  return (
    <div className="blueprint-container">
      {/* Header */}
      <div className="blueprint-header">
        <div className="blueprint-title-section">
          <h1 className="blueprint-title">🗺️ Holiday Blueprint</h1>
          <h2 className="blueprint-destination">{plan.destination}</h2>
          <div className="blueprint-meta">
            <span>{plan.tripLength} Days</span>
            <span>•</span>
            <span>By {plan.scoutName}</span>
          </div>
        </div>

        {/* Preferences Tags */}
        {prefs.length > 0 && (
          <div className="preferences-tags">
            {prefs.map((pref, idx) => (
              <span key={idx} className="pref-tag">{pref}</span>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="blueprint-summary">
        <h3>Scout's Summary</h3>
        <p>{plan.summary}</p>
      </div>

      {/* Image Placeholders */}
      {plan.imageUrls && plan.imageUrls.length > 0 && (
        <div className="blueprint-images">
          {plan.imageUrls.map((url, idx) => (
            <div key={idx} className="image-placeholder">
              <img src={url} alt={`${plan.destination} ${idx + 1}`} />
            </div>
          ))}
        </div>
      )}

      {/* Visual Placeholder for Future Stable Diffusion */}
      {(!plan.imageUrls || plan.imageUrls.length === 0) && (
        <div className="blueprint-images">
          <div className="image-placeholder">
            <div className="placeholder-content">
              <span className="placeholder-icon">🏞️</span>
              <span className="placeholder-text">
                Destination Image<br/>
                <small>(Stable Diffusion integration coming soon)</small>
              </span>
            </div>
          </div>
          <div className="image-placeholder">
            <div className="placeholder-content">
              <span className="placeholder-icon">🍜</span>
              <span className="placeholder-text">
                Local Cuisine<br/>
                <small>(AI-generated)</small>
              </span>
            </div>
          </div>
          <div className="image-placeholder">
            <div className="placeholder-content">
              <span className="placeholder-icon">🏛️</span>
              <span className="placeholder-text">
                Main Attraction<br/>
                <small>(AI-generated)</small>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Itinerary */}
      <div className="blueprint-itinerary">
        <h3>Detailed Itinerary</h3>
        <div className="itinerary-days">
          {plan.itinerary.map((day) => (
            <ItineraryDay key={day.day} day={day} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="blueprint-actions">
        <button onClick={() => setShowShareModal(true)} className="btn btn-primary">
          🔗 Share Plan
        </button>
        {onDownloadPDF && (
          <button onClick={onDownloadPDF} className="btn btn-secondary">
            📄 Download PDF
          </button>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Share Your Holiday Blueprint</h2>
            </div>
            <div className="modal-body">
              <p>Share this link with friends and family:</p>
              <div className="share-link-container">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="share-link-input"
                />
                <button onClick={handleCopyLink} className="btn btn-small btn-primary">
                  Copy
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowShareModal(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
