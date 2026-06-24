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
      <span className="summary__eyebrow">
        <span className="summary__dot" aria-hidden="true" />
        Available for opportunities
      </span>

      <h1 className="summary__title">
        Ashish Borde — delivery leader for{' '}
        <span className="summary__accent">cloud, data &amp; AI</span>
      </h1>

      <p className="summary__lead">
        Strategic Delivery Manager with 12+ years leading digital transformation and data
        engineering programs across telecom and tech — pairing SAFe and PRINCE2 delivery
        rigor with hands-on AWS, GCP, and AI/ML fluency. London-based and open to new roles.
      </p>

      <ul className="summary__skills" aria-label="Key skills">
        {SKILLS.map((skill) => (
          <li key={skill} className="pill">{skill}</li>
        ))}
      </ul>

      <div className="summary__actions">
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
