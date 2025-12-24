/**
 * NewYearLogo - Confetti, fireworks, and celebration
 */
function NewYearLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* New Year gradient - midnight blue */}
      <defs>
        <linearGradient id="newYearGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#191970" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000080" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="deckGradientNewYear" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id="fireworkGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Circular background */}
      <circle cx="50" cy="50" r="46" fill="url(#newYearGradient)" />

      {/* Firework burst 1 - gold */}
      <g transform="translate(25, 20)">
        <circle cx="0" cy="0" r="3" fill="#FFD700" opacity="0.9" />
        <line x1="0" y1="-3" x2="0" y2="-10" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <line x1="3" y1="0" x2="10" y2="0" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <line x1="0" y1="3" x2="0" y2="10" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <line x1="-3" y1="0" x2="-10" y2="0" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <line x1="2" y1="-2" x2="7" y2="-7" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <line x1="2" y1="2" x2="7" y2="7" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <line x1="-2" y1="2" x2="-7" y2="7" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <line x1="-2" y1="-2" x2="-7" y2="-7" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        {/* Sparkle dots */}
        <circle cx="0" cy="-12" r="1" fill="#FFA500" opacity="0.7" />
        <circle cx="8" cy="-8" r="0.8" fill="#FFA500" opacity="0.6" />
        <circle cx="12" cy="0" r="1" fill="#FFA500" opacity="0.7" />
      </g>

      {/* Firework burst 2 - magenta */}
      <g transform="translate(75, 28)">
        <circle cx="0" cy="0" r="2.5" fill="#FF00FF" opacity="0.8" />
        <line x1="0" y1="-2.5" x2="0" y2="-8" stroke="#FF00FF" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <line x1="2.5" y1="0" x2="8" y2="0" stroke="#FF00FF" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <line x1="0" y1="2.5" x2="0" y2="8" stroke="#FF00FF" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <line x1="-2.5" y1="0" x2="-8" y2="0" stroke="#FF00FF" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <line x1="1.8" y1="-1.8" x2="5.5" y2="-5.5" stroke="#FF00FF" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <line x1="1.8" y1="1.8" x2="5.5" y2="5.5" stroke="#FF00FF" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* Firework burst 3 - cyan (smaller) */}
      <g transform="translate(55, 15)">
        <circle cx="0" cy="0" r="2" fill="#00FFFF" opacity="0.7" />
        <line x1="0" y1="-2" x2="0" y2="-6" stroke="#00FFFF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <line x1="2" y1="0" x2="6" y2="0" stroke="#00FFFF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <line x1="-2" y1="0" x2="-6" y2="0" stroke="#00FFFF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <line x1="0" y1="2" x2="0" y2="6" stroke="#00FFFF" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* Stars */}
      <circle cx="45" cy="30" r="1.2" fill="white" opacity="0.8" />
      <circle cx="85" cy="45" r="1" fill="white" opacity="0.6" />
      <circle cx="15" cy="42" r="0.8" fill="white" opacity="0.5" />

      {/* Confetti pieces */}
      <rect x="18" y="38" width="3" height="2" rx="0.5" fill="#FF6B6B" opacity="0.8" transform="rotate(25 18 38)" />
      <rect x="78" y="50" width="2.5" height="1.5" rx="0.4" fill="#4ECDC4" opacity="0.7" transform="rotate(-15 78 50)" />
      <rect x="35" y="42" width="2" height="1.5" rx="0.3" fill="#FFD700" opacity="0.6" transform="rotate(45 35 42)" />
      <rect x="65" y="40" width="2.5" height="1.5" rx="0.4" fill="#FF69B4" opacity="0.7" transform="rotate(-30 65 40)" />
      <rect x="12" y="55" width="2" height="1.2" rx="0.3" fill="#00FF00" opacity="0.5" transform="rotate(60 12 55)" />
      <rect x="88" y="38" width="2" height="1.2" rx="0.3" fill="#FFA500" opacity="0.6" transform="rotate(-45 88 38)" />

      {/* Deck platform */}
      <path
        d="M20 65 L50 50 L80 65 L75 70 L50 58 L25 70 Z"
        fill="url(#deckGradientNewYear)"
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

      {/* Party lights on railing */}
      <circle cx="34" cy="54" r="2" fill="#FF6B6B" opacity="0.9" />
      <circle cx="44" cy="49" r="2" fill="#FFD700" opacity="0.9" />
      <circle cx="54" cy="47" r="2" fill="#4ECDC4" opacity="0.9" />
      <circle cx="64" cy="50" r="2" fill="#FF69B4" opacity="0.9" />

      {/* Support beam */}
      <path
        d="M50 58 L50 82"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Party hat on deck */}
      <g transform="translate(42, 42)">
        <path d="M8 0 L0 15 L16 15 Z" fill="#FF6B6B" />
        <ellipse cx="8" cy="15" rx="8" ry="2" fill="#FFD700" />
        <circle cx="8" cy="0" r="2.5" fill="#FFD700" />
        {/* Hat stripes */}
        <path d="M6 5 L4 10" stroke="#FFD700" strokeWidth="1" opacity="0.7" />
        <path d="M10 5 L12 10" stroke="#FFD700" strokeWidth="1" opacity="0.7" />
      </g>

      {/* Support base */}
      <ellipse cx="50" cy="84" rx="12" ry="4" fill="currentColor" opacity="0.6" />

      {/* Champagne glass */}
      <g transform="translate(62, 74)">
        <path d="M4 0 L0 8 L2 8 L2 12 L6 12 L6 8 L8 8 Z" fill="#E6E6FA" opacity="0.8" />
        <ellipse cx="4" cy="0" rx="4" ry="1.5" fill="#E6E6FA" opacity="0.6" />
        {/* Bubbles */}
        <circle cx="3" cy="3" r="0.8" fill="white" opacity="0.6" />
        <circle cx="5" cy="5" r="0.6" fill="white" opacity="0.5" />
      </g>
    </svg>
  );
}

export default NewYearLogo;
