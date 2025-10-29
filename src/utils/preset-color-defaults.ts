/**
 * Default color calculation for preset overrides
 * Generates intelligent defaults based on base and accent colors
 */

import { ColorPalette } from '../presets/CustomPreset';
import { hslToHex } from './color-utils';

/**
 * Get default color value for a given color key
 * @param key - Color key (bg1, tx1, red, etc.)
 * @param palette - Base palette with base and accent colors
 * @returns Hex color string
 */
export function getDefaultColorForKey(key: string, palette: ColorPalette): string {
  const baseH = palette.base.h;
  const baseS = palette.base.s;
  const baseL = palette.base.l;
  const accentH = palette.accent.h;
  const accentS = palette.accent.s;
  const accentL = palette.accent.l;
  
  const isLightBase = baseL > 50;
  
  // Syntax colors - actual colors!
  const syntaxDefaults: { [key: string]: string } = {
    'red': '#e74c3c',
    'orange': '#e67e22',
    'yellow': '#f39c12',
    'green': '#27ae60',
    'cyan': '#16a085',
    'blue': '#3498db',
    'purple': '#9b59b6',
    'pink': '#e91e63'
  };
  
  if (syntaxDefaults[key]) {
    return syntaxDefaults[key];
  }
  
  // Calculate derived colors based on theme and convert to hex
  let h: number, s: number, l: number;
  
  switch(key) {
    case 'bg1':
      return hslToHex({ h: baseH, s: baseS, l: baseL });
    case 'bg2':
      l = isLightBase ? Math.max(0, baseL - 5) : Math.min(100, baseL + 5);
      return hslToHex({ h: baseH, s: baseS, l });
    case 'bg3':
      l = isLightBase ? Math.max(0, baseL - 10) : Math.min(100, baseL + 10);
      return hslToHex({ h: baseH, s: baseS, l });
    case 'ui1':
      l = isLightBase ? Math.max(0, baseL - 15) : Math.min(100, baseL + 15);
      return hslToHex({ h: baseH, s: baseS, l });
    case 'ui2':
      l = isLightBase ? Math.max(0, baseL - 10) : Math.min(100, baseL + 10);
      return hslToHex({ h: baseH, s: baseS, l });
    case 'ui3':
      l = isLightBase ? Math.max(0, baseL - 5) : Math.min(100, baseL + 5);
      return hslToHex({ h: baseH, s: baseS, l });
    case 'tx1':
      s = Math.max(0, baseS - 10);
      l = isLightBase ? Math.max(0, baseL - 87) : Math.min(100, baseL + 77);
      return hslToHex({ h: baseH, s, l });
    case 'tx2':
      s = Math.max(0, baseS - 20);
      l = isLightBase ? Math.max(0, baseL - 53) : Math.min(100, baseL + 45);
      return hslToHex({ h: baseH, s, l });
    case 'tx3':
      s = Math.max(0, baseS - 10);
      l = isLightBase ? Math.max(0, baseL - 78) : Math.min(100, baseL + 30);
      return hslToHex({ h: baseH, s, l });
    case 'tx4':
      s = Math.max(0, baseS - 10);
      l = isLightBase ? Math.max(0, baseL - 48) : Math.min(100, baseL + 40);
      return hslToHex({ h: baseH, s, l });
    case 'hl1':
      // Semi-transparent accent color - for color input, use opaque version
      return hslToHex({ h: accentH, s: 50, l: 40 });
    case 'hl2':
      // Orange highlight
      return '#ffb150';
    default:
      return '#000000';
  }
}

