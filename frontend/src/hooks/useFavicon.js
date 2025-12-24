import { useEffect, useCallback } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
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
} from '../components/common/logos';
import Logo from '../components/common/Logo';

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
 * Convert an SVG string to a data URL for use as a favicon
 */
function svgToDataUrl(svgString) {
  // Encode the SVG string to base64
  const encoded = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * Update the favicon in the document head
 */
function updateFavicon(dataUrl) {
  // Find existing favicon link
  let link = document.querySelector("link[rel*='icon']");

  // Create if doesn't exist
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  // Update href
  link.type = 'image/svg+xml';
  link.href = dataUrl;
}

/**
 * Hook to dynamically update the favicon based on logo variant
 */
export function useFavicon() {
  const updateFaviconFromVariant = useCallback(() => {
    // Get current variant from localStorage or auto-detect
    const storedVariant = localStorage.getItem('logoVariant') || 'auto';
    const activeVariant = storedVariant === 'auto' ? Logo.detectVariant() : storedVariant;

    // Get the logo component for this variant
    const LogoComponent = LOGO_COMPONENTS[activeVariant] || BaseLogo;

    // Render the logo to static markup
    const svgMarkup = renderToStaticMarkup(
      createElement(LogoComponent, { size: 32, className: '' })
    );

    // Convert to data URL and update favicon
    const dataUrl = svgToDataUrl(svgMarkup);
    updateFavicon(dataUrl);
  }, []);

  useEffect(() => {
    // Update favicon on mount
    updateFaviconFromVariant();

    // Listen for storage changes (when logo variant changes)
    const handleStorageChange = (e) => {
      if (e.key === 'logoVariant') {
        updateFaviconFromVariant();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also update on custom event for same-tab changes
    const handleLogoChange = () => {
      updateFaviconFromVariant();
    };

    window.addEventListener('logoVariantChanged', handleLogoChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logoVariantChanged', handleLogoChange);
    };
  }, [updateFaviconFromVariant]);

  return { updateFavicon: updateFaviconFromVariant };
}

export default useFavicon;
