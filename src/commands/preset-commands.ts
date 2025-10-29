/**
 * Custom preset commands (create, import, cycle)
 */

import { PluginContext } from '../types';
import { COMMAND_IDS } from '../constants';
import { PresetEditorModal } from '../modals/PresetEditorModal';
import { PresetImportModal } from '../modals/PresetImportModal';

export function registerPresetCommands(plugin: PluginContext): void {
  plugin.addCommand({
    id: COMMAND_IDS.CREATE_PRESET,
    name: 'Create custom color preset',
    callback: () => {
      const modal = new PresetEditorModal(plugin.app, plugin, null, (preset) => {
        plugin.settings.customPresets.push(preset);
        plugin.saveData(plugin.settings);
      });
      modal.open();
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.IMPORT_PRESET,
    name: 'Import custom color preset',
    callback: () => {
      const modal = new PresetImportModal(plugin.app, plugin, (preset) => {
        plugin.settings.customPresets.push(preset);
        plugin.saveData(plugin.settings);
      });
      modal.open();
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.CYCLE_PRESETS_LIGHT,
    name: 'Cycle through custom presets (light mode)',
    callback: () => {
      if (plugin.settings.customPresets.length === 0) return;
      
      const currentIndex = plugin.settings.customPresets.findIndex(p => 
        plugin.settings.lightScheme === `minimal-custom-${p.id}`
      );
      const nextIndex = (currentIndex + 1) % plugin.settings.customPresets.length;
      const nextPreset = plugin.settings.customPresets[nextIndex];
      
      plugin.settings.lightScheme = `minimal-custom-${nextPreset.id}`;
      plugin.saveData(plugin.settings);
      updateLightScheme(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.CYCLE_PRESETS_DARK,
    name: 'Cycle through custom presets (dark mode)',
    callback: () => {
      if (plugin.settings.customPresets.length === 0) return;
      
      const currentIndex = plugin.settings.customPresets.findIndex(p => 
        plugin.settings.darkScheme === `minimal-custom-${p.id}`
      );
      const nextIndex = (currentIndex + 1) % plugin.settings.customPresets.length;
      const nextPreset = plugin.settings.customPresets[nextIndex];
      
      plugin.settings.darkScheme = `minimal-custom-${nextPreset.id}`;
      plugin.saveData(plugin.settings);
      updateDarkScheme(plugin);
    }
  });
}

function updateLightScheme(plugin: PluginContext): void {
  // Delegate to style manager (will be properly implemented in refactor)
  if ('updateLightScheme' in plugin) {
    (plugin as any).updateLightScheme();
  }
}

function updateDarkScheme(plugin: PluginContext): void {
  // Delegate to style manager (will be properly implemented in refactor)
  if ('updateDarkScheme' in plugin) {
    (plugin as any).updateDarkScheme();
  }
}

