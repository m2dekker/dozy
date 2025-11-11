import React, { useState, useEffect } from 'react';
import { AIModel, CloneBio, saveCloneBio, getCloneBio } from '@/lib/journal';

interface BioFormProps {
  cloneId: string;
  cloneName: string;
  onSave?: () => void;
}

export default function BioForm({ cloneId, cloneName, onSave }: BioFormProps) {
  const [bio, setBio] = useState('');
  const [aiModel, setAiModel] = useState<AIModel>('claude');
  const [wordCount, setWordCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing bio if available
    const existingBio = getCloneBio(cloneId);
    if (existingBio) {
      setBio(existingBio.bio);
      setAiModel(existingBio.aiModel);
      setWordCount(existingBio.bio.split(/\s+/).filter(w => w).length);
    }
  }, [cloneId]);

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setBio(text);

    const words = text.split(/\s+/).filter(w => w).length;
    setWordCount(words);
  };

  const handleSave = () => {
    if (!bio.trim()) {
      alert('Please enter a bio for your clone');
      return;
    }

    if (wordCount < 10 || wordCount > 150) {
      alert('Bio must be between 10-150 words');
      return;
    }

    const cloneBio: CloneBio = {
      cloneId,
      bio: bio.trim(),
      aiModel
    };

    saveCloneBio(cloneBio);
    setSaved(true);
    setShowForm(false);

    if (onSave) {
      onSave();
    }

    setTimeout(() => setSaved(false), 3000);
  };

  const existingBio = getCloneBio(cloneId);

  return (
    <div className="bio-form-container">
      {!showForm && existingBio && (
        <div className="bio-display">
          <div className="bio-header">
            <h4>📖 {cloneName}'s Personality</h4>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-small"
            >
              Edit
            </button>
          </div>
          <p className="bio-text">{existingBio.bio}</p>
          <div className="bio-meta">
            <span className="ai-badge">{existingBio.aiModel === 'claude' ? '🤖 Claude' : '💬 ChatGPT'}</span>
          </div>
        </div>
      )}

      {(!existingBio || showForm) && (
        <div className="bio-form">
          <div className="bio-form-header">
            <h4>📝 Set Personality for {cloneName}</h4>
            {showForm && (
              <button
                onClick={() => setShowForm(false)}
                className="btn btn-small btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="form-group">
            <label>
              Personality Bio (10-150 words)
              <span className="word-count">
                {wordCount} words
                {wordCount > 0 && (wordCount < 10 || wordCount > 150) && (
                  <span className="warning"> ⚠️</span>
                )}
              </span>
            </label>
            <textarea
              value={bio}
              onChange={handleBioChange}
              placeholder="e.g., I'm sarcastic, love coffee and street food, hate mornings and tourist traps. I get excited about architecture and local markets. I'm always looking for authentic experiences off the beaten path."
              rows={4}
              className="bio-textarea"
            />
            <p className="help-text">
              Describe your personality, likes, dislikes, and travel style. This shapes how your clone experiences destinations.
            </p>
          </div>

          <div className="form-group">
            <label>AI Model</label>
            <div className="model-selector">
              <label className="radio-option">
                <input
                  type="radio"
                  name="aiModel"
                  value="claude"
                  checked={aiModel === 'claude'}
                  onChange={() => setAiModel('claude')}
                />
                <span className="radio-label">
                  <span className="radio-icon">🤖</span>
                  <span className="radio-text">
                    <strong>Claude</strong>
                    <small>Anthropic - Creative & nuanced</small>
                  </span>
                </span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="aiModel"
                  value="chatgpt"
                  checked={aiModel === 'chatgpt'}
                  onChange={() => setAiModel('chatgpt')}
                />
                <span className="radio-label">
                  <span className="radio-icon">💬</span>
                  <span className="radio-text">
                    <strong>ChatGPT</strong>
                    <small>OpenAI - Conversational & detailed</small>
                  </span>
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={wordCount < 10 || wordCount > 150}
          >
            Save Personality
          </button>

          {saved && (
            <div className="save-success">
              ✅ Personality saved! Your clone will reflect this in their journal.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
