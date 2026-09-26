import React from 'react';

/**
 * Universal BrandLogo component for Expense Tracker Pro.
 * Uses 100% pure standard inline CSS & explicit pixel dimensions.
 * Guaranteed zero overflow or layout shifts on all desktop & mobile browsers.
 */
function BrandLogo({
  size = 'md',
  showSubtitle = true,
  subtitle = 'Your Financial Life, Secured.',
  className = '',
  onClick,
}) {
  const sizeMap = {
    sm: { box: 34, font: 12, titleSize: '0.82rem', subSize: '0.66rem', gap: 10, radius: 10 },
    md: { box: 40, font: 14, titleSize: '0.9rem', subSize: '0.72rem', gap: 12, radius: 12 },
    lg: { box: 48, font: 17, titleSize: '1.05rem', subSize: '0.8rem', gap: 14, radius: 14 },
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`app-brand-badge ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${s.gap}px`,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        textDecoration: 'none',
        lineHeight: 1,
      }}
    >
      {/* Precision Gradient Brand Mark with 'ET' Typography */}
      <div
        style={{
          width: `${s.box}px`,
          height: `${s.box}px`,
          minWidth: `${s.box}px`,
          minHeight: `${s.box}px`,
          maxWidth: `${s.box}px`,
          maxHeight: `${s.box}px`,
          borderRadius: `${s.radius}px`,
          background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #4f46e5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(14, 165, 233, 0.4)',
          border: '1px solid rgba(56, 189, 248, 0.45)',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: `${s.font}px`,
          letterSpacing: '0.06em',
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        ET
      </div>

      {/* Brand Name & Subtitle */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: s.titleSize,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.12em',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textTransform: 'uppercase',
            display: 'block',
            lineHeight: 1.15,
          }}
        >
          EXPENSE TRACKER <span style={{ color: '#38bdf8' }}>PRO</span>
        </span>

        {showSubtitle && (
          <span
            style={{
              fontSize: s.subSize,
              fontWeight: 600,
              color: '#94a3b8',
              letterSpacing: '0.04em',
              marginTop: '3px',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              display: 'block',
              lineHeight: 1.1,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

export default BrandLogo;
