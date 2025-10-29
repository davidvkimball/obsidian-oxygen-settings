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
   * Generate CSS for a custom preset using Obsidian native variables
   */
  static generatePresetCSS(preset: CustomColorPreset, mode: 'light' | 'dark'): string {
    const palette = mode === 'light' ? preset.light : preset.dark;
    const themeClass = mode === 'light' ? 'theme-light' : 'theme-dark';
    const className = `minimal-custom-${preset.id}`;
    
    // Use more specific selector to avoid conflicts
    let css = `body.${themeClass}.${className} {\n`;
    
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
    
    // Calculate color values
    const bg1 = `hsl(${baseH}, ${baseS}%, ${baseL}%)`;
    const bg2 = `hsl(${baseH}, ${baseS}%, ${isLightBase ? Math.max(0, baseL - 5) : Math.min(100, baseL + 5)}%)`;
    const bg3 = `hsl(${baseH}, ${baseS}%, ${isLightBase ? Math.max(0, baseL - 10) : Math.min(100, baseL + 10)}%)`;
    
    // UI colors (borders, dividers, etc.) - darker for light mode, lighter for dark mode
    const ui1L = isLightBase ? Math.max(0, baseL - 15) : Math.min(100, baseL + 15);
    const ui2L = isLightBase ? Math.max(0, baseL - 10) : Math.min(100, baseL + 10);
    const ui3L = isLightBase ? Math.max(0, baseL - 5) : Math.min(100, baseL + 5);
    
    const ui1 = `hsl(${baseH}, ${baseS}%, ${ui1L}%)`;
    const ui2 = `hsl(${baseH}, ${baseS}%, ${ui2L}%)`;
    const ui3 = `hsl(${baseH}, ${baseS}%, ${ui3L}%)`;
    
    // Text colors - ensure proper contrast
    const tx1L = isLightBase ? 15 : 85;  // Very dark text for light bg, very light text for dark bg
    const tx2L = isLightBase ? 25 : 75;
    const tx3L = isLightBase ? 35 : 65;
    const tx4L = isLightBase ? 30 : 70;
    
    const tx1 = `hsl(${baseH}, ${Math.max(0, baseS - 10)}%, ${tx1L}%)`;
    const tx2 = `hsl(${baseH}, ${Math.max(0, baseS - 20)}%, ${tx2L}%)`;
    const tx3 = `hsl(${baseH}, ${Math.max(0, baseS - 10)}%, ${tx3L}%)`;
    const tx4 = `hsl(${baseH}, ${Math.max(0, baseS - 10)}%, ${tx4L}%)`;
    
    // Accent colors
    const ax1 = `hsl(${accentH}, ${accentS}%, ${accentL}%)`;
    const ax2 = `hsl(${accentH}, ${accentS}%, ${Math.max(0, Math.min(100, accentL + 8))}%)`;
    const ax3 = `hsl(${accentH}, ${accentS}%, ${Math.max(0, Math.min(100, accentL - 5))}%)`;
    
    // Highlight colors
    const hl1 = `hsla(${accentH}, 50%, 40%, 30%)`;
    const hl2 = `rgba(255, 177, 80, 0.3)`;
    
    // Special colors
    const sp1 = isLightMode ? 'white' : 'black';
    
    // Calculate proper contrast for accent color
    const accentIsLight = accentL > 50;
    const textOnAccent = accentIsLight ? 'black' : 'white';
    
    // Direct Obsidian native variable assignments (no !important needed)
    css += `  --background-primary: ${bg1};\n`;
    css += `  --background-secondary: ${bg2};\n`;
    css += `  --background-secondary-alt: ${bg3};\n`;
    css += `  --background-modifier-border: ${ui1};\n`;
    css += `  --background-modifier-border-hover: ${ui2};\n`;
    css += `  --background-modifier-border-focus: ${ui3};\n`;
    css += `  --text-normal: ${tx1};\n`;
    css += `  --text-muted: ${tx2};\n`;
    css += `  --text-faint: ${tx3};\n`;
    css += `  --text-accent: ${ax1};\n`;
    css += `  --text-accent-hover: ${ax2};\n`;
    css += `  --interactive-accent: ${ax3};\n`;
    css += `  --text-on-accent: ${textOnAccent};\n`;
    css += `  --text-highlight-bg: ${hl1};\n`;
    css += `  --text-highlight-bg-active: ${hl2};\n`;
    
    // Additional Obsidian native variables for enhanced compatibility
    css += `  --interactive-normal: ${bg2};\n`;
    css += `  --interactive-hover: ${bg3};\n`;
    css += `  --scrollbar-bg: transparent;\n`;
    css += `  --scrollbar-thumb-bg: ${ui1};\n`;
    css += `  --scrollbar-active-thumb-bg: ${ui3};\n`;
    css += `  --divider-color: ${ui1};\n`;
    css += `  --frame-divider-color: ${ui1};\n`;
    css += `  --tab-outline-color: ${ui1};\n`;
    
    // Obsidian-specific color mappings for enhanced theme compatibility
    css += `  --background-modifier-accent: ${ax3};\n`;
    css += `  --mobile-sidebar-background: ${bg1};\n`;
    css += `  --background-modifier-form-field-highlighted: ${bg1};\n`;
    css += `  --background-modifier-form-field: ${bg1};\n`;
    css += `  --background-modifier-hover: ${bg3};\n`;
    css += `  --background-modifier-active-hover: ${bg3};\n`;
    css += `  --background-primary-alt: ${bg2};\n`;
    css += `  --background-table-rows: ${bg2};\n`;
    css += `  --checkbox-color: ${ax3};\n`;
    css += `  --code-normal: ${tx1};\n`;
    css += `  --icon-color-active: ${tx1};\n`;
    css += `  --icon-color-focused: ${tx1};\n`;
    css += `  --icon-color-hover: ${tx2};\n`;
    css += `  --icon-color: ${tx2};\n`;
    css += `  --interactive-accent-hover: ${ax1};\n`;
    css += `  --list-marker-color: ${tx3};\n`;
    css += `  --nav-item-background-active: ${bg3};\n`;
    css += `  --nav-item-background-hover: ${bg3};\n`;
    css += `  --nav-item-color: ${tx2};\n`;
    css += `  --nav-item-color-active: ${tx1};\n`;
    css += `  --nav-item-color-hover: ${tx1};\n`;
    css += `  --nav-item-color-selected: ${tx1};\n`;
    css += `  --nav-collapse-icon-color: ${tx2};\n`;
    css += `  --nav-collapse-icon-color-collapsed: ${tx2};\n`;
    css += `  --nav-indentation-guide-color: ${ui1};\n`;
    css += `  --prompt-border-color: ${ui3};\n`;
    css += `  --quote-opening-modifier: ${ui2};\n`;
    css += `  --ribbon-background: ${bg2};\n`;
    css += `  --search-result-background: ${bg1};\n`;
    css += `  --tab-text-color-focused-active: ${tx1};\n`;
    css += `  --text-blockquote: ${tx2};\n`;
    css += `  --text-bold: ${tx1};\n`;
    css += `  --text-code: ${tx4};\n`;
    css += `  --text-selection: ${hl1};\n`;
    css += `  --text-title-h1: ${tx1};\n`;
    css += `  --text-title-h2: ${tx1};\n`;
    css += `  --text-title-h3: ${tx1};\n`;
    css += `  --text-title-h4: ${tx1};\n`;
    css += `  --text-title-h5: ${tx1};\n`;
    css += `  --text-title-h6: ${tx1};\n`;
    
    // Button and interactive element colors
    css += `  --button-background: ${ax3};\n`;
    css += `  --button-background-hover: ${ax2};\n`;
    css += `  --button-text: ${textOnAccent};\n`;
    
    // Right sidebar specific overrides
    css += `  .mod-right-split {\n`;
    css += `    --background-secondary: ${bg1};\n`;
    css += `  }\n`;
    
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
          // Map custom overrides to appropriate Obsidian variables
          switch (colorKey) {
            case 'bg1':
              css += `  --background-primary: ${color} !important;\n`;
              break;
            case 'bg2':
              css += `  --background-secondary: ${color} !important;\n`;
              break;
            case 'bg3':
              css += `  --background-secondary-alt: ${color} !important;\n`;
              break;
            case 'ui1':
              css += `  --background-modifier-border: ${color} !important;\n`;
              css += `  --divider-color: ${color} !important;\n`;
              css += `  --frame-divider-color: ${color} !important;\n`;
              css += `  --tab-outline-color: ${color} !important;\n`;
              break;
            case 'ui2':
              css += `  --background-modifier-border-hover: ${color} !important;\n`;
              break;
            case 'ui3':
              css += `  --background-modifier-border-focus: ${color} !important;\n`;
              break;
            case 'tx1':
              css += `  --text-normal: ${color} !important;\n`;
              css += `  --text-bold: ${color} !important;\n`;
              css += `  --text-title-h1: ${color} !important;\n`;
              css += `  --text-title-h2: ${color} !important;\n`;
              css += `  --text-title-h3: ${color} !important;\n`;
              css += `  --text-title-h4: ${color} !important;\n`;
              css += `  --text-title-h5: ${color} !important;\n`;
              css += `  --text-title-h6: ${color} !important;\n`;
              break;
            case 'tx2':
              css += `  --text-muted: ${color} !important;\n`;
              css += `  --text-blockquote: ${color} !important;\n`;
              break;
            case 'tx3':
              css += `  --text-faint: ${color} !important;\n`;
              break;
            case 'tx4':
              css += `  --text-code: ${color} !important;\n`;
              break;
            case 'hl1':
              css += `  --text-highlight-bg: ${color} !important;\n`;
              css += `  --text-selection: ${color} !important;\n`;
              break;
            case 'hl2':
              css += `  --text-highlight-bg-active: ${color} !important;\n`;
              break;
            // For accent colors, we need to determine which ax variable this should map to
            // This is a simplified mapping - in practice, you might want more sophisticated logic
            default:
              // For syntax colors and other custom colors, we can add them as custom properties
              css += `  --color-${colorKey}: ${color};\n`;
              break;
          }
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
