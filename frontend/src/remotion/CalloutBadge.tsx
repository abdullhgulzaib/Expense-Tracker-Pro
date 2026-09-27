import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface CalloutBadgeProps {
  step: string;
  stepNumber?: string;
  title: string;
  subtitle?: string;
  icon?: string;
}

export const CalloutBadge: React.FC<CalloutBadgeProps> = ({
  step,
  stepNumber = '01',
  title,
  subtitle,
  icon = '✦',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const translateY = interpolate(entrance, [0, 1], [-40, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.92, 1]);

  // Typography kinetic reveal animation
  const titleLetters = title.split(' ');
  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subtitleTranslateX = interpolate(frame, [15, 30], [15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pulse glow ring for icon
  const pulse = Math.sin((frame / 30) * Math.PI * 2) * 0.15 + 0.85;

  return (
    <div
      style={{
        position: 'absolute',
        top: 38,
        right: 48,
        zIndex: 999,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '16px 26px',
        borderRadius: 20,
        backgroundColor: 'rgba(7, 17, 31, 0.94)',
        backdropFilter: 'blur(28px) saturate(180%)',
        border: '1.5px solid rgba(56, 189, 248, 0.45)',
        boxShadow:
          '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        maxWidth: 580,
      }}
    >
      {/* High-visibility Pulsing Icon Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          minWidth: 52,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #00D9FF 0%, #2563eb 100%)',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: 24,
          boxShadow: `0 8px 24px rgba(0, 217, 255, ${0.45 * pulse})`,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          transform: `scale(${pulse})`,
        }}
      >
        {icon}
      </div>

      {/* Typography Body with Kinetic Reveal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Step Badge Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.14)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              padding: '2px 10px',
              borderRadius: 6,
            }}
          >
            {step} • {stepNumber}
          </span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
              display: 'inline-block',
            }}
          />
        </div>

        {/* Title with Word-by-Word Stagger Typography */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.01em',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            lineHeight: 1.25,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
          }}
        >
          {titleLetters.map((word, index) => {
            const wordDelay = index * 4;
            const wordSpring = spring({
              frame: Math.max(0, frame - wordDelay),
              fps,
              config: { damping: 12, stiffness: 180 },
            });
            const wordOpacity = interpolate(wordSpring, [0, 1], [0, 1]);
            const wordY = interpolate(wordSpring, [0, 1], [12, 0]);

            return (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Subtitle with Animated Reveal */}
        {subtitle && (
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#94a3b8',
              opacity: subtitleOpacity,
              transform: `translateX(${subtitleTranslateX}px)`,
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
