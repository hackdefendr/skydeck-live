/**
 * ChristmasLogo - Santa hat, ornaments, and festive cheer
 */
function ChristmasLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Christmas gradient */}
      <defs>
        <linearGradient id="christmasGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a472a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2d5a3f" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="deckGradientChristmas" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id="ornamentRed" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#ff6b6b" />
          <stop offset="100%" stopColor="#c41e3a" />
        </radialGradient>
        <radialGradient id="ornamentGold" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#daa520" />
        </radialGradient>
        <radialGradient id="ornamentGreen" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#90EE90" />
          <stop offset="100%" stopColor="#228B22" />
        </radialGradient>
      </defs>

      {/* Circular background */}
      <circle cx="50" cy="50" r="46" fill="url(#christmasGradient)" />

      {/* Snowflakes in background */}
      <circle cx="20" cy="25" r="1.5" fill="white" opacity="0.6" />
      <circle cx="75" cy="20" r="1" fill="white" opacity="0.5" />
      <circle cx="85" cy="40" r="1.2" fill="white" opacity="0.4" />
      <circle cx="15" cy="45" r="1" fill="white" opacity="0.5" />

      {/* Santa hat on top of deck */}
      <g transform="translate(38, 20)">
        {/* Hat body */}
        <path
          d="M0 28 Q12 10 24 28 L20 28 Q12 18 4 28 Z"
          fill="#c41e3a"
        />
        {/* Hat curve/droop */}
        <path
          d="M20 12 Q28 8 30 18"
          stroke="#c41e3a"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hat white trim */}
        <ellipse cx="12" cy="28" rx="14" ry="4" fill="white" />
        {/* Pompom */}
        <circle cx="32" cy="16" r="5" fill="white" />
      </g>

      {/* Deck platform */}
      <path
        d="M20 65 L50 50 L80 65 L75 70 L50 58 L25 70 Z"
        fill="url(#deckGradientChristmas)"
      />

      {/* Snow on deck */}
      <path
        d="M22 64 L50 49 L78 64 L75 65 L50 52 L25 65 Z"
        fill="white"
        opacity="0.6"
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

      {/* Christmas lights on railing */}
      <circle cx="32" cy="56" r="2.5" fill="url(#ornamentRed)" />
      <circle cx="42" cy="51" r="2.5" fill="url(#ornamentGold)" />
      <circle cx="52" cy="48" r="2.5" fill="url(#ornamentGreen)" />
      <circle cx="62" cy="51" r="2.5" fill="url(#ornamentRed)" />
      <circle cx="70" cy="56" r="2.5" fill="url(#ornamentGold)" />

      {/* Light strings */}
      <path
        d="M30 55 Q36 58 40 50 Q46 54 50 47 Q56 52 60 50 Q66 56 72 55"
        stroke="#333"
        strokeWidth="0.5"
        fill="none"
        opacity="0.4"
      />

      {/* Support beam */}
      <path
        d="M50 58 L50 82"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Wrapped ribbon on beam */}
      <path
        d="M48 62 L52 65 M48 68 L52 71 M48 74 L52 77"
        stroke="#c41e3a"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Snow-covered base */}
      <ellipse cx="50" cy="84" rx="14" ry="5" fill="white" opacity="0.8" />

      {/* Small gift box */}
      <g transform="translate(60, 78)">
        <rect x="0" y="0" width="8" height="6" fill="#c41e3a" rx="1" />
        <rect x="3" y="0" width="2" height="6" fill="url(#ornamentGold)" />
        <rect x="0" y="2" width="8" height="2" fill="url(#ornamentGold)" />
      </g>
    </svg>
  );
}

export default ChristmasLogo;
