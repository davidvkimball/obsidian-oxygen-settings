/**
 * Theme Manager
 * Handles theme mode switching (light/dark)
 */

import { PluginContext, ThemeMode } from '../types';
import { OBSIDIAN_THEMES } from '../constants';
import { getVaultConfig, setTheme, setVaultConfig } from '../types/obsidian-extensions';

export class ThemeManagerImpl {
  private plugin: PluginContext;

  constructor(plugin: PluginContext) {
    this.plugin = plugin;
  }

  // The main app window's document. Obsidian 1.13.0+ opens Settings in a
  // separate window, so `activeDocument` points at the Settings window while a
  // setting is being changed — toggling theme classes there would affect the
  // wrong window. The workspace container always lives in the main window.
  private get doc(): Document {
    return this.plugin.app.workspace.containerEl.ownerDocument;
  }

  /**
   * Toggle between light and dark themes
   */
  updateTheme(): void {
    const currentTheme = getVaultConfig(this.plugin.app, 'theme');
    if (currentTheme === OBSIDIAN_THEMES.SYSTEM) {
      // System theme mode - just toggle class
      if (this.doc.body.classList.contains('theme-light')) {
        this.doc.body.removeClass('theme-light');
        this.doc.body.addClass('theme-dark');
      } else {
        this.doc.body.removeClass('theme-dark');
        this.doc.body.addClass('theme-light');
      }
    } else {
      // Manual theme mode - toggle both class and Obsidian theme
      if (this.doc.body.classList.contains('theme-light')) {
        this.doc.body.removeClass('theme-light');
        this.doc.body.addClass('theme-dark');
      } else {
        this.doc.body.removeClass('theme-dark');
        this.doc.body.addClass('theme-light');
      }

      const theme = getVaultConfig(this.plugin.app, 'theme');
      const newTheme = theme === OBSIDIAN_THEMES.LIGHT 
        ? OBSIDIAN_THEMES.DARK 
        : OBSIDIAN_THEMES.LIGHT;

      setTheme(this.plugin.app, newTheme);
      setVaultConfig(this.plugin.app, 'theme', newTheme);
    }
    
    this.plugin.app.workspace.trigger('css-change');
  }

  /**
   * Switch to light theme
   */
  switchToLight(): void {
    this.doc.body.removeClass('theme-dark');
    this.doc.body.addClass('theme-light');
    
    const theme = getVaultConfig(this.plugin.app, 'theme');
    if (theme !== OBSIDIAN_THEMES.SYSTEM) {
      setTheme(this.plugin.app, OBSIDIAN_THEMES.LIGHT);
      setVaultConfig(this.plugin.app, 'theme', OBSIDIAN_THEMES.LIGHT);
    }
    
    this.plugin.app.workspace.trigger('css-change');
  }

  /**
   * Switch to dark theme
   */
  switchToDark(): void {
    this.doc.body.removeClass('theme-light');
    this.doc.body.addClass('theme-dark');
    
    const theme = getVaultConfig(this.plugin.app, 'theme');
    if (theme !== OBSIDIAN_THEMES.SYSTEM) {
      setTheme(this.plugin.app, OBSIDIAN_THEMES.DARK);
      setVaultConfig(this.plugin.app, 'theme', OBSIDIAN_THEMES.DARK);
    }
    
    this.plugin.app.workspace.trigger('css-change');
  }

  /**
   * Get current theme mode
   */
  getCurrentMode(): ThemeMode {
    return this.doc.body.classList.contains('theme-light') ? 'light' : 'dark';
  }

  /**
   * Update sidebar theme for high contrast light mode
   */
  updateSidebarTheme(): void {
    // Only update sidebar theme if Oxygen theme is active
    if (!this.plugin.isOxygenThemeActive()) {
      return;
    }
    
    const sidebarEl = this.doc.getElementsByClassName('mod-left-split')[0];
    const ribbonEl = this.doc.getElementsByClassName('side-dock-ribbon')[0];
    
    if (
      sidebarEl && 
      ribbonEl && 
      this.doc.body.classList.contains('theme-light') && 
      this.plugin.settings.lightStyle === 'oxygen-light-contrast'
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
    const sidebarEl = this.doc.getElementsByClassName('mod-left-split')[0];
    if (sidebarEl) {
      sidebarEl.removeClass('theme-dark');
    }
    
    const ribbonEl = this.doc.getElementsByClassName('side-dock-ribbon')[0];
    if (ribbonEl) {
      ribbonEl.removeClass('theme-dark');
    }
  }
}

