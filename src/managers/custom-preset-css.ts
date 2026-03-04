/**
 * Custom Preset CSS Management
 * Handles generation and injection of CSS for custom color presets
 */

import { PluginContext } from '../types';
import { PresetCSSGenerator } from '../presets/preset-css-generator';
import { setCssProps } from '../utils/css-props';

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
   * Update custom preset CSS based on current settings.
   * Most properties are applied as inline body styles.
   * Accent properties (--accent-h/s/l) are applied via a <style> element
   * scoped to the preset's body class, so they persist through Obsidian's
   * accent color reset (which only clears inline styles, not stylesheet rules).
   * When the user picks a custom accent, Obsidian's inline style overrides
   * the stylesheet rule naturally (inline > class specificity).
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

    // Remove all custom preset classes from body
    const allPresetClasses = Array.from(document.body.classList).filter(cls =>
      cls.startsWith('oxygen-custom-')
    );
    allPresetClasses.forEach(cls => document.body.classList.remove(cls));

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
      document.body.style.removeProperty(prop);
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
    const isLightMode = document.body.classList.contains('theme-light');
    const activePreset = isLightMode ? activeLightPreset : activeDarkPreset;

    // Apply properties for the active preset
    if (activePreset) {
      const presetClass = `oxygen-custom-${activePreset.id}`;
      document.body.classList.add(presetClass);

      const mode = isLightMode ? 'light' : 'dark';
      const properties = PresetCSSGenerator.generateProperties(activePreset, mode);

      // Split: accent goes into a <style> element, everything else stays inline
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
      setCssProps(document.body, inlineProps);

      // Apply accent properties via <style> element scoped to preset class.
      // Uses .theme-light/.theme-dark + preset class, matching built-in scheme specificity.
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

    // Clear the updating flag after a short delay to allow CSS to settle
    setTimeout(() => {
      this.isUpdating = false;
    }, 50);
  }

  /**
   * Create or update the accent style element
   */
  private createAccentStyleElement(cssText: string): void {
    this.removeAccentStyleElement();
    this.styleEl = document.createElement('style');
    this.styleEl.id = STYLE_ELEMENT_ID;
    this.styleEl.textContent = cssText;
    document.head.appendChild(this.styleEl);
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
    const existing = document.getElementById(STYLE_ELEMENT_ID);
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Cleanup - remove all custom preset classes, CSS properties, and style element
   */
  cleanup(): void {
    // Remove all custom preset classes
    const allPresetClasses = Array.from(document.body.classList).filter(cls =>
      cls.startsWith('oxygen-custom-')
    );
    allPresetClasses.forEach(cls => document.body.classList.remove(cls));

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
      document.body.style.removeProperty(prop);
    });

    // Remove accent style element
    this.removeAccentStyleElement();
  }
}
