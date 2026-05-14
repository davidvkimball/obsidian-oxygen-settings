/**
 * Settings Sync Manager
 * Synchronizes plugin settings with Obsidian vault configuration
 */

import { PluginContext } from '../types';
import { VAULT_CONFIG } from '../constants';
import { getVaultConfig, setVaultConfig, onVaultConfigChanged, updateFontSize } from '../types/obsidian-extensions';

export class SettingsSyncManager {
  private plugin: PluginContext;

  constructor(plugin: PluginContext) {
    this.plugin = plugin;
  }

  /**
   * Setup event watchers for vault config changes
   */
  setupWatchers(): void {
    // Watch for vault config changes
    this.plugin.registerEvent(
      onVaultConfigChanged(this.plugin.app, () => {
        this.syncFromVault();
      })
    );
    
    // Watch for CSS changes (sidebar theme updates)
    this.plugin.registerEvent(
      this.plugin.app.workspace.on('css-change', () => {
        this.updateSidebarTheme();
      })
    );
  }

  /**
   * Sync settings from Obsidian vault config
   * @param skipSave - If true, don't save settings (used during initial load)
   */
  syncFromVault(skipSave: boolean = false): void {
    // Font size
    const fontSize = getVaultConfig(this.plugin.app, VAULT_CONFIG.BASE_FONT_SIZE);
    if (typeof fontSize === 'number') {
      this.plugin.settings.textNormal = fontSize;
    }

    // Folding
    this.plugin.settings.folding = !!getVaultConfig(this.plugin.app, VAULT_CONFIG.FOLD_HEADING);

    // Line numbers
    this.plugin.settings.lineNumbers = !!getVaultConfig(this.plugin.app, VAULT_CONFIG.SHOW_LINE_NUMBER);

    // Readable line length
    this.plugin.settings.readableLineLength = !!getVaultConfig(this.plugin.app, VAULT_CONFIG.READABLE_LINE_LENGTH);

    // Update body classes
    const bodyClassList = activeDocument.body.classList;
    bodyClassList.toggle('oxygen-folding', this.plugin.settings.folding);
    bodyClassList.toggle('oxygen-line-nums', this.plugin.settings.lineNumbers);
    bodyClassList.toggle('oxygen-readable', this.plugin.settings.readableLineLength);
    bodyClassList.toggle('oxygen-readable-off', !this.plugin.settings.readableLineLength);

    // Save updated settings (skip during initial load to avoid unnecessary I/O)
    if (!skipSave) {
      void this.plugin.saveData(this.plugin.settings);
    }
  }

  /**
   * Sync font size to Obsidian vault config
   */
  setFontSize(): void {
    setVaultConfig(this.plugin.app, VAULT_CONFIG.BASE_FONT_SIZE, this.plugin.settings.textNormal);
    updateFontSize(this.plugin.app);
  }

  /**
   * Update sidebar theme for high contrast mode
   */
  private updateSidebarTheme(): void {
    const sidebarEl = activeDocument.getElementsByClassName('mod-left-split')[0];
    const ribbonEl = activeDocument.getElementsByClassName('side-dock-ribbon')[0];
    
    if (
      sidebarEl && 
      ribbonEl && 
      activeDocument.body.classList.contains('theme-light') && 
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
   * Cleanup - no specific cleanup needed for this manager
   */
  cleanup(): void {
    // Event listeners are automatically cleaned up by Obsidian
  }
}

