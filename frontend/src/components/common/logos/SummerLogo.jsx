/**
 * SummerLogo - Bright sun, blue sky, and warm vibes
 */
function SummerLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Summer sky gradient */}
      <defs>
        <linearGradient id="summerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00BFFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#87CEEB" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
          <stop offset="70%" stopColor="#FFA500" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.6" />
        </radialGradient>
        <linearGradient id="deckGradientSummer" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Circular background */}
      <circle cx="50" cy="50" r="46" fill="url(#summerGradient)" />

      {/* Sun with rays */}
      <g>
        {/* Sun rays */}
        <line x1="22" y1="22" x2="15" y2="15" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <line x1="22" y1="32" x2="12" y2="32" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <line x1="22" y1="42" x2="15" y2="49" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <line x1="32" y1="22" x2="32" y2="12" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <line x1="42" y1="22" x2="49" y2="15" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

        {/* Sun body */}
        <circle cx="32" cy="32" r="12" fill="url(#sunGradient)" />

        {/* Sun face (subtle) */}
        <circle cx="28" cy="30" r="1.5" fill="#FF8C00" opacity="0.5" />
        <circle cx="36" cy="30" r="1.5" fill="#FF8C00" opacity="0.5" />
        <path d="M28 36 Q32 39 36 36" stroke="#FF8C00" strokeWidth="1.5" fill="none" opacity="0.5" />
      </g>

      {/* White fluffy cloud */}
      <g>
        <ellipse cx="72" cy="25" rx="10" ry="6" fill="white" opacity="0.9" />
        <ellipse cx="80" cy="28" rx="8" ry="5" fill="white" opacity="0.85" />
        <ellipse cx="65" cy="28" rx="6" ry="4" fill="white" opacity="0.85" />
      </g>

      {/* Small bird silhouettes */}
      <path d="M60 42 Q62 40 64 42 Q66 40 68 42" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3" />
      <path d="M75 48 Q76 47 77 48 Q78 47 79 48" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.25" />

      {/* Deck platform */}
      <path
        d="M20 65 L50 50 L80 65 L75 70 L50 58 L25 70 Z"
        fill="url(#deckGradientSummer)"
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

      {/* Sunglasses on railing (fun touch) */}
      <g transform="translate(48, 44)">
        <ellipse cx="0" cy="0" rx="3" ry="2" fill="#333" opacity="0.7" />
        <ellipse cx="7" cy="0" rx="3" ry="2" fill="#333" opacity="0.7" />
        <path d="M3 0 L4 0" stroke="#333" strokeWidth="1" opacity="0.7" />
      </g>
    </svg>
  );
}

export default SummerLogo;
