import React from 'react';

/**
 * Universal BrandLogo component for Expense Tracker Pro.
 * Guarantees 100% brand consistency (emblem, colors, typography, letter-spacing)
 * across Vault, Sidebar, Auth, and Topbar.
 */
function BrandLogo({
  size = 'md',
  showSubtitle = true,
  subtitle = 'Your Financial Life, Secured.',
  className = '',
  onClick,
}) {
  // Dimension definitions
  const dimensions = {
    sm: {
      box: 'w-8 h-8 rounded-xl',
      svg: 'w-4 h-4',
      title: 'text-[11px] tracking-[0.14em]',
      subtitle: 'text-[9px] tracking-wide',
      gap: 'gap-2.5',
    },
    md: {
      box: 'w-9 h-9 rounded-xl',
      svg: 'w-5 h-5',
      title: 'text-xs md:text-sm tracking-[0.16em]',
      subtitle: 'text-[10px] md:text-[11px] tracking-wide',
      gap: 'gap-3',
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      svg: 'w-6 h-6',
      title: 'text-base md:text-lg tracking-[0.18em]',
      subtitle: 'text-xs tracking-wider',
      gap: 'gap-3.5',
    },
  };

  const current = dimensions[size] || dimensions.md;

  return (
    <div
      className={`brand-logo-root flex items-center ${current.gap} select-none ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Precision Geometric Gradient Brand Emblem */}
      <div
        className={`${current.box} bg-gradient-to-tr from-[#0284c7] via-[#0ea5e9] to-[#2563eb] flex items-center justify-center shadow-lg shadow-cyan-500/25 flex-shrink-0 border border-cyan-400/30`}
      >
        <svg
          className={`${current.svg} text-white filter drop-shadow(0 1px 2px rgba(0,0,0,0.4))` }
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Geometric Diamond & Secure Vault Shield Node */}
          <polygon points="12 2 2 7 12 12 22 7 12 2" fill="rgba(255,255,255,0.18)" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>

      {/* Standardized Typography */}
      <div className="flex flex-col leading-tight">
        <div className={`font-black text-white uppercase font-sans ${current.title}`}>
          EXPENSE TRACKER <span className="text-cyan-400">PRO</span>
        </div>
        {showSubtitle && (
          <div className={`font-medium text-slate-400 font-sans mt-0.5 ${current.subtitle}`}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrandLogo;
