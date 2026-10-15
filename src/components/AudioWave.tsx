import React, { useMemo } from 'react';

export const AudioWave: React.FC = () => {
  const bars = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => ({
      key: i,
      delay: `${-i * 0.137}s`,
      duration: `${0.5 + (i % 7) * 0.17}s`,
    }));
  }, []);

  return (
    <div className="wave" aria-hidden="true">
      {bars.map((bar) => (
        <i
          key={bar.key}
          style={{
            animationDelay: bar.delay,
            animationDuration: bar.duration,
          }}
        />
      ))}
    </div>
  );
};
