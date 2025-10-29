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
   * Generate CSS for a custom preset using Oxygen custom variables
   * This allows Style Settings to override Obsidian native variables
   */
  static generatePresetCSS(preset: CustomColorPreset, mode: 'light' | 'dark'): string {
    const palette = mode === 'light' ? preset.light : preset.dark;
    const themeClass = mode === 'light' ? 'theme-light' : 'theme-dark';
    const className = `minimal-custom-${preset.id}`;
    
    // Use simpler selector - modifies Oxygen custom variables, not Obsidian native
    let css = `.${themeClass}.${className} {\n`;
    
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
    
    // === BASE HSL VALUES (Required for colorful-frame and colorful-headings) ===
    css += `  --base-h: ${baseH};\n`;
    css += `  --base-s: ${baseS}%;\n`;
    css += `  --base-l: ${baseL}%;\n`;
    css += `\n`;
    css += `  --accent-h: ${accentH};\n`;
    css += `  --accent-s: ${accentS}%;\n`;
    css += `  --accent-l: ${accentL}%;\n`;
    css += `\n`;
    
    // === OXYGEN CUSTOM VARIABLES (Core theme colors) ===
    // Backgrounds
    css += `  --bg1: ${bg1};\n`;
    css += `  --bg2: ${bg2};\n`;
    css += `  --bg-tab: ${bg2};\n`;
    css += `  --bg3: ${bg3};\n`;
    css += `\n`;
    
    // UI Elements
    css += `  --ui1: ${ui1};\n`;
    css += `  --ui2: ${ui2};\n`;
    css += `  --ui3: ${ui3};\n`;
    css += `\n`;
    
    // Text Colors
    css += `  --tx1: ${tx1};\n`;
    css += `  --tx2: ${tx2};\n`;
    css += `  --tx3: ${tx3};\n`;
    css += `  --tx4: ${tx4};\n`;
    css += `\n`;
    
    // Accent Colors
    css += `  --ax1: ${ax1};\n`;
    css += `  --ax2: ${ax2};\n`;
    css += `  --ax3: ${ax3};\n`;
    css += `\n`;
    
    // Highlights
    css += `  --hl1: ${hl1};\n`;
    css += `  --hl2: ${hl2};\n`;
    css += `\n`;
    
    // Special
    css += `  --sp1: ${sp1};\n`;
    
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
            case 'bg2':
            case 'bg3':
            case 'ui1':
            case 'ui2':
            case 'ui3':
            case 'tx1':
            case 'tx2':
            case 'tx3':
            case 'tx4':
            case 'hl1':
            case 'hl2':
              // Override Oxygen custom variables directly (no !important)
              css += `  --${colorKey}: ${color};\n`;
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
