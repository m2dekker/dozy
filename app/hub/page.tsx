'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  getClones,
  CloneData
} from '@/lib/travel';
import {
  DialogueMessage,
  GroupDialogue,
  saveDialogue,
  getLatestDialogue,
  createShareableUrl,
  parseGuestCloneFromUrl,
  generateDialogueId
} from '@/lib/dialogue';
import ChatMessage from '@/components/ChatMessage';
import { Language, getTranslations, getLanguage } from '@/lib/translations';

export default function HubPage() {
  const router = useRouter();
  const [clones, setClones] = useState<CloneData[]>([]);
  const [dialogue, setDialogue] = useState<GroupDialogue | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const t = getTranslations(language);

  useEffect(() => {
    // Load language
    setLanguage(getLanguage());

    // Load arrived clones
    const allClones = getClones();
    const arrivedClones = allClones.filter(c => c.hasArrived);

    // Check for guest clone in URL
    const guestCloneId = parseGuestCloneFromUrl();
    if (guestCloneId) {
      // In a real app, fetch from Supabase
      // For now, just log it
      console.log('Guest clone requested:', guestCloneId);
    }

    setClones(arrivedClones);

    // Load existing dialogue if available
    const existingDialogue = getLatestDialogue();
    if (existingDialogue) {
      setDialogue(existingDialogue);
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current && dialogue) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [dialogue]);

  const handleGenerateDialogue = async () => {
    if (clones.length === 0) {
      setError('No clones have arrived yet! Send some clones first.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Limit to 10 clones
      const limitedClones = clones.slice(0, 10);

      const response = await fetch('/api/generate-dialogue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clones: limitedClones.map(c => ({
            id: c.id,
            name: c.name,
            destination: c.destination
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate dialogue');
      }

      // Convert dialogue to DialogueMessage format
      const messages: DialogueMessage[] = data.dialogue.map((msg: any, idx: number) => {
        const clone = limitedClones.find(c => c.name === msg.cloneName);
        return {
          id: `msg_${Date.now()}_${idx}`,
          cloneId: clone?.id || '',
          cloneName: msg.cloneName,
          destination: clone?.destination || '',
          message: msg.message,
          timestamp: Date.now() + idx,
          shouldHaveVoice: msg.shouldHaveVoice
        };
      });

      const newDialogue: GroupDialogue = {
        id: generateDialogueId(),
        participants: limitedClones,
        messages: messages,
        createdAt: Date.now()
      };

      setDialogue(newDialogue);
      saveDialogue(newDialogue);

      // Generate voice for marked messages
      await generateVoiceForMessages(messages);

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to generate dialogue');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVoiceForMessages = async (messages: DialogueMessage[]) => {
    // Find messages marked for voice
    const voiceMessages = messages.filter(m => (m as any).shouldHaveVoice);

    if (voiceMessages.length === 0) return;

    setIsGeneratingVoice(true);

    // Generate voice for first 2 marked messages
    const toGenerate = voiceMessages.slice(0, 2);

    for (const msg of toGenerate) {
      try {
        const response = await fetch('/api/generate-voice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: msg.message,
            voiceId: null // Use default voice
          }),
        });

        const data = await response.json();

        if (response.ok && data.audioUrl) {
          // Update message with audio URL
          setDialogue(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: prev.messages.map(m =>
                m.id === msg.id ? { ...m, audioUrl: data.audioUrl } : m
              )
            };
          });
        }
      } catch (err) {
        console.error('Failed to generate voice for message:', err);
        // Continue with other messages
      }
    }

    setIsGeneratingVoice(false);
  };

  const handleInviteFriend = () => {
    if (clones.length === 0) {
      setError('Create a clone first to generate a shareable link!');
      return;
    }

    // Use first clone as shareable
    const url = createShareableUrl(clones[0].id);
    setShareUrl(url);
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  const handleBackHome = () => {
    router.push('/');
  };

  return (
    <main className="hub-container">
      <div className="hub-card">
        {/* Header */}
        <div className="hub-header">
          <button onClick={handleBackHome} className="btn-back">
            ← Back
          </button>
          <h1 className="hub-title">🌐 CloneSync Social Hub</h1>
          <button onClick={handleInviteFriend} className="btn-invite">
            🔗 Invite Friend
          </button>
        </div>

        <p className="hub-subtitle">
          Your clones meet here to share their travel stories!
        </p>

        {/* Stats */}
        <div className="hub-stats">
          <div className="stat-item">
            <span className="stat-value">{clones.length}</span>
            <span className="stat-label">Clones in Hub</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{dialogue?.messages.length || 0}</span>
            <span className="stat-label">Messages</span>
          </div>
        </div>

        {/* Empty State */}
        {clones.length === 0 && (
          <div className="hub-empty">
            <div className="empty-icon">🛫</div>
            <h3>No Clones Here Yet!</h3>
            <p>Send some clones on adventures first, then come back here to see them chat!</p>
            <button onClick={handleBackHome} className="btn btn-primary">
              Go Send Clones
            </button>
          </div>
        )}

        {/* Clone List */}
        {clones.length > 0 && (
          <div className="hub-clones">
            <h3 className="section-subtitle">
              👥 Clones in the Hub ({clones.length > 10 ? '10/' : ''}{clones.length})
            </h3>
            <div className="clone-chips">
              {clones.slice(0, 10).map(clone => (
                <div key={clone.id} className="clone-chip">
                  <span className="chip-name">{clone.name}</span>
                  <span className="chip-location">📍 {clone.destination}</span>
                </div>
              ))}
            </div>
            {clones.length > 10 && (
              <p className="hub-note">
                ℹ️ Showing first 10 clones for performance
              </p>
            )}
          </div>
        )}

        {/* Generate Button */}
        {clones.length > 0 && !dialogue && (
          <div className="hub-action">
            <button
              onClick={handleGenerateDialogue}
              disabled={isGenerating}
              className="btn btn-primary btn-large"
            >
              {isGenerating ? '✨ Generating Chat...' : '✨ Start Group Chat'}
            </button>
            <p className="action-hint">
              Your clones will share stories and banter about their adventures!
            </p>
          </div>
        )}

        {/* Chat Messages */}
        {dialogue && (
          <div className="chat-container" ref={chatContainerRef}>
            <div className="chat-messages">
              {dialogue.messages.map((message, idx) => (
                <ChatMessage key={message.id} message={message} index={idx} />
              ))}
            </div>

            {isGeneratingVoice && (
              <div className="voice-status">
                🎙️ Generating voice for key messages...
              </div>
            )}

            {/* Regenerate Button */}
            <div className="chat-footer">
              <button
                onClick={handleGenerateDialogue}
                disabled={isGenerating}
                className="btn btn-secondary"
              >
                {isGenerating ? 'Generating...' : '🔄 Generate New Chat'}
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="hub-error">{error}</div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔗 Invite Friend's Clone</h2>
            </div>
            <div className="modal-body">
              <p>Share this link with your friend so their clone can join the hub:</p>
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
              <p className="share-hint">
                ℹ️ Their clone will appear in the hub and join the conversation!
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowShareModal(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
