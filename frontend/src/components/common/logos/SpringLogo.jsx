/**
 * SpringLogo - Cherry blossoms and fresh spring vibes
 */
function SpringLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Spring sky gradient */}
      <defs>
        <linearGradient id="springGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#87CEEB" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#98FB98" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="deckGradientSpring" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Circular background */}
      <circle cx="50" cy="50" r="46" fill="url(#springGradient)" />

      {/* Cherry blossom petals floating */}
      <g className="animate-pulse">
        {/* Blossom 1 */}
        <circle cx="20" cy="20" r="4" fill="#FFB7C5" opacity="0.9" />
        <circle cx="18" cy="18" r="2" fill="#FF69B4" opacity="0.6" />

        {/* Blossom 2 */}
        <circle cx="75" cy="15" r="3.5" fill="#FFB7C5" opacity="0.85" />
        <circle cx="73" cy="13" r="1.5" fill="#FF69B4" opacity="0.6" />

        {/* Blossom 3 */}
        <circle cx="85" cy="40" r="3" fill="#FFB7C5" opacity="0.8" />
        <circle cx="83" cy="38" r="1.5" fill="#FF69B4" opacity="0.5" />

        {/* Blossom 4 */}
        <circle cx="15" cy="45" r="2.5" fill="#FFB7C5" opacity="0.75" />

        {/* Blossom 5 */}
        <circle cx="30" cy="30" r="2" fill="#FFB7C5" opacity="0.7" />

        {/* Falling petals */}
        <ellipse cx="65" cy="35" rx="2" ry="1" fill="#FFB7C5" opacity="0.6" transform="rotate(30 65 35)" />
        <ellipse cx="40" cy="25" rx="1.5" ry="0.8" fill="#FFB7C5" opacity="0.5" transform="rotate(-20 40 25)" />
      </g>

      {/* Small butterfly */}
      <g transform="translate(78, 55) rotate(-15)">
        <ellipse cx="0" cy="0" rx="3" ry="5" fill="#E6E6FA" opacity="0.8" />
        <ellipse cx="5" cy="0" rx="3" ry="5" fill="#DDA0DD" opacity="0.8" />
        <rect x="2" y="-3" width="1" height="6" fill="#666" opacity="0.6" />
      </g>

      {/* Deck platform */}
      <path
        d="M20 65 L50 50 L80 65 L75 70 L50 58 L25 70 Z"
        fill="url(#deckGradientSpring)"
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

      {/* Support base with grass */}
      <ellipse cx="50" cy="84" rx="12" ry="4" fill="#90EE90" opacity="0.6" />

      {/* Small flowers at base */}
      <circle cx="42" cy="82" r="2" fill="#FFB7C5" opacity="0.8" />
      <circle cx="58" cy="83" r="1.5" fill="#FF69B4" opacity="0.7" />
    </svg>
  );
}

export default SpringLogo;
