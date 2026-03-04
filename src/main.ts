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
import { MigrationRunner } from './utils/migrations';
import { isOxygenThemeActive } from './utils/theme-utils';

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
    this._isOxygenActive = isOxygenThemeActive(this.app);

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
          const newThemeState = isOxygenThemeActive(this.app);
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
            this.styleManager.updateCustomPresetCSS();
          } else if (this._isOxygenActive && newThemeState && this._isInitialized) {
            // Still on Oxygen, same mode - re-apply custom preset CSS
            // (handles Obsidian's accent color reset clearing our inline properties)
            this.styleManager.updateCustomPresetCSS();
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

    const migrationRunner = new MigrationRunner(this.app, this.settings);
    let migrated = await migrationRunner.run();

    // Migrate workspace borders separately as it needs raw loadedData
    if (migrationRunner.migrateWorkspaceBorders(loadedData)) {
      migrated = true;
    }

    // Migration for renamed default schemes was moved to MigrationRunner.run()
    // but the specific checks remain there.

    // Ensure custom presets array exists (for existing users)
    if (!this.settings.customPresets) {
      this.settings.customPresets = [];
    }
    if (this.settings.enableCustomPresets === undefined) {
      this.settings.enableCustomPresets = true;
    }

    // Ensure animationPersonality is set (run in MigrationRunner.run() but double check here)
    if (!this.settings.animationPersonality) {
      this.settings.animationPersonality = 'default';
    }

    if (migrated) {
      await this.saveSettings();
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
}

