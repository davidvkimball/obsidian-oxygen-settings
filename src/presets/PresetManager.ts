/**
 * Preset management and CSS generation
 */

import { CustomColorPreset, ColorPalette, DEFAULT_COLOR_PALETTE } from './CustomPreset';
import { 
  validatePresetId, 
  isPresetIdUnique, 
  sanitizePresetName, 
  generatePresetId,
  hslToHex 
} from '../utils/color-utils';

export class PresetManager {
  /**
   * Generate CSS for a custom preset
   */
  static generatePresetCSS(preset: CustomColorPreset, mode: 'light' | 'dark'): string {
    const palette = mode === 'light' ? preset.light : preset.dark;
    const themeClass = mode === 'light' ? 'theme-light' : 'theme-dark';
    const className = `minimal-custom-${preset.id}`;
    
    // Use more specific selector to avoid conflicts
    let css = `body.${themeClass}.${className} {\n`;
    
    // Required base HSL variables
    css += `  --base-h: ${palette.base.h} !important;\n`;
    css += `  --base-s: ${palette.base.s}% !important;\n`;
    css += `  --base-l: ${palette.base.l}% !important;\n`;
    
    // Required accent HSL variables
    css += `  --accent-h: ${palette.accent.h} !important;\n`;
    css += `  --accent-s: ${palette.accent.s}% !important;\n`;
    css += `  --accent-l: ${palette.accent.l}% !important;\n`;
    
    // Calculate all derived colors based on the theme's color system
    const baseH = palette.base.h;
    const baseS = palette.base.s;
    const baseL = palette.base.l;
    const accentH = palette.accent.h;
    const accentS = palette.accent.s;
    const accentL = palette.accent.l;
    
    // Determine if this is a light or dark theme based on base lightness
    const isLightMode = mode === 'light';
    const isLightBase = baseL > 50;
    
    // Background colors - simple calculation
    css += `  --bg1: hsl(${baseH}, ${baseS}%, ${baseL}%) !important;\n`;
    css += `  --bg2: hsl(${baseH}, ${baseS}%, ${isLightBase ? Math.max(0, baseL - 5) : Math.min(100, baseL + 5)}%) !important;\n`;
    css += `  --bg-tab: hsl(${baseH}, ${baseS}%, ${baseL}%) !important;\n`;
    css += `  --bg3: hsl(${baseH}, ${baseS}%, ${isLightBase ? Math.max(0, baseL - 10) : Math.min(100, baseL + 10)}%) !important;\n`;
    
    // UI colors (borders, dividers, etc.) - darker for light mode, lighter for dark mode
    const ui1L = isLightBase ? Math.max(0, baseL - 15) : Math.min(100, baseL + 15);
    const ui2L = isLightBase ? Math.max(0, baseL - 10) : Math.min(100, baseL + 10);
    const ui3L = isLightBase ? Math.max(0, baseL - 5) : Math.min(100, baseL + 5);
    
    css += `  --ui1: hsl(${baseH}, ${baseS}%, ${ui1L}%) !important;\n`;
    css += `  --ui2: hsl(${baseH}, ${baseS}%, ${ui2L}%) !important;\n`;
    css += `  --ui3: hsl(${baseH}, ${baseS}%, ${ui3L}%) !important;\n`;
    
    // Text colors - ensure proper contrast
    const tx1L = isLightBase ? 15 : 85;  // Very dark text for light bg, very light text for dark bg
    const tx2L = isLightBase ? 25 : 75;
    const tx3L = isLightBase ? 35 : 65;
    const tx4L = isLightBase ? 30 : 70;
    
    css += `  --tx1: hsl(${baseH}, ${Math.max(0, baseS - 10)}%, ${tx1L}%) !important;\n`;
    css += `  --tx2: hsl(${baseH}, ${Math.max(0, baseS - 20)}%, ${tx2L}%) !important;\n`;
    css += `  --tx3: hsl(${baseH}, ${Math.max(0, baseS - 10)}%, ${tx3L}%) !important;\n`;
    css += `  --tx4: hsl(${baseH}, ${Math.max(0, baseS - 10)}%, ${tx4L}%) !important;\n`;
    
    // Accent colors
    css += `  --ax1: hsl(${accentH}, ${accentS}%, ${accentL}%) !important;\n`;
    css += `  --ax2: hsl(${accentH}, ${accentS}%, ${Math.max(0, Math.min(100, accentL + 8))}%) !important;\n`;
    css += `  --ax3: hsl(${accentH}, ${accentS}%, ${Math.max(0, Math.min(100, accentL - 5))}%) !important;\n`;
    
    // Highlight colors
    css += `  --hl1: hsla(${accentH}, 50%, 40%, 30%) !important;\n`;
    css += `  --hl2: rgba(255, 177, 80, 0.3) !important;\n`;
    
    // Special colors
    css += `  --sp1: ${isLightMode ? 'white' : 'black'} !important;\n`;
    
    // Obsidian-specific color mappings
    css += `  --background-modifier-accent: var(--ax3) !important;\n`;
    css += `  --background-modifier-border-focus: var(--ui3) !important;\n`;
    css += `  --background-modifier-border-hover: var(--ui2) !important;\n`;
    css += `  --background-modifier-border: var(--ui1) !important;\n`;
    css += `  --mobile-sidebar-background: var(--bg1) !important;\n`;
    css += `  --background-modifier-form-field-highlighted: var(--bg1) !important;\n`;
    css += `  --background-modifier-form-field: var(--bg1) !important;\n`;
    css += `  --background-modifier-success: var(--color-green) !important;\n`;
    css += `  --background-modifier-hover: var(--bg3) !important;\n`;
    css += `  --background-modifier-active-hover: var(--bg3) !important;\n`;
    css += `  --background-primary: var(--bg1) !important;\n`;
    css += `  --background-primary-alt: var(--bg2) !important;\n`;
    css += `  --background-secondary: var(--bg2) !important;\n`;
    css += `  --background-secondary-alt: var(--bg1) !important;\n`;
    css += `  --background-table-rows: var(--bg2) !important;\n`;
    css += `  --checkbox-color: var(--ax3) !important;\n`;
    css += `  --code-normal: var(--tx1) !important;\n`;
    css += `  --divider-color: var(--ui1) !important;\n`;
    css += `  --frame-divider-color: var(--ui1) !important;\n`;
    css += `  --icon-color-active: var(--tx1) !important;\n`;
    css += `  --icon-color-focused: var(--tx1) !important;\n`;
    css += `  --icon-color-hover: var(--tx2) !important;\n`;
    css += `  --icon-color: var(--tx2) !important;\n`;
    css += `  --icon-hex: var(--mono0) !important;\n`;
    css += `  --interactive-accent-hover: var(--ax1) !important;\n`;
    css += `  --interactive-accent: var(--ax3) !important;\n`;
    css += `  --interactive-hover: var(--ui1) !important;\n`;
    css += `  --list-marker-color: var(--tx3) !important;\n`;
    css += `  --nav-item-background-active: var(--bg3) !important;\n`;
    css += `  --nav-item-background-hover: var(--bg3) !important;\n`;
    css += `  --nav-item-color: var(--tx2) !important;\n`;
    css += `  --nav-item-color-active: var(--tx1) !important;\n`;
    css += `  --nav-item-color-hover: var(--tx1) !important;\n`;
    css += `  --nav-item-color-selected: var(--tx1) !important;\n`;
    css += `  --nav-collapse-icon-color: var(--tx2) !important;\n`;
    css += `  --nav-collapse-icon-color-collapsed: var(--tx2) !important;\n`;
    css += `  --nav-indentation-guide-color: var(--ui1) !important;\n`;
    css += `  --prompt-border-color: var(--ui3) !important;\n`;
    css += `  --quote-opening-modifier: var(--ui2) !important;\n`;
    css += `  --ribbon-background: var(--bg2) !important;\n`;
    css += `  --scrollbar-active-thumb-bg: var(--ui3) !important;\n`;
    css += `  --scrollbar-bg: transparent !important;\n`;
    css += `  --scrollbar-thumb-bg: var(--ui1) !important;\n`;
    css += `  --search-result-background: var(--bg1) !important;\n`;
    css += `  --tab-text-color-focused-active: var(--tx1) !important;\n`;
    css += `  --tab-outline-color: var(--ui1) !important;\n`;
    css += `  --text-accent-hover: var(--ax2) !important;\n`;
    css += `  --text-accent: var(--ax1) !important;\n`;
    css += `  --text-blockquote: var(--tx2) !important;\n`;
    css += `  --text-bold: var(--tx1) !important;\n`;
    css += `  --text-code: var(--tx4) !important;\n`;
    css += `  --text-faint: var(--tx3) !important;\n`;
    css += `  --text-muted: var(--tx2) !important;\n`;
    css += `  --text-normal: var(--tx1) !important;\n`;
    css += `  --text-selection: var(--hl1) !important;\n`;
    css += `  --text-title-h1: var(--tx1) !important;\n`;
    css += `  --text-title-h2: var(--tx1) !important;\n`;
    css += `  --text-title-h3: var(--tx1) !important;\n`;
    css += `  --text-title-h4: var(--tx1) !important;\n`;
    css += `  --text-title-h5: var(--tx1) !important;\n`;
    css += `  --text-title-h6: var(--tx1) !important;\n`;
    
    // Specific UI element fixes - calculate proper contrast for accent color
    const accentIsLight = accentL > 50;
    css += `  --text-on-accent: ${accentIsLight ? 'black' : 'white'} !important;\n`;
    css += `  --interactive-accent-hover: var(--ax1) !important;\n`;
    css += `  --interactive-accent: var(--ax3) !important;\n`;
    
    // Hover effects for settings and other UI elements
    css += `  --background-modifier-hover: var(--bg3) !important;\n`;
    css += `  --background-modifier-active-hover: var(--bg3) !important;\n`;
    css += `  --nav-item-background-hover: var(--bg3) !important;\n`;
    css += `  --nav-item-background-active: var(--bg3) !important;\n`;
    
    // Right sidebar specific overrides
    css += `  .mod-right-split {\n`;
    css += `    --background-secondary: var(--bg1) !important;\n`;
    css += `  }\n`;
    
    // Button and interactive element colors
    css += `  --button-background: var(--ax3) !important;\n`;
    css += `  --button-background-hover: var(--ax2) !important;\n`;
    css += `  --button-text: var(--text-on-accent) !important;\n`;
    
    // Optional color overrides (if user provided specific colors)
    if (palette.colors) {
      const overrides = [
        'bg1', 'bg2', 'bg3',
        'ui1', 'ui2', 'ui3',
        'tx1', 'tx2', 'tx3', 'tx4',
        'hl1', 'hl2',
        'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'
      ];
      
      overrides.forEach(colorKey => {
        const color = palette.colors?.[colorKey as keyof typeof palette.colors];
        if (color) {
          css += `  --${colorKey}: ${color} !important;\n`;
        }
      });
    }
    
    css += '}\n';
    
    
    return css;
  }

  /**
   * Validate preset ID format and uniqueness
   */
  static validatePresetId(id: string, existingPresets: CustomColorPreset[], excludeId?: string): boolean {
    return validatePresetId(id) && isPresetIdUnique(id, existingPresets, excludeId);
  }

  /**
   * Sanitize preset name
   */
  static sanitizePresetName(name: string): string {
    return sanitizePresetName(name);
  }

  /**
   * Create a new preset with validation
   */
  static createPreset(
    name: string, 
    author: string = '', 
    existingPresets: CustomColorPreset[] = []
  ): CustomColorPreset {
    const sanitizedName = this.sanitizePresetName(name);
    if (!sanitizedName) {
      throw new Error('Preset name cannot be empty');
    }

    let id = generatePresetId(sanitizedName);
    let counter = 1;
    
    // Ensure unique ID
    while (!this.validatePresetId(id, existingPresets)) {
      id = `${generatePresetId(sanitizedName)}-${counter}`;
      counter++;
    }

    return {
      id,
      name: sanitizedName,
      author: author.trim(),
      version: '1.0.0',
      light: { ...DEFAULT_COLOR_PALETTE },
      dark: { ...DEFAULT_COLOR_PALETTE }
    };
  }

  /**
   * Update an existing preset
   */
  static updatePreset(
    id: string, 
    updates: Partial<CustomColorPreset>, 
    existingPresets: CustomColorPreset[]
  ): CustomColorPreset {
    const existingPreset = existingPresets.find(p => p.id === id);
    if (!existingPreset) {
      throw new Error(`Preset with ID "${id}" not found`);
    }

    const updatedPreset = { ...existingPreset, ...updates };
    
    // Validate new ID if changed
    if (updates.id && updates.id !== id) {
      if (!this.validatePresetId(updates.id, existingPresets, id)) {
        throw new Error(`Preset ID "${updates.id}" is invalid or already exists`);
      }
    }

    // Sanitize name if changed
    if (updates.name) {
      updatedPreset.name = this.sanitizePresetName(updates.name);
      if (!updatedPreset.name) {
        throw new Error('Preset name cannot be empty');
      }
    }

    return updatedPreset;
  }

  /**
   * Delete a preset
   */
  static deletePreset(id: string, existingPresets: CustomColorPreset[]): CustomColorPreset[] {
    return existingPresets.filter(preset => preset.id !== id);
  }

  /**
   * Export preset as JSON
   */
  static exportPresetAsJSON(preset: CustomColorPreset): string {
    return JSON.stringify(preset, null, 2);
  }

  /**
   * Import preset from JSON
   */
  static importPresetFromJSON(json: string): CustomColorPreset {
    try {
      const parsed = JSON.parse(json);
      
      // Validate required fields
      if (!parsed.id || !parsed.name || !parsed.light || !parsed.dark) {
        throw new Error('Invalid preset format: missing required fields');
      }

      // Validate structure
      if (!parsed.light.base || !parsed.light.accent || !parsed.dark.base || !parsed.dark.accent) {
        throw new Error('Invalid preset format: missing base or accent colors');
      }

      // Validate HSL ranges
      const validateHSL = (hsl: any) => {
        return hsl && 
               typeof hsl.h === 'number' && hsl.h >= 0 && hsl.h <= 360 &&
               typeof hsl.s === 'number' && hsl.s >= 0 && hsl.s <= 100 &&
               typeof hsl.l === 'number' && hsl.l >= 0 && hsl.l <= 100;
      };

      if (!validateHSL(parsed.light.base) || !validateHSL(parsed.light.accent) ||
          !validateHSL(parsed.dark.base) || !validateHSL(parsed.dark.accent)) {
        throw new Error('Invalid preset format: HSL values out of range');
      }

      // Sanitize and validate
      const preset: CustomColorPreset = {
        id: this.sanitizePresetName(parsed.id),
        name: this.sanitizePresetName(parsed.name),
        author: parsed.author || '',
        version: parsed.version || '1.0.0',
        light: {
          base: parsed.light.base,
          accent: parsed.light.accent,
          colors: parsed.light.colors || {}
        },
        dark: {
          base: parsed.dark.base,
          accent: parsed.dark.accent,
          colors: parsed.dark.colors || {}
        }
      };

      if (!preset.id || !preset.name) {
        throw new Error('Invalid preset format: ID or name is empty after sanitization');
      }

      return preset;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format');
      }
      throw error;
    }
  }

  /**
   * Get preset by ID
   */
  static getPresetById(id: string, presets: CustomColorPreset[]): CustomColorPreset | undefined {
    return presets.find(preset => preset.id === id);
  }

  /**
   * Check if preset is currently active
   */
  static isPresetActive(presetId: string, lightScheme: string, darkScheme: string): boolean {
    return lightScheme === `minimal-custom-${presetId}` || 
           darkScheme === `minimal-custom-${presetId}`;
  }

  /**
   * Generate a preview of the preset colors
   */
  static generatePresetPreview(preset: CustomColorPreset): { light: string[], dark: string[] } {
    return {
      light: [
        hslToHex(preset.light.base),
        hslToHex(preset.light.accent),
        preset.light.colors?.bg1 || hslToHex(preset.light.base),
        preset.light.colors?.tx1 || hslToHex({ ...preset.light.base, l: Math.max(0, preset.light.base.l - 30) })
      ],
      dark: [
        hslToHex(preset.dark.base),
        hslToHex(preset.dark.accent),
        preset.dark.colors?.bg1 || hslToHex(preset.dark.base),
        preset.dark.colors?.tx1 || hslToHex({ ...preset.dark.base, l: Math.min(100, preset.dark.base.l + 30) })
      ]
    };
  }
}
