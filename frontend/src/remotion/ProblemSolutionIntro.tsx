import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

interface ProblemSolutionIntroProps {
  durationInFrames: number;
}

// Pain points ticker items
const PAIN_POINTS = [
  { icon: '💬', title: 'Awkward WhatsApp Reminders', desc: '"Bhai mera hissa kab bhej rahe ho?"', color: '#EF4444' },
  { icon: '🧾', title: 'Lost Receipts & Screenshots', desc: 'Buried in gallery or deleted by mistake', color: '#F97316' },
  { icon: '📑', title: 'Messy Spreadsheets & Roommate Math', desc: 'Broken formulas and forgotten cash advances', color: '#EAB308' },
  { icon: '❓', title: 'Endless "Who Owes Who?" Arguments', desc: 'Friction between closest friends and flatmates', color: '#EC4899' },
  { icon: '💸', title: 'Unsettled Balances & Financial Stress', desc: 'Never knowing the exact settled amount', color: '#8B5CF6' },
];

// Orbiting solution cards (Gemini launch style)
const SOLUTION_FEATURES = [
  { icon: '🔑', title: '6-Digit Sync Code', desc: 'Zero-friction group connection', angle: 0, color: '#38BDF8' },
  { icon: '⚡', title: 'Auto 50/50 Split', desc: 'Dynamic real-time calculations', angle: 60, color: '#818CF8' },
  { icon: '📸', title: 'Direct Proof Upload', desc: 'Easypaisa / Raast screenshot attached', angle: 120, color: '#F59E0B' },
  { icon: '🛡️', title: 'Dual-Sided Verification', desc: 'Payer verifies & approves in 1 tap', angle: 180, color: '#10B981' },
  { icon: '📊', title: 'Zero-Balance Sync', desc: 'Real-time ledger audit trail', angle: 240, color: '#EC4899' },
  { icon: '🤝', title: 'Multi-Vault Ecosystem', desc: 'Flats, Trips, and Tours separated', angle: 300, color: '#06B6D4' },
];

export const ProblemSolutionIntro: React.FC<ProblemSolutionIntroProps> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (The Problem): frames 0 to 125 (~4.1s)
  // Transition: frames 125 to 140
  // Phase 2 (The Solution / SplitVault Reveal): frames 140 to 270 (~4.3s)
  const isPhase1 = frame < 130;
  const phaseTransition = interpolate(frame, [120, 138], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Entrance spring for Phase 1
  const entranceSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 100 },
  });

  // Entrance spring for Phase 2
  const solutionSpring = spring({
    frame: frame - 132,
    fps,
    config: { damping: 13, mass: 0.8, stiffness: 90 },
  });

  // Exit transition for the whole intro into Scene 1
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Typewriter effect for the Gemini search pill
  const pillPrompt = 'Splitting expenses with flatmates & friends?';
  const typedCount = Math.floor(
    interpolate(frame, [8, 48], [0, pillPrompt.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const currentPromptText = pillPrompt.substring(0, typedCount);

  // Ticker scroll motion for Pain Points (Gemini vertical ticker style)
  const tickerY = interpolate(frame, [25, 115], [80, -220], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Floating ambient drift
  const floatDrift = Math.sin(frame * 0.05) * 6;
  const globalScale =
    interpolate(exitProgress, [0, 1], [1, 1.08]) +
    interpolate(solutionSpring, [0, 1], [0.94, 1.0]) - 0.94;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        opacity: (1 - exitProgress),
        transform: `scale(${1 + exitProgress * 0.06})`,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Dynamic Background Aurora Glow */}
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: isPhase1
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.16) 0%, rgba(249, 115, 22, 0.06) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(99, 102, 241, 0.12) 50%, transparent 75%)',
          filter: 'blur(100px)',
          transition: 'all 0.5s ease',
          pointerEvents: 'none',
          transform: `translate(${Math.sin(frame * 0.03) * 30}px, ${Math.cos(frame * 0.03) * 30}px)`,
        }}
      />

      {/* ========================================================= */}
      {/* ACT 1: THE PROBLEM (Frames 0 - 130)                       */}
      {/* ========================================================= */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: (1 - phaseTransition),
          transform: `scale(${interpolate(phaseTransition, [0, 1], [1, 0.92])}) translateY(${interpolate(
            phaseTransition,
            [0, 1],
            [0, -40]
          )}px)`,
          pointerEvents: isPhase1 ? 'auto' : 'none',
          padding: '0 60px',
        }}
      >
        {/* Gemini-Style Pill Input Bar */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 24px',
            borderRadius: 9999,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            marginBottom: 28,
            transform: `translateY(${interpolate(entranceSpring, [0, 1], [-20, 0])}px)`,
            opacity: interpolate(entranceSpring, [0, 1], [0, 1]),
          }}
        >
          <span style={{ fontSize: 18, color: '#38BDF8', fontWeight: 900 }}>+</span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: '#F1F5F9',
              letterSpacing: '-0.01em',
            }}
          >
            {currentPromptText}
            {frame % 20 < 10 && <span style={{ color: '#38BDF8' }}>|</span>}
          </span>
        </div>

        {/* Bold Kinetic Problem Headline */}
        <h1
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: '#FFFFFF',
            textAlign: 'center',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            maxWidth: 1050,
            margin: 0,
            textShadow: '0 8px 30px rgba(0,0,0,0.8)',
            transform: `translateY(${interpolate(entranceSpring, [0, 1], [25, 0])}px)`,
            opacity: interpolate(entranceSpring, [0, 1], [0, 1]),
          }}
        >
          Shared living shouldn’t mean{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            awkward money fights.
          </span>
        </h1>

        <p
          style={{
            fontSize: 20,
            color: '#94A3B8',
            marginTop: 14,
            marginBottom: 34,
            textAlign: 'center',
            maxWidth: 780,
            lineHeight: 1.45,
            opacity: interpolate(entranceSpring, [0, 1], [0, 1]),
          }}
        >
          Manual math, lost receipts, and WhatsApp debt reminders destroy roommate peace.
        </p>

        {/* Gemini-Inspired Shifting Ticker / Brand Reel */}
        <div
          style={{
            position: 'relative',
            width: 720,
            height: 120,
            overflow: 'hidden',
            borderRadius: 18,
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1.5px solid rgba(239, 68, 68, 0.25)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Top & Bottom gradient mask for smooth ticker roll */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 32,
              background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), transparent)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 32,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              transform: `translateY(${tickerY}px)`,
              width: '100%',
              padding: '0 24px',
            }}
          >
            {PAIN_POINTS.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '10px 18px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${item.color}30`,
                }}
              >
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{item.desc}</div>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: item.color,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: `${item.color}15`,
                    textTransform: 'uppercase',
                  }}
                >
                  Friction
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating WhatsApp / Alert Chips (Left & Right) */}
        <div
          style={{
            position: 'absolute',
            left: 100,
            bottom: 120,
            padding: '12px 20px',
            borderRadius: 16,
            background: 'rgba(30, 41, 59, 0.85)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
            transform: `rotate(-4deg) translateY(${floatDrift}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 20 }}>💬</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#F87171' }}>
              "Bhai Murree trip ka hissa mila?"
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Unanswered message · 3 days ago</div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 90,
            top: 140,
            padding: '12px 20px',
            borderRadius: 16,
            background: 'rgba(30, 41, 59, 0.85)',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
            transform: `rotate(3deg) translateY(${-floatDrift}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 20 }}>🧾</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#FBBF24' }}>
              "Lost Easypaisa screenshot"
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Can't verify transaction TID</div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ACT 2: THE SOLUTION — SPLITVAULT REVEAL (Frames 130-270)   */}
      {/* ========================================================= */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: phaseTransition,
          transform: `scale(${interpolate(solutionSpring, [0, 1], [0.92, 1])}) translateY(${interpolate(
            solutionSpring,
            [0, 1],
            [30, 0]
          )}px)`,
          pointerEvents: !isPhase1 ? 'auto' : 'none',
          padding: '0 60px',
        }}
      >
        {/* Solution Pill Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 22px',
            borderRadius: 9999,
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1.5px solid rgba(56, 189, 248, 0.35)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 30px rgba(56, 189, 248, 0.25)',
            marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              backgroundColor: '#38BDF8',
              boxShadow: '0 0 12px #38BDF8',
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: '#38BDF8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            The Intelligent Solution
          </span>
        </div>

        {/* Main Solution Punchy Statement */}
        <h1
          style={{
            fontSize: 58,
            fontWeight: 900,
            color: '#FFFFFF',
            textAlign: 'center',
            letterSpacing: '-0.04em',
            lineHeight: 1.15,
            margin: 0,
            textShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 60px rgba(56, 189, 248, 0.35)',
          }}
        >
          Meet{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SplitVault.
          </span>
        </h1>

        <p
          style={{
            fontSize: 22,
            color: '#CBD5E1',
            marginTop: 12,
            marginBottom: 44,
            textAlign: 'center',
            maxWidth: 820,
            lineHeight: 1.45,
            fontWeight: 500,
          }}
        >
          Zero friction. 100% financial peace of mind with dual-sided proof verification.
        </p>

        {/* Gemini-Style Orbiting / Floating Carousel Cards (from frames 16 & 20) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            width: '100%',
            maxWidth: 1040,
          }}
        >
          {SOLUTION_FEATURES.map((item, idx) => {
            const cardSpring = spring({
              frame: frame - 145 - idx * 4,
              fps,
              config: { damping: 14, mass: 0.7, stiffness: 100 },
            });

            const cardFloat = Math.sin(frame * 0.06 + idx * 1.2) * 5;
            const cardScale = interpolate(cardSpring, [0, 1], [0.85, 1.0]);
            const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

            return (
              <div
                key={idx}
                style={{
                  opacity: cardOpacity,
                  transform: `scale(${cardScale}) translateY(${cardFloat}px)`,
                  padding: '16px 20px',
                  borderRadius: 16,
                  background: 'rgba(15, 23, 42, 0.82)',
                  border: `1.5px solid ${item.color}35`,
                  backdropFilter: 'blur(20px)',
                  boxShadow: `0 15px 35px rgba(0, 0, 0, 0.6), 0 0 25px ${item.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginBottom: 2 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.3 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transition prompt arrow */}
        <div
          style={{
            marginTop: 38,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 700,
            color: '#38BDF8',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            opacity: interpolate(solutionSpring, [0, 1], [0, 1]),
          }}
        >
          <span>Step-by-Step Live Walkthrough</span>
          <span style={{ transform: `translateX(${Math.sin(frame * 0.15) * 4}px)` }}>→</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
