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

export interface TutorialPart2Props {
  hasAudio?: boolean;
}

interface SceneConfig {
  title: string;
  description: string;
  badge: string;
  urlPath: string;
  videoSrc: string;
  startFrameInSource: number; // 30 fps frame in raw source clip
  durationInFrames: number;
  accentColor: string;
  accentSecondary: string;
}

const SCENES: SceneConfig[] = [
  {
    title: 'Smart Transaction Management',
    description: 'Instant keyword search, collapsible multi-filters, and real-time ledger updates',
    badge: 'Feature 01 · Transactions',
    urlPath: 'expensetracker.pro/transactions',
    videoSrc: 'video/Transactions.mp4',
    startFrameInSource: 400, // ~13.3s where filters are toggled & items filtered
    durationInFrames: 225, // 7.5s
    accentColor: '#38BDF8', // Cyan
    accentSecondary: '#0284C7',
  },
  {
    title: 'Deep Financial Analytics',
    description: 'Interactive monthly spending curves, category comparisons, and one-click PDF statements',
    badge: 'Feature 02 · Analytics',
    urlPath: 'expensetracker.pro/analytics',
    videoSrc: 'video/Analytics.mp4',
    startFrameInSource: 210, // ~7s where user interacts with bar charts and export
    durationInFrames: 225, // 7.5s
    accentColor: '#A855F7', // Purple/Violet
    accentSecondary: '#7C3AED',
  },
  {
    title: 'Visual Category Intelligence',
    description: 'Track spending groups at a glance with real-time budget distribution bars',
    badge: 'Feature 03 · Categories',
    urlPath: 'expensetracker.pro/categories',
    videoSrc: 'video/Categories.mp4',
    startFrameInSource: 60, // ~2s showing category breakdown and totals
    durationInFrames: 180, // 6.0s
    accentColor: '#10B981', // Emerald
    accentSecondary: '#059669',
  },
  {
    title: 'Personalized Preferences & Themes',
    description: 'Custom currency defaults (PKR), notification channels, and instant Light/Dark mode',
    badge: 'Feature 04 · Settings',
    urlPath: 'expensetracker.pro/settings',
    videoSrc: 'video/Settings.mp4',
    startFrameInSource: 90, // ~3s showing currency and theme switch to light mode
    durationInFrames: 240, // 8.0s
    accentColor: '#F59E0B', // Amber
    accentSecondary: '#D97706',
  },
];

// Single Scene Component
const SceneView: React.FC<{
  scene: SceneConfig;
  sceneIndex: number;
}> = ({ scene, sceneIndex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for browser card
  const enterSpring = spring({
    frame,
    fps,
    config: {
      damping: 15,
      mass: 0.8,
      stiffness: 90,
    },
  });

  // Smooth exit fade for transitions
  const exitProgress = interpolate(
    frame,
    [scene.durationInFrames - 12, scene.durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cardScale = interpolate(enterSpring, [0, 1], [0.96, 1]) * (0.99 + 0.01 * exitProgress);
  const cardOpacity = interpolate(enterSpring, [0, 1], [0, 1]) * exitProgress;
  const cardTranslateY = interpolate(enterSpring, [0, 1], [25, 0]);

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Dynamic Ambient Background Glows */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1200,
          height: 480,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${scene.accentColor}28 0%, transparent 70%)`,
          filter: 'blur(70px)',
          pointerEvents: 'none',
          opacity: cardOpacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 380,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${scene.accentSecondary}20 0%, transparent 75%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          opacity: cardOpacity,
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

      {/* Browser Mockup Window */}
      <div
        style={{
          position: 'absolute',
          top: 156,
          left: '50%',
          transform: `translateX(-50%) translateY(${cardTranslateY}px) scale(${cardScale})`,
          opacity: cardOpacity,
          width: 1540,
          height: 875,
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: '#0F172A',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: `
            0 30px 80px -15px rgba(0, 0, 0, 0.85),
            0 0 60px -10px ${scene.accentColor}18,
            0 0 0 1px rgba(255, 255, 255, 0.08)
          `,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* macOS Browser Header */}
        <div
          style={{
            height: 42,
            background: 'linear-gradient(to bottom, #1E293B, #0F172A)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            position: 'relative',
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          {/* Traffic light window controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)',
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#F59E0B',
                boxShadow: '0 0 6px rgba(245, 158, 11, 0.4)',
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)',
              }}
            />
          </div>

          {/* Centered URL Pill */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: '4px 20px',
              fontSize: 13,
              color: '#94A3B8',
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: '#10B981', fontSize: 11 }}>🔒</span>
            <span>https://{scene.urlPath}</span>
          </div>

          {/* Right badge */}
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              color: scene.accentColor,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: scene.accentColor,
                boxShadow: `0 0 8px ${scene.accentColor}`,
              }}
            />
            <span>Active Module</span>
          </div>
        </div>

        {/* Video Viewport */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#090D16',
          }}
        >
          <OffthreadVideo
            src={staticFile(scene.videoSrc)}
            startFrom={scene.startFrameInSource}
            endAt={scene.startFrameInSource + scene.durationInFrames}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const TutorialPart2: React.FC<TutorialPart2Props> = ({
  hasAudio = true,
}) => {
  // Total duration is sum of scene durations: 225 + 225 + 180 + 240 = 870 frames (29s)
  let currentFrom = 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070B14',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      }}
    >
      {/* Modern High-Contrast Gradient Canvas Background */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(130% 120% at 50% -10%, #151C33 0%, #090E1B 45%, #04060C 100%)
          `,
        }}
      />

      {/* Subtle Blueprint Mesh Grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.8,
          pointerEvents: 'none',
        }}
      />

      {/* Background Audio with 75% volume and smooth fade-in / fade-out */}
      {hasAudio && (
        <Audio
          src={staticFile('audio/bg_raw.mp3')}
          startFrom={15 * 30} // 450 frames in raw audio (the energetic drop)
          endAt={(15 + 29) * 30} // 1320 frames
          volume={(f) =>
            interpolate(
              f,
              [0, 25, 840, 870],
              [0, 0.75, 0.75, 0],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }
            )
          }
        />
      )}

      {/* Sequenced Scenes */}
      {SCENES.map((scene, index) => {
        const from = currentFrom;
        currentFrom += scene.durationInFrames;

        return (
          <Sequence
            key={scene.title}
            from={from}
            durationInFrames={scene.durationInFrames}
          >
            <SceneView scene={scene} sceneIndex={index} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
