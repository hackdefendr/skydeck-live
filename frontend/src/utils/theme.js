// Theme utility functions

export function hexToHsl(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function lighten(hex, amount) {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  const newL = Math.min(100, hsl.l + amount);
  return hslToHex(hsl.h, hsl.s, newL);
}

export function darken(hex, amount) {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  const newL = Math.max(0, hsl.l - amount);
  return hslToHex(hsl.h, hsl.s, newL);
}

export function getContrastColor(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '#000000';

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function isValidHex(hex) {
  return /^#[0-9A-F]{6}$/i.test(hex);
}

export function generatePalette(baseColor) {
  const hsl = hexToHsl(baseColor);
  if (!hsl) return null;

  return {
    50: hslToHex(hsl.h, Math.max(0, hsl.s - 30), 95),
    100: hslToHex(hsl.h, Math.max(0, hsl.s - 20), 90),
    200: hslToHex(hsl.h, Math.max(0, hsl.s - 10), 80),
    300: hslToHex(hsl.h, hsl.s, 70),
    400: hslToHex(hsl.h, hsl.s, 60),
    500: baseColor,
    600: hslToHex(hsl.h, hsl.s, 45),
    700: hslToHex(hsl.h, hsl.s, 35),
    800: hslToHex(hsl.h, hsl.s, 25),
    900: hslToHex(hsl.h, hsl.s, 15),
  };
}

export const defaultDarkTheme = {
  name: 'Dark',
  mode: 'dark',
  primaryColor: '#0085ff',
  secondaryColor: '#6366f1',
  accentColor: '#22c55e',
  bgPrimary: '#000000',
  bgSecondary: '#16181c',
  bgTertiary: '#1d1f23',
  textPrimary: '#e7e9ea',
  textSecondary: '#71767b',
  textMuted: '#536471',
  borderColor: '#2f3336',
};

export const defaultLightTheme = {
  name: 'Light',
  mode: 'light',
  primaryColor: '#0085ff',
  secondaryColor: '#6366f1',
  accentColor: '#22c55e',
  bgPrimary: '#ffffff',
  bgSecondary: '#f7f9f9',
  bgTertiary: '#eff3f4',
  textPrimary: '#0f1419',
  textSecondary: '#536471',
  textMuted: '#8b98a5',
  borderColor: '#eff3f4',
};
