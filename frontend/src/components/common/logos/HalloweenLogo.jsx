/**
 * HalloweenLogo - Spooky pumpkin, bats, and orange glow
 */
function HalloweenLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Halloween gradient - dark purple night */}
      <defs>
        <linearGradient id="halloweenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a0a2e" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#2d1b4e" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="deckGradientHalloween" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id="pumpkinGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6600" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FF6600" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#FFFACD" />
          <stop offset="100%" stopColor="#F0E68C" />
        </radialGradient>
      </defs>

      {/* Circular background */}
      <circle cx="50" cy="50" r="46" fill="url(#halloweenGradient)" />

      {/* Full moon */}
      <circle cx="75" cy="22" r="12" fill="url(#moonGradient)" opacity="0.9" />
      {/* Moon craters */}
      <circle cx="72" cy="20" r="2" fill="#DAA520" opacity="0.3" />
      <circle cx="78" cy="26" r="1.5" fill="#DAA520" opacity="0.2" />

      {/* Bat 1 - large */}
      <g transform="translate(18, 22)">
        <ellipse cx="8" cy="4" rx="2" ry="3" fill="#1a0a2e" />
        <path d="M0 4 Q4 0 8 4 Q8 8 4 6 Z" fill="#1a0a2e" />
        <path d="M16 4 Q12 0 8 4 Q8 8 12 6 Z" fill="#1a0a2e" />
        {/* Ears */}
        <path d="M6 1 L7 3 L8 1" fill="#1a0a2e" />
        <path d="M10 1 L9 3 L8 1" fill="#1a0a2e" />
      </g>

      {/* Bat 2 - small */}
      <g transform="translate(58, 35) scale(0.6)">
        <ellipse cx="8" cy="4" rx="2" ry="3" fill="#2d1b4e" />
        <path d="M0 4 Q4 0 8 4 Q8 8 4 6 Z" fill="#2d1b4e" />
        <path d="M16 4 Q12 0 8 4 Q8 8 12 6 Z" fill="#2d1b4e" />
      </g>

      {/* Stars */}
      <circle cx="30" cy="15" r="1" fill="#FFFACD" opacity="0.7" />
      <circle cx="45" cy="22" r="0.8" fill="#FFFACD" opacity="0.5" />
      <circle cx="88" cy="38" r="0.8" fill="#FFFACD" opacity="0.6" />
      <circle cx="12" cy="40" r="1" fill="#FFFACD" opacity="0.5" />

      {/* Pumpkin glow effect */}
      <circle cx="50" cy="75" r="20" fill="url(#pumpkinGlow)" />

      {/* Deck platform */}
      <path
        d="M20 65 L50 50 L80 65 L75 70 L50 58 L25 70 Z"
        fill="url(#deckGradientHalloween)"
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

      {/* Cobweb on railing */}
      <g opacity="0.4">
        <path d="M26 58 L30 54 M26 58 L28 52 M26 58 L32 56" stroke="white" strokeWidth="0.5" />
        <path d="M28 54 Q30 55 30 54 Q31 54 31 56" stroke="white" strokeWidth="0.3" fill="none" />
      </g>

      {/* Support beam */}
      <path
        d="M50 58 L50 82"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Jack-o-lantern pumpkin at base */}
      <g transform="translate(38, 72)">
        {/* Pumpkin body */}
        <ellipse cx="12" cy="10" rx="11" ry="9" fill="#FF6600" />
        {/* Pumpkin segments */}
        <path d="M12 1 Q8 10 12 19" stroke="#CC5500" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M12 1 Q16 10 12 19" stroke="#CC5500" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M5 3 Q3 10 5 17" stroke="#CC5500" strokeWidth="0.8" fill="none" opacity="0.4" />
        <path d="M19 3 Q21 10 19 17" stroke="#CC5500" strokeWidth="0.8" fill="none" opacity="0.4" />
        {/* Stem */}
        <rect x="10" y="0" width="4" height="4" rx="1" fill="#228B22" />
        {/* Face - glowing */}
        <path d="M6 8 L8 6 L10 8" fill="#FFD700" />
        <path d="M14 8 L16 6 L18 8" fill="#FFD700" />
        <path d="M8 14 L12 16 L16 14 L12 13 Z" fill="#FFD700" />
        {/* Face glow */}
        <path d="M6 8 L8 6 L10 8" fill="#FFA500" opacity="0.5" />
        <path d="M14 8 L16 6 L18 8" fill="#FFA500" opacity="0.5" />
      </g>

      {/* Small skull decoration */}
      <g transform="translate(68, 78)">
        <ellipse cx="5" cy="4" rx="5" ry="4" fill="#F5F5DC" opacity="0.8" />
        <circle cx="3" cy="4" r="1.5" fill="#1a0a2e" opacity="0.8" />
        <circle cx="7" cy="4" r="1.5" fill="#1a0a2e" opacity="0.8" />
        <ellipse cx="5" cy="7" rx="1" ry="0.5" fill="#1a0a2e" opacity="0.6" />
      </g>
    </svg>
  );
}

export default HalloweenLogo;
