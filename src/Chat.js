import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';

const AWS_ENDPOINT = process.env.REACT_APP_AWS_ENDPOINT || '';

const SUGGESTIONS = [
  'What are your core skills?',
  'Tell me about your experience with AWS.',
  'Are you available for new roles?',
];

const ERROR_REPLY = 'Sorry — I had trouble reaching the assistant. Please try again.';

async function sendMessageToAWS(messages) {
  if (!AWS_ENDPOINT) return { reply: 'Backend not configured.' };
  try {
    const res = await fetch(AWS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) return { reply: ERROR_REPLY };
    const data = await res.json().catch(() => ({}));
    return { reply: data.reply || ERROR_REPLY };
  } catch {
    return { reply: ERROR_REPLY };
  }
}

export default function Chat({ inputRef: externalInputRef }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const internalInputRef = useRef();
  const inputRef = externalInputRef || internalInputRef;
  const threadRef = useRef();

  const isBackendConfigured = !!AWS_ENDPOINT;
  const isEmpty = messages.length === 0;

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    const response = await sendMessageToAWS(newMessages);
    setMessages([...newMessages, { role: 'assistant', content: response.reply }]);
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  return (
    <section className="chat" aria-label="Chat Interface">
      <div className="chat__panel">
        <header className="chat__header">
          <span className="chat__avatar" aria-hidden="true">AI</span>
          <div>
            <h2 className="chat__title">AI Assistant</h2>
            <span className="chat__status">
              <span className={`chat__status-dot ${isBackendConfigured ? '' : 'is-off'}`} />
              {isBackendConfigured ? 'Online' : 'Offline'}
            </span>
          </div>
        </header>

        <div className="chat__thread" ref={threadRef} aria-live="polite">
          {isEmpty && !loading && (
            <div className="chat__empty">
              <p className="chat__empty-title">Ask me anything</p>
              <p className="chat__empty-sub">
                I can talk through skills, experience, and availability.
              </p>
              <div className="chat__suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chip"
                    onClick={() => send(s)}
                    disabled={!isBackendConfigured}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`bubble bubble--${msg.role}`}>
              <span className="bubble__text">{msg.content}</span>
            </div>
          ))}

          {loading && (
            <div className="bubble bubble--assistant" aria-label="Assistant is typing">
              <span className="typing">
                <span /><span /><span />
              </span>
            </div>
          )}
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="composer__input"
            placeholder={isBackendConfigured ? 'Type your message…' : 'Chat is currently offline'}
            aria-label="Type your message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || !isBackendConfigured}
          />
          <button
            type="submit"
            className="composer__send"
            aria-label="Send message"
            disabled={loading || !isBackendConfigured || !input.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 20.5v-6l8-2.5-8-2.5v-6l18 8.5z" fill="currentColor" />
            </svg>
          </button>
        </form>

        {!isBackendConfigured && (
          <p className="chat__notice" role="alert">
            Chat backend not configured. Set <code>REACT_APP_AWS_ENDPOINT</code> to enable live replies.
          </p>
        )}
      </div>
    </section>
  );
}
