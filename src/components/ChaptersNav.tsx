import React, { useEffect, useRef } from 'react';
import { CHAPTERS } from '../data/content';

interface ChaptersNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChaptersNav: React.FC<ChaptersNavProps> = ({ isOpen, onClose }) => {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
        const menuBtn = document.querySelector<HTMLButtonElement>('#menu');
        menuBtn?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <nav
      id="chapters"
      ref={navRef}
      aria-label="Rozdziały"
      hidden={!isOpen}
    >
      <span className="eyebrow">WYBIERZ KLATKĘ</span>
      {CHAPTERS.map((ch) => (
        <a
          key={ch.id}
          href={`#${ch.id}`}
          onClick={() => {
            onClose();
          }}
        >
          {ch.number} / {ch.title}
        </a>
      ))}
    </nav>
  );
};
