/**
 * Generates realistic Base64 SVG data URLs for Pakistani payment receipts
 * (JazzCash, Easypaisa, Raast, Bank Transfer)
 * Encoded with Base64 for 100% reliable rendering in all browsers.
 */

const toBase64Svg = (svgString) => {
  try {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString.trim())))}`;
  } catch (e) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
  }
};

export const generateSampleReceipt = (type, { amount, recipient, tid, date }) => {
  const formattedAmount = Number(amount || 1500).toLocaleString();
  const txDate = date || new Date().toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });
  const txId = tid || `PK${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  if (type === 'JazzCash') {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 620" width="400" height="620">
      <defs>
        <linearGradient id="jcGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#E50914"/>
          <stop offset="100%" stop-color="#B71C1C"/>
        </linearGradient>
      </defs>
      <rect width="400" height="620" rx="24" fill="#18181B"/>
      <rect width="400" height="130" rx="24" fill="url(#jcGrad)"/>
      <rect y="100" width="400" height="30" fill="url(#jcGrad)"/>
      
      <text x="200" y="52" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="1">JAZZCASH</text>
      <text x="200" y="80" fill="#FDE047" font-family="system-ui, sans-serif" font-weight="700" font-size="13" text-anchor="middle">TRANSACTION SUCCESSFUL</text>

      <circle cx="200" cy="130" r="32" fill="#22C55E" stroke="#18181B" stroke-width="5"/>
      <path d="M190 130 L197 137 L211 123" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

      <text x="200" y="200" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">Amount Transferred</text>
      <text x="200" y="242" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="34" text-anchor="middle">Rs ${formattedAmount}</text>

      <line x1="40" y1="270" x2="360" y2="270" stroke="#27272A" stroke-width="2" stroke-dasharray="6,6"/>

      <g transform="translate(40, 305)">
        <text x="0" y="0" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="13">Receiver</text>
        <text x="320" y="0" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="700" font-size="14" text-anchor="end">${recipient || 'Hostel Roommate'}</text>

        <text x="0" y="42" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="13">Transaction ID (TID)</text>
        <text x="320" y="42" fill="#FDE047" font-family="monospace" font-weight="700" font-size="13" text-anchor="end">${txId}</text>

        <text x="0" y="84" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="13">Date and Time</text>
        <text x="320" y="84" fill="#E4E4E7" font-family="system-ui, sans-serif" font-size="13" text-anchor="end">${txDate}</text>

        <text x="0" y="126" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="13">Fee and Taxes</text>
        <text x="320" y="126" fill="#22C55E" font-family="system-ui, sans-serif" font-weight="700" font-size="13" text-anchor="end">FREE (Rs 0.00)</text>

        <text x="0" y="168" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="13">Channel</text>
        <text x="320" y="168" fill="#E4E4E7" font-family="system-ui, sans-serif" font-size="13" text-anchor="end">JazzCash Mobile Wallet</text>
      </g>

      <line x1="40" y1="510" x2="360" y2="510" stroke="#27272A" stroke-width="2"/>

      <g transform="translate(200, 545)">
        <rect x="-140" y="-12" width="280" height="28" rx="14" fill="#27272A"/>
        <text x="0" y="7" fill="#A1A1AA" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">Verified Mobile Wallet Receipt</text>
      </g>
      <text x="200" y="590" fill="#52525B" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">State Bank of Pakistan Regulated Payment</text>
    </svg>
    `;
    return toBase64Svg(svg);
  }

  if (type === 'Easypaisa') {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 620" width="400" height="620">
      <defs>
        <linearGradient id="epGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#00C853"/>
          <stop offset="100%" stop-color="#009624"/>
        </linearGradient>
      </defs>
      <rect width="400" height="620" rx="24" fill="#0D1F17"/>
      <rect width="400" height="130" rx="24" fill="url(#epGrad)"/>
      <rect y="100" width="400" height="30" fill="url(#epGrad)"/>
      
      <text x="200" y="52" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="1">easypaisa</text>
      <text x="200" y="80" fill="#E8F5E9" font-family="system-ui, sans-serif" font-weight="700" font-size="13" text-anchor="middle">MONEY SENT SUCCESSFULLY</text>

      <circle cx="200" cy="130" r="32" fill="#10B981" stroke="#0D1F17" stroke-width="5"/>
      <path d="M190 130 L197 137 L211 123" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

      <text x="200" y="200" fill="#A7F3D0" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">Total Paid</text>
      <text x="200" y="242" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="34" text-anchor="middle">PKR ${formattedAmount}</text>

      <line x1="40" y1="270" x2="360" y2="270" stroke="#1E3A2F" stroke-width="2" stroke-dasharray="6,6"/>

      <g transform="translate(40, 305)">
        <text x="0" y="0" fill="#6EE7B7" font-family="system-ui, sans-serif" font-size="13">Sent To</text>
        <text x="320" y="0" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="700" font-size="14" text-anchor="end">${recipient || 'Flatmate'}</text>

        <text x="0" y="42" fill="#6EE7B7" font-family="system-ui, sans-serif" font-size="13">Transaction ID</text>
        <text x="320" y="42" fill="#34D399" font-family="monospace" font-weight="700" font-size="13" text-anchor="end">${txId}</text>

        <text x="0" y="84" fill="#6EE7B7" font-family="system-ui, sans-serif" font-size="13">Payment Time</text>
        <text x="320" y="84" fill="#D1FAE5" font-family="system-ui, sans-serif" font-size="13" text-anchor="end">${txDate}</text>

        <text x="0" y="126" fill="#6EE7B7" font-family="system-ui, sans-serif" font-size="13">Fee</text>
        <text x="320" y="126" fill="#34D399" font-family="system-ui, sans-serif" font-weight="700" font-size="13" text-anchor="end">PKR 0.00</text>

        <text x="0" y="168" fill="#6EE7B7" font-family="system-ui, sans-serif" font-size="13">Source Account</text>
        <text x="320" y="168" fill="#D1FAE5" font-family="system-ui, sans-serif" font-size="13" text-anchor="end">Easypaisa Wallet</text>
      </g>

      <line x1="40" y1="510" x2="360" y2="510" stroke="#1E3A2F" stroke-width="2"/>

      <g transform="translate(200, 545)">
        <rect x="-140" y="-12" width="280" height="28" rx="14" fill="#133624"/>
        <text x="0" y="7" fill="#6EE7B7" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">Instant Settlement Complete</text>
      </g>
      <text x="200" y="590" fill="#047857" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Telenor Microfinance Bank - Verified E-Receipt</text>
    </svg>
    `;
    return toBase64Svg(svg);
  }

  // Raast / Bank Transfer (PKR)
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 620" width="400" height="620">
    <defs>
      <linearGradient id="raastGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0284C7"/>
        <stop offset="100%" stop-color="#0369A1"/>
      </linearGradient>
    </defs>
    <rect width="400" height="620" rx="24" fill="#0F172A"/>
    <rect width="400" height="130" rx="24" fill="url(#raastGrad)"/>
    <rect y="100" width="400" height="30" fill="url(#raastGrad)"/>
    
    <text x="200" y="52" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="2">RAAST</text>
    <text x="200" y="80" fill="#BAE6FD" font-family="system-ui, sans-serif" font-weight="700" font-size="13" text-anchor="middle">INSTANT P2P TRANSFER</text>

    <circle cx="200" cy="130" r="32" fill="#38BDF8" stroke="#0F172A" stroke-width="5"/>
    <path d="M190 130 L197 137 L211 123" fill="none" stroke="#0F172A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

    <text x="200" y="200" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">Settled Amount</text>
    <text x="200" y="242" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="34" text-anchor="middle">Rs ${formattedAmount}</text>

    <line x1="40" y1="270" x2="360" y2="270" stroke="#1E293B" stroke-width="2" stroke-dasharray="6,6"/>

    <g transform="translate(40, 305)">
      <text x="0" y="0" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="13">Beneficiary</text>
      <text x="320" y="0" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="700" font-size="14" text-anchor="end">${recipient || 'Friend'}</text>

      <text x="0" y="42" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="13">Raast Ref ID</text>
      <text x="320" y="42" fill="#38BDF8" font-family="monospace" font-weight="700" font-size="13" text-anchor="end">${txId}</text>

      <text x="0" y="84" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="13">Timestamp</text>
      <text x="320" y="84" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="13" text-anchor="end">${txDate}</text>

      <text x="0" y="126" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="13">Bank Processing</text>
      <text x="320" y="126" fill="#22C55E" font-family="system-ui, sans-serif" font-weight="700" font-size="13" text-anchor="end">SUCCESSFUL</text>

      <text x="0" y="168" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="13">Protocol</text>
      <text x="320" y="168" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="13" text-anchor="end">Raast ISO 20022</text>
    </g>

    <line x1="40" y1="510" x2="360" y2="510" stroke="#1E293B" stroke-width="2"/>

    <g transform="translate(200, 545)">
      <rect x="-140" y="-12" width="280" height="28" rx="14" fill="#1E293B"/>
      <text x="0" y="7" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">Cryptographically Settled</text>
    </g>
    <text x="200" y="590" fill="#475569" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">State Bank of Pakistan - National Payment System</text>
  </svg>
  `;
  return toBase64Svg(svg);
};
