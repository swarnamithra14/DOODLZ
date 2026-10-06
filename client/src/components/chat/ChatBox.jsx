import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, CheckCircle } from 'lucide-react';

export function ChatBox({
  messages,
  onSendMessage,
  isDrawer = false,
  hasGuessed = false,
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (isDrawer || hasGuessed) return;

    onSendMessage(inputText.trim());
    setInputText('');
  };

  const getPlaceholderText = () => {
    if (isDrawer) return "You are drawing — non-drawers guess!";
    if (hasGuessed) return "You guessed correctly! 🎉";
    return "Type your guess here...";
  };

  return (
    <div className="chat-card">
      <div className="sidebar-header" style={{ padding: '0.75rem 1rem 0' }}>
        <span>Live Guess Feed</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          if (msg.type === 'system') {
            return (
              <div key={index} className="chat-msg system-msg">
                {msg.text}
              </div>
            );
          }

          if (msg.type === 'correct') {
            return (
              <div key={index} className="chat-msg correct-guess">
                🎉 <strong>{msg.sender}</strong> guessed the secret word! (+{msg.points || 250} pts)
              </div>
            );
          }

          return (
            <div key={index} className="chat-msg">
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-bar">
        <input
          type="text"
          className="input-text"
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.9rem' }}
          placeholder={getPlaceholderText()}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isDrawer || hasGuessed}
          maxLength={50}
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={isDrawer || hasGuessed || !inputText.trim()}
          title="Send guess"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
