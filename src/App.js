import React, { useRef } from 'react';
import Summary from './Summary';
import Chat from './Chat';
import './App.css';

export default function App() {
  const chatInputRef = useRef();

  const focusChat = () => {
    chatInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    chatInputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <a className="brand" href="/" aria-label="Home">
            <span className="brand__mark" aria-hidden="true">AB</span>
            <span className="brand__name">Ashish Borde</span>
          </a>
          <a className="btn btn--ghost btn--sm" href="mailto:bordeashish@gmail.com">
            Get in touch
          </a>
        </div>
      </header>

      <main className="content" aria-label="Professional AI Assistant Homepage">
        <div className="split">
          <div className="split__summary">
            <Summary onAsk={focusChat} />
          </div>
          <div className="split__chat">
            <Chat inputRef={chatInputRef} />
          </div>
        </div>
      </main>
    </div>
  );
}
