/**
 * Color scheme switching commands
 * Generates commands for all built-in light and dark schemes
 */

import { PluginContext } from '../types';
import { LIGHT_SCHEMES, DARK_SCHEMES, SCHEME_DISPLAY_NAMES } from '../constants';

export function registerSchemeCommands(plugin: PluginContext): void {
  // Register light scheme commands
  LIGHT_SCHEMES.forEach(scheme => {
    const schemeName = SCHEME_DISPLAY_NAMES[scheme] || scheme;
    const commandId = `toggle-${scheme}`;
    
    plugin.addCommand({
      id: commandId,
      name: `Switch light color scheme to ${schemeName} (light)`,
      callback: () => {
        plugin.settings.lightScheme = scheme;
        plugin.saveData(plugin.settings);
        updateLightScheme(plugin);
        updateLightStyle(plugin);
      }
    });
  });

  // Register dark scheme commands
  DARK_SCHEMES.forEach(scheme => {
    const schemeName = SCHEME_DISPLAY_NAMES[scheme] || scheme;
    const commandId = `toggle-${scheme}`;
    
    plugin.addCommand({
      id: commandId,
      name: `Switch dark color scheme to ${schemeName} (dark)`,
      callback: () => {
        plugin.settings.darkScheme = scheme;
        plugin.saveData(plugin.settings);
        updateDarkScheme(plugin);
        updateDarkStyle(plugin);
      }
    });
  });
}

function updateLightScheme(plugin: PluginContext): void {
  removeLightScheme(plugin);
  removeDarkScheme(plugin);
  
  if (!document.body.classList.contains('theme-light')) {
    document.body.removeClass('theme-dark');
    document.body.addClass('theme-light');
  }
  
  document.body.addClass(plugin.settings.lightScheme);
}

function updateDarkScheme(plugin: PluginContext): void {
  removeDarkScheme(plugin);
  removeLightScheme(plugin);
  
  if (!document.body.classList.contains('theme-dark')) {
    document.body.removeClass('theme-light');
    document.body.addClass('theme-dark');
  }
  
  document.body.addClass(plugin.settings.darkScheme);
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

function removeLightScheme(plugin: PluginContext): void {
  document.body.removeClass(...LIGHT_SCHEMES);
  
  // Remove custom preset classes
  plugin.settings.customPresets.forEach(preset => {
    document.body.removeClass(`minimal-custom-${preset.id}`);
  });
}

function removeDarkScheme(plugin: PluginContext): void {
  document.body.removeClass(...DARK_SCHEMES);
  
  // Remove custom preset classes
  plugin.settings.customPresets.forEach(preset => {
    document.body.removeClass(`minimal-custom-${preset.id}`);
  });
}

