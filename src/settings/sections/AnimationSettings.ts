/**
 * Animation settings section
 * Controls animation personality and speed
 */

import { Setting, SettingGroup, SliderComponent } from 'obsidian';
import MinimalTheme from '../../main';


export function buildAnimationSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  const animationGroup = new SettingGroup(containerEl).setHeading('Animations');

  // Declare speedSetting variable first so it can be referenced in personality onChange
  let speedSetting: Setting;

  // Animation Personality dropdown
  animationGroup.addSetting(setting => {
    setting
      .setName('Animation personality')
      .setDesc('Choose the animation style: Default (smooth), Playful (bouncy), or off (disabled).')
      .addDropdown(dropdown => {
        dropdown
          .addOption('default', 'Default')
          .addOption('playful', 'Playful')
          .addOption('off', 'Off')
          .setValue(plugin.settings.animationPersonality || 'default')
          .onChange(value => {
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
  animationGroup.addSetting(setting => {
    speedSetting = setting;
    setting
      .setName('Animation speed')
      .setDesc('Control the speed of animations. Range: 0 (disabled) to 2 (half speed / slower). Default: 1 (normal speed). Lower values = faster animations, higher values = slower animations.')
      .addSlider((slider: SliderComponent) => {
        slider
          .setLimits(0, 2, 0.1)
          .setValue(plugin.settings.animationSpeed)
          .setDynamicTooltip()
          .onChange((value: number) => {
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

