import React from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export interface LinkedInTeaserProps {
  hasAudio?: boolean;
}

// -------------------------------------------------------------
// BEAT 1: THE PROBLEM (Frames 0 - 180 / 0.0s - 6.0s)
// -------------------------------------------------------------
const Beat1TheProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 100 },
  });

  // Exit transition
  const exitProgress = interpolate(frame, [162, 180], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Kinetic headline lines
  const line1Spring = spring({ frame: frame - 5, fps, config: { damping: 14, stiffness: 120 } });
  const line2Spring = spring({ frame: frame - 18, fps, config: { damping: 14, stiffness: 120 } });
  const line3Spring = spring({ frame: frame - 32, fps, config: { damping: 14, stiffness: 120 } });

  // Floating friction badges
  const badge1Spring = spring({ frame: frame - 50, fps, config: { damping: 13, stiffness: 90 } });
  const badge2Spring = spring({ frame: frame - 70, fps, config: { damping: 13, stiffness: 90 } });
  const badge3Spring = spring({ frame: frame - 90, fps, config: { damping: 13, stiffness: 90 } });

  const float1 = Math.sin(frame * 0.08) * 6;
  const float2 = Math.cos(frame * 0.07) * 6;
  const float3 = Math.sin(frame * 0.09 + 1) * 6;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 60px',
        opacity: (1 - exitProgress),
        transform: `scale(${interpolate(exitProgress, [0, 1], [1, 0.94])}) translateY(${interpolate(
          exitProgress,
          [0, 1],
          [0, -30]
        )}px)`,
        textAlign: 'center',
      }}
    >
      {/* Background Red/Amber Alert Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          width: 650,
          height: 650,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.18) 0%, rgba(249, 115, 22, 0.05) 50%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      {/* Category Pill */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 20px',
          borderRadius: 9999,
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1.5px solid rgba(239, 68, 68, 0.35)',
          color: '#F87171',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 32,
          opacity: interpolate(enterSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(enterSpring, [0, 1], [-20, 0])}px)`,
        }}
      >
        <span>⚠️ The Everyday Struggle</span>
      </div>

      {/* Kinetic Typography */}
      <div style={{ marginBottom: 40, lineHeight: 1.15 }}>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            opacity: interpolate(line1Spring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(line1Spring, [0, 1], [30, 0])}px)`,
          }}
        >
          Managing money
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            opacity: interpolate(line2Spring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(line2Spring, [0, 1], [30, 0])}px)`,
          }}
        >
          shouldn’t feel like
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em',
            marginTop: 4,
            opacity: interpolate(line3Spring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(line3Spring, [0, 1], [30, 0])}px)`,
          }}
        >
          a full-time job.
        </div>
      </div>

      {/* 3 Floating Friction Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          width: '100%',
          maxWidth: 620,
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            opacity: interpolate(badge1Spring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(badge1Spring, [0, 1], [0.85, 1])}) translateY(${float1}px)`,
            padding: '14px 22px',
            borderRadius: 16,
            background: 'rgba(30, 41, 59, 0.75)',
            border: '1.5px solid rgba(239, 68, 68, 0.3)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 24 }}>📑</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9' }}>
              Messy Spreadsheets & Manual Math
            </span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase' }}>
            Broken formulas
          </span>
        </div>

        {/* Card 2 */}
        <div
          style={{
            opacity: interpolate(badge2Spring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(badge2Spring, [0, 1], [0.85, 1])}) translateY(${float2}px)`,
            padding: '14px 22px',
            borderRadius: 16,
            background: 'rgba(30, 41, 59, 0.75)',
            border: '1.5px solid rgba(249, 115, 22, 0.3)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 24 }}>🧾</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9' }}>
              Lost Receipts & Buried Screenshots
            </span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#F97316', textTransform: 'uppercase' }}>
            Zero proof
          </span>
        </div>

        {/* Card 3 */}
        <div
          style={{
            opacity: interpolate(badge3Spring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(badge3Spring, [0, 1], [0.85, 1])}) translateY(${float3}px)`,
            padding: '14px 22px',
            borderRadius: 16,
            background: 'rgba(30, 41, 59, 0.75)',
            border: '1.5px solid rgba(234, 179, 8, 0.3)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 24 }}>💬</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9' }}>
              Awkward WhatsApp Debt Reminders
            </span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#EAB308', textTransform: 'uppercase' }}>
            Friendship strain
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------
// BEAT 2: THE RE-IMAGINATION & HERO INTRO (Frames 180 - 360 / 6.0s - 12.0s)
// Features Quick UI Clip 1: 3D Floating Dashboard Glimpse
// -------------------------------------------------------------
const Beat2ProductIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({ frame, fps, config: { damping: 14, mass: 0.8, stiffness: 95 } });

  const exitProgress = interpolate(frame, [162, 180], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const headlineSpring = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 110 } });
  const clipSpring = spring({ frame: frame - 28, fps, config: { damping: 14, mass: 0.8, stiffness: 90 } });

  const float = Math.sin(frame * 0.06) * 5;
  const rotateX = interpolate(clipSpring, [0, 1], [12, 5]) - exitProgress * 4;
  const rotateY = interpolate(clipSpring, [0, 1], [-8, -2]) + exitProgress * 4;
  const clipScale = interpolate(clipSpring, [0, 1], [0.88, 1]) - exitProgress * 0.05;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 50px',
        opacity: (1 - exitProgress),
        transform: `translateY(${interpolate(exitProgress, [0, 1], [0, -25])}px)`,
        textAlign: 'center',
      }}
    >
      {/* Cyan / Indigo Aurora Glow */}
      <div
        style={{
          position: 'absolute',
          width: 750,
          height: 750,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(99, 102, 241, 0.12) 50%, transparent 70%)',
          filter: 'blur(95px)',
          pointerEvents: 'none',
        }}
      />

      {/* Pill */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 22px',
          borderRadius: 9999,
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          color: '#38BDF8',
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 20,
          opacity: interpolate(enterSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(enterSpring, [0, 1], [-18, 0])}px)`,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 10px #38BDF8' }} />
        <span>Next-Gen Financial Operating System</span>
      </div>

      {/* Main Title */}
      <div
        style={{
          opacity: interpolate(headlineSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(headlineSpring, [0, 1], [25, 0])}px)`,
          marginBottom: 30,
        }}
      >
        <h1
          style={{
            fontSize: 50,
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.04em',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Say Hello to{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Expense Tracker Pro
          </span>
        </h1>
        <p
          style={{
            fontSize: 18,
            color: '#94A3B8',
            marginTop: 10,
            margin: '10px 0 0',
            fontWeight: 500,
          }}
        >
          Intelligent Personal Wealth + Dual-Sided Mutual SplitVaults.
        </p>
      </div>

      {/* 3D Floating Glass UI Glimpse (B-Roll 1: Dashboard) */}
      <div
        style={{
          width: '100%',
          maxWidth: 820,
          opacity: interpolate(clipSpring, [0, 1], [0, 1]),
          transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${clipScale}) translateY(${float}px)`,
          borderRadius: 20,
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 45px rgba(56, 189, 248, 0.25)',
        }}
      >
        {/* Titlebar */}
        <div
          style={{
            height: 38,
            background: 'rgba(15, 23, 42, 0.98)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#27C93F' }} />
          </div>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8' }}>
            🔒 expensetracker.pro/dashboard
          </span>
          <span style={{ fontSize: 10, color: '#38BDF8', fontWeight: 700 }}>LIVE DEMO</span>
        </div>

        {/* Video Area */}
        <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundColor: '#090D16' }}>
          <OffthreadVideo
            src={staticFile('video/ExpenseAddedToDashboared.mp4')}
            startFrom={30}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------
// BEAT 3: PILLAR 1 - EFFORTLESS PERSONAL FINANCE (Frames 360 - 540 / 12.0s - 18.0s)
// Kinetic textography + 3 high-impact feature metrics
// -------------------------------------------------------------
const Beat3PersonalFinance: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({ frame, fps, config: { damping: 14, mass: 0.8, stiffness: 95 } });
  const exitProgress = interpolate(frame, [162, 180], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const card1Spring = spring({ frame: frame - 15, fps, config: { damping: 14, stiffness: 105 } });
  const card2Spring = spring({ frame: frame - 30, fps, config: { damping: 14, stiffness: 105 } });
  const card3Spring = spring({ frame: frame - 45, fps, config: { damping: 14, stiffness: 105 } });

  const float1 = Math.sin(frame * 0.07) * 5;
  const float2 = Math.cos(frame * 0.07) * 5;
  const float3 = Math.sin(frame * 0.07 + 2) * 5;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 60px',
        opacity: (1 - exitProgress),
        transform: `translateY(${interpolate(exitProgress, [0, 1], [0, -25])}px)`,
        textAlign: 'center',
      }}
    >
      {/* Emerald Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.05) 50%, transparent 70%)',
          filter: 'blur(95px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 20px',
          borderRadius: 9999,
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1.5px solid rgba(16, 185, 129, 0.35)',
          color: '#34D399',
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 24,
          opacity: interpolate(enterSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(enterSpring, [0, 1], [-18, 0])}px)`,
        }}
      >
        <span>⚡ Pillar 01 · Personal Wealth</span>
      </div>

      <h1
        style={{
          fontSize: 48,
          fontWeight: 900,
          color: '#FFFFFF',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          margin: '0 0 14px',
          maxWidth: 850,
          opacity: interpolate(enterSpring, [0, 1], [0, 1]),
        }}
      >
        Track Every Rupee in{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Under 3 Seconds.
        </span>
      </h1>

      <p
        style={{
          fontSize: 18,
          color: '#94A3B8',
          maxWidth: 680,
          lineHeight: 1.45,
          margin: '0 0 40px',
          opacity: interpolate(enterSpring, [0, 1], [0, 1]),
        }}
      >
        From daily coffee to monthly investments, get total clarity on your cash flow.
      </p>

      {/* 3 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18,
          width: '100%',
          maxWidth: 900,
        }}
      >
        {/* Metric 1 */}
        <div
          style={{
            opacity: interpolate(card1Spring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(card1Spring, [0, 1], [0.85, 1])}) translateY(${float1}px)`,
            padding: '24px 20px',
            borderRadius: 18,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#34D399', letterSpacing: '-0.02em' }}>
            &lt; 3 Secs
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>
            Instant Logging
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            Quick modal with smart tags
          </div>
        </div>

        {/* Metric 2 */}
        <div
          style={{
            opacity: interpolate(card2Spring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(card2Spring, [0, 1], [0.85, 1])}) translateY(${float2}px)`,
            padding: '24px 20px',
            borderRadius: 18,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid rgba(56, 189, 248, 0.35)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#38BDF8', letterSpacing: '-0.02em' }}>
            Live Trends
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>
            Dynamic Analytics
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            Visual cash flow breakdowns
          </div>
        </div>

        {/* Metric 3 */}
        <div
          style={{
            opacity: interpolate(card3Spring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(card3Spring, [0, 1], [0.85, 1])}) translateY(${float3}px)`,
            padding: '24px 20px',
            borderRadius: 18,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid rgba(192, 132, 252, 0.35)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#C084FC', letterSpacing: '-0.02em' }}>
            Zero Leakage
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>
            Budget Safety
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            Automated threshold alerts
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------
// BEAT 4: PILLAR 2 - THE GAME CHANGER: SPLITVAULT (Frames 540 - 780 / 18.0s - 26.0s)
// Features Quick UI Clip 2: 3D Floating Proof Verification Glimpse
// -------------------------------------------------------------
const Beat4SplitVaultHero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({ frame, fps, config: { damping: 14, mass: 0.8, stiffness: 95 } });
  const exitProgress = interpolate(frame, [220, 240], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleSpring = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 110 } });
  const clipSpring = spring({ frame: frame - 25, fps, config: { damping: 14, mass: 0.8, stiffness: 90 } });

  const float = Math.sin(frame * 0.06) * 5;
  const rotateX = interpolate(clipSpring, [0, 1], [10, 4]) - exitProgress * 4;
  const rotateY = interpolate(clipSpring, [0, 1], [6, 2]) - exitProgress * 4;
  const clipScale = interpolate(clipSpring, [0, 1], [0.88, 1]) - exitProgress * 0.05;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 50px',
        opacity: (1 - exitProgress),
        transform: `translateY(${interpolate(exitProgress, [0, 1], [0, -25])}px)`,
        textAlign: 'center',
      }}
    >
      {/* Amber/Orange Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          width: 750,
          height: 750,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(236, 72, 153, 0.1) 50%, transparent 70%)',
          filter: 'blur(95px)',
          pointerEvents: 'none',
        }}
      />

      {/* Pill */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 22px',
          borderRadius: 9999,
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1.5px solid rgba(245, 158, 11, 0.35)',
          color: '#FBBF24',
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 18,
          opacity: interpolate(enterSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(enterSpring, [0, 1], [-18, 0])}px)`,
        }}
      >
        <span>🛡️ The Hero Innovation · SplitVault</span>
      </div>

      <div
        style={{
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleSpring, [0, 1], [25, 0])}px)`,
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.04em',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Mutual Expense Splitting with{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Proof Verification.
          </span>
        </h1>
        <p
          style={{
            fontSize: 17,
            color: '#CBD5E1',
            margin: '8px 0 0',
            fontWeight: 500,
          }}
        >
          Attach Easypaisa / Raast receipts · One-tap dual-sided approval · Zero debt anxiety.
        </p>
      </div>

      {/* 3D Floating Glass UI Glimpse (B-Roll 2: AddProof Verification) */}
      <div
        style={{
          width: '100%',
          maxWidth: 820,
          opacity: interpolate(clipSpring, [0, 1], [0, 1]),
          transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${clipScale}) translateY(${float}px)`,
          borderRadius: 20,
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1.5px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 45px rgba(245, 158, 11, 0.25)',
        }}
      >
        {/* Titlebar */}
        <div
          style={{
            height: 38,
            background: 'rgba(15, 23, 42, 0.98)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#27C93F' }} />
          </div>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8' }}>
            🔒 expensetracker.pro/splitvault/proof
          </span>
          <span style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700 }}>PROOF VERIFIED</span>
        </div>

        {/* Video Area */}
        <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundColor: '#090D16' }}>
          <OffthreadVideo
            src={staticFile('video/AddProof.mp4')}
            startFrom={120} // ~4s in (right at the upload modal)
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------
// BEAT 5: ENGINEERING ARCHITECTURE (Frames 780 - 930 / 26.0s - 31.0s)
// High-tech credentials for LinkedIn recruiters and tech leaders
// -------------------------------------------------------------
const Beat5TechStack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({ frame, fps, config: { damping: 14, mass: 0.8, stiffness: 95 } });
  const exitProgress = interpolate(frame, [132, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badges = [
    { name: 'React 18', role: 'Component Architecture', color: '#38BDF8', icon: '⚛️' },
    { name: 'TypeScript', role: 'End-to-End Type Safety', color: '#3178C6', icon: '🔷' },
    { name: 'FastAPI / Python', role: 'High-Performance API', color: '#10B981', icon: '⚡' },
    { name: 'Supabase / Postgres', role: 'Real-Time Database', color: '#3ECF8E', icon: '🗄️' },
    { name: 'Tailwind CSS', role: 'Dynamic Glassmorphism', color: '#38BDF8', icon: '🎨' },
    { name: 'Remotion Studio', role: 'Programmatic Video Gen', color: '#EC4899', icon: '🎥' },
  ];

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 60px',
        opacity: (1 - exitProgress),
        transform: `translateY(${interpolate(exitProgress, [0, 1], [0, -25])}px)`,
        textAlign: 'center',
      }}
    >
      {/* Indigo Tech Glow */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 70%)',
          filter: 'blur(95px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 20px',
          borderRadius: 9999,
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1.5px solid rgba(99, 102, 241, 0.35)',
          color: '#818CF8',
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 20,
          opacity: interpolate(enterSpring, [0, 1], [0, 1]),
        }}
      >
        <span>💻 Architecture & Engineering</span>
      </div>

      <h1
        style={{
          fontSize: 46,
          fontWeight: 900,
          color: '#FFFFFF',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          margin: '0 0 12px',
          opacity: interpolate(enterSpring, [0, 1], [0, 1]),
        }}
      >
        Engineered for{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #818CF8 0%, #C084FC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Speed, Scale & Trust.
        </span>
      </h1>

      <p
        style={{
          fontSize: 17,
          color: '#94A3B8',
          maxWidth: 650,
          lineHeight: 1.45,
          margin: '0 0 34px',
          opacity: interpolate(enterSpring, [0, 1], [0, 1]),
        }}
      >
        Built with modern production-grade technologies for seamless desktop & mobile performance.
      </p>

      {/* Tech Stack Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          width: '100%',
          maxWidth: 880,
        }}
      >
        {badges.map((tech, idx) => {
          const badgeSpring = spring({
            frame: frame - 15 - idx * 5,
            fps,
            config: { damping: 14, stiffness: 110 },
          });

          return (
            <div
              key={idx}
              style={{
                opacity: interpolate(badgeSpring, [0, 1], [0, 1]),
                transform: `scale(${interpolate(badgeSpring, [0, 1], [0.85, 1])})`,
                padding: '16px 18px',
                borderRadius: 16,
                background: 'rgba(15, 23, 42, 0.85)',
                border: `1.5px solid ${tech.color}35`,
                backdropFilter: 'blur(20px)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 24 }}>{tech.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>{tech.name}</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>{tech.role}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------
// BEAT 6: THE OUTRO & CALL TO ACTION (Frames 930 - 1080 / 31.0s - 36.0s)
// Final punchy branding and live demo link
// -------------------------------------------------------------
const Beat6CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({ frame, fps, config: { damping: 14, mass: 0.8, stiffness: 90 } });

  const dot1Scale = 1 + Math.sin(frame * 0.18) * 0.3;
  const dot2Scale = 1 + Math.sin(frame * 0.18 + 1.2) * 0.3;
  const dot3Scale = 1 + Math.sin(frame * 0.18 + 2.4) * 0.3;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 50px',
        textAlign: 'center',
        opacity: interpolate(enterSpring, [0, 1], [0, 1]),
        transform: `scale(${interpolate(enterSpring, [0, 1], [0.92, 1.0])})`,
      }}
    >
      {/* 3 Kinetic Glowing Dots */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, alignItems: 'center' }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#38BDF8',
            transform: `scale(${dot1Scale})`,
            boxShadow: '0 0 18px #38BDF8',
          }}
        />
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#818CF8',
            transform: `scale(${dot2Scale})`,
            boxShadow: '0 0 22px #818CF8',
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#C084FC',
            transform: `scale(${dot3Scale})`,
            boxShadow: '0 0 18px #C084FC',
          }}
        />
      </div>

      <h1
        style={{
          fontSize: 54,
          fontWeight: 900,
          color: '#FFFFFF',
          letterSpacing: '-0.04em',
          lineHeight: 1.15,
          margin: 0,
        }}
      >
        Take Total Control of
      </h1>
      <h2
        style={{
          fontSize: 54,
          fontWeight: 900,
          background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em',
          marginTop: 6,
          marginBottom: 36,
        }}
      >
        Your Financial Future.
      </h2>

      {/* Brand Identity Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 32px',
          borderRadius: 9999,
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6), 0 0 35px rgba(56, 189, 248, 0.25)',
          marginBottom: 30,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 50%, #4F46E5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: 18,
            boxShadow: '0 4px 16px rgba(14, 165, 233, 0.5)',
          }}
        >
          ET
        </div>
        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
            }}
          >
            EXPENSE TRACKER <span style={{ color: '#38BDF8' }}>PRO</span>
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
            Live on Web & Mobile · 100% Free & Open Source
          </div>
        </div>
      </div>

      {/* Action Chips */}
      <div style={{ display: 'flex', gap: 14 }}>
        <div
          style={{
            padding: '10px 22px',
            borderRadius: 12,
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38BDF8',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          🌐 Try Live Web Demo
        </div>
        <div
          style={{
            padding: '10px 22px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#F1F5F9',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          💻 Star on GitHub
        </div>
      </div>
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------
// MAIN LINKEDIN TEASER COMPOSITION (1080 x 1080 Square, 1080 Frames / 36s)
// -------------------------------------------------------------
export const LinkedInTeaser: React.FC<LinkedInTeaserProps> = ({ hasAudio = true }) => {
  const frame = useCurrentFrame();
  const totalFrames = 1080; // 36 seconds at 30 fps

  const bgPulse = Math.sin(frame * 0.03) * 8;

  return (
    <AbsoluteFill
      style={{
        background: '#040711',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Background Audio */}
      {hasAudio && (
        <Audio
          src={staticFile('audio/splitvault_bg.mp3')}
          volume={(f) => {
            const fadeIn = interpolate(f, [0, 45], [0, 0.75], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const fadeOut = interpolate(f, [totalFrames - 45, totalFrames], [0.75, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return Math.min(fadeIn, fadeOut);
          }}
        />
      )}

      {/* Ambient Mesh Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: 600 + bgPulse * 6,
          height: 600 + bgPulse * 6,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: 650 + bgPulse * 6,
          height: 650 + bgPulse * 6,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      {/* Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      />

      {/* Sequential Beats */}
      <Sequence from={0} durationInFrames={180}>
        <Beat1TheProblem />
      </Sequence>

      <Sequence from={180} durationInFrames={180}>
        <Beat2ProductIntro />
      </Sequence>

      <Sequence from={360} durationInFrames={180}>
        <Beat3PersonalFinance />
      </Sequence>

      <Sequence from={540} durationInFrames={240}>
        <Beat4SplitVaultHero />
      </Sequence>

      <Sequence from={780} durationInFrames={150}>
        <Beat5TechStack />
      </Sequence>

      <Sequence from={930} durationInFrames={150}>
        <Beat6CallToAction />
      </Sequence>
    </AbsoluteFill>
  );
};

export default LinkedInTeaser;
