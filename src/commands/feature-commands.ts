/**
 * Feature toggle commands (borders, headings, focus mode, etc.)
 */

import { PluginContext } from '../types';
import { COMMAND_IDS } from '../constants';

export function registerFeatureCommands(plugin: PluginContext): void {
  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_BORDERS,
    name: 'Toggle sidebar borders',
    callback: () => {
      plugin.settings.bordersToggle = !plugin.settings.bordersToggle;
      plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_COLORFUL_HEADINGS,
    name: 'Toggle colorful headings',
    callback: () => {
      plugin.settings.colorfulHeadings = !plugin.settings.colorfulHeadings;
      plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_FOCUS_MODE,
    name: 'Toggle focus mode',
    callback: () => {
      plugin.settings.focusMode = !plugin.settings.focusMode;
      plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_COLORFUL_FRAME,
    name: 'Toggle colorful window frame',
    callback: () => {
      plugin.settings.colorfulFrame = !plugin.settings.colorfulFrame;
      plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_IMAGE_GRID,
    name: 'Toggle image grids',
    callback: () => {
      plugin.settings.imgGrid = !plugin.settings.imgGrid;
      plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_THEME,
    name: 'Switch between light and dark mode',
    callback: () => {
      updateTheme(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.DEV_BLOCK_WIDTH,
    name: 'Dev — Show block widths',
    callback: () => {
      plugin.settings.devBlockWidth = !plugin.settings.devBlockWidth;
      plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });
}

function refresh(plugin: PluginContext): void {
  // Delegate to style manager (will be implemented)
  if ('updateStyle' in plugin) {
    (plugin as any).updateStyle();
  }
}

function updateTheme(plugin: PluginContext): void {
  // Only apply styles if Oxygen theme is active
  if (!plugin.isOxygenThemeActive()) {
    return;
  }
  
  const app = plugin.app as any;
  
  if (app.vault.getConfig('theme') === 'system') {
    if (document.body.classList.contains('theme-light')) {
      document.body.removeClass('theme-light');
      document.body.addClass('theme-dark');
    } else {
      document.body.removeClass('theme-dark');
      document.body.addClass('theme-light');
    }
  } else {
    if (document.body.classList.contains('theme-light')) {
      document.body.removeClass('theme-light');
      document.body.addClass('theme-dark');
    } else {
      document.body.removeClass('theme-dark');
      document.body.addClass('theme-light');
    }

    const currentTheme = app.vault.getConfig('theme');
    const newTheme = currentTheme === 'moonstone' ? 'obsidian' : 'moonstone';
    app.setTheme(newTheme);
    app.vault.setConfig('theme', newTheme);
  }
  plugin.app.workspace.trigger('css-change');
}

