/**
 * Animation settings section
 * Controls animation personality and speed
 */

import { Setting } from 'obsidian';
import MinimalTheme from '../../main';
import { createSettingsGroup } from '../../utils/settings-compat';

export function buildAnimationSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  const animationGroup = createSettingsGroup(containerEl, 'Animations');

  // Declare speedSetting variable first so it can be referenced in personality onChange
  let speedSetting: Setting;

  // Animation Personality dropdown
  animationGroup.addSetting((setting) => {
    setting
      .setName('Animation personality')
      .setDesc('Choose the animation style: Default (smooth), Playful (bouncy), or Off (disabled).')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('default', 'Default')
          .addOption('playful', 'Playful')
          .addOption('off', 'Off')
          .setValue(plugin.settings.animationPersonality || 'default')
          .onChange(async (value) => {
            plugin.settings.animationPersonality = value as 'default' | 'playful' | 'off';
            await plugin.saveData(plugin.settings);
            plugin.refresh();

            // Update speed slider visibility
            if (speedSetting) {
              speedSetting.settingEl.style.display = value === 'off' ? 'none' : '';
            }
          })
      );
  });

  // Animation Speed slider
  animationGroup.addSetting((setting) => {
    speedSetting = setting;
    setting
      .setName('Animation speed')
      .setDesc('Control the speed of animations. Range: 0 (disabled) to 2 (half speed / slower). Default: 1 (normal speed). Lower values = faster animations, higher values = slower animations.')
      .addSlider((slider) =>
        slider
          .setLimits(0, 2, 0.1)
          .setValue(plugin.settings.animationSpeed)
          .setDynamicTooltip()
          .onChange(async (value) => {
            plugin.settings.animationSpeed = value;
            await plugin.saveData(plugin.settings);
            plugin.refresh();
          })
      );

    // Hide speed slider if animations are off
    if (plugin.settings.animationPersonality === 'off') {
      speedSetting.settingEl.style.display = 'none';
    }
  });
}

