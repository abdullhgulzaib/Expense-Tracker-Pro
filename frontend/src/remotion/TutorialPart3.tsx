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
import { TopCenterHeader } from './TopCenterHeader';
import { ProblemSolutionIntro } from './ProblemSolutionIntro';

export interface TutorialPart3Props {
  hasAudio?: boolean;
}

interface SceneConfig {
  title: string;
  description: string;
  badge: string;
  urlPath: string;
  videoSrc: string;
  startFrameInSource: number;
  durationInFrames: number;
  accentColor: string;
  accentSecondary: string;
}

// 7 Comprehensive SplitVault Workflow Scenes
const SCENES: SceneConfig[] = [
  {
    title: '1. Create Shared Vault',
    description: 'Set group name, select category (Flatmates), and generate an instant 6-digit sync code',
    badge: 'Step 01 · Group Formation',
    urlPath: 'expensetracker.pro/splitvault/create',
    videoSrc: 'video/Create Group.mp4',
    startFrameInSource: 20,
    durationInFrames: 420, // 14.0s
    accentColor: '#38BDF8', // Cyan
    accentSecondary: '#0284C7',
  },
  {
    title: '2. Join Group with Code',
    description: 'Enter 6-digit invite code to instantly sync shared expenses across roommate accounts',
    badge: 'Step 02 · Zero-Friction Join',
    urlPath: 'expensetracker.pro/splitvault/join',
    videoSrc: 'video/JoinGroup.mp4',
    startFrameInSource: 15,
    durationInFrames: 360, // 12.0s
    accentColor: '#6366F1', // Indigo
    accentSecondary: '#4F46E5',
  },
  {
    title: '3. Add Shared Expense',
    description: 'Log group outing (Rs 5,000) with automatic 50/50 division (Rs 2,500/member)',
    badge: 'Step 03 · Dynamic Split Math',
    urlPath: 'expensetracker.pro/splitvault/expense',
    videoSrc: 'video/CreateExpense.mp4',
    startFrameInSource: 30,
    durationInFrames: 540, // 18.0s
    accentColor: '#10B981', // Emerald
    accentSecondary: '#059669',
  },
  {
    title: '4. Upload Proof of Transfer',
    description: 'Member attaches banking screenshot via Easypaisa / Raast for 100% transparency',
    badge: 'Step 04 · Proof Verification',
    urlPath: 'expensetracker.pro/splitvault/proof',
    videoSrc: 'video/AddProof.mp4',
    startFrameInSource: 10,
    durationInFrames: 690, // 23.0s (Full new recording: gallery receipt, TID 101, submission & toast)
    accentColor: '#F59E0B', // Amber
    accentSecondary: '#D97706',
  },
  {
    title: '5. Dual-Sided Payment Verification',
    description: 'Payer reviews submitted receipt proof and one-click approves to verify settlement',
    badge: 'Step 05 · Fraud-Proof Settlement',
    urlPath: 'expensetracker.pro/splitvault/review',
    videoSrc: 'video/AprovePayment.mp4',
    startFrameInSource: 20,
    durationInFrames: 480, // 16.0s
    accentColor: '#EC4899', // Pink
    accentSecondary: '#DB2777',
  },
  {
    title: '6. Real-Time Dashboard Sync',
    description: 'Group balance updates to Rs 0 (Settled) with complete audit trail and activity log',
    badge: 'Step 06 · Instant Dashboard Sync',
    urlPath: 'expensetracker.pro/dashboard/splitvault',
    videoSrc: 'video/ExpenseAddedToDashboared.mp4',
    startFrameInSource: 10,
    durationInFrames: 330, // 11.0s
    accentColor: '#8B5CF6', // Purple
    accentSecondary: '#6D28D9',
  },
  {
    title: '7. Manage Multi-Vault Ecosystem',
    description: 'Organize separate vaults for Trips, Flatmates, and Tours with dedicated member linking',
    badge: 'Step 07 · Multi-Vault Ecosystem',
    urlPath: 'expensetracker.pro/splitvault/manage',
    videoSrc: 'video/ManageDifferentGroups.mp4',
    startFrameInSource: 15,
    durationInFrames: 360, // 12.0s
    accentColor: '#06B6D4', // Cyan / Teal
    accentSecondary: '#0891B2',
  },
];

// Single SplitVault Scene View with Gemini-Inspired 3D Float & Screen Shifting Physics
const SplitVaultSceneView: React.FC<{
  scene: SceneConfig;
  sceneIndex: number;
}> = ({ scene, sceneIndex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring with Gemini-style gentle 3D tilt
  const enterSpring = spring({
    frame,
    fps,
    config: {
      damping: 14,
      mass: 0.8,
      stiffness: 85,
    },
  });

  // Exit interpolation during last 18 frames (smooth screen shift)
  const exitProgress = interpolate(
    frame,
    [scene.durationInFrames - 18, scene.durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Gemini-style floating drift
  const floatY = Math.sin(frame * 0.05) * 5;
  const floatRotate = Math.cos(frame * 0.04) * 0.6;

  // Alternating 3D perspective shift across scenes for dynamic screen shifting
  const dir = sceneIndex % 2 === 0 ? 1 : -1;
  const enterRotateY = interpolate(enterSpring, [0, 1], [dir * 4, 0]);
  const exitRotateY = exitProgress * (dir * -5);
  const rotateY = enterRotateY + exitRotateY + floatRotate;

  const enterRotateX = interpolate(enterSpring, [0, 1], [6, 0]);
  const exitRotateX = exitProgress * -4;
  const rotateX = enterRotateX + exitRotateX;

  const translateY =
    interpolate(enterSpring, [0, 1], [50, 0]) + floatY - exitProgress * 35;
  const scale =
    interpolate(enterSpring, [0, 1], [0.93, 1.0]) - exitProgress * 0.06;
  const opacity = interpolate(enterSpring, [0, 1], [0, 1]) * (1 - exitProgress);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 80px',
      }}
    >
      {/* Dynamic Background Colored Aurora Glow */}
      <div
        style={{
          position: 'absolute',
          width: 1000,
          height: 550,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${scene.accentColor}25 0%, ${scene.accentSecondary}08 55%, transparent 75%)`,
          filter: 'blur(90px)',
          pointerEvents: 'none',
          transform: `translateY(${floatY * 0.6}px)`,
        }}
      />

      {/* Top Center Kinetic Header */}
      <TopCenterHeader
        title={scene.title}
        description={scene.description}
        badge={scene.badge}
        accentColor={scene.accentColor}
        durationInFrames={scene.durationInFrames}
      />

      {/* 3D Floating SaaS Window Container (Shifting of Screens) */}
      <div
        style={{
          width: '100%',
          maxWidth: 1420,
          marginTop: 110,
          opacity,
          transform: `perspective(1400px) translateY(${translateY}px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          borderRadius: 22,
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.94)',
          border: `1.5px solid ${scene.accentColor}35`,
          boxShadow: `
            0 30px 90px rgba(0, 0, 0, 0.75),
            0 0 50px ${scene.accentColor}25,
            0 0 1px 1px rgba(255, 255, 255, 0.1) inset
          `,
          position: 'relative',
        }}
      >
        {/* Sleek macOS Style Glass Window Titlebar */}
        <div
          style={{
            height: 44,
            background: 'rgba(15, 23, 42, 0.98)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
          }}
        >
          {/* Traffic Lights */}
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
            <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
            <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#27C93F' }} />
          </div>

          {/* Centered URL & Security Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '3px 18px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: 12,
              fontWeight: 500,
              color: '#94A3B8',
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: scene.accentColor }}>🔒</span>
            <span>{scene.urlPath}</span>
          </div>

          {/* Step Pill */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: scene.accentColor,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            0{sceneIndex + 1} / 07
          </div>
        </div>

        {/* Video Player Display Container (100% Clean Native View) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            backgroundColor: '#090D16',
            overflow: 'hidden',
          }}
        >
          <OffthreadVideo
            src={staticFile(scene.videoSrc)}
            startFrom={scene.startFrameInSource}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 8: Gemini-Inspired Minimalist Kinetic Outro
const GeminiStyleOutro: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const outroSpring = spring({
    frame,
    fps,
    config: {
      damping: 14,
      mass: 0.8,
      stiffness: 90,
    },
  });

  const scale = interpolate(outroSpring, [0, 1], [0.92, 1.0]);
  const opacity = interpolate(outroSpring, [0, 1], [0, 1]);

  // 3 Animated Gemini-style pulsing dots
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
        zIndex: 100,
        opacity,
        transform: `scale(${scale})`,
        padding: '0 40px',
        textAlign: 'center',
      }}
    >
      {/* 3 Kinetic Glowing Dots (Gemini Signature Motion) */}
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

      {/* Main Punchy Tagline (Requested by User) */}
      <h1
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: '#FFFFFF',
          letterSpacing: '-0.04em',
          lineHeight: 1.15,
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textShadow: '0 10px 40px rgba(0, 0, 0, 0.9), 0 0 60px rgba(56, 189, 248, 0.4)',
        }}
      >
        Relax yourself.
      </h1>

      <h2
        style={{
          fontSize: 48,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em',
          marginTop: 14,
          marginBottom: 36,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textShadow: '0 4px 30px rgba(99, 102, 241, 0.3)',
        }}
      >
        Let Expense Tracker Pro take your stress.
      </h2>

      {/* Centered Brand Badge & URL */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 28px',
          borderRadius: 9999,
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.25)',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 50%, #4F46E5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: 16,
            boxShadow: '0 4px 14px rgba(14, 165, 233, 0.5)',
          }}
        >
          ET
        </div>

        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            EXPENSE TRACKER <span style={{ color: '#38BDF8' }}>PRO</span>
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
            Live on Web & Mobile · Free Real-Time Mutual Vaults
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Main Part 3 Remotion Composition
export const TutorialPart3: React.FC<TutorialPart3Props> = ({ hasAudio = true }) => {
  const frame = useCurrentFrame();

  const INTRO_DURATION = 270; // 9.0s Gemini-Inspired Problem->Solution Sequence
  const OUTRO_DURATION = 210; // 7.0s Gemini Kinetic Tagline Outro

  // Calculate cumulative scene timing offsets for the 7 workflow clips
  const sceneOffsets = SCENES.reduce<number[]>((acc, scene, index) => {
    if (index === 0) return [0];
    return [...acc, acc[index - 1] + SCENES[index - 1].durationInFrames];
  }, []);

  const totalWorkflowFrames =
    sceneOffsets[sceneOffsets.length - 1] + SCENES[SCENES.length - 1].durationInFrames;

  const totalFrames = INTRO_DURATION + totalWorkflowFrames + OUTRO_DURATION;

  // Background subtle organic breathing
  const bgPulse = Math.sin(frame * 0.02) * 10;

  return (
    <AbsoluteFill
      style={{
        background: '#040711',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Background Music with smooth fade-in and outro fade-out */}
      {hasAudio && (
        <Audio
          src={staticFile('audio/splitvault_bg.mp3')}
          volume={(f) => {
            const fadeIn = interpolate(f, [0, 45], [0, 0.7], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const fadeOut = interpolate(f, [totalFrames - 45, totalFrames], [0.7, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return Math.min(fadeIn, fadeOut);
          }}
        />
      )}

      {/* 1. Gemini-Style Ambient Floating Mesh Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: 850 + bgPulse * 8,
          height: 850 + bgPulse * 8,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(14, 165, 233, 0.04) 55%, transparent 75%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: 900 + bgPulse * 8,
          height: 900 + bgPulse * 8,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.24) 0%, rgba(99, 102, 241, 0.04) 55%, transparent 75%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          right: '25%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
          filter: 'blur(110px)',
          pointerEvents: 'none',
        }}
      />

      {/* 2. Delicate Radial Grid Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.65,
          pointerEvents: 'none',
        }}
      />

      {/* 3. SCENE 0: Gemini-Inspired Problem -> Solution Hook Opening */}
      <Sequence from={0} durationInFrames={INTRO_DURATION}>
        <ProblemSolutionIntro durationInFrames={INTRO_DURATION} />
      </Sequence>

      {/* 4. Render 7 Workflow Scenes sequentially with 3D shifting transitions */}
      {SCENES.map((scene, index) => (
        <Sequence
          key={scene.badge}
          from={INTRO_DURATION + sceneOffsets[index]}
          durationInFrames={scene.durationInFrames}
        >
          <SplitVaultSceneView scene={scene} sceneIndex={index} />
        </Sequence>
      ))}

      {/* 5. Render Gemini-Style Outro */}
      <Sequence
        from={INTRO_DURATION + totalWorkflowFrames}
        durationInFrames={OUTRO_DURATION}
      >
        <GeminiStyleOutro durationInFrames={OUTRO_DURATION} />
      </Sequence>
    </AbsoluteFill>
  );
};
export default TutorialPart3;
