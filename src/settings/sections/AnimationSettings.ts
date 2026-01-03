/**
 * Animation settings section
 * Controls animation personality and speed
 */

import { Setting } from 'obsidian';
import MinimalTheme from '../../main';
import { createSettingsGroup } from '../../utils/settings-compat';

export function buildAnimationSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  const animationGroup = createSettingsGroup(containerEl, 'Animations', 'oxygen-settings');

  // Declare speedSetting variable first so it can be referenced in personality onChange
  let speedSetting: Setting;

  // Animation Personality dropdown
  animationGroup.addSetting((setting) => {
    setting
      .setName('Animation personality')
      // False positive: Text is already in sentence case; "Default", "Playful", and "Off" are option labels
      // eslint-disable-next-line obsidianmd/ui/sentence-case
      .setDesc('Choose the animation style: Default (smooth), Playful (bouncy), or Off (disabled).')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('default', 'Default')
          .addOption('playful', 'Playful')
          .addOption('off', 'Off')
          .setValue(plugin.settings.animationPersonality || 'default')
          .onChange(async (value) => {
            plugin.settings.animationPersonality = value as 'default' | 'playful' | 'off';
            void plugin.saveData(plugin.settings);
            plugin.refresh();

            // Update speed slider visibility using CSS class
            if (speedSetting !== undefined) {
              if (value === 'off') {
                speedSetting.settingEl.addClass('hidden');
              } else {
                speedSetting.settingEl.removeClass('hidden');
              }
            }
          });
      });
  });

  // Animation Speed slider
  animationGroup.addSetting((setting) => {
    speedSetting = setting;
    setting
      .setName('Animation speed')
      .setDesc('Control the speed of animations. Range: 0 (disabled) to 2 (half speed / slower). Default: 1 (normal speed). Lower values = faster animations, higher values = slower animations.')
      .addSlider((slider) => {
        slider
          .setLimits(0, 2, 0.1)
          .setValue(plugin.settings.animationSpeed)
          .setDynamicTooltip()
          .onChange(async (value) => {
            plugin.settings.animationSpeed = value;
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });

    // Hide speed slider if animations are off using CSS class
    if (plugin.settings.animationPersonality === 'off') {
      speedSetting.settingEl.addClass('hidden');
    }
  });
}

