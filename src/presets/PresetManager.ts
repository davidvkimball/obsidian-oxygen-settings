/**
 * Preset management and CRUD operations
 */

import { CustomColorPreset, ColorPalette, DEFAULT_COLOR_PALETTE } from './CustomPreset';
import { PresetCSSGenerator } from './preset-css-generator';
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
   * Delegates to PresetCSSGenerator
   */
  static generatePresetCSS(preset: CustomColorPreset, mode: 'light' | 'dark'): string {
    return PresetCSSGenerator.generateCSS(preset, mode);
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
      light: { 
        base: { h: 210, s: 2, l: 96 },  // Light background
        accent: { h: 200, s: 80, l: 50 },
        colors: {}
      },
      dark: { 
        base: { h: 210, s: 2, l: 13 },  // Dark background
        accent: { h: 200, s: 80, l: 50 },
        colors: {}
      }
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
