'use client';

import { useState } from 'react';

const TIMELINE = [
  {
    year: '2022',
    title: 'Contenido próximamente.',
    text: 'Contenido próximamente.',
  },
  {
    year: '2023',
    title: 'Contenido próximamente.',
    text: 'Contenido próximamente.',
  },
  {
    year: '2024',
    title: 'Contenido próximamente.',
    text: 'Contenido próximamente.',
  },
  {
    year: '2025',
    title: 'Contenido próximamente.',
    text: 'Contenido próximamente.',
  },
];

export default function StoryCollapse() {
  const [storyOpen, setStoryOpen] = useState<boolean>(false);

  return (
            <div className="story-wrapper">
              <button
                className="story-toggle"
                onClick={() => setStoryOpen(!storyOpen)}
              >
                {storyOpen ? 'Ver menos ↑' : 'Ver la historia completa ↓'}
              </button>
              {storyOpen && (
                <ol className="story-timeline">
                  {TIMELINE.map((entry) => (
                    <li key={entry.year} className="story-timeline-item">
                      <span className="story-timeline-year">{entry.year}</span>
                      <div className="story-timeline-body">
                        <h4 className="story-timeline-title">{entry.title}</h4>
                        <p>{entry.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
  );
}
