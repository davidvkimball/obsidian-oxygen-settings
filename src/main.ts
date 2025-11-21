/**
 * Minimal Theme Plugin - Refactored
 * Main plugin file - lifecycle management only
 */

import { Plugin, setIcon, Notice } from 'obsidian';
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
  
  // Help button replacement
  private helpButtonObserver?: MutationObserver;
  private helpButtonElement?: HTMLElement;
  private customHelpButton?: HTMLElement;
  private helpButtonStyleEl?: HTMLStyleElement;

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
    
    // Setup help button replacement
    this.setupHelpButtonReplacement();
    
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
    
    // Cleanup help button replacement
    if (this.helpButtonObserver) {
      this.helpButtonObserver.disconnect();
      this.helpButtonObserver = undefined;
    }
    
    // Remove CSS style that hides help button
    if (this.helpButtonStyleEl) {
      this.helpButtonStyleEl.remove();
      this.helpButtonStyleEl = undefined;
    }
    
    // Restore original help button if we modified it
    this.restoreHelpButton();
  }

  async loadSettings() {
    const loadedData = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
    
    // Migration for renamed default schemes
    if (this.settings.lightScheme === 'minimal-default-light') {
      this.settings.lightScheme = 'minimal-minimal-light';
    }
    if (this.settings.darkScheme === 'minimal-default-dark') {
      this.settings.darkScheme = 'minimal-minimal-dark';
    }
    
    // Migration for workspace borders: convert old bordersToggle + workspaceBordersEnhanced to new workspaceBorders dropdown
    // Only migrate if workspaceBorders hasn't been explicitly set by the user yet
    if (loadedData && (loadedData.bordersToggle !== undefined || loadedData.workspaceBordersEnhanced !== undefined)) {
      if (loadedData.workspaceBorders === undefined) {
        // Only migrate if workspaceBorders hasn't been set yet (not in saved data)
        if (loadedData.bordersToggle === false) {
          this.settings.workspaceBorders = 'none';
        } else if (loadedData.workspaceBordersEnhanced === true) {
          this.settings.workspaceBorders = 'enhanced';
        } else {
          this.settings.workspaceBorders = 'default';
        }
        // Save migrated settings
        await this.saveData(this.settings);
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
    if (loadedData && loadedData.animationPersonality === 'refined') {
      this.settings.animationPersonality = 'default';
      await this.saveData(this.settings);
    }
    // Ensure animationPersonality is set (default to 'default' if missing)
    if (!this.settings.animationPersonality) {
      this.settings.animationPersonality = 'default';
    }
    
    // Migration for sidebar buttons: convert old hideSidebarButtons to separate left/right settings
    if (loadedData && loadedData.hideSidebarButtons !== undefined) {
      // Only migrate if new settings haven't been set yet
      if (loadedData.hideLeftSidebarButton === undefined && loadedData.hideRightSidebarButton === undefined) {
        this.settings.hideLeftSidebarButton = loadedData.hideSidebarButtons;
        this.settings.hideRightSidebarButton = loadedData.hideSidebarButtons;
        // Save migrated settings
        await this.saveData(this.settings);
      }
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
  
  // Help button replacement methods
  private setupHelpButtonReplacement() {
    // Only proceed if help button is hidden and replacement is enabled
    if (!this.settings.hideHelpButton || !this.settings.helpButtonReplacement?.enabled) {
      return;
    }
    
    // Update CSS and button
    this.updateHelpButtonCSS();
    
    // Wait for the DOM to be ready
    const trySetup = () => {
      if (this.settings.hideHelpButton && this.settings.helpButtonReplacement?.enabled) {
        this.updateHelpButton();
      }
    };

    // Try immediately
    trySetup();

    // Also try after a short delay to ensure DOM is ready
    setTimeout(trySetup, 500);

    // Set up observer after initial setup to watch for button recreation
    setTimeout(() => {
      this.setupHelpButtonObserver();
    }, 1000);
  }

  private updateHelpButtonCSS() {
    // Remove existing style if any
    if (this.helpButtonStyleEl) {
      this.helpButtonStyleEl.remove();
    }

    // Only add CSS if help button is hidden and replacement is enabled
    if (this.settings.hideHelpButton && this.settings.helpButtonReplacement?.enabled) {
      // Create style element to hide help button globally
      this.helpButtonStyleEl = document.createElement('style');
      this.helpButtonStyleEl.id = 'oxygen-settings-hide-help-button';
      this.helpButtonStyleEl.textContent = `
        .workspace-drawer-vault-actions .clickable-icon:has(svg.help) {
          display: none !important;
        }
      `;
      document.head.appendChild(this.helpButtonStyleEl);
    }
  }

  public async updateHelpButton() {
    // Only proceed if help button is hidden and replacement is enabled
    if (!this.settings.hideHelpButton || !this.settings.helpButtonReplacement?.enabled) {
      this.restoreHelpButton();
      return;
    }
    
    // Temporarily disconnect observer to prevent infinite loops
    if (this.helpButtonObserver) {
      this.helpButtonObserver.disconnect();
    }

    // Ensure we have the latest settings
    await this.loadSettings();

    // Update CSS first (this will hide the help button globally)
    this.updateHelpButtonCSS();

    try {
      // Check if replacement is still enabled
      if (!this.settings.hideHelpButton || !this.settings.helpButtonReplacement?.enabled) {
        this.restoreHelpButton();
        return;
      }

      // Find the help button
      const vaultActions = document.querySelector('.workspace-drawer-vault-actions');
      if (!vaultActions) {
        return;
      }

      // Find the help button - it's the first clickable-icon that contains an SVG with class "help"
      const clickableIcons = Array.from(vaultActions.querySelectorAll('.clickable-icon'));
      let helpButton: HTMLElement | null = null;
      
      for (const icon of clickableIcons) {
        const svg = icon.querySelector('svg.help');
        if (svg) {
          helpButton = icon as HTMLElement;
          break;
        }
      }
      
      if (!helpButton) {
        return;
      }

      // Store reference to the button
      this.helpButtonElement = helpButton;

      // Remove existing custom button if it exists (always recreate to update icon/command)
      if (this.customHelpButton && this.customHelpButton.parentElement) {
        this.customHelpButton.remove();
        this.customHelpButton = undefined;
      }

      // Create a new custom button
      const customButton = helpButton.cloneNode(true) as HTMLElement;
      customButton.style.display = '';
      customButton.removeAttribute('aria-label'); // Remove any existing aria-label
      
      // Clear any existing click handlers
      customButton.onclick = null;
      
      // Replace the icon using Obsidian's setIcon function
      const iconContainer = customButton.querySelector('svg')?.parentElement || customButton;
      try {
        setIcon(iconContainer as HTMLElement, this.settings.helpButtonReplacement.iconId);
      } catch (error) {
        console.warn('[Oxygen Settings] Error setting icon:', error);
      }

      // Add our custom click handler
      customButton.addEventListener('click', async (evt: MouseEvent) => {
        evt.preventDefault();
        evt.stopPropagation();
        
        const commandId = this.settings.helpButtonReplacement?.commandId;
        if (commandId) {
          try {
            await (this.app as any).commands.executeCommandById(commandId);
          } catch (error) {
            console.warn('[Oxygen Settings] Error executing command:', error);
            new Notice(`Failed to execute command: ${commandId}`);
          }
        }
      }, true); // Use capture phase to ensure we handle it first

      // Insert the custom button right after the original (hidden) button
      helpButton.parentElement?.insertBefore(customButton, helpButton.nextSibling);
      
      // Store reference to custom button
      this.customHelpButton = customButton;
    } finally {
      // Reconnect observer after a delay
      setTimeout(() => {
        if (this.settings.hideHelpButton && this.settings.helpButtonReplacement?.enabled) {
          this.setupHelpButtonObserver();
        }
      }, 1000);
    }
  }

  private setupHelpButtonObserver() {
    // Disconnect existing observer if any
    if (this.helpButtonObserver) {
      this.helpButtonObserver.disconnect();
    }

    // Only set up observer if help button is hidden and replacement is enabled
    if (!this.settings.hideHelpButton || !this.settings.helpButtonReplacement?.enabled) {
      return;
    }

    // Watch for changes to the vault profile area only (more targeted)
    let updateTimeout: number | null = null;
    this.helpButtonObserver = new MutationObserver(() => {
      // Debounce updates to prevent infinite loops
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      updateTimeout = window.setTimeout(() => {
        // Check if help button was recreated (CSS will hide it, but we need to inject our custom button)
        const vaultActions = document.querySelector('.workspace-drawer-vault-actions');
        if (!vaultActions) return;
        
        // Check if we have a custom button, if not, inject it
        if (!this.customHelpButton) {
          this.updateHelpButton();
        }
      }, 100); // Shorter debounce for better responsiveness
    });

    // Observe the vault actions area more specifically
    const vaultActions = document.querySelector('.workspace-drawer-vault-actions');
    if (vaultActions) {
      this.helpButtonObserver.observe(vaultActions, {
        childList: true,
        subtree: true, // Watch subtree to catch when buttons are recreated
      });
    }
    
    // Also observe the parent vault profile area
    const vaultProfile = document.querySelector('.workspace-sidedock-vault-profile');
    if (vaultProfile) {
      this.helpButtonObserver.observe(vaultProfile, {
        childList: true,
        subtree: false,
      });
    }
  }

  private restoreHelpButton() {
    // Remove CSS that hides help button
    if (this.helpButtonStyleEl) {
      this.helpButtonStyleEl.remove();
      this.helpButtonStyleEl = undefined;
    }

    // Remove the custom button
    if (this.customHelpButton) {
      this.customHelpButton.remove();
      this.customHelpButton = undefined;
    }

    // Clear stored references
    this.helpButtonElement = undefined;
  }
}

