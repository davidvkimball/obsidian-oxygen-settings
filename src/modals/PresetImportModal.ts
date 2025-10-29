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
        text.setPlaceholder('Paste JSON preset data here...')
          .onChange(value => this.parseJSON(value));
        
        // Style the textarea
        this.textArea.style.height = '200px';
        this.textArea.style.fontFamily = 'monospace';
        this.textArea.style.fontSize = '0.9rem';
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
    const errorSection = contentEl.createEl('div', { cls: 'modal-section error-section' });
    errorSection.style.display = 'none';
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

    // Add CSS styles
    this.addStyles();
  }

  private parseJSON(jsonString: string) {
    const errorSection = this.contentEl.querySelector('.error-section') as HTMLElement;
    const errorMessage = this.contentEl.querySelector('.error-message') as HTMLElement;
    
    // Clear previous state
    this.parsedPreset = null;
    this.importButton.disabled = true;
    errorSection.style.display = 'none';
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
      errorSection.style.display = 'block';
      
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
    const preview = this.previewContainer.createEl('div', { cls: 'color-preview' });
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
    const details = this.previewContainer.createEl('div', { cls: 'color-details' });
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

  private addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .preset-import-modal .modal-content {
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .modal-section {
        margin-bottom: 1.5rem;
      }
      
      .preview-container {
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 1rem;
        background: var(--background-primary);
        min-height: 200px;
      }
      
      .preview-placeholder,
      .preview-error {
        color: var(--text-muted);
        font-style: italic;
        text-align: center;
        margin: 2rem 0;
      }
      
      .preview-error {
        color: var(--text-error);
      }
      
      .error-section {
        background: var(--background-modifier-error);
        border: 1px solid var(--text-error);
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 1rem;
      }
      
      .error-message {
        color: var(--text-error);
        font-weight: 500;
      }
      
      .preset-info {
        margin-bottom: 1rem;
      }
      
      .info-row {
        margin-bottom: 0.5rem;
      }
      
      .preset-id {
        font-family: monospace;
        background: var(--background-secondary);
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-size: 0.9rem;
      }
      
      .color-preview {
        margin-bottom: 1rem;
      }
      
      .mode-toggle {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid var(--background-modifier-border);
      }
      
      .mode-btn {
        background: none;
        border: none;
        padding: 0.5rem 1rem;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        color: var(--text-muted);
        font-size: 0.9rem;
        transition: color 0.2s ease;
      }
      
      .mode-btn:hover {
        color: var(--text-normal);
      }
      
      .mode-btn.active {
        color: var(--text-normal);
        border-bottom-color: var(--text-accent);
        font-weight: 500;
      }
      
      .swatch-container {
        margin-top: 0.5rem;
      }
      
      .mode-swatches {
        display: none;
        gap: 1rem;
        margin-top: 0.5rem;
      }
      
      .mode-swatches.active {
        display: flex;
      }
      
      .color-swatch {
        width: 3rem;
        height: 3rem;
        border-radius: 6px;
        border: 1px solid var(--background-modifier-border);
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      
      .color-swatch:hover {
        transform: scale(1.05);
      }
      
      .color-details {
        margin-top: 1rem;
      }
      
      .mode-details {
        margin-bottom: 1rem;
      }
      
      .mode-details h5 {
        margin: 0 0 0.5rem 0;
        color: var(--text-normal);
      }
      
      .color-detail {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        font-family: monospace;
        font-size: 0.9rem;
      }
      
      .detail-swatch {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 3px;
        border: 1px solid var(--background-modifier-border);
        flex-shrink: 0;
      }
      
      .color-detail span:first-child {
        color: var(--text-muted);
        min-width: 3rem;
      }
      
      .overrides-info {
        margin-top: 1rem;
        padding: 0.5rem;
        background: var(--background-secondary);
        border-radius: 3px;
        font-size: 0.9rem;
        color: var(--text-muted);
      }
    `;
    document.head.appendChild(style);
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
