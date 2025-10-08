import React, { useState } from 'react';
import Summary from './Summary';
import Chat from './Chat';
import './App.css';

export default function App() {
  const [view, setView] = useState('summary');
  return (
    <main aria-label="Professional AI Assistant Homepage">
      <nav aria-label="Main navigation" className="nav">
        <button
          aria-pressed={view === 'summary'}
          onClick={() => setView('summary')}
        >
          Summary
        </button>
        <button
          aria-pressed={view === 'chat'}
          onClick={() => setView('chat')}
        >
          Chat
        </button>
      </nav>
      <section className="content">
        {view === 'summary' ? <Summary /> : <Chat />}
      </section>
    </main>
  );
}
