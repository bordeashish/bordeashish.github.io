import React, { useState, useRef } from 'react';

const AWS_ENDPOINT = process.env.REACT_APP_AWS_ENDPOINT || '';

function sendMessageToAWS(messages) {
  if (!AWS_ENDPOINT) return Promise.resolve({ reply: 'Backend not configured.' });
  return fetch(AWS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
    .then(res => res.json())
    .catch(() => ({ reply: 'Error contacting backend.' }));
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setLoading(true);
    const response = await sendMessageToAWS(newMessages);
    setMessages([...newMessages, { role: 'assistant', content: response.reply }]);
    setInput('');
    setLoading(false);
    inputRef.current?.focus();
  };

  const isBackendConfigured = !!AWS_ENDPOINT;

  return (
    <section aria-label="Chat Interface" className="chat">
      <h2>Chat with AI Assistant</h2>
      <div className="messages" aria-live="polite">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          ref={inputRef}
          type="text"
          aria-label="Type your message"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading || !isBackendConfigured}
        />
        <button
          onClick={handleSend}
          disabled={loading || !isBackendConfigured}
          aria-disabled={loading || !isBackendConfigured}
        >
          Send
        </button>
      </div>
      {!isBackendConfigured && (
        <div className="fallback" role="alert">
          Chat backend not configured. Please set REACT_APP_AWS_ENDPOINT.
        </div>
      )}
    </section>
  );
}
