/**
 * Modal for importing custom color presets from JSON
 */

import { Modal, Setting, App } from 'obsidian';
import { CustomColorPreset } from '../presets/CustomPreset';
import { PresetManager } from '../presets/PresetManager';
import { generateColorSwatch } from '../utils/color-utils';
import MinimalTheme from '../main';

export class PresetImportModal extends Modal {
  private onImport: (preset: CustomColorPreset) => void;
  private plugin: MinimalTheme;
  private textArea: HTMLTextAreaElement;
  private previewContainer: HTMLElement;
  private importButton: HTMLButtonElement;
  private parsedPreset: CustomColorPreset | null = null;

  constructor(
    app: App, 
    plugin: MinimalTheme,
    onImport: (preset: CustomColorPreset) => void
  ) {
    super(app);
    this.plugin = plugin;
    this.onImport = onImport;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('preset-import-modal');

    // Header
    const header = contentEl.createEl('div', { cls: 'modal-header' });
    header.createEl('h2', { text: 'Import Custom Preset' });

    // Instructions
    const instructions = contentEl.createEl('div', { cls: 'modal-section' });
    instructions.createEl('p', { 
      text: 'Paste a JSON preset below. You can export presets from this plugin or create them manually following the correct format.' 
    });

    // JSON input area
    const inputSection = contentEl.createEl('div', { cls: 'modal-section' });
    inputSection.createEl('h3', { text: 'JSON Preset Data' });

    new Setting(inputSection)
      .setName('Preset JSON')
      .setDesc('Paste the complete JSON preset data here')
      .addTextArea(text => {
        this.textArea = text.inputEl;
        this.textArea.addClass('preset-json-input');
        text.setPlaceholder('Paste JSON preset data here...')
          .onChange(value => this.parseJSON(value));
      });

    // Preview section
    const previewSection = contentEl.createEl('div', { cls: 'modal-section' });
    previewSection.createEl('h3', { text: 'Preview' });
    this.previewContainer = previewSection.createEl('div', { cls: 'preview-container' });
    this.previewContainer.createEl('p', { 
      text: 'Enter valid JSON to see a preview of the preset',
      cls: 'preview-placeholder'
    });

    // Error display
    const errorSection = contentEl.createEl('div', { cls: 'modal-section error-section hidden' });
    errorSection.createEl('div', { cls: 'error-message' });

    // Footer buttons
    const footer = contentEl.createEl('div', { cls: 'modal-footer' });
    
    const cancelBtn = footer.createEl('button', { text: 'Cancel', cls: 'mod-cta' });
    cancelBtn.onclick = () => this.close();
    
    this.importButton = footer.createEl('button', { 
      text: 'Import Preset', 
      cls: 'mod-cta' 
    });
    this.importButton.disabled = true;
    this.importButton.onclick = () => this.importPreset();
  }

  private parseJSON(jsonString: string) {
    const errorSection = this.contentEl.querySelector('.error-section') as HTMLElement;
    const errorMessage = this.contentEl.querySelector('.error-message') as HTMLElement;
    
    // Clear previous state
    this.parsedPreset = null;
    this.importButton.disabled = true;
    errorSection.addClass('hidden');
    this.previewContainer.empty();

    if (!jsonString.trim()) {
      this.previewContainer.createEl('p', { 
        text: 'Enter valid JSON to see a preview of the preset',
        cls: 'preview-placeholder'
      });
      return;
    }

    try {
      // Parse and validate the JSON
      this.parsedPreset = PresetManager.importPresetFromJSON(jsonString);
      
      // Check for ID conflicts
      const existingPreset = this.plugin.settings.customPresets.find(p => p.id === this.parsedPreset!.id);
      if (existingPreset) {
        throw new Error(`A preset with ID "${this.parsedPreset.id}" already exists. Please rename the preset.`);
      }

      // Show preview
      this.showPreview(this.parsedPreset);
      this.importButton.disabled = false;

    } catch (error) {
      // Show error
      errorMessage.textContent = error instanceof Error ? error.message : 'Invalid JSON format';
      errorSection.removeClass('hidden');
      
      this.previewContainer.createEl('p', { 
        text: 'Fix the JSON errors above to see a preview',
        cls: 'preview-error'
      });
    }
  }

  private showPreview(preset: CustomColorPreset) {
    this.previewContainer.empty();

    // Preset info
    const info = this.previewContainer.createEl('div', { cls: 'preset-info' });
    
    const nameRow = info.createEl('div', { cls: 'info-row' });
    nameRow.createEl('strong', { text: 'Name: ' });
    nameRow.createEl('span', { text: preset.name });

    if (preset.author) {
      const authorRow = info.createEl('div', { cls: 'info-row' });
      authorRow.createEl('strong', { text: 'Author: ' });
      authorRow.createEl('span', { text: preset.author });
    }

    const versionRow = info.createEl('div', { cls: 'info-row' });
    versionRow.createEl('strong', { text: 'Version: ' });
    versionRow.createEl('span', { text: preset.version || '1.0.0' });

    const idRow = info.createEl('div', { cls: 'info-row' });
    idRow.createEl('strong', { text: 'ID: ' });
    idRow.createEl('span', { text: preset.id, cls: 'preset-id' });

    // Color preview section
    const preview = this.previewContainer.createEl('div', { cls: 'color-preview-section' });
    preview.createEl('h4', { text: 'Color Preview' });

    // Mode toggle
    const modeToggle = preview.createEl('div', { cls: 'mode-toggle' });
    const lightModeBtn = modeToggle.createEl('button', { 
      text: 'Light Mode', 
      cls: 'mode-btn active' 
    });
    const darkModeBtn = modeToggle.createEl('button', { 
      text: 'Dark Mode', 
      cls: 'mode-btn' 
    });

    // Color swatches container
    const swatchContainer = preview.createEl('div', { cls: 'swatch-container' });
    
    // Light mode swatches
    const lightSwatches = swatchContainer.createEl('div', { cls: 'mode-swatches active' });
    const lightBaseSwatchPreview = lightSwatches.createEl('div', { cls: 'color-swatch' });
    lightBaseSwatchPreview.style.backgroundColor = `hsl(${preset.light.base.h}, ${preset.light.base.s}%, ${preset.light.base.l}%)`;
    lightBaseSwatchPreview.title = `Base: hsl(${preset.light.base.h}, ${preset.light.base.s}%, ${preset.light.base.l}%)`;
    
    const lightAccentSwatchPreview = lightSwatches.createEl('div', { cls: 'color-swatch' });
    lightAccentSwatchPreview.style.backgroundColor = `hsl(${preset.light.accent.h}, ${preset.light.accent.s}%, ${preset.light.accent.l}%)`;
    lightAccentSwatchPreview.title = `Accent: hsl(${preset.light.accent.h}, ${preset.light.accent.s}%, ${preset.light.accent.l}%)`;

    // Dark mode swatches
    const darkSwatches = swatchContainer.createEl('div', { cls: 'mode-swatches' });
    const darkBaseSwatchPreview = darkSwatches.createEl('div', { cls: 'color-swatch' });
    darkBaseSwatchPreview.style.backgroundColor = `hsl(${preset.dark.base.h}, ${preset.dark.base.s}%, ${preset.dark.base.l}%)`;
    darkBaseSwatchPreview.title = `Base: hsl(${preset.dark.base.h}, ${preset.dark.base.s}%, ${preset.dark.base.l}%)`;
    
    const darkAccentSwatchPreview = darkSwatches.createEl('div', { cls: 'color-swatch' });
    darkAccentSwatchPreview.style.backgroundColor = `hsl(${preset.dark.accent.h}, ${preset.dark.accent.s}%, ${preset.dark.accent.l}%)`;
    darkAccentSwatchPreview.title = `Accent: hsl(${preset.dark.accent.h}, ${preset.dark.accent.s}%, ${preset.dark.accent.l}%)`;

    // Mode toggle functionality
    lightModeBtn.onclick = () => {
      lightModeBtn.classList.add('active');
      darkModeBtn.classList.remove('active');
      lightSwatches.classList.add('active');
      darkSwatches.classList.remove('active');
    };

    darkModeBtn.onclick = () => {
      darkModeBtn.classList.add('active');
      lightModeBtn.classList.remove('active');
      darkSwatches.classList.add('active');
      lightSwatches.classList.remove('active');
    };

    // Color details
    const details = this.previewContainer.createEl('div', { cls: 'color-details-section' });
    details.createEl('h4', { text: 'Color Values' });

    const lightDetails = details.createEl('div', { cls: 'mode-details' });
    lightDetails.createEl('h5', { text: 'Light Mode' });
    
    const lightBase = lightDetails.createEl('div', { cls: 'color-detail' });
    const lightBaseSwatchDetail = lightBase.createEl('div', { cls: 'detail-swatch' });
    lightBaseSwatchDetail.style.backgroundColor = `hsl(${preset.light.base.h}, ${preset.light.base.s}%, ${preset.light.base.l}%)`;
    lightBase.createEl('span', { text: 'Base: ' });
    lightBase.createEl('span', { text: `hsl(${preset.light.base.h}, ${preset.light.base.s}%, ${preset.light.base.l}%)` });
    
    const lightAccent = lightDetails.createEl('div', { cls: 'color-detail' });
    const lightAccentSwatchDetail = lightAccent.createEl('div', { cls: 'detail-swatch' });
    lightAccentSwatchDetail.style.backgroundColor = `hsl(${preset.light.accent.h}, ${preset.light.accent.s}%, ${preset.light.accent.l}%)`;
    lightAccent.createEl('span', { text: 'Accent: ' });
    lightAccent.createEl('span', { text: `hsl(${preset.light.accent.h}, ${preset.light.accent.s}%, ${preset.light.accent.l}%)` });

    const darkDetails = details.createEl('div', { cls: 'mode-details' });
    darkDetails.createEl('h5', { text: 'Dark Mode' });
    
    const darkBase = darkDetails.createEl('div', { cls: 'color-detail' });
    const darkBaseSwatchDetail = darkBase.createEl('div', { cls: 'detail-swatch' });
    darkBaseSwatchDetail.style.backgroundColor = `hsl(${preset.dark.base.h}, ${preset.dark.base.s}%, ${preset.dark.base.l}%)`;
    darkBase.createEl('span', { text: 'Base: ' });
    darkBase.createEl('span', { text: `hsl(${preset.dark.base.h}, ${preset.dark.base.s}%, ${preset.dark.base.l}%)` });
    
    const darkAccent = darkDetails.createEl('div', { cls: 'color-detail' });
    const darkAccentSwatchDetail = darkAccent.createEl('div', { cls: 'detail-swatch' });
    darkAccentSwatchDetail.style.backgroundColor = `hsl(${preset.dark.accent.h}, ${preset.dark.accent.s}%, ${preset.dark.accent.l}%)`;
    darkAccent.createEl('span', { text: 'Accent: ' });
    darkAccent.createEl('span', { text: `hsl(${preset.dark.accent.h}, ${preset.dark.accent.s}%, ${preset.dark.accent.l}%)` });

    // Show override count if any
    const lightOverrides = Object.keys(preset.light.colors || {}).length;
    const darkOverrides = Object.keys(preset.dark.colors || {}).length;
    
    if (lightOverrides > 0 || darkOverrides > 0) {
      const overridesInfo = this.previewContainer.createEl('div', { cls: 'overrides-info' });
      overridesInfo.createEl('p', { 
        text: `Custom overrides: ${lightOverrides} light mode, ${darkOverrides} dark mode` 
      });
    }
  }

  private importPreset() {
    if (this.parsedPreset) {
      this.onImport(this.parsedPreset);
      this.close();
    }
  }


  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
