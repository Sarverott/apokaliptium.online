import React from 'react';

interface RailProps {
  progressPercent: number;
  currentFrame: number;
  totalFrames: number;
}

export const Rail: React.FC<RailProps> = ({
  progressPercent,
  currentFrame,
  totalFrames,
}) => {
  const formattedCounter = `${String(currentFrame).padStart(2, '0')} / ${String(totalFrames).padStart(2, '0')}`;

  return (
    <aside className="rail" aria-hidden="true">
      <span>APOKALIPTIUM / THE LONG VIEW</span>
      <div className="track">
        <i id="progress" style={{ height: `${progressPercent}%` }} />
      </div>
      <b id="counter">{formattedCounter}</b>
    </aside>
  );
};
