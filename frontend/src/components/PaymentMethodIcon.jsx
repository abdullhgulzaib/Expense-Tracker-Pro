import React from 'react';

/**
 * High-definition, pixel-perfect SVG logos for Pakistani & Global payment methods.
 * Professional fintech look with zero dependency on emojis.
 */
export default function PaymentMethodIcon({ method, size = 18, className = '' }) {
  const norm = (method || '').toLowerCase().trim();

  // Easypaisa (Signature Green & White)
  if (norm.includes('easypaisa')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ flexShrink: 0 }}
      >
        <rect width="24" height="24" rx="6" fill="#00A859" />
        <path
          d="M6.5 12C6.5 8.96 8.96 6.5 12 6.5C14.1 6.5 15.93 7.68 16.85 9.42L14.7 10.35C14.2 9.25 13.18 8.5 12 8.5C10.07 8.5 8.5 10.07 8.5 12C8.5 13.93 10.07 15.5 12 15.5C13.25 15.5 14.33 14.7 14.78 13.55H11.5V11.75H17.2V12.35C17.2 15.42 14.85 17.5 12 17.5C8.96 17.5 6.5 15.04 6.5 12Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // JazzCash (Signature Red & Yellow)
  if (norm.includes('jazzcash')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ flexShrink: 0 }}
      >
        <rect width="24" height="24" rx="6" fill="#D32F2F" />
        <circle cx="10" cy="12" r="4.5" fill="#FFC107" />
        <circle cx="14" cy="12" r="4.5" fill="#FF9800" fillOpacity="0.8" />
        <path
          d="M11.5 9.5H12.5V14.5H11.5V9.5Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // Raast (State Bank of Pakistan Instant Payment - Signature Orange & Red)
  if (norm.includes('raast')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ flexShrink: 0 }}
      >
        <rect width="24" height="24" rx="6" fill="#FF6F00" />
        <path
          d="M7 15L12 9L17 15"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="16" r="1.5" fill="#FFFFFF" />
      </svg>
    );
  }

  // SadaPay (Signature Teal & Coral)
  if (norm.includes('sadapay')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ flexShrink: 0 }}
      >
        <rect width="24" height="24" rx="6" fill="#0D9488" />
        <circle cx="9.5" cy="12" r="4" fill="#FF6B6B" />
        <circle cx="14.5" cy="12" r="4" fill="#2DD4BF" fillOpacity="0.85" />
      </svg>
    );
  }

  // NayaPay (Signature Bright Orange)
  if (norm.includes('nayapay')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ flexShrink: 0 }}
      >
        <rect width="24" height="24" rx="6" fill="#F97316" />
        <path
          d="M8 16V8L16 16V8"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Bank Transfer (Classic Neoclassical Bank Pillar)
  if (norm.includes('bank')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ flexShrink: 0 }}
      >
        <rect width="24" height="24" rx="6" fill="#4F46E5" />
        <path
          d="M4 10L12 6L20 10V11H4V10ZM6 12H8V17H6V12ZM11 12H13V17H11V12ZM16 12H18V17H16V12ZM4 18H20V19.5H4V18Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // Cash / Default Card
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <rect width="24" height="24" rx="6" fill="#059669" />
      <rect x="5" y="7" width="14" height="10" rx="2" stroke="#FFFFFF" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
    </svg>
  );
}
