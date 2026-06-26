import React, { useRef, useState } from 'react';
import Summary from './Summary';
import Chat from './Chat';
import './App.css';

function getInitialTheme() {
  if (typeof document !== 'undefined') {
    const set = document.documentElement.getAttribute('data-theme');
    if (set) return set;
  }
  return 'light';
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <svg
        className={`theme-toggle__icon ${isDark ? 'is-dark' : 'is-light'}`}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        {isDark ? (
          <path
            d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"
            fill="currentColor"
          />
        ) : (
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </g>
        )}
      </svg>
    </button>
  );
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const chatInputRef = useRef();

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      /* ignore storage failures */
    }
  };

  const focusChat = () => {
    chatInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    chatInputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="app">
      <div className="app__glow" aria-hidden="true" />

      <header className="topbar">
        <div className="topbar__inner">
          <a className="brand" href="/" aria-label="Home">
            <span className="brand__mark" aria-hidden="true">AB</span>
            <span className="brand__name">Ashish Borde</span>
          </a>
          <div className="topbar__actions">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <a className="btn btn--ghost btn--sm" href="mailto:bordeashish@gmail.com">
              Get in touch
            </a>
          </div>
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
