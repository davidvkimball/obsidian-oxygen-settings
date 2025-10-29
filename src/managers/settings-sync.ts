/**
 * Settings Sync Manager
 * Synchronizes plugin settings with Obsidian vault configuration
 */

import { PluginContext } from '../types';
import { VAULT_CONFIG } from '../constants';

export class SettingsSyncManager {
  private plugin: PluginContext;

  constructor(plugin: PluginContext) {
    this.plugin = plugin;
  }

  /**
   * Setup event watchers for vault config changes
   */
  setupWatchers(): void {
    // Obsidian internal API - vault events
    const app = this.plugin.app as any; // TODO: Type definition for vault.on
    
    // Watch for vault config changes
    this.plugin.registerEvent(
      app.vault.on('config-changed', () => {
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
    // Obsidian internal API
    const app = this.plugin.app as any; // TODO: Type definition for vault.getConfig
    
    // Font size
    const fontSize = app.vault.getConfig(VAULT_CONFIG.BASE_FONT_SIZE);
    if (typeof fontSize === 'number') {
      this.plugin.settings.textNormal = fontSize;
    }

    // Folding
    this.plugin.settings.folding = !!app.vault.getConfig(VAULT_CONFIG.FOLD_HEADING);

    // Line numbers
    this.plugin.settings.lineNumbers = !!app.vault.getConfig(VAULT_CONFIG.SHOW_LINE_NUMBER);

    // Readable line length
    this.plugin.settings.readableLineLength = !!app.vault.getConfig(VAULT_CONFIG.READABLE_LINE_LENGTH);

    // Update body classes
    const bodyClassList = document.body.classList;
    bodyClassList.toggle('minimal-folding', this.plugin.settings.folding);
    bodyClassList.toggle('minimal-line-nums', this.plugin.settings.lineNumbers);
    bodyClassList.toggle('minimal-readable', this.plugin.settings.readableLineLength);
    bodyClassList.toggle('minimal-readable-off', !this.plugin.settings.readableLineLength);

    // Save updated settings (skip during initial load to avoid unnecessary I/O)
    if (!skipSave) {
      this.plugin.saveData(this.plugin.settings);
    }
  }

  /**
   * Sync font size to Obsidian vault config
   */
  setFontSize(): void {
    // Obsidian internal API
    const app = this.plugin.app as any; // TODO: Type definition for vault.setConfig
    app.vault.setConfig(VAULT_CONFIG.BASE_FONT_SIZE, this.plugin.settings.textNormal);
    app.updateFontSize();
  }

  /**
   * Update sidebar theme for high contrast mode
   */
  private updateSidebarTheme(): void {
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
   * Cleanup - no specific cleanup needed for this manager
   */
  cleanup(): void {
    // Event listeners are automatically cleaned up by Obsidian
  }
}

