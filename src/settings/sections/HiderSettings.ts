/**
 * Focus settings section
 * Focus and distraction-free writing features
 * Note: Most UI hiding features have been moved to UI Tweaker plugin
 */

import { Setting } from 'obsidian';
import MinimalTheme from '../../main';
import { createSettingsGroup } from '../../utils/settings-compat';

export function buildHiderSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  const focusGroup = createSettingsGroup(containerEl, 'Focus');

  focusGroup.addSetting((setting) =>
    setting
      .setName('Focus mode')
      .setDesc('Hide tab bar and status bar, hover to display. Can be toggled via hotkey.')
      .addToggle((toggle) =>
        toggle.setValue(plugin.settings.focusMode).onChange(async (value: boolean) => {
          plugin.settings.focusMode = value;
          await plugin.saveData(plugin.settings);
          plugin.refresh();
        })
      )
  );

  focusGroup.addSetting((setting) =>
    setting
      .setName('Auto-hide tab bar when single tab')
      .setDesc('Hide the tab bar automatically when only 1 tab is open. Inspired by Meridian Theme.')
      .addToggle((toggle) =>
        toggle.setValue(plugin.settings.autoHideTabBarWhenSingleTab).onChange(async (value: boolean) => {
          plugin.settings.autoHideTabBarWhenSingleTab = value;
          await plugin.saveData(plugin.settings);
          plugin.refresh();
        })
      )
  );

  focusGroup.addSetting((setting) =>
    setting
      .setName('Deemphasize properties')
      .setDesc('Softens visual prominence of file properties. They become more visible on hover.')
      .addToggle((toggle) =>
        toggle.setValue(plugin.settings.deemphasizeProperties).onChange(async (value: boolean) => {
          plugin.settings.deemphasizeProperties = value;
          await plugin.saveData(plugin.settings);
          plugin.refresh();
        })
      )
  );
}
