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
import { getVaultConfig } from './types/obsidian-extensions';

export default class MinimalTheme extends Plugin {
  settings: MinimalSettings;
  
  // Managers
  styleManager: StyleManagerImpl;
  themeManager: ThemeManagerImpl;
  settingsSyncManager: SettingsSyncManager;
  settingsTab?: MinimalSettingsTab;
  
  // Cache theme state to avoid repeated vault config calls (performance optimization)
  private _isOxygenActive: boolean = false;
  private _isInitialized: boolean = false;

  async onload() {
    await this.loadSettings();
    
    // Initialize managers
    this.styleManager = new StyleManagerImpl(this);
    this.themeManager = new ThemeManagerImpl(this);
    this.settingsSyncManager = new SettingsSyncManager(this);
    
    // Setup UI
    this.settingsTab = new MinimalSettingsTab(this.app, this);
    this.addSettingTab(this.settingsTab);
    
    // Cache theme state once at startup for performance
    this._isOxygenActive = this.checkOxygenTheme();
    
    // Initialize last theme mode for change detection
    const initialThemeMode = document.body.classList.contains('theme-light') ? 'light' : 'dark';
    
    // Only initialize styles if Oxygen theme is active
    // Note: initialize() calls updateStyle() which also updates custom preset CSS
    if (this._isOxygenActive) {
      this.styleManager.initialize();
      this._isInitialized = true;
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
    
    // Watch for theme changes with debouncing for performance
    // css-change fires very frequently, so we debounce and cache the theme state
    let debounceTimer: number;
    let lastThemeMode: string = initialThemeMode;
    
    this.registerEvent(
      this.app.workspace.on('css-change', () => {
        // Debounce to avoid excessive checks (performance optimization)
        window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => {
          const newThemeState = this.checkOxygenTheme();
          const currentThemeMode = document.body.classList.contains('theme-light') ? 'light' : 'dark';
          const themeModeChanged = lastThemeMode !== null && lastThemeMode !== currentThemeMode;
          lastThemeMode = currentThemeMode;
          
          // Only act when theme actually changes (not from our own CSS updates)
          if (this._isOxygenActive && !newThemeState) {
            // Switched away from Oxygen - cleanup
            this._isOxygenActive = false;
            this._isInitialized = false;
            this.styleManager.cleanup();
          } else if (!this._isOxygenActive && newThemeState && !this._isInitialized) {
            // Switched to Oxygen and not yet initialized - initialize
            this._isOxygenActive = true;
            this._isInitialized = true;
            this.styleManager.initialize();
          } else if (this._isOxygenActive && newThemeState && this._isInitialized && themeModeChanged) {
            // Still on Oxygen, but theme mode (light/dark) changed - refresh styles
            this.styleManager.updateStyle();
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
    const loadedData = await this.loadData() as Partial<MinimalSettings> | null;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
    
    // Migration for minimal- to oxygen- prefix (run once per user)
    const migrationVersion = 'minimal-to-oxygen-prefix-v1';
    const migrationVersions = loadedData && typeof loadedData === 'object' && '_migrationVersions' in loadedData 
      ? (loadedData as { _migrationVersions?: string[] })._migrationVersions 
      : undefined;
    if (!loadedData || !migrationVersions || !migrationVersions.includes(migrationVersion)) {
      let migrated = false;
      
      // Migrate style settings
      if (this.settings.lightStyle && this.settings.lightStyle.startsWith('minimal-')) {
        this.settings.lightStyle = this.settings.lightStyle.replace(/^minimal-/, 'oxygen-');
        migrated = true;
      }
      if (this.settings.darkStyle && this.settings.darkStyle.startsWith('minimal-')) {
        this.settings.darkStyle = this.settings.darkStyle.replace(/^minimal-/, 'oxygen-');
        migrated = true;
      }
      
      // Migrate color scheme settings
      if (this.settings.lightScheme && this.settings.lightScheme.startsWith('minimal-')) {
        this.settings.lightScheme = this.settings.lightScheme.replace(/^minimal-/, 'oxygen-');
        migrated = true;
      }
      if (this.settings.darkScheme && this.settings.darkScheme.startsWith('minimal-')) {
        this.settings.darkScheme = this.settings.darkScheme.replace(/^minimal-/, 'oxygen-');
        migrated = true;
      }
      
      // Mark migration as complete
      if (migrated) {
        if (!this.settings._migrationVersions) {
          this.settings._migrationVersions = [];
        }
        this.settings._migrationVersions.push(migrationVersion);
        await this.saveData(this.settings);
        console.debug('[Oxygen Settings] Migrated settings from minimal- to oxygen- prefix');
      }
    }
    
    // Migration for renamed default schemes
    if (this.settings.lightScheme === 'minimal-default-light') {
      this.settings.lightScheme = 'oxygen-minimal-light';
    }
    if (this.settings.darkScheme === 'minimal-default-dark') {
      this.settings.darkScheme = 'oxygen-minimal-dark';
    }
    
    // Migration for workspace borders: convert old bordersToggle + workspaceBordersEnhanced to new workspaceBorders dropdown
    // Only migrate if workspaceBorders hasn't been explicitly set by the user yet
    if (loadedData && typeof loadedData === 'object') {
      const legacyData = loadedData as { bordersToggle?: boolean; workspaceBordersEnhanced?: boolean; workspaceBorders?: string };
      if (legacyData.bordersToggle !== undefined || legacyData.workspaceBordersEnhanced !== undefined) {
        if (legacyData.workspaceBorders === undefined) {
          // Only migrate if workspaceBorders hasn't been set yet (not in saved data)
          if (legacyData.bordersToggle === false) {
            this.settings.workspaceBorders = 'none';
          } else if (legacyData.workspaceBordersEnhanced === true) {
            this.settings.workspaceBorders = 'enhanced';
          } else {
            this.settings.workspaceBorders = 'default';
          }
          // Save migrated settings
          await this.saveData(this.settings);
        }
      }
    }
    
    // Ensure custom presets array exists (for existing users)
    if (!this.settings.customPresets) {
      this.settings.customPresets = [];
    }
    if (this.settings.enableCustomPresets === undefined) {
      this.settings.enableCustomPresets = true;
    }
    
    // Migration for animation personality: convert 'refined' to 'default'
    if (loadedData && typeof loadedData === 'object' && 'animationPersonality' in loadedData) {
      const legacyData = loadedData as { animationPersonality?: string };
      if (legacyData.animationPersonality === 'refined') {
        this.settings.animationPersonality = 'default';
        await this.saveData(this.settings);
      }
    }
    // Ensure animationPersonality is set (default to 'default' if missing)
    if (!this.settings.animationPersonality) {
      this.settings.animationPersonality = 'default';
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
    const cssTheme = getVaultConfig(this.app, 'cssTheme');
    return cssTheme === OXYGEN_THEME_NAME;
  }
}

