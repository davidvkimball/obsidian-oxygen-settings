/**
 * Type definitions for custom color presets
 */

export interface HSLColor {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
}

export interface ColorOverrides {
  // Background colors
  bg1?: string; // Primary background
  bg2?: string; // Secondary background
  bg3?: string; // Tertiary background
  
  // UI element colors
  ui1?: string; // Primary UI
  ui2?: string; // Secondary UI
  ui3?: string; // Tertiary UI
  
  // Text colors
  tx1?: string; // Primary text
  tx2?: string; // Secondary text
  tx3?: string; // Tertiary text
  tx4?: string; // Quaternary text
  
  // Highlight colors
  hl1?: string; // Primary highlight
  hl2?: string; // Secondary highlight
  
  // Syntax colors
  red?: string;
  orange?: string;
  yellow?: string;
  green?: string;
  cyan?: string;
  blue?: string;
  purple?: string;
  pink?: string;
}

export interface ColorPalette {
  base: HSLColor;
  accent: HSLColor;
  colors?: ColorOverrides;
  frameLightnessOffset?: number; // Optional override for colorful-frame feature (default: -25 for dark, +30 for light)
}

export interface CustomColorPreset {
  id: string;                    // Unique identifier (e.g., "custom-dracula-inspired")
  name: string;                  // Display name (e.g., "Dracula Inspired")
  author?: string;               // Optional author
  version?: string;              // Optional version
  light: ColorPalette;           // Light mode colors
  dark: ColorPalette;            // Dark mode colors
}

/**
 * Default color palette for new presets
 */
export const DEFAULT_COLOR_PALETTE: ColorPalette = {
  base: { h: 210, s: 20, l: 50 }, // Neutral blue-gray
  accent: { h: 200, s: 80, l: 50 }, // Bright blue
  colors: {}
};

/**
 * Default custom preset structure
 */
export const DEFAULT_CUSTOM_PRESET: Omit<CustomColorPreset, 'id' | 'name'> = {
  author: '',
  version: '1.0.0',
  light: DEFAULT_COLOR_PALETTE,
  dark: DEFAULT_COLOR_PALETTE
};
