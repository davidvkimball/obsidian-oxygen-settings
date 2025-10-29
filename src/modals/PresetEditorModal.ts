/**
 * Modal for creating and editing custom color presets
 * Refactored to use extracted UI components and utilities
 */

import { Modal, Setting, App, setIcon } from 'obsidian';
import { CustomColorPreset, ColorPalette, HSLColor } from '../presets/CustomPreset';
import { PresetManager } from '../presets/PresetManager';
import { hslToHex } from '../utils/color-utils';
import { createHSLControls, createColorOverride } from './components/PresetColorControls';
import MinimalTheme from '../main';

export class PresetEditorModal extends Modal {
  private preset: CustomColorPreset;
  private isEditing: boolean;
  private onSave: (preset: CustomColorPreset) => void;
  private plugin: MinimalTheme;
  
  // Form elements
  private nameInput: HTMLInputElement;
  private authorInput: HTMLInputElement;
  private previewSwatch: HTMLElement;

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

    // Content area - show both modes linearly
    const contentArea = contentEl.createEl('div', { cls: 'modes-container' });
    
    // Light mode section
    const lightSection = contentArea.createEl('div', { cls: 'mode-section' });
    lightSection.createEl('h3', { text: 'Light Mode' });
    this.buildModeContent(lightSection, 'light');
    
    // Dark mode section
    const darkSection = contentArea.createEl('div', { cls: 'mode-section' });
    darkSection.createEl('h3', { text: 'Dark Mode' });
    this.buildModeContent(darkSection, 'dark');

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
  }

  private buildModeContent(container: HTMLElement, mode: 'light' | 'dark') {
    container.empty();
    const palette = mode === 'light' ? this.preset.light : this.preset.dark;

    // Required colors section
    const requiredSection = container.createEl('div', { cls: 'color-section' });
    const headerText = mode === 'light' ? 'Light Theme Colors' : 'Dark Theme Colors';
    requiredSection.createEl('h3', { text: headerText });

    // Base color
    const baseSection = requiredSection.createEl('div', { cls: 'color-group' });
    baseSection.createEl('label', { text: 'Base Color' });
    createHSLControls(baseSection, palette.base, (hsl) => {
      if (mode === 'light') {
        this.preset.light.base = hsl;
      } else {
        this.preset.dark.base = hsl;
      }
      this.updatePreview();
    });

    // Accent color
    const accentSection = requiredSection.createEl('div', { cls: 'color-group' });
    accentSection.createEl('label', { text: 'Accent Color' });
    createHSLControls(accentSection, palette.accent, (hsl) => {
      if (mode === 'light') {
        this.preset.light.accent = hsl;
      } else {
        this.preset.dark.accent = hsl;
      }
      this.updatePreview();
    });

    // Colorful frame lightness override (optional)
    const frameSection = requiredSection.createEl('div', { cls: 'color-group' });
    const frameLabel = frameSection.createEl('label', { text: 'Colorful Frame Lightness Override (Optional)' });
    frameLabel.style.fontSize = '0.9em';
    const frameDesc = frameSection.createEl('div', { cls: 'setting-item-description' });
    frameDesc.textContent = mode === 'dark' 
      ? 'Offset from accent lightness for colorful frame. Default: -25 (darkens by 25%). Leave empty for default.'
      : 'Offset from accent lightness for colorful frame. Default: +30 (brightens by 30%). Leave empty for default.';
    frameDesc.style.fontSize = '0.85em';
    frameDesc.style.marginBottom = '8px';
    
    const frameInput = frameSection.createEl('input', { type: 'number' });
    frameInput.style.width = '80px';
    frameInput.placeholder = mode === 'dark' ? '-25' : '+30';
    frameInput.min = '-100';
    frameInput.max = '100';
    frameInput.step = '5';
    if (palette.frameLightnessOffset !== undefined) {
      frameInput.value = palette.frameLightnessOffset.toString();
    }
    
    frameInput.oninput = () => {
      const value = frameInput.value.trim();
      if (value === '') {
        // Clear override - use theme default
        if (mode === 'light') {
          delete this.preset.light.frameLightnessOffset;
        } else {
          delete this.preset.dark.frameLightnessOffset;
        }
      } else {
        const offset = parseInt(value);
        if (!isNaN(offset)) {
          if (mode === 'light') {
            this.preset.light.frameLightnessOffset = offset;
          } else {
            this.preset.dark.frameLightnessOffset = offset;
          }
        }
      }
      this.updatePreview();
    };

    // Advanced overrides (collapsible)
    const advancedSection = container.createEl('div', { cls: 'color-section' });
    const advancedHeader = advancedSection.createEl('div', { cls: 'collapsible-header' });
    advancedHeader.createEl('h4', { text: 'Advanced Overrides (Optional)' });
    const advancedToggle = advancedHeader.createEl('button', { 
      cls: 'collapse-toggle' 
    });
    setIcon(advancedToggle, 'chevron-down');

    // Initialize colors object if not exists
    if (!palette.colors) {
      palette.colors = {};
    }

    // Create color overrides
    const advancedItems: HTMLElement[] = [];
    const overrideKeys = ['bg1', 'bg2', 'bg3', 'ui1', 'ui2', 'ui3', 'tx1', 'tx2', 'tx3', 'tx4', 'hl1', 'hl2'];
    const overrideLabels = ['Background 1', 'Background 2', 'Background 3', 'UI 1', 'UI 2', 'UI 3', 'Text 1', 'Text 2', 'Text 3', 'Text 4', 'Highlight 1', 'Highlight 2'];
    
    overrideKeys.forEach((key, index) => {
      const item = createColorOverride(
        advancedSection, 
        overrideLabels[index], 
        key, 
        palette.colors, 
        palette,
        () => this.updatePreview()
      );
      advancedItems.push(item);
      item.style.display = 'none'; // Hide by default
    });
    
    // Toggle visibility
    advancedToggle.onclick = () => {
      const isCollapsed = advancedItems[0].style.display === 'none';
      advancedItems.forEach(item => item.style.display = isCollapsed ? 'flex' : 'none');
      setIcon(advancedToggle, isCollapsed ? 'chevron-up' : 'chevron-down');
    };

    // Syntax colors (collapsible)
    const syntaxSection = container.createEl('div', { cls: 'color-section' });
    const syntaxHeader = syntaxSection.createEl('div', { cls: 'collapsible-header' });
    syntaxHeader.createEl('h4', { text: 'Syntax Colors (Optional)' });
    const syntaxToggle = syntaxHeader.createEl('button', { 
      cls: 'collapse-toggle' 
    });
    setIcon(syntaxToggle, 'chevron-down');

    // Create syntax color overrides
    const syntaxColors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'];
    const syntaxItems: HTMLElement[] = [];
    
    syntaxColors.forEach(color => {
      const item = createColorOverride(
        syntaxSection, 
        color.charAt(0).toUpperCase() + color.slice(1), 
        color, 
        palette.colors, 
        palette,
        () => this.updatePreview()
      );
      syntaxItems.push(item);
      item.style.display = 'none'; // Hide by default
    });
    
    // Toggle visibility
    syntaxToggle.onclick = () => {
      const isCollapsed = syntaxItems[0].style.display === 'none';
      syntaxItems.forEach(item => item.style.display = isCollapsed ? 'flex' : 'none');
      setIcon(syntaxToggle, isCollapsed ? 'chevron-up' : 'chevron-down');
    };
  }

  private updatePreview() {
    this.previewSwatch.empty();
    
    // Live preview: temporarily update the plugin's preset data to show changes in real-time
    const presetIndex = this.plugin.settings.customPresets.findIndex(p => p.id === this.preset.id);
    if (presetIndex !== -1) {
      // Temporarily update the preset in settings
      this.plugin.settings.customPresets[presetIndex] = this.preset;
      
      // Apply changes if this preset is currently active
      const presetSchemeId = `minimal-custom-${this.preset.id}`;
      if (this.plugin.settings.lightScheme === presetSchemeId || this.plugin.settings.darkScheme === presetSchemeId) {
        this.plugin.updateStyle();
        this.plugin.updateCustomPresetCSS();
      }
    }
    
    // Get colors for both modes
    const lightPalette = this.preset.light;
    const darkPalette = this.preset.dark;
    
    const lightBaseHex = hslToHex(lightPalette.base);
    const lightAccentHex = hslToHex(lightPalette.accent);
    const darkBaseHex = hslToHex(darkPalette.base);
    const darkAccentHex = hslToHex(darkPalette.accent);
    
    // Create Light Mode section
    const lightRow = this.previewSwatch.createEl('div', { cls: 'preview-row' });
    lightRow.createEl('div', { text: 'Light Mode', cls: 'preview-label' });
    const lightColors = lightRow.createEl('div', { cls: 'preview-colors' });
    const lightBaseColor = lightColors.createEl('div', { cls: 'preview-color' });
    lightBaseColor.style.background = lightBaseHex;
    const lightAccentColor = lightColors.createEl('div', { cls: 'preview-color' });
    lightAccentColor.style.background = lightAccentHex;
    
    // Create Dark Mode section
    const darkRow = this.previewSwatch.createEl('div', { cls: 'preview-row' });
    darkRow.createEl('div', { text: 'Dark Mode', cls: 'preview-label' });
    const darkColors = darkRow.createEl('div', { cls: 'preview-colors' });
    const darkBaseColor = darkColors.createEl('div', { cls: 'preview-color' });
    darkBaseColor.style.background = darkBaseHex;
    const darkAccentColor = darkColors.createEl('div', { cls: 'preview-color' });
    darkAccentColor.style.background = darkAccentHex;
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

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

