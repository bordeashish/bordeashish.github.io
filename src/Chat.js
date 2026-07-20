import React, { useState, useRef, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import './Chat.css';

// Both values are public by design: the sitekey is meant to be embedded in client
// HTML, and the Worker URL is protected by Turnstile + a server-side key, not by
// obscurity. Env vars exist only to override (e.g. pointing at a staging Worker).
const CHAT_API_URL =
  process.env.REACT_APP_CHAT_API_URL ||
  'https://ashish-portfolio-chatbot-edge.bordeashish.workers.dev/';
const TURNSTILE_SITEKEY =
  process.env.REACT_APP_TURNSTILE_SITEKEY || '0x4AAAAAAD56IKsZD9ZC6BV2';

const SUGGESTIONS = [
  { label: 'Standout achievements', query: "What are Ashish's standout achievements?" },
  { label: 'Leading distributed teams', query: 'How does he lead distributed teams?' },
  { label: 'Hands-on technical depth', query: 'How hands-on is he technically?' },
  { label: "What he's looking for next", query: 'What is he looking for in his next role?' },
];

const ERROR_REPLY = 'Sorry — I had trouble reaching the assistant. Please try again.';
const BUSY_REPLY = 'The assistant is busy right now — please try again later.';
const TOO_LONG_REPLY = 'That message is a bit too long — please shorten it and try again.';
const VERIFY_REPLY = "Human verification didn't go through — please try sending again.";

async function sendMessageToWorker(messages, turnstileToken) {
  if (!turnstileToken) return { reply: VERIFY_REPLY };
  try {
    const res = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-turnstile-response': turnstileToken,
      },
      body: JSON.stringify({ messages }),
    });
    // The Worker normalizes every JSON response to { reply }, any status; parse
    // defensively anyway — a network/edge failure may carry no JSON at all.
    const data = await res.json().catch(() => ({}));
    if (data.reply) return { reply: data.reply };
    if (res.status === 403) return { reply: VERIFY_REPLY };
    if (res.status === 429) return { reply: BUSY_REPLY };
    if (res.status === 400 || res.status === 413) return { reply: TOO_LONG_REPLY };
    return { reply: ERROR_REPLY };
  } catch {
    return { reply: ERROR_REPLY };
  }
}

const REVEAL_INTERVAL = 32; // ms between reveal ticks
const REVEAL_CAP = 3000; // max ms to fully reveal a reply

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// --- Minimal, dependency-free markdown rendering -------------------------------
// Handles the subset the backend emits: **bold**, *italic*, `code`, bullet and
// numbered lists, headings, and paragraphs. Built from React elements only (no
// dangerouslySetInnerHTML) so there is no XSS risk.

function parseInline(text) {
  const nodes = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let last = 0;
  let m;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2] !== undefined) nodes.push(<strong key={key++}>{m[2]}</strong>);
    else if (m[3] !== undefined) nodes.push(<em key={key++}>{m[3]}</em>);
    else if (m[4] !== undefined) nodes.push(<code key={key++}>{m[4]}</code>);
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const BULLET = /^\s*[-*]\s+/;
const NUMBERED = /^\s*\d+\.\s+/;
const HEADING = /^\s*(#{1,6})\s+(.*)$/;
const HR = /^\s*([-*_])\1{2,}\s*$/; // ---, ***, ___

function renderMarkdown(text) {
  const lines = String(text).replace(/\r/g, '').split('\n');
  const blocks = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    if (!lines[i].trim()) { i += 1; continue; } // blank line separates blocks

    if (HR.test(lines[i])) { // horizontal rule (---, ***, ___)
      blocks.push(<hr key={key++} className="md-hr" />);
      i += 1;
      continue;
    }

    if (BULLET.test(lines[i])) {
      const items = [];
      while (i < lines.length && BULLET.test(lines[i])) {
        items.push(<li key={key++}>{parseInline(lines[i].replace(BULLET, ''))}</li>);
        i += 1;
      }
      blocks.push(<ul key={key++}>{items}</ul>);
      continue;
    }

    if (NUMBERED.test(lines[i])) {
      const items = [];
      while (i < lines.length && NUMBERED.test(lines[i])) {
        items.push(<li key={key++}>{parseInline(lines[i].replace(NUMBERED, ''))}</li>);
        i += 1;
      }
      blocks.push(<ol key={key++}>{items}</ol>);
      continue;
    }

    const h = lines[i].match(HEADING);
    if (h) {
      blocks.push(<p key={key++} className="md-h">{parseInline(h[2])}</p>);
      i += 1;
      continue;
    }

    // paragraph: gather consecutive plain lines (soft line breaks within)
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !BULLET.test(lines[i]) &&
      !NUMBERED.test(lines[i]) &&
      !HEADING.test(lines[i]) &&
      !HR.test(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push(
      <p key={key++}>
        {para.map((line, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <br />}
            {parseInline(line)}
          </React.Fragment>
        ))}
      </p>
    );
  }
  return blocks;
}

export default function Chat({ inputRef: externalInputRef }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState(null); // { full, shown } in-progress reply
  // Turnstile runs in deferred-execution mode: no challenge on page load — the
  // first send starts it (execute()), and each send then pre-solves the next
  // message's token in the background. send() awaits the token, so no request
  // ever goes out without one even though the UI is never token-gated.
  const [tsError, setTsError] = useState(false);
  // Cloudflare requires the visitor to tick the checkbox (interactive challenge).
  const [tsInteractionNeeded, setTsInteractionNeeded] = useState(false);
  const tsRef = useRef(null);
  const tsStartedRef = useRef(false); // execute() called at least once
  // Consecutive widget failures. First-visit challenges can fail with transient,
  // retryable codes (Cloudflare 300xxx/600xxx) — retry silently before alarming
  // the visitor.
  const tsFailsRef = useRef(0);
  const TS_SILENT_RETRIES = 2;

  // Clear + start solving a fresh token (tokens are single-use).
  const tsSolveNext = () => {
    tsRef.current?.reset();
    tsRef.current?.execute();
  };
  const internalInputRef = useRef();
  const inputRef = externalInputRef || internalInputRef;
  const threadRef = useRef();
  const timerRef = useRef(null);

  const isEmpty = messages.length === 0 && !stream;

  // Keep the most recent question anchored near the top of the thread, so the
  // answer reads from the start as it streams in (and a long reply doesn't leave
  // you stranded at its end). The target scroll position is the question's offset,
  // clamped — so while the answer grows the question progressively settles to the top.
  const scrollQuestionToTop = (behavior = 'auto') => {
    const thread = threadRef.current;
    if (!thread) return;
    const users = thread.querySelectorAll('.bubble--user');
    const el = users[users.length - 1];
    if (!el) return;
    const top =
      el.getBoundingClientRect().top -
      thread.getBoundingClientRect().top +
      thread.scrollTop -
      12;
    thread.scrollTo({ top: Math.max(0, top), behavior });
  };

  useEffect(() => {
    if (messages.length === 0) return;
    const smooth = messages[messages.length - 1].role === 'assistant';
    requestAnimationFrame(() => scrollQuestionToTop(smooth ? 'smooth' : 'auto'));
  }, [messages]);

  // Commit the in-progress streamed reply to the message history.
  const commitStream = (full) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setMessages((prev) => [...prev, { role: 'assistant', content: full }]);
    setStream(null);
  };

  // Drive the word-by-word reveal whenever a new stream target is set.
  useEffect(() => {
    if (!stream) return;
    const { full } = stream;

    if (prefersReducedMotion()) {
      commitStream(full);
      return;
    }

    const words = full.split(/(\s+)/); // keep whitespace tokens so spacing is preserved
    const wordCount = words.filter((w) => w.trim()).length;
    const perTick = Math.max(1, Math.ceil(wordCount / (REVEAL_CAP / REVEAL_INTERVAL)));
    let i = 0;

    timerRef.current = setInterval(() => {
      // advance by `perTick` non-space words (consuming trailing spaces too)
      let advanced = 0;
      while (i < words.length && advanced < perTick) {
        i += 1;
        if (words[i - 1].trim()) advanced += 1;
        while (i < words.length && !words[i].trim()) i += 1; // swallow following spaces
      }
      const shownText = words.slice(0, i).join('');
      if (i >= words.length) {
        commitStream(full);
      } else {
        setStream((s) => (s ? { ...s, shown: shownText } : s));
        scrollQuestionToTop('auto'); // keep the question anchored as the answer grows
      }
    }, REVEAL_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [stream?.full]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading || tsError) return;
    // Finalize any in-progress reveal before starting a new turn.
    if (stream) commitStream(stream.full);

    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Acquire the single-use token. The first send starts the challenge; later
    // sends usually find the pre-solved token instantly. If Cloudflare demands
    // interaction, the wait covers the visitor ticking the checkbox below.
    let token = null;
    if (tsRef.current) {
      if (!tsStartedRef.current) {
        tsStartedRef.current = true;
        tsRef.current.execute();
      }
      try {
        token = await tsRef.current.getResponsePromise(30000);
      } catch {
        token = null;
      }
      tsSolveNext(); // consume it and pre-solve the next message's token
    }

    const response = await sendMessageToWorker(newMessages, token);
    setLoading(false);
    setStream({ full: response.reply, shown: '' });
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
              <span className={`chat__status-dot ${tsError ? 'is-off' : ''}`} />
              {tsError ? 'Offline' : 'Online'}
            </span>
          </div>
        </header>

        <div className="chat__thread" ref={threadRef} aria-live="polite" aria-busy={!!stream}>
          {isEmpty && !loading && (
            <div className="chat__empty">
              <p className="chat__empty-title">Ask me about Ashish</p>
              <p className="chat__empty-sub">
                Trained on his experience across cloud, data &amp; AI.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`bubble bubble--${msg.role}`}>
              {msg.role === 'assistant' ? (
                <div className="bubble__md">{renderMarkdown(msg.content)}</div>
              ) : (
                <span className="bubble__text">{msg.content}</span>
              )}
            </div>
          ))}

          {loading && (
            <div className="bubble bubble--assistant" aria-label="Assistant is typing">
              <span className="typing">
                <span /><span /><span />
              </span>
            </div>
          )}

          {stream && (
            <div
              className="bubble bubble--assistant bubble--streaming"
              onClick={() => commitStream(stream.full)}
              title="Click to skip"
              aria-hidden="true"
            >
              <span className="bubble__text">{stream.shown}</span>
              <span className="caret" />
            </div>
          )}
        </div>

        {isEmpty && !loading && (
          <div className="chat__starters" aria-label="Suggested questions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                className="chip"
                onClick={() => send(s.query)}
                disabled={tsError}
                title={s.query}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <form className="composer" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="composer__input"
            placeholder={tsError ? 'Verification unavailable' : 'Type your message…'}
            aria-label="Type your message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || tsError}
            maxLength={1000}
          />
          <button
            type="submit"
            className="composer__send"
            aria-label="Send message"
            disabled={loading || tsError || !input.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 20.5v-6l8-2.5-8-2.5v-6l18 8.5z" fill="currentColor" />
            </svg>
          </button>
        </form>

        {input.length > 0 && (
          <p className="composer__counter">{input.length}/1000</p>
        )}

        {tsInteractionNeeded && !tsError && (
          <p className="chat__verify-hint">
            Quick human check — please tick the box below to continue.
          </p>
        )}

        {/* Widget mounted once for the whole conversation, in deferred-execution
            mode: the challenge only runs when send() calls execute(). It stays
            hidden unless Cloudflare requires an interactive challenge, which
            materializes here, below the composer — so this container must stay
            renderable (never display:none). */}
        <div className="chat__turnstile">
          <Turnstile
            ref={tsRef}
            siteKey={TURNSTILE_SITEKEY}
            options={{ action: 'chat', appearance: 'interaction-only', execution: 'execute' }}
            scriptOptions={{ onError: () => setTsError(true) }}
            onSuccess={() => {
              tsFailsRef.current = 0;
              setTsError(false);
              setTsInteractionNeeded(false);
            }}
            onBeforeInteractive={() => setTsInteractionNeeded(true)}
            onAfterInteractive={() => setTsInteractionNeeded(false)}
            onExpire={() => tsSolveNext()}
            onError={(code) => {
              tsFailsRef.current += 1;
              if (tsFailsRef.current <= TS_SILENT_RETRIES) {
                console.warn(`Turnstile error ${code} — retrying (${tsFailsRef.current}/${TS_SILENT_RETRIES})`);
                tsSolveNext();
              } else {
                console.warn(`Turnstile error ${code} — giving up after ${TS_SILENT_RETRIES} retries`);
                setTsInteractionNeeded(false);
                setTsError(true);
              }
            }}
          />
        </div>

        {tsError && (
          <p className="chat__notice" role="alert">
            Human verification is unavailable (it may be blocked by an extension).{' '}
            <button
              type="button"
              className="chat__notice-retry"
              onClick={() => {
                tsFailsRef.current = 0;
                setTsError(false);
                if (tsStartedRef.current) tsSolveNext();
              }}
            >
              Retry
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
