/**
 * Settings Tab - Refactored
 * Coordinates all settings sections
 */

import { PluginSettingTab } from 'obsidian';
import MinimalTheme from "./main";
import { buildColorSchemeSettings } from './settings/sections/ColorSchemeSettings';
import { buildFeatureSettings } from './settings/sections/FeatureSettings';
import { buildLayoutSettings } from './settings/sections/LayoutSettings';
import { buildTypographySettings } from './settings/sections/TypographySettings';
import { buildCustomPresetSettings } from './settings/sections/CustomPresetSettings';

// Re-export from settings-interface for backward compatibility
export type { MinimalSettings } from './settings/settings-interface';
export { DEFAULT_SETTINGS } from './settings/settings-interface';

export class MinimalSettingsTab extends PluginSettingTab {
  plugin: MinimalTheme;
  
  constructor(app: any, plugin: MinimalTheme) { // App type from Obsidian
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;
    containerEl.empty();

    // Build all settings sections
    buildColorSchemeSettings(containerEl, this.plugin);
    buildCustomPresetSettings(containerEl, this.plugin, this.app, () => this.display());
    buildFeatureSettings(containerEl, this.plugin);
    buildLayoutSettings(containerEl, this.plugin);
    buildTypographySettings(containerEl, this.plugin);
  }
}

