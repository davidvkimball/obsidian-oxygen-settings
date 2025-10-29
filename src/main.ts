/**
 * Minimal Theme Plugin - Refactored
 * Main plugin file - lifecycle management only
 */

import { Plugin } from 'obsidian';
import { MinimalSettings, DEFAULT_SETTINGS } from './settings/settings-interface';
import { MinimalSettingsTab } from './settings';
import { StyleManagerImpl } from './managers/style-manager';
import { ThemeManagerImpl } from './managers/theme-manager';
import { SettingsSyncManager } from './managers/settings-sync';
import { registerAllCommands } from './commands';
import { OXYGEN_THEME_NAME } from './constants';

export default class MinimalTheme extends Plugin {
  settings: MinimalSettings;
  
  // Managers
  styleManager: StyleManagerImpl;
  themeManager: ThemeManagerImpl;
  settingsSyncManager: SettingsSyncManager;
  
  // Cache theme state to avoid repeated vault config calls (performance optimization)
  private _isOxygenActive: boolean = false;

  async onload() {
    await this.loadSettings();
    
    // Initialize managers
    this.styleManager = new StyleManagerImpl(this);
    this.themeManager = new ThemeManagerImpl(this);
    this.settingsSyncManager = new SettingsSyncManager(this);
    
    // Setup UI
    this.addSettingTab(new MinimalSettingsTab(this.app, this));
    
    // Cache theme state once at startup for performance
    this._isOxygenActive = this.checkOxygenTheme();
    
    // Only initialize styles if Oxygen theme is active
    if (this._isOxygenActive) {
      this.styleManager.initialize();
    }
    
    this.settingsSyncManager.setupWatchers();
    
    // Initial sync from vault (without saving)
    this.settingsSyncManager.syncFromVault(true);
    
    // Setup sidebar theme update on layout ready
    this.app.workspace.onLayoutReady(() => {
      if (this._isOxygenActive) {
        this.themeManager.updateSidebarTheme();
      }
    });

    // Register all commands
    registerAllCommands(this);
    
    // Defer custom preset CSS initialization to after load completes
    // This prevents blocking the main load process
    setTimeout(() => {
      if (this._isOxygenActive) {
        this.styleManager.initializeCustomPresets();
      }
    }, 100);
    
    // Watch for theme changes with debouncing for performance
    // css-change fires very frequently, so we debounce and cache the theme state
    let debounceTimer: number;
    
    this.registerEvent(
      this.app.workspace.on('css-change', () => {
        // Debounce to avoid excessive checks (performance optimization)
        window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => {
          const newThemeState = this.checkOxygenTheme();
          
          // Only act when theme actually changes
          if (this._isOxygenActive && !newThemeState) {
            // Switched away from Oxygen - cleanup
            this._isOxygenActive = false;
            this.styleManager.cleanup();
          } else if (!this._isOxygenActive && newThemeState) {
            // Switched to Oxygen - initialize
            this._isOxygenActive = true;
            this.styleManager.initialize();
          }
        }, 100); // 100ms debounce
      })
    );
  }

  onunload() {
    // Cleanup managers
    this.themeManager.cleanupSidebarTheme();
    this.styleManager.cleanup();
    this.settingsSyncManager.cleanup();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    
    // Migration for renamed default schemes
    if (this.settings.lightScheme === 'minimal-default-light') {
      this.settings.lightScheme = 'minimal-minimal-light';
    }
    if (this.settings.darkScheme === 'minimal-default-dark') {
      this.settings.darkScheme = 'minimal-minimal-dark';
    }
    
    // Ensure custom presets array exists (for existing users)
    if (!this.settings.customPresets) {
      this.settings.customPresets = [];
    }
    if (this.settings.enableCustomPresets === undefined) {
      this.settings.enableCustomPresets = true;
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // Convenience methods that delegate to managers
  refresh(): void {
    this.styleManager.refresh();
  }

  updateStyle(): void {
    this.styleManager.updateStyle();
  }

  updateLightStyle(): void {
    this.styleManager.updateLightStyle();
  }

  updateDarkStyle(): void {
    this.styleManager.updateDarkStyle();
  }

  updateLightScheme(): void {
    this.styleManager.updateLightScheme();
  }

  updateDarkScheme(): void {
    this.styleManager.updateDarkScheme();
  }

  updateCustomPresetCSS(): void {
    this.styleManager.updateCustomPresetCSS();
  }

  setFontSize(): void {
    this.settingsSyncManager.setFontSize();
  }
  
  /**
   * Check if the Oxygen theme is currently active (uses cached value for performance)
   * @returns true if Oxygen theme is active, false otherwise
   */
  isOxygenThemeActive(): boolean {
    return this._isOxygenActive;
  }
  
  /**
   * Check theme state from vault config (called only when needed)
   * @private
   */
  private checkOxygenTheme(): boolean {
    const app = this.app as any;
    const cssTheme = app.vault.getConfig('cssTheme');
    return cssTheme === OXYGEN_THEME_NAME;
  }
}

