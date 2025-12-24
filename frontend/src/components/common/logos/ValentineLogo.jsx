/**
 * ValentineLogo - Hearts, pink vibes, and love in the air
 */
function ValentineLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Valentine gradient - soft pink */}
      <defs>
        <linearGradient id="valentineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFB6C1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFC0CB" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="deckGradientValentine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF69B4" />
          <stop offset="100%" stopColor="#DC143C" />
        </linearGradient>
        <linearGradient id="heartGradientLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFB6C1" />
          <stop offset="100%" stopColor="#FF69B4" />
        </linearGradient>
      </defs>

      {/* Circular background */}
      <circle cx="50" cy="50" r="46" fill="url(#valentineGradient)" />

      {/* Large decorative heart - top center */}
      <g transform="translate(40, 12) scale(1.2)">
        <path
          d="M10 6 C10 2 6 0 3 0 C0 0 -2 3 -2 6 C-2 12 10 20 10 20 C10 20 22 12 22 6 C22 3 20 0 17 0 C14 0 10 2 10 6"
          fill="url(#heartGradient)"
          opacity="0.9"
        />
        {/* Heart shine */}
        <ellipse cx="4" cy="5" rx="2" ry="1.5" fill="white" opacity="0.4" />
      </g>

      {/* Floating hearts */}
      {/* Heart 1 - left */}
      <g transform="translate(15, 30) scale(0.5)">
        <path
          d="M10 6 C10 2 6 0 3 0 C0 0 -2 3 -2 6 C-2 12 10 20 10 20 C10 20 22 12 22 6 C22 3 20 0 17 0 C14 0 10 2 10 6"
          fill="url(#heartGradientLight)"
          opacity="0.8"
        />
      </g>

      {/* Heart 2 - right */}
      <g transform="translate(75, 25) scale(0.4)">
        <path
          d="M10 6 C10 2 6 0 3 0 C0 0 -2 3 -2 6 C-2 12 10 20 10 20 C10 20 22 12 22 6 C22 3 20 0 17 0 C14 0 10 2 10 6"
          fill="#FF69B4"
          opacity="0.7"
        />
      </g>

      {/* Heart 3 - small left */}
      <g transform="translate(22, 48) scale(0.3)">
        <path
          d="M10 6 C10 2 6 0 3 0 C0 0 -2 3 -2 6 C-2 12 10 20 10 20 C10 20 22 12 22 6 C22 3 20 0 17 0 C14 0 10 2 10 6"
          fill="#FFB6C1"
          opacity="0.6"
        />
      </g>

      {/* Heart 4 - small right */}
      <g transform="translate(82, 45) scale(0.25)">
        <path
          d="M10 6 C10 2 6 0 3 0 C0 0 -2 3 -2 6 C-2 12 10 20 10 20 C10 20 22 12 22 6 C22 3 20 0 17 0 C14 0 10 2 10 6"
          fill="#DC143C"
          opacity="0.5"
        />
      </g>

      {/* Sparkles */}
      <circle cx="30" cy="20" r="1.5" fill="white" opacity="0.7" />
      <circle cx="70" cy="38" r="1" fill="white" opacity="0.6" />
      <circle cx="85" cy="55" r="1.2" fill="white" opacity="0.5" />
      <circle cx="12" cy="38" r="1" fill="white" opacity="0.5" />

      {/* Deck platform */}
      <path
        d="M20 65 L50 50 L80 65 L75 70 L50 58 L25 70 Z"
        fill="url(#deckGradientValentine)"
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

      {/* Heart decorations on railing */}
      <g transform="translate(36, 48) scale(0.35)">
        <path
          d="M10 6 C10 2 6 0 3 0 C0 0 -2 3 -2 6 C-2 12 10 20 10 20 C10 20 22 12 22 6 C22 3 20 0 17 0 C14 0 10 2 10 6"
          fill="#DC143C"
        />
      </g>
      <g transform="translate(56, 48) scale(0.35)">
        <path
          d="M10 6 C10 2 6 0 3 0 C0 0 -2 3 -2 6 C-2 12 10 20 10 20 C10 20 22 12 22 6 C22 3 20 0 17 0 C14 0 10 2 10 6"
          fill="#FF69B4"
        />
      </g>

      {/* Support beam */}
      <path
        d="M50 58 L50 82"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Ribbon wrapped around beam */}
      <path
        d="M48 63 Q54 66 48 69 Q54 72 48 75"
        stroke="#FF69B4"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* Support base with rose petals */}
      <ellipse cx="50" cy="84" rx="12" ry="4" fill="currentColor" opacity="0.5" />

      {/* Rose petals */}
      <ellipse cx="42" cy="82" rx="2" ry="1" fill="#DC143C" opacity="0.7" transform="rotate(-20 42 82)" />
      <ellipse cx="57" cy="83" rx="1.5" ry="0.8" fill="#FF69B4" opacity="0.6" transform="rotate(15 57 83)" />
      <ellipse cx="50" cy="86" rx="1.8" ry="0.9" fill="#FFB6C1" opacity="0.5" />
    </svg>
  );
}

export default ValentineLogo;
