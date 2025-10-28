/**
 * Color utility functions for custom presets
 */

import { HSLColor, CustomColorPreset } from '../presets/CustomPreset';

/**
 * Convert hex color to HSL
 */
export function hexToHSL(hex: string): HSLColor {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL color to hex
 */
export function hslToHex(hsl: HSLColor): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Validate hex color format (supports transparency)
 */
export function validateHex(hex: string): boolean {
  const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/;
  return hexRegex.test(hex);
}

/**
 * Validate HSL color ranges
 */
export function validateHSL(hsl: HSLColor): boolean {
  return hsl.h >= 0 && hsl.h <= 360 &&
         hsl.s >= 0 && hsl.s <= 100 &&
         hsl.l >= 0 && hsl.l <= 100;
}

/**
 * Generate a color swatch element for preview
 */
export function generateColorSwatch(preset: CustomColorPreset): HTMLElement {
  const swatch = document.createElement('div');
  swatch.className = 'custom-preset-swatch';
  swatch.style.cssText = `
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 3px;
    border: 1px solid var(--background-modifier-border);
    margin-right: 8px;
    background: linear-gradient(45deg, 
      ${hslToHex(preset.light.base)} 0%, 
      ${hslToHex(preset.light.accent)} 50%, 
      ${hslToHex(preset.dark.base)} 100%);
    vertical-align: middle;
  `;
  return swatch;
}

/**
 * Sanitize preset name for display
 */
export function sanitizePresetName(name: string): string {
  return name.trim().replace(/[<>:"/\\|?*]/g, '');
}

/**
 * Generate a unique preset ID from name
 */
export function generatePresetId(name: string): string {
  return sanitizePresetName(name)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50);
}

/**
 * Validate preset ID format
 */
export function validatePresetId(id: string): boolean {
  const idRegex = /^[a-z0-9-]+$/;
  return idRegex.test(id) && id.length > 0 && id.length <= 50;
}

/**
 * Check if preset ID is unique
 */
export function isPresetIdUnique(id: string, existingPresets: CustomColorPreset[], excludeId?: string): boolean {
  return !existingPresets.some(preset => preset.id === id && preset.id !== excludeId);
}

/**
 * Format HSL color for display
 */
export function formatHSL(hsl: HSLColor): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

/**
 * Get contrast ratio between two colors (for accessibility)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}
