/**
 * WinterLogo - Snowflakes and frosty winter vibes
 */
function WinterLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Winter sky gradient */}
      <defs>
        <linearGradient id="winterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B0E0E6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#E0FFFF" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="deckGradientWinter" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Circular background */}
      <circle cx="50" cy="50" r="46" fill="url(#winterGradient)" />

      {/* Snowflake 1 - large, decorative */}
      <g transform="translate(22, 25)" stroke="#ADD8E6" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
        <line x1="0" y1="-8" x2="0" y2="8" />
        <line x1="-7" y1="-4" x2="7" y2="4" />
        <line x1="-7" y1="4" x2="7" y2="-4" />
        <line x1="0" y1="-8" x2="-2" y2="-6" />
        <line x1="0" y1="-8" x2="2" y2="-6" />
        <line x1="0" y1="8" x2="-2" y2="6" />
        <line x1="0" y1="8" x2="2" y2="6" />
      </g>

      {/* Snowflake 2 - medium */}
      <g transform="translate(75, 20)" stroke="#B0C4DE" strokeWidth="1.2" strokeLinecap="round" opacity="0.75">
        <line x1="0" y1="-6" x2="0" y2="6" />
        <line x1="-5" y1="-3" x2="5" y2="3" />
        <line x1="-5" y1="3" x2="5" y2="-3" />
        <circle cx="0" cy="0" r="1.5" fill="#B0C4DE" />
      </g>

      {/* Snowflake 3 - small */}
      <g transform="translate(82, 45)" stroke="#ADD8E6" strokeWidth="1" strokeLinecap="round" opacity="0.6">
        <line x1="0" y1="-4" x2="0" y2="4" />
        <line x1="-3.5" y1="-2" x2="3.5" y2="2" />
        <line x1="-3.5" y1="2" x2="3.5" y2="-2" />
      </g>

      {/* Snowflake 4 - tiny */}
      <g transform="translate(15, 48)" stroke="#B0C4DE" strokeWidth="0.8" strokeLinecap="round" opacity="0.5">
        <line x1="0" y1="-3" x2="0" y2="3" />
        <line x1="-2.6" y1="-1.5" x2="2.6" y2="1.5" />
        <line x1="-2.6" y1="1.5" x2="2.6" y2="-1.5" />
      </g>

      {/* Falling snow dots */}
      <circle cx="30" cy="18" r="1.5" fill="white" opacity="0.8" />
      <circle cx="65" cy="35" r="1" fill="white" opacity="0.6" />
      <circle cx="45" cy="28" r="1.2" fill="white" opacity="0.7" />
      <circle cx="58" cy="15" r="1" fill="white" opacity="0.5" />
      <circle cx="35" cy="40" r="0.8" fill="white" opacity="0.5" />
      <circle cx="72" cy="52" r="1" fill="white" opacity="0.4" />
      <circle cx="20" cy="35" r="0.8" fill="white" opacity="0.5" />

      {/* Deck platform */}
      <path
        d="M20 65 L50 50 L80 65 L75 70 L50 58 L25 70 Z"
        fill="url(#deckGradientWinter)"
      />

      {/* Snow on deck */}
      <path
        d="M22 64 L50 49 L78 64 L75 65 L50 52 L25 65 Z"
        fill="white"
        opacity="0.7"
      />

      {/* Deck railing posts */}
      <rect x="28" y="58" width="3" height="12" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="42" y="52" width="3" height="12" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="55" y="52" width="3" height="12" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="69" y="58" width="3" height="12" rx="1" fill="currentColor" opacity="0.9" />

      {/* Snow caps on posts */}
      <ellipse cx="29.5" cy="57" rx="2.5" ry="1.5" fill="white" opacity="0.9" />
      <ellipse cx="43.5" cy="51" rx="2.5" ry="1.5" fill="white" opacity="0.9" />
      <ellipse cx="56.5" cy="51" rx="2.5" ry="1.5" fill="white" opacity="0.9" />
      <ellipse cx="70.5" cy="57" rx="2.5" ry="1.5" fill="white" opacity="0.9" />

      {/* Deck railing top bar */}
      <path
        d="M26 58 L50 46 L74 58"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Snow on railing */}
      <path
        d="M27 57 L50 45 L73 57"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* Support beam */}
      <path
        d="M50 58 L50 82"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Snow-covered base */}
      <ellipse cx="50" cy="84" rx="14" ry="5" fill="white" opacity="0.8" />
      <ellipse cx="50" cy="85" rx="12" ry="4" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export default WinterLogo;
