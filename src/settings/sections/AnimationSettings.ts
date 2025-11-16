/**
 * Animation settings section
 * Controls animation personality and speed
 */

import { Setting } from 'obsidian';
import MinimalTheme from '../../main';

export function buildAnimationSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  containerEl.createEl('br');

  const animationSection = containerEl.createEl('div', {cls: 'setting-item setting-item-heading'});
  const animationSectionInfo = animationSection.createEl('div', {cls: 'setting-item-info'});
  animationSectionInfo.createEl('div', {text: 'Animations', cls: 'setting-item-name'});

  const animationSectionDesc = animationSectionInfo.createEl('div', {cls: 'setting-item-description'});
  animationSectionDesc.appendText('Control animation style and speed throughout the theme.');

  // Declare speedSetting variable first so it can be referenced in personality onChange
  let speedSetting: Setting;

  // Animation Personality dropdown
  new Setting(containerEl)
    .setName('Animation personality')
    .setDesc('Choose the animation style: Default (smooth), Playful (bouncy), or Off (disabled).')
    .addDropdown(dropdown => dropdown
      .addOption('default', 'Default')
      .addOption('playful', 'Playful')
      .addOption('off', 'Off')
      .setValue(plugin.settings.animationPersonality || 'default')
      .onChange((value) => {
        plugin.settings.animationPersonality = value as 'default' | 'playful' | 'off';
        void plugin.saveData(plugin.settings);
        plugin.refresh();
        
        // Update speed slider visibility
        if (speedSetting) {
          speedSetting.settingEl.style.display = value === 'off' ? 'none' : '';
        }
      })
    );

  // Animation Speed slider
  speedSetting = new Setting(containerEl)
    .setName('Animation speed')
    .setDesc('Control the speed of animations. Range: 0 (disabled) to 2 (double speed). Default: 1 (normal speed).')
    .addSlider(slider => slider
      .setLimits(0, 2, 0.1)
      .setValue(plugin.settings.animationSpeed)
      .setDynamicTooltip()
      .onChange((value) => {
        plugin.settings.animationSpeed = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide speed slider if animations are off
  if (plugin.settings.animationPersonality === 'off') {
    speedSetting.settingEl.style.display = 'none';
  }
}

