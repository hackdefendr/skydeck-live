import { useMemo } from 'react';
import {
  BaseLogo,
  SpringLogo,
  SummerLogo,
  AutumnLogo,
  WinterLogo,
  ChristmasLogo,
  HalloweenLogo,
  ValentineLogo,
  NewYearLogo,
  LOGO_VARIANTS,
} from './logos';

// Map variant names to components
const LOGO_COMPONENTS = {
  [LOGO_VARIANTS.default]: BaseLogo,
  [LOGO_VARIANTS.spring]: SpringLogo,
  [LOGO_VARIANTS.summer]: SummerLogo,
  [LOGO_VARIANTS.autumn]: AutumnLogo,
  [LOGO_VARIANTS.winter]: WinterLogo,
  [LOGO_VARIANTS.christmas]: ChristmasLogo,
  [LOGO_VARIANTS.halloween]: HalloweenLogo,
  [LOGO_VARIANTS.valentine]: ValentineLogo,
  [LOGO_VARIANTS.newyear]: NewYearLogo,
};

/**
 * Calculate Easter date for a given year (Computus algorithm)
 */
function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Detect the appropriate logo variant based on current date
 * Priority: Holidays > Seasons
 */
function detectVariant(date = new Date()) {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  const year = date.getFullYear();

  // === HOLIDAYS (higher priority) ===

  // New Year (Dec 31 - Jan 2)
  if ((month === 11 && day >= 31) || (month === 0 && day <= 2)) {
    return LOGO_VARIANTS.newyear;
  }

  // Valentine's Day (Feb 12-14)
  if (month === 1 && day >= 12 && day <= 14) {
    return LOGO_VARIANTS.valentine;
  }

  // Easter (varies - check if within 3 days before or after)
  const easter = getEasterDate(year);
  const easterStart = new Date(easter);
  easterStart.setDate(easter.getDate() - 3);
  const easterEnd = new Date(easter);
  easterEnd.setDate(easter.getDate() + 1);
  if (date >= easterStart && date <= easterEnd) {
    return LOGO_VARIANTS.spring; // Use spring theme for Easter
  }

  // Halloween (Oct 25 - Oct 31)
  if (month === 9 && day >= 25 && day <= 31) {
    return LOGO_VARIANTS.halloween;
  }

  // Christmas (Dec 20 - Dec 26)
  if (month === 11 && day >= 20 && day <= 26) {
    return LOGO_VARIANTS.christmas;
  }

  // === SEASONS (lower priority) ===

  // Spring: March 20 - June 20
  if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
    return LOGO_VARIANTS.spring;
  }

  // Summer: June 21 - September 22
  if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 23)) {
    return LOGO_VARIANTS.summer;
  }

  // Autumn: September 23 - December 20
  if ((month === 8 && day >= 23) || month === 9 || month === 10 || (month === 11 && day < 20)) {
    return LOGO_VARIANTS.autumn;
  }

  // Winter: December 21 - March 19
  if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20)) {
    return LOGO_VARIANTS.winter;
  }

  return LOGO_VARIANTS.default;
}

/**
 * Logo Component
 *
 * @param {Object} props
 * @param {number} props.size - Size in pixels (default: 32)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Force a specific variant ('auto' = auto-detect, or specific variant name)
 */
function Logo({ size = 32, className = '', variant = 'auto' }) {
  // Get the logo preference from localStorage (can be overridden by settings)
  const storedPreference = useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('logoVariant') || 'auto';
    }
    return 'auto';
  }, []);

  // Determine which variant to use
  const activeVariant = useMemo(() => {
    const preference = variant !== 'auto' ? variant : storedPreference;

    if (preference === 'auto') {
      return detectVariant();
    }

    return preference;
  }, [variant, storedPreference]);

  // Get the appropriate component
  const LogoComponent = LOGO_COMPONENTS[activeVariant] || BaseLogo;

  return <LogoComponent size={size} className={className} />;
}

// Export utility functions for settings
Logo.detectVariant = detectVariant;
Logo.VARIANTS = LOGO_VARIANTS;
Logo.COMPONENTS = LOGO_COMPONENTS;

export default Logo;
