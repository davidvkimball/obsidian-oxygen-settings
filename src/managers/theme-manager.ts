/**
 * Theme Manager
 * Handles theme mode switching (light/dark)
 */

import { PluginContext, ThemeMode } from '../types';
import { OBSIDIAN_THEMES } from '../constants';

export class ThemeManagerImpl {
  private plugin: PluginContext;

  constructor(plugin: PluginContext) {
    this.plugin = plugin;
  }

  /**
   * Toggle between light and dark themes
   */
  updateTheme(): void {
    // Obsidian internal API
    const app = this.plugin.app as any; // TODO: Type definition for vault config
    
    const currentTheme = app.vault.getConfig('theme');
    if (currentTheme === OBSIDIAN_THEMES.SYSTEM) {
      // System theme mode - just toggle class
      if (document.body.classList.contains('theme-light')) {
        document.body.removeClass('theme-light');
        document.body.addClass('theme-dark');
      } else {
        document.body.removeClass('theme-dark');
        document.body.addClass('theme-light');
      }
    } else {
      // Manual theme mode - toggle both class and Obsidian theme
      if (document.body.classList.contains('theme-light')) {
        document.body.removeClass('theme-light');
        document.body.addClass('theme-dark');
      } else {
        document.body.removeClass('theme-dark');
        document.body.addClass('theme-light');
      }

      const theme = app.vault.getConfig('theme');
      const newTheme = theme === OBSIDIAN_THEMES.LIGHT 
        ? OBSIDIAN_THEMES.DARK 
        : OBSIDIAN_THEMES.LIGHT;

      app.setTheme(newTheme);
      app.vault.setConfig('theme', newTheme);
    }
    
    this.plugin.app.workspace.trigger('css-change');
  }

  /**
   * Switch to light theme
   */
  switchToLight(): void {
    document.body.removeClass('theme-dark');
    document.body.addClass('theme-light');
    
    // Obsidian internal API
    const app = this.plugin.app as any; // TODO: Type definition
    const theme = app.vault.getConfig('theme');
    if (theme !== OBSIDIAN_THEMES.SYSTEM) {
      app.setTheme(OBSIDIAN_THEMES.LIGHT);
      app.vault.setConfig('theme', OBSIDIAN_THEMES.LIGHT);
    }
    
    this.plugin.app.workspace.trigger('css-change');
  }

  /**
   * Switch to dark theme
   */
  switchToDark(): void {
    document.body.removeClass('theme-light');
    document.body.addClass('theme-dark');
    
    // Obsidian internal API
    const app = this.plugin.app as any; // TODO: Type definition
    const theme = app.vault.getConfig('theme');
    if (theme !== OBSIDIAN_THEMES.SYSTEM) {
      app.setTheme(OBSIDIAN_THEMES.DARK);
      app.vault.setConfig('theme', OBSIDIAN_THEMES.DARK);
    }
    
    this.plugin.app.workspace.trigger('css-change');
  }

  /**
   * Get current theme mode
   */
  getCurrentMode(): ThemeMode {
    return document.body.classList.contains('theme-light') ? 'light' : 'dark';
  }

  /**
   * Update sidebar theme for high contrast light mode
   */
  updateSidebarTheme(): void {
    // Only update sidebar theme if Oxygen theme is active
    if (!this.plugin.isOxygenThemeActive()) {
      return;
    }
    
    const sidebarEl = document.getElementsByClassName('mod-left-split')[0];
    const ribbonEl = document.getElementsByClassName('side-dock-ribbon')[0];
    
    if (
      sidebarEl && 
      ribbonEl && 
      document.body.classList.contains('theme-light') && 
      this.plugin.settings.lightStyle === 'minimal-light-contrast'
    ) {
      sidebarEl.addClass('theme-dark');
      ribbonEl.addClass('theme-dark');
    } else if (sidebarEl && ribbonEl) {
      sidebarEl.removeClass('theme-dark'); 
      ribbonEl.removeClass('theme-dark');
    }
  }

  /**
   * Cleanup sidebar theme on unload
   */
  cleanupSidebarTheme(): void {
    const sidebarEl = document.getElementsByClassName('mod-left-split')[0];
    if (sidebarEl) {
      sidebarEl.removeClass('theme-dark');
    }
    
    const ribbonEl = document.getElementsByClassName('side-dock-ribbon')[0];
    if (ribbonEl) {
      ribbonEl.removeClass('theme-dark');
    }
  }
}

