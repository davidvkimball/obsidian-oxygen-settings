/**
 * Feature toggle commands (borders, headings, focus mode, etc.)
 */

import { App } from 'obsidian';
import { PluginContext } from '../types';
import { COMMAND_IDS } from '../constants';
import { getVaultConfig, setTheme, setVaultConfig } from '../types/obsidian-extensions';

export function registerFeatureCommands(plugin: PluginContext): void {
  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_BORDERS,
    name: 'Toggle sidebar borders',
    callback: () => {
      // Cycle through: enhanced -> default -> none -> enhanced
      const current = plugin.settings.workspaceBorders;
      if (current === 'enhanced') {
        plugin.settings.workspaceBorders = 'default';
      } else if (current === 'default') {
        plugin.settings.workspaceBorders = 'none';
      } else {
        plugin.settings.workspaceBorders = 'enhanced';
      }
      void plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_COLORFUL_HEADINGS,
    name: 'Toggle colorful headings',
    callback: () => {
      plugin.settings.colorfulHeadings = !plugin.settings.colorfulHeadings;
      void plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_COLORFUL_FRAME,
    name: 'Toggle colorful window frame',
    callback: () => {
      plugin.settings.colorfulFrame = !plugin.settings.colorfulFrame;
      void plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_IMAGE_GRID,
    name: 'Toggle image grids',
    callback: () => {
      plugin.settings.imgGrid = !plugin.settings.imgGrid;
      void plugin.saveData(plugin.settings);
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
    name: 'Dev — show block widths',
    callback: () => {
      plugin.settings.devBlockWidth = !plugin.settings.devBlockWidth;
      void plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });


  // Open settings command
  plugin.addCommand({
    id: COMMAND_IDS.OPEN_SETTINGS,
    name: 'Open settings',
    icon: 'settings-2',
    callback: () => {
      // Open settings and navigate to this plugin's tab
      // Using type-safe access to internal Obsidian API
      const appWithSettings = plugin.app as App & {
        setting: {
          open: () => void;
          openTabById: (id: string) => void;
        };
      };
      appWithSettings.setting.open();
      appWithSettings.setting.openTabById(plugin.manifest.id);
    }
  });
}

function refresh(plugin: PluginContext): void {
  plugin.updateStyle();
}

function updateTheme(plugin: PluginContext): void {
  // Only apply styles if Oxygen theme is active
  if (!plugin.isOxygenThemeActive()) {
    return;
  }
  
  const theme = getVaultConfig(plugin.app, 'theme');
  
  if (theme === 'system') {
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

    const currentTheme = getVaultConfig(plugin.app, 'theme');
    const newTheme = currentTheme === 'moonstone' ? 'obsidian' : 'moonstone';
    setTheme(plugin.app, newTheme);
    setVaultConfig(plugin.app, 'theme', newTheme);
  }
  plugin.app.workspace.trigger('css-change');
}

