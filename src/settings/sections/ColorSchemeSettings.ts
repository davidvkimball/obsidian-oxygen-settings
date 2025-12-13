/**
 * Color scheme settings section
 * Light/dark mode color schemes and background contrast
 */

import { Setting } from 'obsidian';
import MinimalTheme from '../../main';
import { createSettingsGroup } from '../../utils/settings-compat';

export function buildColorSchemeSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  const colorGroup = createSettingsGroup(containerEl, 'Color scheme');

  // Light mode color scheme
  colorGroup.addSetting((setting) =>
    setting
      .setName('Light mode color scheme')
      .setDesc('Preset color options for light mode. To create a custom color scheme use the Style Settings plugin. See Documentation for details.')
      .addDropdown((dropdown) => {
      // Built-in schemes
      dropdown
        .addOption('minimal-oxygen-light','Oxygen')
        .addOption('minimal-minimal-light','Minimal')
        .addOption('minimal-atom-light','Atom')
        .addOption('minimal-ayu-light','Ayu')
        .addOption('minimal-catppuccin-light','Catppuccin')
        .addOption('minimal-eink-light','E-ink (beta)')
        .addOption('minimal-everforest-light','Everforest')
        .addOption('minimal-flexoki-light','Flexoki')
        .addOption('minimal-gruvbox-light','Gruvbox')
        .addOption('minimal-macos-light','macOS')
        .addOption('minimal-nord-light','Nord')
        .addOption('minimal-rose-pine-light','Rosé Pine')
        .addOption('minimal-notion-light','Sky')
        .addOption('minimal-solarized-light','Solarized')
        .addOption('minimal-things-light','Things');

      // Add custom presets if enabled and any exist
      if (plugin.settings.enableCustomPresets && plugin.settings.customPresets.length > 0) {
        plugin.settings.customPresets
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach(preset => {
            dropdown.addOption(`minimal-custom-${preset.id}`, preset.name);
          });
      }

        dropdown
          .setValue(plugin.settings.lightScheme)
          .onChange(async (value) => {
            plugin.settings.lightScheme = value;
            await plugin.saveData(plugin.settings);
            // Regenerate all CSS including custom presets
            plugin.updateStyle();
            plugin.updateCustomPresetCSS();
          });
      })
  );

  // Light mode background contrast
  colorGroup.addSetting((setting) =>
    setting
      .setName('Light mode background contrast')
      .setDesc('Level of contrast between sidebar and main content.')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('minimal-light', 'Default')
          .addOption('minimal-light-white', 'All white')
          .addOption('minimal-light-tonal', 'Low contrast')
          .addOption('minimal-light-contrast', 'High contrast')
          .setValue(plugin.settings.lightStyle)
          .onChange(async (value) => {
            plugin.settings.lightStyle = value;
            await plugin.saveData(plugin.settings);
            // Only apply light style if currently in light mode
            if (document.body.classList.contains('theme-light')) {
              plugin.updateLightStyle();
            }
          })
      )
  );

  // Dark mode color scheme
  colorGroup.addSetting((setting) =>
    setting
      .setName('Dark mode color scheme')
      .setDesc('Preset colors options for dark mode.')
      .addDropdown((dropdown) => {
      // Built-in schemes
      dropdown
        .addOption('minimal-oxygen-dark','Oxygen')
        .addOption('minimal-minimal-dark','Minimal')
        .addOption('minimal-atom-dark','Atom')
        .addOption('minimal-ayu-dark','Ayu')
        .addOption('minimal-catppuccin-dark','Catppuccin')
        .addOption('minimal-dracula-dark','Dracula')
        .addOption('minimal-eink-dark','E-ink (beta)')
        .addOption('minimal-everforest-dark','Everforest')
        .addOption('minimal-flexoki-dark','Flexoki')
        .addOption('minimal-gruvbox-dark','Gruvbox')
        .addOption('minimal-macos-dark','macOS')
        .addOption('minimal-nord-dark','Nord')
        .addOption('minimal-rose-pine-dark','Rosé Pine')
        .addOption('minimal-notion-dark','Sky')
        .addOption('minimal-solarized-dark','Solarized')
        .addOption('minimal-things-dark','Things');

      // Add custom presets if enabled and any exist
      if (plugin.settings.enableCustomPresets && plugin.settings.customPresets.length > 0) {
        plugin.settings.customPresets
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach(preset => {
            dropdown.addOption(`minimal-custom-${preset.id}`, preset.name);
          });
      }

        dropdown
          .setValue(plugin.settings.darkScheme)
          .onChange(async (value) => {
            plugin.settings.darkScheme = value;
            await plugin.saveData(plugin.settings);
            // Regenerate all CSS including custom presets
            plugin.updateStyle();
            plugin.updateCustomPresetCSS();
          });
      })
  );

  // Dark mode background contrast
  colorGroup.addSetting((setting) =>
    setting
      .setName('Dark mode background contrast')
      .setDesc('Level of contrast between sidebar and main content.')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('minimal-dark', 'Default')
          .addOption('minimal-dark-tonal', 'Low contrast')
          .addOption('minimal-dark-black', 'True black')
          .setValue(plugin.settings.darkStyle)
          .onChange(async (value) => {
            plugin.settings.darkStyle = value;
            await plugin.saveData(plugin.settings);
            // Only apply dark style if currently in dark mode
            if (document.body.classList.contains('theme-dark')) {
              plugin.updateDarkStyle();
            }
          })
      )
  );
}

