import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface TopCenterHeaderProps {
  title: string;
  description: string;
  badge?: string;
  accentColor?: string;
  durationInFrames: number;
}

export const TopCenterHeader: React.FC<TopCenterHeaderProps> = ({
  title,
  description,
  badge,
  accentColor = '#38BDF8',
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation
  const titleSpring = spring({
    frame,
    fps,
    config: {
      damping: 14,
      mass: 0.7,
      stiffness: 110,
    },
  });

  const descSpring = spring({
    frame: frame - 4,
    fps,
    config: {
      damping: 14,
      mass: 0.7,
      stiffness: 100,
    },
  });

  // Exit fade animation during last 14 frames
  const exitFade = interpolate(
    frame,
    [durationInFrames - 14, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const titleTranslateY = interpolate(titleSpring, [0, 1], [-25, 0]);
  const descTranslateY = interpolate(descSpring, [0, 1], [-15, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]) * exitFade;
  const descOpacity = interpolate(descSpring, [0, 1], [0, 1]) * exitFade;

  return (
    <div
      style={{
        position: 'absolute',
        top: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        width: '100%',
        maxWidth: 1400,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      {/* Category / Step Pill if provided */}
      {badge && (
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleTranslateY}px)`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${accentColor}40`,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}`,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: accentColor,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Prominent Bold Headline */}
      <h1
        style={{
          margin: 0,
          fontSize: 42,
          fontWeight: 900,
          letterSpacing: '-0.03em',
          color: '#FFFFFF',
          opacity: titleOpacity,
          transform: `translateY(${titleTranslateY}px)`,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textShadow:
            '0 4px 24px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {title}
      </h1>

      {/* Clear Descriptive Subtitle */}
      <p
        style={{
          margin: '8px 0 0 0',
          fontSize: 20,
          fontWeight: 500,
          color: '#CBD5E1',
          opacity: descOpacity,
          transform: `translateY(${descTranslateY}px)`,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textShadow: '0 2px 14px rgba(0, 0, 0, 0.8)',
          letterSpacing: '-0.01em',
        }}
      >
        {description}
      </p>
    </div>
  );
};
