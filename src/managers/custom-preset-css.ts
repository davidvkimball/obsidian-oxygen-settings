/**
 * Custom Preset CSS Management
 * Handles generation and injection of CSS for custom color presets
 */

import { PluginContext } from '../types';
import { PresetManager } from '../presets/PresetManager';
import { CSS_CLASSES } from '../constants';

export class CustomPresetCSS {
  private plugin: PluginContext;
  private isUpdating: boolean = false;
  
  constructor(plugin: PluginContext) {
    this.plugin = plugin;
  }
  
  /**
   * Initialize custom preset CSS
   * Note: Custom presets require dynamic CSS rules with class selectors.
   * This is necessary for preset-specific styling that can't be expressed
   * with CSS variables alone.
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
    
    // Remove existing custom preset styles
    document.querySelectorAll('style[data-custom-presets]').forEach(el => el.remove());
    
    // Create new style element for custom preset CSS rules
    // NOTE: While Obsidian guidelines prefer styles.css for static CSS, custom presets
    // require dynamic CSS rules with class selectors (e.g., .theme-light.minimal-custom-xyz)
    // that are generated from user input and can't be pre-defined in styles.css.
    // This is the only way to inject dynamic CSS rules with class selectors.
    // The style element is properly cleaned up in cleanup().
    const styleEl = document.createElement('style');
    styleEl.id = CSS_CLASSES.CUSTOM_PRESETS_STYLE;
    styleEl.setAttribute('data-custom-presets', 'true');
    
    let css = '';
    
    // Generate CSS for active presets
    const activeLightPreset = this.plugin.settings.customPresets.find(p => 
      this.plugin.settings.lightScheme === `minimal-custom-${p.id}`
    );
    const activeDarkPreset = this.plugin.settings.customPresets.find(p => 
      this.plugin.settings.darkScheme === `minimal-custom-${p.id}`
    );
    
    if (activeLightPreset) {
      css += PresetManager.generatePresetCSS(activeLightPreset, 'light') + '\n';
    }
    if (activeDarkPreset) {
      css += PresetManager.generatePresetCSS(activeDarkPreset, 'dark') + '\n';
    }
    
    if (!css) {
      this.isUpdating = false;
      return;
    }
    
    // Don't use !important - allows users to override accent color in Obsidian's native settings
    // The preset CSS is scoped to body classes, so it will still apply when the preset is active
    
    styleEl.textContent = css;
    
    // Append at the END of head to ensure it overrides theme CSS
    document.head.appendChild(styleEl);
    
    // Clear the updating flag after a short delay to allow CSS to settle
    setTimeout(() => {
      this.isUpdating = false;
    }, 150);
    
    // Trigger reflow
    setTimeout(() => {
      void document.body.offsetHeight;
    }, 100);
  }
  
  
  /**
   * Cleanup - remove all custom preset styles
   */
  cleanup(): void {
    document.querySelectorAll('style[data-custom-preset]').forEach(el => el.remove());
    document.querySelectorAll('style[data-custom-presets]').forEach(el => el.remove());
    
    const customPresetElement = document.getElementById(CSS_CLASSES.CUSTOM_PRESETS_STYLE);
    if (customPresetElement) {
      customPresetElement.remove();
    }
  }
}

