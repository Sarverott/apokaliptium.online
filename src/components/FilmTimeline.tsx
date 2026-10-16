import React from 'react';
import { TIMELINE_STEPS } from '../data/content';

export const FilmTimeline: React.FC = () => {
  return (
    <div
      className="film-timeline"
      tabIndex={0}
      aria-label="Sześć kadrów wizji przyszłości. Przewijaj poziomo."
    >
      {TIMELINE_STEPS.map((step, i) => (
        <article key={step.title} className="timeline-frame">
          <div
            className="timeline-image"
            style={{
              backgroundPosition: `${i * 20}% center`,
            }}
            role="img"
            aria-label={`${step.title} — kadr wizji przyszłości`}
          />
          <span>{step.label}</span>
          <h3>{step.title}</h3>
          <p>{step.desc}</p>
        </article>
      ))}
    </div>
  );
};
