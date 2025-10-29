/**
 * Custom presets settings section
 * Enable/disable, create, import, list, edit, export, delete presets
 */

import { Setting, App } from 'obsidian';
import MinimalTheme from '../../main';
import { CustomColorPreset } from '../../presets/CustomPreset';
import { PresetManager } from '../../presets/PresetManager';
import { PresetEditorModal } from '../../modals/PresetEditorModal';
import { PresetImportModal } from '../../modals/PresetImportModal';
import { ConfirmationModal } from '../../modals/ConfirmationModal';
import { generateColorSwatch } from '../../utils/color-utils';

export function buildCustomPresetSettings(
  containerEl: HTMLElement, 
  plugin: MinimalTheme,
  app: App,
  refreshCallback: () => void
): void {
  // Enable/Disable Custom Presets
  new Setting(containerEl)
    .setName('Enable custom presets')
    .setDesc('Allow creation and use of custom color presets')
    .addToggle(toggle => toggle
      .setValue(plugin.settings.enableCustomPresets)
      .onChange(async (value) => {
        plugin.settings.enableCustomPresets = value;
        
        // If disabling, reset any active custom preset schemes to default
        if (!value) {
          let needsUpdate = false;
          
          if (plugin.settings.lightScheme.startsWith('minimal-custom-')) {
            plugin.settings.lightScheme = 'minimal-oxygen-light';
            needsUpdate = true;
          }
          
          if (plugin.settings.darkScheme.startsWith('minimal-custom-')) {
            plugin.settings.darkScheme = 'minimal-oxygen-dark';
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            plugin.updateStyle();
            plugin.updateCustomPresetCSS();
          }
        }
        
        await plugin.saveData(plugin.settings);
        refreshCallback(); // Refresh the settings tab
      }));

  if (!plugin.settings.enableCustomPresets) {
    return;
  }

  // Action buttons
  new Setting(containerEl)
    .setName('Create new preset')
    .setDesc('Design a custom color scheme from scratch')
    .addExtraButton(button => button
      .setIcon('plus')
      .setTooltip('Create new preset')
      .onClick(() => openPresetEditor(app, plugin, null, refreshCallback)));

  new Setting(containerEl)
    .setName('Import preset')
    .setDesc('Import a preset from JSON data')
    .addExtraButton(button => button
      .setIcon('download')
      .setTooltip('Import preset')
      .onClick(() => openPresetImporter(app, plugin, refreshCallback)));

  // Presets list
  if (plugin.settings.customPresets.length > 0) {
    const presetsList = containerEl.createEl('div', { cls: 'custom-presets-list' });

    plugin.settings.customPresets
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(preset => {
        addPresetListItem(presetsList, preset, app, plugin, refreshCallback);
      });
  } else {
    const emptyState = containerEl.createEl('div', { cls: 'custom-presets-empty' });
    emptyState.createEl('p', { 
      text: 'No custom presets yet. Create your first preset to get started!',
      cls: 'empty-message'
    });
  }
}

function addPresetListItem(
  container: HTMLElement, 
  preset: CustomColorPreset,
  app: App,
  plugin: MinimalTheme,
  refreshCallback: () => void
): void {
  const presetItem = container.createEl('div', { cls: 'custom-preset-item' });
  
  // Preset info
  const presetInfo = presetItem.createEl('div', { cls: 'preset-info' });
  
  // Color swatch
  const swatch = generateColorSwatch(preset);
  presetInfo.appendChild(swatch);
  
  // Preset details
  const details = presetInfo.createEl('div', { cls: 'preset-details' });
  details.createEl('div', { text: preset.name, cls: 'preset-name' });
  
  if (preset.author) {
    details.createEl('div', { text: `by ${preset.author}`, cls: 'preset-author' });
  }
  
  const idSpan = details.createEl('div', { text: preset.id, cls: 'preset-id' });
  idSpan.style.fontSize = '0.8rem';
  idSpan.style.color = 'var(--text-muted)';
  idSpan.style.fontFamily = 'monospace';

  // Action buttons using proper Obsidian API
  new Setting(presetItem)
    .setName('')
    .setDesc('')
    .addExtraButton(button => button
      .setIcon('edit')
      .setTooltip('Edit preset')
      .onClick(() => openPresetEditor(app, plugin, preset, refreshCallback)))
    .addExtraButton(button => button
      .setIcon('download')
      .setTooltip('Export preset')
      .onClick(() => exportPreset(preset)))
    .addExtraButton(button => button
      .setIcon('trash')
      .setTooltip('Delete preset')
      .onClick(async () => await deletePreset(app, plugin, preset, refreshCallback)));
}

function openPresetEditor(
  app: App,
  plugin: MinimalTheme,
  preset: CustomColorPreset | null,
  refreshCallback: () => void
): void {
  const modal = new PresetEditorModal(app, plugin, preset, (updatedPreset) => {
    if (preset) {
      // Update existing preset
      const index = plugin.settings.customPresets.findIndex(p => p.id === preset.id);
      if (index !== -1) {
        plugin.settings.customPresets[index] = updatedPreset;
      }
    } else {
      // Add new preset
      plugin.settings.customPresets.push(updatedPreset);
    }
    
    plugin.saveData(plugin.settings);
    
    // Update styles if this preset is currently active
    const presetSchemeId = `minimal-custom-${updatedPreset.id}`;
    if (plugin.settings.lightScheme === presetSchemeId || plugin.settings.darkScheme === presetSchemeId) {
      plugin.updateStyle();
      plugin.updateCustomPresetCSS();
    }
    
    refreshCallback(); // Refresh the settings tab
  });
  modal.open();
}

function openPresetImporter(
  app: App,
  plugin: MinimalTheme,
  refreshCallback: () => void
): void {
  const modal = new PresetImportModal(app, plugin, (importedPreset) => {
    plugin.settings.customPresets.push(importedPreset);
    plugin.saveData(plugin.settings);
    refreshCallback(); // Refresh the settings tab
  });
  modal.open();
}

function exportPreset(preset: CustomColorPreset): void {
  const json = PresetManager.exportPresetAsJSON(preset);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${preset.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function deletePreset(
  app: App,
  plugin: MinimalTheme,
  preset: CustomColorPreset,
  refreshCallback: () => void
): Promise<void> {
  // Check if preset is currently active
  const isActive = PresetManager.isPresetActive(
    preset.id, 
    plugin.settings.lightScheme, 
    plugin.settings.darkScheme
  );
  
  if (isActive) {
    // Show warning modal
    const confirmed = await ConfirmationModal.show(
      app,
      'Delete Active Preset',
      'This preset is currently active. Deleting it will switch to the default scheme. Continue?',
      'Delete'
    );
    
    if (!confirmed) {
      return;
    }
    
    // Switch to default schemes
    if (plugin.settings.lightScheme === `minimal-custom-${preset.id}`) {
      plugin.settings.lightScheme = 'minimal-oxygen-light';
    }
    if (plugin.settings.darkScheme === `minimal-custom-${preset.id}`) {
      plugin.settings.darkScheme = 'minimal-oxygen-dark';
    }
  }
  
  // Remove preset from settings
  plugin.settings.customPresets = plugin.settings.customPresets.filter(p => p.id !== preset.id);
  await plugin.saveData(plugin.settings);
  
  // Update styles
  plugin.updateStyle();
  plugin.updateCustomPresetCSS();
  
  refreshCallback(); // Refresh the settings tab
}

