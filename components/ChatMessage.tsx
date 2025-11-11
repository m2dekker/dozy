import React, { useState } from 'react';
import { DialogueMessage } from '@/lib/dialogue';
import { getCloneAvatar } from '@/lib/dialogue';

interface ChatMessageProps {
  message: DialogueMessage;
  index: number;
}

export default function ChatMessage({ message, index }: ChatMessageProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const avatar = getCloneAvatar(message.destination);

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    const audio = document.getElementById(`audio-${message.id}`) as HTMLAudioElement;
    if (audio) {
      audio.play();
      audio.onended = () => setIsPlayingAudio(false);
    }
  };

  return (
    <div className="chat-message" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="message-avatar">{avatar}</div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-author">{message.cloneName}</span>
          <span className="message-location">📍 {message.destination}</span>
        </div>
        <div className="message-text">{message.message}</div>
        {message.audioUrl && (
          <div className="message-audio">
            <button
              onClick={handlePlayAudio}
              className="audio-play-btn"
              disabled={isPlayingAudio}
            >
              {isPlayingAudio ? '🔊 Playing...' : '🔊 Play Voice'}
            </button>
            <audio id={`audio-${message.id}`} src={message.audioUrl} preload="none" />
          </div>
        )}
      </div>
    </div>
  );
}
