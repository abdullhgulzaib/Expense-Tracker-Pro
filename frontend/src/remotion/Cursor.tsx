import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface CursorProps {
  x: number;
  y: number;
  clickFrame?: number;
}

export const Cursor: React.FC<CursorProps> = ({ x, y, clickFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isClicking = clickFrame !== undefined && frame >= clickFrame && frame <= clickFrame + 15;
  const clickProgress = clickFrame !== undefined && frame >= clickFrame
    ? spring({
        frame: frame - clickFrame,
        fps,
        config: { damping: 12, stiffness: 200 },
      })
    : 0;

  const scale = isClicking ? interpolate(clickProgress, [0, 0.5, 1], [1, 0.85, 1]) : 1;
  const ringScale = isClicking ? interpolate(clickProgress, [0, 1], [0.6, 2.2]) : 0;
  const ringOpacity = isClicking ? interpolate(clickProgress, [0, 1], [0.8, 0]) : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-2px, -2px) scale(${scale})`,
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'transform 0.05s ease-out',
      }}
    >
      {/* Click ripple circle */}
      {isClicking && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 32,
            height: 32,
            transform: `translate(-50%, -50%) scale(${ringScale})`,
            borderRadius: '50%',
            border: '2px solid #38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.25)',
            opacity: ringOpacity,
          }}
        />
      )}

      {/* SVG Modern Cursor */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5))',
        }}
      >
        <path
          d="M5.5 3.5L18.5 13.5L12 14.5L9 20.5L5.5 3.5Z"
          fill="#38bdf8"
          stroke="#07111F"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
