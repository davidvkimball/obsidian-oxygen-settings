/**
 * Custom Preset CSS Management
 * Handles generation and injection of CSS for custom color presets
 */

import { PluginContext } from '../types';
import { PresetManager } from '../presets/PresetManager';
import { CSS_CLASSES, CSS_REFLOW_DELAY } from '../constants';

export class CustomPresetCSS {
  private plugin: PluginContext;
  
  constructor(plugin: PluginContext) {
    this.plugin = plugin;
  }
  
  /**
   * Initialize custom preset CSS (create style element and generate CSS)
   */
  initialize(): void {
    this.createStyleElement();
    this.updateCSS();
  }
  
  /**
   * Update custom preset CSS based on current settings
   */
  updateCSS(): void {
    // Remove existing custom preset styles
    document.querySelectorAll('style[data-custom-presets]').forEach(el => el.remove());
    
    // Create new style element
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
    
    // Add force override
    css += `
      :root {
        --base-h: var(--base-h) !important;
        --base-s: var(--base-s) !important;
        --base-l: var(--base-l) !important;
        --accent-h: var(--accent-h) !important;
        --accent-s: var(--accent-s) !important;
        --accent-l: var(--accent-l) !important;
      }
    `;
    
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    
    // Trigger reflow
    setTimeout(() => {
      document.body.offsetHeight;
    }, CSS_REFLOW_DELAY);
  }
  
  /**
   * Create custom preset style element
   */
  private createStyleElement(): void {
    const existing = document.getElementById(CSS_CLASSES.CUSTOM_PRESETS_STYLE);
    if (existing) {
      existing.remove();
    }
    
    const styleEl = document.createElement('style');
    styleEl.id = CSS_CLASSES.CUSTOM_PRESETS_STYLE;
    styleEl.setAttribute('data-custom-presets', 'true');
    document.head.appendChild(styleEl);
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

