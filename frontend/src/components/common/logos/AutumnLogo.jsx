/**
 * AutumnLogo - Falling maple leaves and warm autumn colors
 */
function AutumnLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Autumn sky gradient */}
      <defs>
        <linearGradient id="autumnGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFB347" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#D2691E" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="deckGradientAutumn" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Circular background */}
      <circle cx="50" cy="50" r="46" fill="url(#autumnGradient)" />

      {/* Maple leaf 1 - large, top left */}
      <g transform="translate(18, 22) rotate(-15) scale(0.8)">
        <path
          d="M10 0 L12 8 L20 6 L14 12 L18 20 L10 16 L10 24 L10 16 L2 20 L6 12 L0 6 L8 8 Z"
          fill="#D2691E"
          opacity="0.9"
        />
        <line x1="10" y1="12" x2="10" y2="24" stroke="#8B4513" strokeWidth="1" opacity="0.6" />
      </g>

      {/* Maple leaf 2 - medium, top right */}
      <g transform="translate(72, 18) rotate(20) scale(0.6)">
        <path
          d="M10 0 L12 8 L20 6 L14 12 L18 20 L10 16 L10 24 L10 16 L2 20 L6 12 L0 6 L8 8 Z"
          fill="#FF6347"
          opacity="0.85"
        />
        <line x1="10" y1="12" x2="10" y2="24" stroke="#8B4513" strokeWidth="1" opacity="0.6" />
      </g>

      {/* Maple leaf 3 - small, falling */}
      <g transform="translate(80, 42) rotate(45) scale(0.4)">
        <path
          d="M10 0 L12 8 L20 6 L14 12 L18 20 L10 16 L10 24 L10 16 L2 20 L6 12 L0 6 L8 8 Z"
          fill="#FF8C00"
          opacity="0.8"
        />
      </g>

      {/* Maple leaf 4 - small, left side */}
      <g transform="translate(12, 50) rotate(-30) scale(0.35)">
        <path
          d="M10 0 L12 8 L20 6 L14 12 L18 20 L10 16 L10 24 L10 16 L2 20 L6 12 L0 6 L8 8 Z"
          fill="#CD853F"
          opacity="0.75"
        />
      </g>

      {/* Maple leaf 5 - medium, center-ish */}
      <g transform="translate(55, 32) rotate(10) scale(0.5)">
        <path
          d="M10 0 L12 8 L20 6 L14 12 L18 20 L10 16 L10 24 L10 16 L2 20 L6 12 L0 6 L8 8 Z"
          fill="#B8860B"
          opacity="0.7"
        />
      </g>

      {/* Small floating leaf */}
      <ellipse cx="40" cy="28" rx="3" ry="1.5" fill="#D2691E" opacity="0.5" transform="rotate(25 40 28)" />

      {/* Deck platform */}
      <path
        d="M20 65 L50 50 L80 65 L75 70 L50 58 L25 70 Z"
        fill="url(#deckGradientAutumn)"
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

      {/* Support base with fallen leaves */}
      <ellipse cx="50" cy="84" rx="12" ry="4" fill="#8B4513" opacity="0.4" />

      {/* Scattered leaves at base */}
      <ellipse cx="42" cy="83" rx="2" ry="1" fill="#D2691E" opacity="0.6" transform="rotate(-20 42 83)" />
      <ellipse cx="56" cy="85" rx="1.5" ry="0.8" fill="#FF8C00" opacity="0.5" transform="rotate(15 56 85)" />
      <ellipse cx="48" cy="86" rx="1.5" ry="0.8" fill="#CD853F" opacity="0.5" transform="rotate(-10 48 86)" />
    </svg>
  );
}

export default AutumnLogo;
