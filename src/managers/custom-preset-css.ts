/**
 * Custom Preset CSS Management
 * Handles generation and injection of CSS for custom color presets
 */

import { PluginContext } from '../types';
import { PresetCSSGenerator } from '../presets/preset-css-generator';
import { setCssProps } from '../utils/css-props';
import { getVaultConfig } from '../types/obsidian-extensions';
import { hexToHSL } from '../utils/color-utils';

// Accent properties that need to live in a <style> element (not inline)
// so they survive Obsidian's accent color "reset" (which clears inline styles).
// This mirrors how built-in schemes define accent via CSS class selectors.
const ACCENT_PROPERTIES = ['--accent-h', '--accent-s', '--accent-l', '--text-on-accent'];
const STYLE_ELEMENT_ID = 'oxygen-custom-preset-accent';

export class CustomPresetCSS {
  private plugin: PluginContext;
  private isUpdating: boolean = false;
  private styleEl: HTMLStyleElement | null = null;

  constructor(plugin: PluginContext) {
    this.plugin = plugin;
  }

  /**
   * Initialize custom preset CSS
   */
  initialize(): void {
    // Only initialize if Oxygen theme is active
    if (!this.plugin.isOxygenThemeActive()) {
      return;
    }
    this.updateCSS();
  }

  /**
   * Check if the user has set a custom accent color in Obsidian.
   * Returns the HSL values if set, or null if not.
   */
  private getUserAccentHSL(): { h: number; s: number; l: number } | null {
    const userAccentColor = getVaultConfig(this.plugin.app, 'accentColor');
    if (typeof userAccentColor === 'string' && userAccentColor.length > 0) {
      return hexToHSL(userAccentColor);
    }
    return null;
  }

  /**
   * Apply the user's custom accent color as inline styles on body.
   * Inline styles have the highest CSS specificity, so they override
   * both theme class selectors (built-in schemes) and our <style> element
   * (custom presets). This ensures the user's accent choice always wins.
   */
  applyUserAccentInline(): void {
    const userHSL = this.getUserAccentHSL();
    if (userHSL) {
      // Calculate text-on-accent contrast
      const textOnAccent = this.calculateTextOnAccent(userHSL.h, userHSL.s, userHSL.l);
      setCssProps(activeDocument.body, {
        '--accent-h': `${userHSL.h}`,
        '--accent-s': `${userHSL.s}%`,
        '--accent-l': `${userHSL.l}%`,
        '--text-on-accent': textOnAccent
      });
    }
  }

  /**
   * Calculate whether text on accent should be black or white
   */
  private calculateTextOnAccent(h: number, s: number, l: number): string {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r: number, g: number, b: number;
    if (sNorm === 0) {
      r = g = b = lNorm;
    } else {
      const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
      const p = 2 * lNorm - q;
      r = hue2rgb(p, q, hNorm + 1 / 3);
      g = hue2rgb(p, q, hNorm);
      b = hue2rgb(p, q, hNorm - 1 / 3);
    }

    const luminance = 0.2126 * (r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4))
      + 0.7152 * (g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4))
      + 0.0722 * (b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));

    return luminance > 0.5 ? 'black' : 'white';
  }

  /**
   * Update custom preset CSS based on current settings.
   * Most properties are applied as inline body styles.
   * Accent properties (--accent-h/s/l) are applied via a <style> element
   * scoped to the preset's body class, so they persist through Obsidian's
   * accent color reset (which only clears inline styles, not stylesheet rules).
   *
   * IMPORTANT: If the user has set a custom accent in Obsidian, it is
   * re-applied as inline styles AFTER all cleanup and preset application.
   * Inline styles beat class selectors (theme CSS) and <style> element rules,
   * ensuring the user's accent choice always wins.
   */
  updateCSS(): void {
    // Prevent re-entrant updates (fixes infinite loop)
    if (this.isUpdating) {
      return;
    }

    // Only update CSS if Oxygen theme is active
    if (!this.plugin.isOxygenThemeActive()) {
      return;
    }

    // Set flag to prevent re-entrant calls
    this.isUpdating = true;

    // Check for user accent BEFORE cleanup (vault config persists across restarts)
    const hasUserAccent = this.getUserAccentHSL() !== null;

    // Remove all custom preset classes from body
    const allPresetClasses = Array.from(activeDocument.body.classList).filter(cls =>
      cls.startsWith('oxygen-custom-')
    );
    allPresetClasses.forEach(cls => activeDocument.body.classList.remove(cls));

    // Remove all custom preset inline CSS properties
    const presetProperties = [
      '--base-h', '--base-s', '--base-l',
      '--accent-h', '--accent-s', '--accent-l',
      '--bg1', '--bg2', '--bg-tab', '--bg3',
      '--ui1', '--ui2', '--ui3',
      '--tx1', '--tx2', '--tx3', '--tx4',
      '--hl1', '--hl2',
      '--sp1', '--text-on-accent',
      '--color-red', '--color-orange', '--color-yellow', '--color-green',
      '--color-cyan', '--color-blue', '--color-purple', '--color-pink',
      '--frame-background-l'
    ];

    presetProperties.forEach(prop => {
      activeDocument.body.style.removeProperty(prop);
    });

    // Remove accent style element
    this.removeAccentStyleElement();

    // Find active presets
    const activeLightPreset = this.plugin.settings.customPresets.find(p =>
      this.plugin.settings.lightScheme === `oxygen-custom-${p.id}`
    );
    const activeDarkPreset = this.plugin.settings.customPresets.find(p =>
      this.plugin.settings.darkScheme === `oxygen-custom-${p.id}`
    );

    // Determine current theme mode
    const isLightMode = activeDocument.body.classList.contains('theme-light');
    const activePreset = isLightMode ? activeLightPreset : activeDarkPreset;

    // Apply properties for the active preset
    if (activePreset) {
      const presetClass = `oxygen-custom-${activePreset.id}`;
      activeDocument.body.classList.add(presetClass);

      const mode = isLightMode ? 'light' : 'dark';
      const properties = PresetCSSGenerator.generateProperties(activePreset, mode);

      // Split: accent goes into a <style> element, everything else stays inline.
      // If the user has a custom accent, we still inject the preset's accent via
      // <style> element as a fallback (for when user later resets their accent),
      // but then OVERRIDE it with the user's accent as inline styles below.
      const inlineProps: Record<string, string> = {};
      const accentProps: Record<string, string> = {};

      for (const [key, value] of Object.entries(properties)) {
        if (ACCENT_PROPERTIES.includes(key)) {
          accentProps[key] = value;
        } else {
          inlineProps[key] = value;
        }
      }

      // Apply non-accent properties as inline body styles
      setCssProps(activeDocument.body, inlineProps);

      // Apply accent properties via <style> element scoped to preset class.
      // Uses .theme-light/.theme-dark + preset class, matching built-in scheme specificity.
      // This provides the preset's accent as a baseline; if user has a custom accent,
      // it will be overridden by inline styles below.
      if (Object.keys(accentProps).length > 0) {
        const themeClass = isLightMode ? 'theme-light' : 'theme-dark';
        let cssText = `body.${themeClass}.${presetClass} {\n`;
        for (const [prop, value] of Object.entries(accentProps)) {
          cssText += `  ${prop}: ${value};\n`;
        }
        cssText += '}\n';
        this.createAccentStyleElement(cssText);
      }
    }

    // CRITICAL: If user has a custom accent color set in Obsidian, re-apply it
    // as inline styles. This ensures the user's accent wins over:
    // 1. Theme CSS class selectors (built-in schemes like Flexoki)
    // 2. Our <style> element (custom presets)
    // because inline styles have the highest CSS specificity.
    if (hasUserAccent) {
      this.applyUserAccentInline();
    }

    // Clear the updating flag after a short delay to allow CSS to settle
    window.setTimeout(() => {
      this.isUpdating = false;
    }, 50);
  }

  /**
   * Create or update the accent style element
   */
  private createAccentStyleElement(cssText: string): void {
    this.removeAccentStyleElement();
    this.styleEl = activeDocument.createElement('style');
    this.styleEl.id = STYLE_ELEMENT_ID;
    this.styleEl.textContent = cssText;
    activeDocument.head.appendChild(this.styleEl);
  }

  /**
   * Remove the accent style element
   */
  private removeAccentStyleElement(): void {
    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }
    // Also remove by ID in case of orphaned elements
    const existing = activeDocument.getElementById(STYLE_ELEMENT_ID);
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Cleanup - remove all custom preset classes, CSS properties, and style element
   */
  cleanup(): void {
    // Remove all custom preset classes
    const allPresetClasses = Array.from(activeDocument.body.classList).filter(cls =>
      cls.startsWith('oxygen-custom-')
    );
    allPresetClasses.forEach(cls => activeDocument.body.classList.remove(cls));

    // Remove all custom preset CSS properties
    const presetProperties = [
      '--base-h', '--base-s', '--base-l',
      '--accent-h', '--accent-s', '--accent-l',
      '--bg1', '--bg2', '--bg-tab', '--bg3',
      '--ui1', '--ui2', '--ui3',
      '--tx1', '--tx2', '--tx3', '--tx4',
      '--hl1', '--hl2',
      '--sp1', '--text-on-accent',
      '--color-red', '--color-orange', '--color-yellow', '--color-green',
      '--color-cyan', '--color-blue', '--color-purple', '--color-pink',
      '--frame-background-l'
    ];

    presetProperties.forEach(prop => {
      activeDocument.body.style.removeProperty(prop);
    });

    // Remove accent style element
    this.removeAccentStyleElement();
  }
}
