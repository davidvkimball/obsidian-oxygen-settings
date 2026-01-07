/**
 * Focus settings section
 * Focus and distraction-free writing features
 * Note: Most UI hiding features have been moved to UI Tweaker plugin
 */

import MinimalTheme from '../../main';
import { createSettingsGroup } from '../../utils/settings-compat';

export function buildHiderSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  const focusGroup = createSettingsGroup(containerEl, 'Focus', 'oxygen-settings');

  focusGroup.addSetting((setting) => {
    setting
      .setName('Focus mode')
      .setDesc('Hide tab bar and status bar, hover to display. Can be toggled via hotkey.')
      .addToggle((toggle) => {
        toggle.setValue(plugin.settings.focusMode).onChange( (value: boolean) => {
          plugin.settings.focusMode = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });

  focusGroup.addSetting((setting) => {
    setting
      .setName('Auto-hide tab bar when single tab')
      // False positive: "Meridian Theme" is a proper noun (theme name)
      // eslint-disable-next-line obsidianmd/ui/sentence-case
      .setDesc('Hide the tab bar automatically when only 1 tab is open. Inspired by Meridian Theme.')
      .addToggle((toggle) => {
        toggle.setValue(plugin.settings.autoHideTabBarWhenSingleTab).onChange( (value: boolean) => {
          plugin.settings.autoHideTabBarWhenSingleTab = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });

  focusGroup.addSetting((setting) => {
    setting
      .setName('Deemphasize properties')
      .setDesc('Softens visual prominence of file properties. They become more visible on hover.')
      .addToggle((toggle) => {
        toggle.setValue(plugin.settings.deemphasizeProperties).onChange( (value: boolean) => {
          plugin.settings.deemphasizeProperties = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });
}
