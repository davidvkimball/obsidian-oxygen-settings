/**
 * Modal for creating and editing custom color presets
 */

import { Modal, Setting, App } from 'obsidian';
import { CustomColorPreset, ColorPalette, HSLColor, DEFAULT_COLOR_PALETTE } from '../presets/CustomPreset';
import { PresetManager } from '../presets/PresetManager';
import { hslToHex, hexToHSL, validateHex, formatHSL } from '../utils/color-utils';
import MinimalTheme from '../main';

export class PresetEditorModal extends Modal {
  private preset: CustomColorPreset;
  private isEditing: boolean;
  private onSave: (preset: CustomColorPreset) => void;
  private plugin: MinimalTheme;
  
  // Form elements
  private nameInput: HTMLInputElement;
  private authorInput: HTMLInputElement;
  private modeTabs: HTMLElement;
  private lightTab: HTMLElement;
  private darkTab: HTMLElement;
  private lightContent: HTMLElement;
  private darkContent: HTMLElement;
  private previewSwatch: HTMLElement;
  
  // Current editing mode
  private currentMode: 'light' | 'dark' = 'light';

  constructor(
    app: App, 
    plugin: MinimalTheme,
    preset: CustomColorPreset | null, 
    onSave: (preset: CustomColorPreset) => void
  ) {
    super(app);
    this.plugin = plugin;
    this.isEditing = preset !== null;
    this.preset = preset || this.createDefaultPreset();
    this.onSave = onSave;
  }

  private createDefaultPreset(): CustomColorPreset {
    return PresetManager.createPreset('New Preset', '', this.plugin.settings.customPresets);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('preset-editor-modal');

    // Header
    const header = contentEl.createEl('div', { cls: 'modal-header' });
    header.createEl('h2', { text: this.isEditing ? 'Edit Preset' : 'Create New Preset' });

    // Basic info section
    const basicInfo = contentEl.createEl('div', { cls: 'modal-section' });
    basicInfo.createEl('h3', { text: 'Basic Information' });

    new Setting(basicInfo)
      .setName('Preset name')
      .setDesc('A unique name for your color preset')
      .addText(text => {
        this.nameInput = text.inputEl;
        text.setValue(this.preset.name)
          .setPlaceholder('Enter preset name')
          .onChange(value => {
            this.preset.name = value;
            this.updatePreview();
          });
      });

    new Setting(basicInfo)
      .setName('Author (optional)')
      .setDesc('Your name or the creator of this preset')
      .addText(text => {
        this.authorInput = text.inputEl;
        text.setValue(this.preset.author || '')
          .setPlaceholder('Enter author name')
          .onChange(value => {
            this.preset.author = value;
          });
      });

    // Mode tabs
    const modeSection = contentEl.createEl('div', { cls: 'modal-section' });
    modeSection.createEl('h3', { text: 'Color Configuration' });
    
    this.modeTabs = modeSection.createEl('div', { cls: 'mode-tabs' });
    this.lightTab = this.modeTabs.createEl('button', { 
      text: 'Light Mode', 
      cls: 'mode-tab active' 
    });
    this.darkTab = this.modeTabs.createEl('button', { 
      text: 'Dark Mode', 
      cls: 'mode-tab' 
    });

    this.lightTab.onclick = () => this.switchMode('light');
    this.darkTab.onclick = () => this.switchMode('dark');

    // Content area
    const contentArea = contentEl.createEl('div', { cls: 'modal-content' });
    this.lightContent = contentArea.createEl('div', { cls: 'mode-content active' });
    this.darkContent = contentEl.createEl('div', { cls: 'mode-content' });

    this.buildModeContent(this.lightContent, 'light');
    this.buildModeContent(this.darkContent, 'dark');

    // Preview section
    const previewSection = contentEl.createEl('div', { cls: 'modal-section' });
    previewSection.createEl('h3', { text: 'Preview' });
    this.previewSwatch = previewSection.createEl('div', { cls: 'preview-swatch' });
    this.updatePreview();

    // Footer buttons
    const footer = contentEl.createEl('div', { cls: 'modal-footer' });
    
    const cancelBtn = footer.createEl('button', { text: 'Cancel', cls: 'mod-cta' });
    cancelBtn.onclick = () => this.close();
    
    const saveBtn = footer.createEl('button', { 
      text: this.isEditing ? 'Update' : 'Create', 
      cls: 'mod-cta' 
    });
    saveBtn.onclick = () => this.savePreset();

    // Add CSS styles
    this.addStyles();
  }

  private buildModeContent(container: HTMLElement, mode: 'light' | 'dark') {
    container.empty();
    const palette = mode === 'light' ? this.preset.light : this.preset.dark;

    // Required colors section
    const requiredSection = container.createEl('div', { cls: 'color-section' });
    requiredSection.createEl('h4', { text: 'Required Colors' });

    // Base color
    const baseSection = requiredSection.createEl('div', { cls: 'color-group' });
    baseSection.createEl('label', { text: 'Base Color' });
    this.createHSLControls(baseSection, palette.base, (hsl) => {
      palette.base = hsl;
      this.updatePreview();
    });

    // Accent color
    const accentSection = requiredSection.createEl('div', { cls: 'color-group' });
    accentSection.createEl('label', { text: 'Accent Color' });
    this.createHSLControls(accentSection, palette.accent, (hsl) => {
      palette.accent = hsl;
      this.updatePreview();
    });

    // Advanced overrides (collapsible)
    const advancedSection = container.createEl('div', { cls: 'color-section' });
    const advancedHeader = advancedSection.createEl('div', { cls: 'collapsible-header' });
    advancedHeader.createEl('h4', { text: 'Advanced Overrides (Optional)' });
    const advancedToggle = advancedHeader.createEl('button', { 
      text: '▼', 
      cls: 'collapse-toggle' 
    });
    
    const advancedContent = advancedSection.createEl('div', { cls: 'collapsible-content collapsed' });
    
    advancedToggle.onclick = () => {
      advancedContent.classList.toggle('collapsed');
      advancedToggle.textContent = advancedContent.classList.contains('collapsed') ? '▼' : '▲';
    };

    // Initialize colors object if not exists
    if (!palette.colors) {
      palette.colors = {};
    }

    // Background colors
    this.createColorOverride(advancedContent, 'Background 1', 'bg1', palette.colors);
    this.createColorOverride(advancedContent, 'Background 2', 'bg2', palette.colors);
    this.createColorOverride(advancedContent, 'Background 3', 'bg3', palette.colors);
    
    // UI colors
    this.createColorOverride(advancedContent, 'UI 1', 'ui1', palette.colors);
    this.createColorOverride(advancedContent, 'UI 2', 'ui2', palette.colors);
    this.createColorOverride(advancedContent, 'UI 3', 'ui3', palette.colors);
    
    // Text colors
    this.createColorOverride(advancedContent, 'Text 1', 'tx1', palette.colors);
    this.createColorOverride(advancedContent, 'Text 2', 'tx2', palette.colors);
    this.createColorOverride(advancedContent, 'Text 3', 'tx3', palette.colors);
    this.createColorOverride(advancedContent, 'Text 4', 'tx4', palette.colors);
    
    // Highlight colors
    this.createColorOverride(advancedContent, 'Highlight 1', 'hl1', palette.colors);
    this.createColorOverride(advancedContent, 'Highlight 2', 'hl2', palette.colors);

    // Syntax colors (collapsible)
    const syntaxSection = container.createEl('div', { cls: 'color-section' });
    const syntaxHeader = syntaxSection.createEl('div', { cls: 'collapsible-header' });
    syntaxHeader.createEl('h4', { text: 'Syntax Colors (Optional)' });
    const syntaxToggle = syntaxHeader.createEl('button', { 
      text: '▼', 
      cls: 'collapse-toggle' 
    });
    
    const syntaxContent = syntaxSection.createEl('div', { cls: 'collapsible-content collapsed' });
    
    syntaxToggle.onclick = () => {
      syntaxContent.classList.toggle('collapsed');
      syntaxToggle.textContent = syntaxContent.classList.contains('collapsed') ? '▼' : '▲';
    };

    const syntaxColors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'];
    syntaxColors.forEach(color => {
      this.createColorOverride(syntaxContent, color.charAt(0).toUpperCase() + color.slice(1), color, palette.colors);
    });
  }

  private createHSLControls(container: HTMLElement, hsl: HSLColor, onChange: (hsl: HSLColor) => void) {
    const controls = container.createEl('div', { cls: 'hsl-controls' });
    
    // Hue
    const hueControl = controls.createEl('div', { cls: 'hsl-control' });
    hueControl.createEl('label', { text: 'Hue' });
    const hueSlider = hueControl.createEl('input', { type: 'range' });
    hueSlider.min = '0';
    hueSlider.max = '360';
    const hueValue = hueControl.createEl('span', { text: hsl.h.toString() });
    hueSlider.value = hsl.h.toString();
    hueSlider.oninput = () => {
      hsl.h = parseInt(hueSlider.value);
      hueValue.textContent = hsl.h.toString();
      onChange(hsl);
    };

    // Saturation
    const satControl = controls.createEl('div', { cls: 'hsl-control' });
    satControl.createEl('label', { text: 'Saturation' });
    const satSlider = satControl.createEl('input', { type: 'range' });
    satSlider.min = '0';
    satSlider.max = '100';
    const satValue = satControl.createEl('span', { text: hsl.s.toString() });
    satSlider.value = hsl.s.toString();
    satSlider.oninput = () => {
      hsl.s = parseInt(satSlider.value);
      satValue.textContent = hsl.s.toString();
      onChange(hsl);
    };

    // Lightness
    const lightControl = controls.createEl('div', { cls: 'hsl-control' });
    lightControl.createEl('label', { text: 'Lightness' });
    const lightSlider = lightControl.createEl('input', { type: 'range' });
    lightSlider.min = '0';
    lightSlider.max = '100';
    const lightValue = lightControl.createEl('span', { text: hsl.l.toString() });
    lightSlider.value = hsl.l.toString();
    lightSlider.oninput = () => {
      hsl.l = parseInt(lightSlider.value);
      lightValue.textContent = hsl.l.toString();
      onChange(hsl);
    };

    // Color preview
    const preview = controls.createEl('div', { cls: 'color-preview' });
    preview.style.backgroundColor = hslToHex(hsl);
  }

  private createColorOverride(container: HTMLElement, label: string, key: string, colors: any) {
    const override = container.createEl('div', { cls: 'color-override' });
    
    const header = override.createEl('div', { cls: 'override-header' });
    const toggle = header.createEl('input', { type: 'checkbox' });
    header.createEl('label', { text: label });
    
    const colorInput = header.createEl('input', { type: 'color' });
    colorInput.disabled = true;
    
    if (colors[key]) {
      toggle.checked = true;
      colorInput.disabled = false;
      colorInput.value = colors[key];
    }
    
    toggle.onchange = () => {
      if (toggle.checked) {
        colorInput.disabled = false;
        if (!colors[key]) {
          colors[key] = '#000000';
        }
        colorInput.value = colors[key];
      } else {
        colorInput.disabled = true;
        delete colors[key];
      }
    };
    
    colorInput.onchange = () => {
      if (validateHex(colorInput.value)) {
        colors[key] = colorInput.value;
      }
    };
  }

  private switchMode(mode: 'light' | 'dark') {
    this.currentMode = mode;
    
    // Update tab appearance
    this.lightTab.classList.toggle('active', mode === 'light');
    this.darkTab.classList.toggle('active', mode === 'dark');
    
    // Update content visibility
    this.lightContent.classList.toggle('active', mode === 'light');
    this.darkContent.classList.toggle('active', mode === 'dark');
  }

  private updatePreview() {
    this.previewSwatch.empty();
    
    const lightHex = hslToHex(this.preset.light.base);
    const lightAccent = hslToHex(this.preset.light.accent);
    const darkHex = hslToHex(this.preset.dark.base);
    const darkAccent = hslToHex(this.preset.dark.accent);
    
    this.previewSwatch.innerHTML = `
      <div class="preview-row">
        <div class="preview-label">Light Mode</div>
        <div class="preview-colors">
          <div class="preview-color" style="background: ${lightHex}"></div>
          <div class="preview-color" style="background: ${lightAccent}"></div>
        </div>
      </div>
      <div class="preview-row">
        <div class="preview-label">Dark Mode</div>
        <div class="preview-colors">
          <div class="preview-color" style="background: ${darkHex}"></div>
          <div class="preview-color" style="background: ${darkAccent}"></div>
        </div>
      </div>
    `;
  }

  private savePreset() {
    try {
      // Validate preset
      if (!this.preset.name.trim()) {
        throw new Error('Preset name is required');
      }

      // Generate ID if creating new preset
      if (!this.isEditing) {
        this.preset.id = PresetManager.createPreset(
          this.preset.name, 
          this.preset.author || '', 
          this.plugin.settings.customPresets
        ).id;
      }

      this.onSave(this.preset);
      this.close();
    } catch (error) {
      console.error('Error saving preset:', error);
      // Could show error message to user here
    }
  }

  private addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .preset-editor-modal .modal-content {
        max-height: 70vh;
        overflow-y: auto;
      }
      
      .modal-section {
        margin-bottom: 1.5rem;
      }
      
      .mode-tabs {
        display: flex;
        border-bottom: 1px solid var(--background-modifier-border);
        margin-bottom: 1rem;
      }
      
      .mode-tab {
        background: none;
        border: none;
        padding: 0.5rem 1rem;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        color: var(--text-muted);
      }
      
      .mode-tab.active {
        color: var(--text-normal);
        border-bottom-color: var(--text-accent);
      }
      
      .mode-content {
        display: none;
      }
      
      .mode-content.active {
        display: block;
      }
      
      .color-section {
        margin-bottom: 1.5rem;
      }
      
      .color-group {
        margin-bottom: 1rem;
      }
      
      .color-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      
      .hsl-controls {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr auto;
        gap: 1rem;
        align-items: center;
      }
      
      .hsl-control {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .hsl-control label {
        font-size: 0.8rem;
        margin: 0;
      }
      
      .hsl-control input[type="range"] {
        width: 100%;
      }
      
      .hsl-control span {
        font-size: 0.8rem;
        color: var(--text-muted);
        min-width: 2rem;
        text-align: center;
      }
      
      .color-preview {
        width: 2rem;
        height: 2rem;
        border-radius: 3px;
        border: 1px solid var(--background-modifier-border);
      }
      
      .collapsible-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 0.5rem 0;
      }
      
      .collapse-toggle {
        background: none;
        border: none;
        font-size: 0.8rem;
        color: var(--text-muted);
        cursor: pointer;
      }
      
      .collapsible-content {
        transition: max-height 0.3s ease;
        overflow: hidden;
      }
      
      .collapsible-content.collapsed {
        max-height: 0;
      }
      
      .color-override {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      
      .override-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
      }
      
      .override-header input[type="color"] {
        width: 2rem;
        height: 1.5rem;
        border: 1px solid var(--background-modifier-border);
        border-radius: 3px;
      }
      
      .preview-swatch {
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 1rem;
        background: var(--background-primary);
      }
      
      .preview-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      
      .preview-row:last-child {
        margin-bottom: 0;
      }
      
      .preview-label {
        font-weight: 500;
        min-width: 5rem;
      }
      
      .preview-colors {
        display: flex;
        gap: 0.5rem;
      }
      
      .preview-color {
        width: 2rem;
        height: 2rem;
        border-radius: 3px;
        border: 1px solid var(--background-modifier-border);
      }
    `;
    document.head.appendChild(style);
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
