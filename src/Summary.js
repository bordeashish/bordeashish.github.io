import React from 'react';
import './Summary.css';

const SKILLS = [
  'Delivery Management',
  'AWS',
  'GCP',
  'AI/ML',
  'SAFe Agile',
  'Data Engineering',
];

export default function Summary({ onAsk }) {
  return (
    <section className="summary" aria-label="Professional Summary">
      <span className="summary__eyebrow stagger" style={{ '--i': 0 }}>
        <span className="summary__dot" aria-hidden="true" />
        Available for opportunities
      </span>

      <h1 className="summary__title stagger" style={{ '--i': 1 }}>
        Ashish Borde
      </h1>

      <p className="summary__subhead stagger" style={{ '--i': 2 }}>
        Delivery leader for <span className="summary__accent">cloud, data &amp; AI</span>
      </p>

      <p className="summary__lead stagger" style={{ '--i': 3 }}>
        Strategic Delivery Manager with 12+ years turning complex cloud, data &amp; AI
        programmes into shipped outcomes — SAFe/PRINCE2 rigor paired with hands-on AWS,
        GCP and ML. London-based, open to new roles.
      </p>

      <ul className="summary__skills stagger" style={{ '--i': 4 }} aria-label="Key skills">
        {SKILLS.map((skill) => (
          <li key={skill} className="pill">
            <span className="pill__dot" aria-hidden="true" />
            {skill}
          </li>
        ))}
      </ul>

      <div className="summary__actions stagger" style={{ '--i': 5 }}>
        <button type="button" className="btn btn--primary" onClick={onAsk}>
          Ask the assistant
        </button>
        <a className="btn btn--ghost" href="mailto:bordeashish@gmail.com">
          Get in touch
        </a>
      </div>
    </section>
  );
}
