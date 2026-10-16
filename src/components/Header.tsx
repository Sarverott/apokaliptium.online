import React from 'react';

interface HeaderProps {
  isPaused: boolean;
  onToggleMotion: () => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isPaused,
  onToggleMotion,
  isMenuOpen,
  onToggleMenu,
}) => {
  return (
    <header>
      <a className="brand" href="#opening">
        <span className="sigil">◈</span> APOKALIPTIUM
      </a>
      <div className="header-right">
        <span className="edition">A VISION IN MOTION / 001</span>
        <button
          id="motion"
          type="button"
          aria-pressed={isPaused}
          onClick={onToggleMotion}
        >
          {isPaused ? (
            <>
              ▶ <span>Wznów ruch</span>
            </>
          ) : (
            <>
              Ⅱ <span>Zatrzymaj ruch</span>
            </>
          )}
        </button>
        <button
          id="menu"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="chapters"
          onClick={onToggleMenu}
        >
          Rozdziały <span>☰</span>
        </button>
      </div>
    </header>
  );
};
