import { SettingGroup } from "obsidian";
/**
 * Color scheme settings section
 * Light/dark mode color schemes and background contrast
 */

import MinimalTheme from '../../main';


export function buildColorSchemeSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  const colorGroup = new SettingGroup(containerEl).setHeading('Color scheme');

  // Light mode color scheme
  colorGroup.addSetting(setting => {
    setting
      .setName('Light mode color scheme')
      // False positive: "Style Settings" and "Documentation" are proper nouns
      .setDesc('Preset color options for light mode. To create a custom color scheme use the Style Settings plugin. See Documentation for details.')
      .addDropdown(dropdown => {
        // Built-in schemes
        dropdown
          .addOption('oxygen-oxygen-light', 'Oxygen')
          .addOption('oxygen-minimal-light', 'Minimal')
          .addOption('oxygen-atom-light', 'Atom')
          .addOption('oxygen-ayu-light', 'Ayu')
          .addOption('oxygen-catppuccin-light', 'Catppuccin')
          .addOption('oxygen-eink-light', 'E-ink (beta)')
          .addOption('oxygen-everforest-light', 'Everforest')
          .addOption('oxygen-flexoki-light', 'Flexoki')
          .addOption('oxygen-gruvbox-light', 'Gruvbox')
          .addOption('oxygen-macos-light', 'macOS')
          .addOption('oxygen-nord-light', 'Nord')
          // False positive: "Rosé Pine" and "Sky" are proper nouns (color scheme names)
          .addOption('oxygen-rose-pine-light', 'Rosé Pine')
          .addOption('oxygen-notion-light', 'Sky')
          .addOption('oxygen-solarized-light', 'Solarized')
          .addOption('oxygen-things-light', 'Things');

        // Add custom presets if enabled and any exist
        if (plugin.settings.enableCustomPresets && plugin.settings.customPresets.length > 0) {
          plugin.settings.customPresets
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(preset => {
              dropdown.addOption(`oxygen-custom-${preset.id}`, preset.name);
            });
        }

        dropdown
          .setValue(plugin.settings.lightScheme)
          .onChange(value => {
            plugin.settings.lightScheme = value;
            void plugin.saveData(plugin.settings);

            // Regenerate all CSS including custom presets
            plugin.updateStyle();
            plugin.updateCustomPresetCSS();
          });
      });
  });

  // Light mode background contrast
  colorGroup.addSetting(setting => {
    setting
      .setName('Light mode background contrast')
      .setDesc('Level of contrast between sidebar and main content.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('oxygen-light', 'Default')
          .addOption('oxygen-light-white', 'All white')
          .addOption('oxygen-light-tonal', 'Low contrast')
          .addOption('oxygen-light-contrast', 'High contrast')
          .setValue(plugin.settings.lightStyle)
          .onChange(value => {
            plugin.settings.lightStyle = value;
            void plugin.saveData(plugin.settings);
            // Refresh all styles to apply the new contrast class and handle sticking
            plugin.updateStyle();
          });
      });
  });

  // Dark mode color scheme
  colorGroup.addSetting(setting => {
    setting
      .setName('Dark mode color scheme')
      .setDesc('Preset colors options for dark mode.')
      .addDropdown(dropdown => {
        // Built-in schemes
        dropdown
          .addOption('oxygen-oxygen-dark', 'Oxygen')
          .addOption('oxygen-minimal-dark', 'Minimal')
          .addOption('oxygen-atom-dark', 'Atom')
          .addOption('oxygen-ayu-dark', 'Ayu')
          .addOption('oxygen-catppuccin-dark', 'Catppuccin')
          .addOption('oxygen-dracula-dark', 'Dracula')
          .addOption('oxygen-eink-dark', 'E-ink (beta)')
          .addOption('oxygen-everforest-dark', 'Everforest')
          .addOption('oxygen-flexoki-dark', 'Flexoki')
          .addOption('oxygen-gruvbox-dark', 'Gruvbox')
          .addOption('oxygen-macos-dark', 'macOS')
          .addOption('oxygen-nord-dark', 'Nord')
          // False positive: "Rosé Pine" and "Sky" are proper nouns (color scheme names)
          .addOption('oxygen-rose-pine-dark', 'Rosé Pine')
          .addOption('oxygen-notion-dark', 'Sky')
          .addOption('oxygen-solarized-dark', 'Solarized')
          .addOption('oxygen-things-dark', 'Things');

        // Add custom presets if enabled and any exist
        if (plugin.settings.enableCustomPresets && plugin.settings.customPresets.length > 0) {
          plugin.settings.customPresets
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(preset => {
              dropdown.addOption(`oxygen-custom-${preset.id}`, preset.name);
            });
        }

        dropdown
          .setValue(plugin.settings.darkScheme)
          .onChange(value => {
            plugin.settings.darkScheme = value;
            void plugin.saveData(plugin.settings);

            // Regenerate all CSS including custom presets
            plugin.updateStyle();
            plugin.updateCustomPresetCSS();
          });
      });
  });

  // Dark mode background contrast
  colorGroup.addSetting(setting => {
    setting
      .setName('Dark mode background contrast')
      .setDesc('Level of contrast between sidebar and main content.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('oxygen-dark', 'Default')
          .addOption('oxygen-dark-tonal', 'Low contrast')
          .addOption('oxygen-dark-black', 'True black')
          .setValue(plugin.settings.darkStyle)
          .onChange(value => {
            plugin.settings.darkStyle = value;
            void plugin.saveData(plugin.settings);
            // Refresh all styles to apply the new contrast class and handle sticking
            plugin.updateStyle();
          });
      });
  });
}

