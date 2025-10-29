/**
 * Light/Dark style cycling commands
 */

import { PluginContext } from '../types';
import { COMMAND_IDS, LIGHT_STYLES, DARK_STYLES } from '../constants';

export function registerStyleCommands(plugin: PluginContext): void {
  // Cycle dark styles
  plugin.addCommand({
    id: COMMAND_IDS.CYCLE_DARK_STYLE,
    name: 'Cycle between dark mode styles',
    callback: () => {
      const currentIndex = DARK_STYLES.indexOf(plugin.settings.darkStyle as any);
      const nextIndex = (currentIndex + 1) % DARK_STYLES.length;
      plugin.settings.darkStyle = DARK_STYLES[nextIndex];
      plugin.saveData(plugin.settings);
      updateDarkStyle(plugin);
    }
  });

  // Cycle light styles
  plugin.addCommand({
    id: COMMAND_IDS.CYCLE_LIGHT_STYLE,
    name: 'Cycle between light mode styles',
    callback: () => {
      const currentIndex = LIGHT_STYLES.indexOf(plugin.settings.lightStyle as any);
      const nextIndex = (currentIndex + 1) % LIGHT_STYLES.length;
      plugin.settings.lightStyle = LIGHT_STYLES[nextIndex];
      plugin.saveData(plugin.settings);
      updateLightStyle(plugin);
    }
  });

  // Individual light style commands
  plugin.addCommand({
    id: COMMAND_IDS.LIGHT_DEFAULT,
    name: 'Use light mode (default)',
    callback: () => {
      plugin.settings.lightStyle = 'minimal-light';
      plugin.saveData(plugin.settings);
      updateLightStyle(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.LIGHT_WHITE,
    name: 'Use light mode (all white)',
    callback: () => {
      plugin.settings.lightStyle = 'minimal-light-white';
      plugin.saveData(plugin.settings);
      updateLightStyle(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.LIGHT_TONAL,
    name: 'Use light mode (low contrast)',
    callback: () => {
      plugin.settings.lightStyle = 'minimal-light-tonal';
      plugin.saveData(plugin.settings);
      updateLightStyle(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.LIGHT_CONTRAST,
    name: 'Use light mode (high contrast)',
    callback: () => {
      plugin.settings.lightStyle = 'minimal-light-contrast';
      plugin.saveData(plugin.settings);
      updateLightStyle(plugin);
    }
  });

  // Individual dark style commands
  plugin.addCommand({
    id: COMMAND_IDS.DARK_DEFAULT,
    name: 'Use dark mode (default)',
    callback: () => {
      plugin.settings.darkStyle = 'minimal-dark';
      plugin.saveData(plugin.settings);
      updateDarkStyle(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.DARK_TONAL,
    name: 'Use dark mode (low contrast)',
    callback: () => {
      plugin.settings.darkStyle = 'minimal-dark-tonal';
      plugin.saveData(plugin.settings);
      updateDarkStyle(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.DARK_BLACK,
    name: 'Use dark mode (true black)',
    callback: () => {
      plugin.settings.darkStyle = 'minimal-dark-black';
      plugin.saveData(plugin.settings);
      updateDarkStyle(plugin);
    }
  });
}

function updateLightStyle(plugin: PluginContext): void {
  // Only apply styles if Oxygen theme is active
  if (!plugin.isOxygenThemeActive()) {
    return;
  }
  
  document.body.removeClass(
    'theme-dark',
    'minimal-light',
    'minimal-light-tonal',
    'minimal-light-contrast',
    'minimal-light-white'
  );
  document.body.addClass('theme-light', plugin.settings.lightStyle);
  
  const app = plugin.app as any;
  if (app.vault.getConfig('theme') !== 'system') {
    app.setTheme('moonstone');
    app.vault.setConfig('theme', 'moonstone');
  }
  plugin.app.workspace.trigger('css-change');
}

function updateDarkStyle(plugin: PluginContext): void {
  // Only apply styles if Oxygen theme is active
  if (!plugin.isOxygenThemeActive()) {
    return;
  }
  
  document.body.removeClass(
    'theme-light',
    'minimal-dark',
    'minimal-dark-tonal',
    'minimal-dark-black'
  );
  document.body.addClass('theme-dark', plugin.settings.darkStyle);
  
  const app = plugin.app as any;
  if (app.vault.getConfig('theme') !== 'system') {
    app.setTheme('obsidian');
    app.vault.setConfig('theme', 'obsidian');
  }
  plugin.app.workspace.trigger('css-change');
}

