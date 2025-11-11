import React from 'react';
import { DialogueMessage } from '@/lib/dialogue';
import { getCloneAvatar } from '@/lib/dialogue';

interface ChatMessageProps {
  message: DialogueMessage;
  index: number;
}

export default function ChatMessage({ message, index }: ChatMessageProps) {
  const avatar = getCloneAvatar(message.destination);

  return (
    <div className="chat-message" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="message-avatar">{avatar}</div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-author">{message.cloneName}</span>
          <span className="message-location">📍 {message.destination}</span>
        </div>
        <div className="message-text">{message.message}</div>
      </div>
    </div>
  );
}
