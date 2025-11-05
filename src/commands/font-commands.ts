/**
 * Font size adjustment commands
 */

import { PluginContext } from '../types';
import { COMMAND_IDS, DEFAULTS } from '../constants';
import { setVaultConfig } from '../types/obsidian-extensions';

export function registerFontCommands(plugin: PluginContext): void {
  plugin.addCommand({
    id: COMMAND_IDS.INCREASE_FONT,
    name: 'Increase body font size',
    callback: () => {
      plugin.settings.textNormal += DEFAULTS.FONT_STEP;
      void plugin.saveData(plugin.settings);
      setFontSize(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.DECREASE_FONT,
    name: 'Decrease body font size',
    callback: () => {
      plugin.settings.textNormal -= DEFAULTS.FONT_STEP;
      void plugin.saveData(plugin.settings);
      setFontSize(plugin);
    }
  });
}

function setFontSize(plugin: PluginContext): void {
  setVaultConfig(plugin.app, 'baseFontSize', plugin.settings.textNormal);
  // @ts-ignore - updateFontSize is an internal Obsidian API
  plugin.app.updateFontSize();
}

