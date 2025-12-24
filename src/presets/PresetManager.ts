/**
 * Preset management and CRUD operations
 */

import { CustomColorPreset, HSLColor } from './CustomPreset';
import { 
  validatePresetId, 
  isPresetIdUnique, 
  sanitizePresetName, 
  generatePresetId,
  hslToHex 
} from '../utils/color-utils';

/**
 * Interface for parsed JSON preset data (before validation)
 */
interface ParsedPresetJSON {
  id?: unknown;
  name?: unknown;
  author?: unknown;
  version?: unknown;
  light?: {
    base?: unknown;
    accent?: unknown;
    colors?: unknown;
    frameLightnessOffset?: unknown;
  };
  dark?: {
    base?: unknown;
    accent?: unknown;
    colors?: unknown;
    frameLightnessOffset?: unknown;
  };
}

export class PresetManager {

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
      const parsed = JSON.parse(json) as unknown;
      
      // Type guard: check if parsed is an object
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid preset format: not an object');
      }
      
      const data = parsed as ParsedPresetJSON;
      
      // Validate required fields
      if (!data.id || !data.name || !data.light || !data.dark) {
        throw new Error('Invalid preset format: missing required fields');
      }

      // Validate structure
      if (!data.light.base || !data.light.accent || !data.dark.base || !data.dark.accent) {
        throw new Error('Invalid preset format: missing base or accent colors');
      }

      // Validate HSL ranges
      const validateHSL = (hsl: unknown): hsl is HSLColor => {
        if (typeof hsl !== 'object' || hsl === null) return false;
        const h = (hsl as { h?: unknown }).h;
        const s = (hsl as { s?: unknown }).s;
        const l = (hsl as { l?: unknown }).l;
        return typeof h === 'number' && h >= 0 && h <= 360 &&
               typeof s === 'number' && s >= 0 && s <= 100 &&
               typeof l === 'number' && l >= 0 && l <= 100;
      };

      if (!validateHSL(data.light.base) || !validateHSL(data.light.accent) ||
          !validateHSL(data.dark.base) || !validateHSL(data.dark.accent)) {
        throw new Error('Invalid preset format: HSL values out of range');
      }

      // Validate and extract colors
      const extractColors = (colors: unknown): Record<string, string> => {
        if (typeof colors === 'object' && colors !== null) {
          const result: Record<string, string> = {};
          for (const [key, value] of Object.entries(colors)) {
            if (typeof value === 'string') {
              result[key] = value;
            }
          }
          return result;
        }
        return {};
      };

      // Validate frameLightnessOffset
      const extractFrameOffset = (offset: unknown): number | undefined => {
        if (typeof offset === 'number') {
          return offset;
        }
        return undefined;
      };

      // Sanitize and validate - ensure id and name are strings
      if (typeof data.id !== 'string') {
        throw new Error('Invalid preset format: id must be a string');
      }
      if (typeof data.name !== 'string') {
        throw new Error('Invalid preset format: name must be a string');
      }
      const idStr = data.id;
      const nameStr = data.name;
      const authorStr = typeof data.author === 'string' ? data.author : '';
      const versionStr = typeof data.version === 'string' ? data.version : '1.0.0';

      const preset: CustomColorPreset = {
        id: this.sanitizePresetName(idStr),
        name: this.sanitizePresetName(nameStr),
        author: authorStr,
        version: versionStr,
        light: {
          base: data.light.base,
          accent: data.light.accent,
          colors: extractColors(data.light.colors),
          frameLightnessOffset: extractFrameOffset(data.light.frameLightnessOffset)
        },
        dark: {
          base: data.dark.base,
          accent: data.dark.accent,
          colors: extractColors(data.dark.colors),
          frameLightnessOffset: extractFrameOffset(data.dark.frameLightnessOffset)
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
    return lightScheme === `oxygen-custom-${presetId}` || 
           darkScheme === `oxygen-custom-${presetId}`;
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
