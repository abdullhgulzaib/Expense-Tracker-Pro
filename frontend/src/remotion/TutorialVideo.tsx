import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Cursor } from './Cursor';
import { CalloutBadge } from './CalloutBadge';

export interface TutorialVideoProps {
  hasAudio?: boolean;
}

export const TutorialVideo: React.FC<TutorialVideoProps> = ({ hasAudio = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Global top progress bar
  const totalDuration = 900; // 30 seconds @ 30fps
  const progress = (frame / totalDuration) * 100;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#07111F',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: 'hidden',
        color: '#ffffff',
      }}
    >
      {/* Optional Background Music */}
      {hasAudio && (
        <Audio
          src={staticFile('audio/bg.mp3')}
          volume={(f) =>
            interpolate(
              f,
              [0, 30, totalDuration - 60, totalDuration],
              [0, 0.65, 0.65, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            )
          }
        />
      )}

      {/* Persistent Living Aurora Glow in Background */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          left: -200,
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 217, 255, 0.18) 0%, transparent 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -200,
          right: -200,
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(38, 132, 255, 0.18) 0%, transparent 70%)',
          filter: 'blur(110px)',
          pointerEvents: 'none',
        }}
      />

      {/* Global Top Progress Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00D9FF 0%, #2684FF 100%)',
            boxShadow: '0 0 12px #00D9FF',
          }}
        />
      </div>

      {/* =====================================================================
          SCENE 1: CINEMATIC BRAND INTRO (0s - 4s | 0 - 120 frames)
          ===================================================================== */}
      <Sequence from={0} durationInFrames={120}>
        <IntroScene />
      </Sequence>

      {/* =====================================================================
          SCENE 2: SIGN UP & SECURITY ONBOARDING (4s - 9s | 120 - 270 frames)
          ===================================================================== */}
      <Sequence from={120} durationInFrames={150}>
        <SignUpScene />
      </Sequence>

      {/* =====================================================================
          SCENE 3: CLEAN WORKSPACE & PKR DEFAULT (9s - 14s | 270 - 420 frames)
          ===================================================================== */}
      <Sequence from={270} durationInFrames={150}>
        <DashboardEmptyScene />
      </Sequence>

      {/* =====================================================================
          SCENE 4: SMART EXPENSE & CATEGORY SELECTION (14s - 20s | 420 - 600 frames)
          ===================================================================== */}
      <Sequence from={420} durationInFrames={180}>
        <AddExpenseScene />
      </Sequence>

      {/* =====================================================================
          SCENE 5: REAL-TIME ANALYTICS & CHARTS (20s - 26s | 600 - 780 frames)
          ===================================================================== */}
      <Sequence from={600} durationInFrames={180}>
        <DashboardUpdatedScene />
      </Sequence>

      {/* =====================================================================
          SCENE 6: OUTRO / CALL TO ACTION (26s - 30s | 780 - 900 frames)
          ===================================================================== */}
      <Sequence from={780} durationInFrames={120}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------
   SCENE 1: Brand Intro
   ------------------------------------------------------------------------- */
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const textOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const textTranslateY = interpolate(frame, [15, 35], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subtitleOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 20,
      }}
    >
      {/* Brand Icon Mark */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          width: 90,
          height: 90,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #4f46e5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 40px rgba(14, 165, 233, 0.45)',
          border: '2px solid rgba(56, 189, 248, 0.5)',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: 36,
          letterSpacing: '0.06em',
        }}
      >
        ET
      </div>

      {/* Main Title */}
      <div
        style={{
          opacity: textOpacity,
          transform: `translateY(${textTranslateY}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <h1
          style={{
            fontSize: 54,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: 0,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          EXPENSE TRACKER <span style={{ color: '#38bdf8', WebkitTextFillColor: '#38bdf8' }}>PRO</span>
        </h1>
        <div
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: '#94a3b8',
            letterSpacing: '0.04em',
          }}
        >
          Your Financial Life, Secured.
        </div>
      </div>

      {/* Badge Pill */}
      <div
        style={{
          opacity: subtitleOpacity,
          padding: '8px 20px',
          borderRadius: 999,
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#38bdf8',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginTop: 10,
        }}
      >
        Quick Start Tutorial • 2026 Edition
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------
   SCENE 2: Sign Up Scene
   ------------------------------------------------------------------------- */
const SignUpScene: React.FC = () => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 150], [1.0, 1.05]);
  const opacity = interpolate(frame, [0, 15, 135, 150], [0, 1, 1, 0]);

  // Cursor moves toward "Create Workspace" button and clicks at frame 70
  const cursorX = interpolate(frame, [15, 65, 80], [700, 473, 473], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cursorY = interpolate(frame, [15, 65, 80], [450, 715, 715], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 946,
          height: 840,
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          backgroundColor: '#07111F',
          transform: `scale(${scale})`,
          position: 'relative',
        }}
      >
        <Img
          src={staticFile('screenshots/01-signup.png')}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

        <Cursor x={cursorX} y={cursorY} clickFrame={70} />
      </div>

      <CalloutBadge
        step="Step 1"
        title="Zero-Knowledge Sign Up"
        subtitle="End-to-end encrypted personal workspace with Google & Email auth"
        icon="🔒"
      />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------
   SCENE 3: Empty Dashboard
   ------------------------------------------------------------------------- */
const DashboardEmptyScene: React.FC = () => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 150], [1.0, 1.05]);
  const opacity = interpolate(frame, [0, 15, 135, 150], [0, 1, 1, 0]);

  // Cursor moves to top right "+ Add Expense" button (around frame 65)
  const cursorX = interpolate(frame, [15, 60, 80], [600, 960, 960], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cursorY = interpolate(frame, [15, 60, 80], [500, 130, 130], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 1036,
          height: 840,
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          backgroundColor: '#07111F',
          transform: `scale(${scale})`,
          position: 'relative',
        }}
      >
        <Img
          src={staticFile('screenshots/02-dashboard-empty.png')}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* Highlight ring around Add Expense button */}
        {frame >= 45 && (
          <div
            style={{
              position: 'absolute',
              top: 110,
              right: 18,
              width: 120,
              height: 42,
              borderRadius: 12,
              border: '2px solid #38bdf8',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.6)',
            }}
          />
        )}

        <Cursor x={cursorX} y={cursorY} clickFrame={65} />
      </div>

      <CalloutBadge
        step="Step 2"
        title="Workspace Overview & PKR Setup"
        subtitle="Default currency set to Rs with real-time analytics ready"
        icon="⚡"
      />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------
   SCENE 4: Add Expense Modal & Category Selection
   ------------------------------------------------------------------------- */
const AddExpenseScene: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15, 165, 180], [0, 1, 1, 0]);

  // Split into two sub-stages:
  // 0 - 85 frames: Category dropdown open ('Bills')
  // 85 - 180 frames: Form completely filled + notes + Click Save Expense
  const isFilledStage = frame >= 85;

  const cursorX = interpolate(frame, [90, 130, 150], [600, 830, 830], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cursorY = interpolate(frame, [90, 130, 150], [500, 755, 755], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 980,
          height: 820,
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          backgroundColor: '#0d1527',
          position: 'relative',
        }}
      >
        <Img
          src={
            isFilledStage
              ? staticFile('screenshots/04-add-expense-filled.png')
              : staticFile('screenshots/03-add-expense-category.png')
          }
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {isFilledStage && <Cursor x={cursorX} y={cursorY} clickFrame={135} />}
      </div>

      <CalloutBadge
        step="Step 3"
        title="Add Expense & Smart Categorization"
        subtitle="Select Category (Bills), Payment Method & Notes with 1-click Save"
        icon="✍️"
      />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------
   SCENE 5: Real-Time Updated Dashboard
   ------------------------------------------------------------------------- */
const DashboardUpdatedScene: React.FC = () => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 180], [1.0, 1.05]);
  const opacity = interpolate(frame, [0, 15, 165, 180], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 1124,
          height: 840,
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          backgroundColor: '#07111F',
          transform: `scale(${scale})`,
          position: 'relative',
        }}
      >
        <Img
          src={staticFile('screenshots/05-dashboard-updated.png')}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* Glow focus highlight on updated metrics card (Rs 4,500.00) */}
        <div
          style={{
            position: 'absolute',
            top: 176,
            left: 225,
            width: 198,
            height: 116,
            borderRadius: 16,
            border: '2px solid rgba(56, 189, 248, 0.8)',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
            pointerEvents: 'none',
          }}
        />

        {/* Glow focus on Donut distribution chart */}
        <div
          style={{
            position: 'absolute',
            top: 328,
            left: 672,
            width: 428,
            height: 254,
            borderRadius: 16,
            border: '2px solid rgba(38, 132, 255, 0.6)',
            boxShadow: '0 0 25px rgba(38, 132, 255, 0.3)',
            pointerEvents: 'none',
          }}
        />
      </div>

      <CalloutBadge
        step="Step 4"
        title="Live Metrics & Instant Visual Charts"
        subtitle="Automatic calculation of totals, monthly trends & category breakdown"
        icon="📊"
      />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------
   SCENE 6: Outro / Call To Action
   ------------------------------------------------------------------------- */
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 24,
      }}
    >
      <div
        style={{
          transform: `scale(${entrance})`,
          width: 80,
          height: 80,
          borderRadius: 22,
          background: 'linear-gradient(135deg, #0ea5e9, #2563eb, #4f46e5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 35px rgba(14, 165, 233, 0.4)',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: 32,
        }}
      >
        ET
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={{ fontSize: 44, fontWeight: 800, margin: 0 }}>
          Take Control of Your Finances
        </h2>
        <p style={{ fontSize: 20, color: '#94a3b8', margin: 0 }}>
          Zero Latency • Bank-Grade Vault • Real-Time Insights
        </p>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: '12px 28px',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #00D9FF 0%, #2684FF 100%)',
          color: '#040913',
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: '0.02em',
          boxShadow: '0 8px 30px rgba(0, 217, 255, 0.35)',
        }}
      >
        Start Tracking Free 🚀
      </div>
    </AbsoluteFill>
  );
};
