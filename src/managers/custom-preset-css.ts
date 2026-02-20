/**
 * Custom Preset CSS Management
 * Handles generation and injection of CSS for custom color presets
 */

import { PluginContext } from '../types';
import { PresetCSSGenerator } from '../presets/preset-css-generator';
import { setCssProps } from '../utils/css-props';

export class CustomPresetCSS {
  private plugin: PluginContext;
  private isUpdating: boolean = false;

  constructor(plugin: PluginContext) {
    this.plugin = plugin;
  }

  /**
   * Initialize custom preset CSS
   * Uses CSS custom properties on body element instead of creating style elements
   */
  initialize(): void {
    // Only initialize if Oxygen theme is active
    if (!this.plugin.isOxygenThemeActive()) {
      return;
    }
    this.updateCSS();
  }

  /**
   * Update custom preset CSS based on current settings
   * Uses CSS custom properties on body element instead of creating style elements
   * This complies with Obsidian guidelines to avoid creating style elements
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

    // Remove all custom preset CSS properties
    // List of all possible custom preset CSS properties
    const presetProperties = [
      '--base-h', '--base-s', '--base-l',
      '--bg1', '--bg2', '--bg-tab', '--bg3',
      '--ui1', '--ui2', '--ui3',
      '--tx1', '--tx2', '--tx3', '--tx4',
      '--hl1', '--hl2',
      '--sp1',
      '--color-red', '--color-orange', '--color-yellow', '--color-green',
      '--color-cyan', '--color-blue', '--color-purple', '--color-pink',
      '--frame-background-l'
    ];

    presetProperties.forEach(prop => {
      document.body.style.removeProperty(prop);
    });

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
      setCssProps(document.body, properties);
    }

    // Clear the updating flag after a short delay to allow CSS to settle
    setTimeout(() => {
      this.isUpdating = false;
    }, 50);
  }


  /**
   * Cleanup - remove all custom preset classes and CSS properties
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
      '--bg1', '--bg2', '--bg-tab', '--bg3',
      '--ui1', '--ui2', '--ui3',
      '--tx1', '--tx2', '--tx3', '--tx4',
      '--hl1', '--hl2',
      '--sp1',
      '--color-red', '--color-orange', '--color-yellow', '--color-green',
      '--color-cyan', '--color-blue', '--color-purple', '--color-pink',
      '--frame-background-l'
    ];

    presetProperties.forEach(prop => {
      document.body.style.removeProperty(prop);
    });
  }
}

