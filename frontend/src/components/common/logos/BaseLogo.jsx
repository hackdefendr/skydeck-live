/**
 * BaseLogo - The default SkyDeck logo
 * A stylized viewing deck/platform reaching into the sky with clouds
 */
function BaseLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sky gradient background */}
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="deckGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Circular sky background */}
      <circle cx="50" cy="50" r="46" fill="url(#skyGradient)" />

      {/* Cloud 1 - top left */}
      <ellipse cx="25" cy="28" rx="12" ry="6" fill="currentColor" opacity="0.2" />
      <ellipse cx="32" cy="26" rx="8" ry="5" fill="currentColor" opacity="0.2" />

      {/* Cloud 2 - top right */}
      <ellipse cx="72" cy="22" rx="10" ry="5" fill="currentColor" opacity="0.2" />
      <ellipse cx="80" cy="24" rx="8" ry="4" fill="currentColor" opacity="0.2" />

      {/* Cloud 3 - middle */}
      <ellipse cx="55" cy="38" rx="8" ry="4" fill="currentColor" opacity="0.15" />

      {/* Deck platform - main viewing deck */}
      <path
        d="M20 65 L50 50 L80 65 L75 70 L50 58 L25 70 Z"
        fill="url(#deckGradient)"
      />

      {/* Deck railing posts */}
      <rect x="28" y="58" width="3" height="12" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="42" y="52" width="3" height="12" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="55" y="52" width="3" height="12" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="69" y="58" width="3" height="12" rx="1" fill="currentColor" opacity="0.9" />

      {/* Deck railing top bar */}
      <path
        d="M26 58 L50 46 L74 58"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Support beam */}
      <path
        d="M50 58 L50 82"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Support base */}
      <ellipse cx="50" cy="84" rx="12" ry="4" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export default BaseLogo;
