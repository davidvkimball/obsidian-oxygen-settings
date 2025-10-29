/**
 * Font size adjustment commands
 */

import { PluginContext } from '../types';
import { COMMAND_IDS, DEFAULTS } from '../constants';

export function registerFontCommands(plugin: PluginContext): void {
  plugin.addCommand({
    id: COMMAND_IDS.INCREASE_FONT,
    name: 'Increase body font size',
    callback: () => {
      plugin.settings.textNormal += DEFAULTS.FONT_STEP;
      plugin.saveData(plugin.settings);
      setFontSize(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.DECREASE_FONT,
    name: 'Decrease body font size',
    callback: () => {
      plugin.settings.textNormal -= DEFAULTS.FONT_STEP;
      plugin.saveData(plugin.settings);
      setFontSize(plugin);
    }
  });
}

function setFontSize(plugin: PluginContext): void {
  const app = plugin.app as any;
  app.vault.setConfig('baseFontSize', plugin.settings.textNormal);
  app.updateFontSize();
}

