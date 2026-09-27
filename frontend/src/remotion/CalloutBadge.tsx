import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface CalloutBadgeProps {
  step: string;
  title: string;
  subtitle?: string;
  icon?: string;
}

export const CalloutBadge: React.FC<CalloutBadgeProps> = ({ step, title, subtitle, icon = '✦' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [30, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 48,
        left: 64,
        zIndex: 100,
        opacity,
        transform: `translateY(${translateY}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 24px',
        borderRadius: 18,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: 18,
          boxShadow: '0 4px 14px rgba(14, 165, 233, 0.5)',
        }}
      >
        {icon}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#38bdf8',
            }}
          >
            {step}
          </span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#f8fafc' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
