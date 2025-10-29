/**
 * Modal for creating and editing custom color presets
 */

import { Modal, Setting, App, setIcon } from 'obsidian';
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

    // Add CSS styles
    this.addStyles();
  }

  private getDefaultColorForKey(key: string, palette: ColorPalette): string {
    const baseH = palette.base.h;
    const baseS = palette.base.s;
    const baseL = palette.base.l;
    const accentH = palette.accent.h;
    const accentS = palette.accent.s;
    const accentL = palette.accent.l;
    
    const isLightBase = baseL > 50;
    
    // Syntax colors - actual colors!
    const syntaxDefaults: { [key: string]: string } = {
      'red': '#e74c3c',
      'orange': '#e67e22',
      'yellow': '#f39c12',
      'green': '#27ae60',
      'cyan': '#16a085',
      'blue': '#3498db',
      'purple': '#9b59b6',
      'pink': '#e91e63'
    };
    
    if (syntaxDefaults[key]) {
      return syntaxDefaults[key];
    }
    
    // Calculate derived colors based on theme and convert to hex
    let h: number, s: number, l: number;
    
    switch(key) {
      case 'bg1':
        return hslToHex({ h: baseH, s: baseS, l: baseL });
      case 'bg2':
        l = isLightBase ? Math.max(0, baseL - 5) : Math.min(100, baseL + 5);
        return hslToHex({ h: baseH, s: baseS, l });
      case 'bg3':
        l = isLightBase ? Math.max(0, baseL - 10) : Math.min(100, baseL + 10);
        return hslToHex({ h: baseH, s: baseS, l });
      case 'ui1':
        l = isLightBase ? Math.max(0, baseL - 15) : Math.min(100, baseL + 15);
        return hslToHex({ h: baseH, s: baseS, l });
      case 'ui2':
        l = isLightBase ? Math.max(0, baseL - 10) : Math.min(100, baseL + 10);
        return hslToHex({ h: baseH, s: baseS, l });
      case 'ui3':
        l = isLightBase ? Math.max(0, baseL - 5) : Math.min(100, baseL + 5);
        return hslToHex({ h: baseH, s: baseS, l });
      case 'tx1':
        s = Math.max(0, baseS - 10);
        l = isLightBase ? Math.max(0, baseL - 87) : Math.min(100, baseL + 77);
        return hslToHex({ h: baseH, s, l });
      case 'tx2':
        s = Math.max(0, baseS - 20);
        l = isLightBase ? Math.max(0, baseL - 53) : Math.min(100, baseL + 45);
        return hslToHex({ h: baseH, s, l });
      case 'tx3':
        s = Math.max(0, baseS - 10);
        l = isLightBase ? Math.max(0, baseL - 78) : Math.min(100, baseL + 30);
        return hslToHex({ h: baseH, s, l });
      case 'tx4':
        s = Math.max(0, baseS - 10);
        l = isLightBase ? Math.max(0, baseL - 48) : Math.min(100, baseL + 40);
        return hslToHex({ h: baseH, s, l });
      case 'hl1':
        // Semi-transparent accent color - for color input, use opaque version
        return hslToHex({ h: accentH, s: 50, l: 40 });
      case 'hl2':
        // Orange highlight
        return '#ffb150';
      default:
        return '#000000';
    }
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
    this.createHSLControls(baseSection, palette.base, (hsl) => {
      // Ensure we're updating the correct mode's palette
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
    this.createHSLControls(accentSection, palette.accent, (hsl) => {
      // Ensure we're updating the correct mode's palette
      if (mode === 'light') {
        this.preset.light.accent = hsl;
      } else {
        this.preset.dark.accent = hsl;
      }
      this.updatePreview();
    });

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

    // Create color overrides directly in section (no wrapper)
    const advancedItems: HTMLElement[] = [];
    advancedItems.push(this.createColorOverride(advancedSection, 'Background 1', 'bg1', palette.colors, mode));
    advancedItems.push(this.createColorOverride(advancedSection, 'Background 2', 'bg2', palette.colors, mode));
    advancedItems.push(this.createColorOverride(advancedSection, 'Background 3', 'bg3', palette.colors, mode));
    advancedItems.push(this.createColorOverride(advancedSection, 'UI 1', 'ui1', palette.colors, mode));
    advancedItems.push(this.createColorOverride(advancedSection, 'UI 2', 'ui2', palette.colors, mode));
    advancedItems.push(this.createColorOverride(advancedSection, 'UI 3', 'ui3', palette.colors, mode));
    advancedItems.push(this.createColorOverride(advancedSection, 'Text 1', 'tx1', palette.colors, mode));
    advancedItems.push(this.createColorOverride(advancedSection, 'Text 2', 'tx2', palette.colors, mode));
    advancedItems.push(this.createColorOverride(advancedSection, 'Text 3', 'tx3', palette.colors, mode));
    advancedItems.push(this.createColorOverride(advancedSection, 'Text 4', 'tx4', palette.colors, mode));
    advancedItems.push(this.createColorOverride(advancedSection, 'Highlight 1', 'hl1', palette.colors, mode));
    advancedItems.push(this.createColorOverride(advancedSection, 'Highlight 2', 'hl2', palette.colors, mode));
    
    // Hide items by default
    advancedItems.forEach(item => item.style.display = 'none');
    
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

    // Create syntax color overrides directly in section (no wrapper)
    const syntaxColors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'];
    const syntaxItems: HTMLElement[] = [];
    syntaxColors.forEach(color => {
      syntaxItems.push(this.createColorOverride(syntaxSection, color.charAt(0).toUpperCase() + color.slice(1), color, palette.colors, mode));
    });
    
    // Hide items by default
    syntaxItems.forEach(item => item.style.display = 'none');
    
    // Toggle visibility
    syntaxToggle.onclick = () => {
      const isCollapsed = syntaxItems[0].style.display === 'none';
      syntaxItems.forEach(item => item.style.display = isCollapsed ? 'flex' : 'none');
      setIcon(syntaxToggle, isCollapsed ? 'chevron-up' : 'chevron-down');
    };
  }

  private createHSLControls(container: HTMLElement, hsl: HSLColor, onChange: (hsl: HSLColor) => void) {
    const controls = container.createEl('div', { cls: 'hsl-controls' });
    
    // Create a copy of the HSL object to avoid modifying the original
    const hslCopy = { ...hsl };
    
    // Color preview
    const preview = controls.createEl('div', { cls: 'color-preview' });
    preview.style.backgroundColor = hslToHex(hslCopy);
    
    // Update preview function
    const updatePreview = () => {
      preview.style.backgroundColor = hslToHex(hslCopy);
    };
    
    // Hue
    const hueControl = controls.createEl('div', { cls: 'hsl-control' });
    hueControl.createEl('label', { text: 'Hue' });
    const hueSlider = hueControl.createEl('input', { type: 'range' });
    hueSlider.min = '0';
    hueSlider.max = '360';
    const hueValue = hueControl.createEl('span', { text: hsl.h.toString() });
    hueSlider.value = hsl.h.toString();
    hueSlider.oninput = () => {
      hslCopy.h = parseInt(hueSlider.value);
      hueValue.textContent = hslCopy.h.toString();
      updatePreview();
      onChange(hslCopy);
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
      hslCopy.s = parseInt(satSlider.value);
      satValue.textContent = hslCopy.s.toString();
      updatePreview();
      onChange(hslCopy);
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
      hslCopy.l = parseInt(lightSlider.value);
      lightValue.textContent = hslCopy.l.toString();
      updatePreview();
      onChange(hslCopy);
    };
  }

  private createColorOverride(container: HTMLElement, label: string, key: string, colors: any, mode: 'light' | 'dark'): HTMLElement {
    const override = container.createEl('div', { cls: 'color-override collapsible-item' });
    
    const header = override.createEl('div', { cls: 'override-header' });
    const toggle = header.createEl('input', { type: 'checkbox' });
    header.createEl('label', { text: label });
    
    const colorInputWrapper = header.createEl('div', { cls: 'color-input-wrapper' });
    const colorInput = colorInputWrapper.createEl('input', { type: 'color' });
    colorInput.disabled = true;
    colorInput.addClass('preset-color-input');
    
    // Store the original color value when toggling off
    let originalColor: string | null = null;
    
    // Get the correct palette for this mode
    const getPalette = () => mode === 'light' ? this.preset.light : this.preset.dark;
    
    if (colors[key]) {
      toggle.checked = true;
      colorInput.disabled = false;
      colorInput.value = colors[key];
      originalColor = colors[key];
    } else {
      // Show default color preview even when disabled
      const defaultColor = this.getDefaultColorForKey(key, getPalette());
      colorInput.value = defaultColor;
      originalColor = defaultColor;
    }
    
    // Make clicking the color input automatically check the toggle
    colorInput.onclick = () => {
      if (!toggle.checked) {
        toggle.checked = true;
        colorInput.disabled = false;
        // Use stored originalColor, or default to current color, or calculate sensible default
        const restoredColor = originalColor || colors[key] || this.getDefaultColorForKey(key, getPalette());
        colors[key] = restoredColor;
        colorInput.value = restoredColor;
        originalColor = restoredColor;
        this.updatePreview();
      }
    };
    
    toggle.onchange = () => {
      if (toggle.checked) {
        colorInput.disabled = false;
        // Use stored originalColor, or default to current color, or calculate sensible default
        const restoredColor = originalColor || colors[key] || this.getDefaultColorForKey(key, getPalette());
        colors[key] = restoredColor;
        colorInput.value = restoredColor;
        originalColor = restoredColor;
      } else {
        colorInput.disabled = true;
        // Store the current value before deleting
        originalColor = colors[key] || originalColor;
        delete colors[key];
      }
      this.updatePreview();
    };
    
    colorInput.onchange = () => {
      if (validateHex(colorInput.value)) {
        colors[key] = colorInput.value;
        originalColor = colorInput.value;
        this.updatePreview();
      }
    };
    
    // Also handle input event for real-time updates
    colorInput.oninput = () => {
      if (validateHex(colorInput.value)) {
        colors[key] = colorInput.value;
        originalColor = colorInput.value;
        this.updatePreview();
      }
    };
    
    return override;
  }

  private updatePreview() {
    this.previewSwatch.empty();
    
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

  private addStyles() {
    // Check if styles already exist
    const existingStyle = document.getElementById('preset-editor-modal-styles');
    if (existingStyle) {
      return; // Styles already added
    }
    
    const style = document.createElement('style');
    style.id = 'preset-editor-modal-styles';
    style.textContent = `
      .preset-editor-modal .modal-content {
        max-height: 70vh;
        overflow-y: auto;
      }
      
      .modal-section {
        margin-bottom: 1.5rem;
      }
      
      .mode-section {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--background-modifier-border);
      }
      
      .mode-section:last-of-type {
        border-bottom: none;
      }
      
      .mode-section h3 {
        color: var(--text-accent);
        margin-bottom: 1rem;
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
        cursor: default;
        padding: 0.25rem 0;
        margin-bottom: 0.25rem;
      }
      
      .collapsible-header h4 {
        margin: 0;
        font-size: 0.9rem;
      }
      
      .collapse-toggle {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: default;
        padding: 0;
        margin: 0;
        width: auto;
        height: auto;
        box-shadow: none;
        outline: none;
        font-family: inherit;
        --icon-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .collapse-toggle:hover {
        color: var(--text-normal);
      }
      
      .collapse-toggle:focus {
        outline: none;
        box-shadow: none;
      }
      
      .collapse-toggle svg {
        width: 16px;
        height: 16px;
        stroke-width: 2;
      }
      
      .collapsible-item {
        padding-left: 1.5rem; /* Indent collapsible items */
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
      
      .color-input-wrapper {
        width: 2rem;
        height: 2rem;
        display: inline-block;
        position: relative;
        overflow: hidden;
        border-radius: 50%;
      }
      
      .preset-editor-modal .preset-color-input,
      .preset-editor-modal input.preset-color-input[type="color"] {
        width: 2rem !important;
        height: 2rem !important;
        min-width: 2rem !important;
        min-height: 2rem !important;
        max-width: 2rem !important;
        max-height: 2rem !important;
        border: none !important;
        border-radius: 50% !important;
        padding: 0 !important;
        margin: 0 !important;
        cursor: pointer !important;
        box-shadow: none !important;
        outline: none !important;
        background: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        appearance: none !important;
        display: block !important;
      }
      
      .preset-editor-modal .preset-color-input:hover,
      .preset-editor-modal input.preset-color-input[type="color"]:hover {
        box-shadow: none !important;
        background: none !important;
        border: none !important;
        outline: none !important;
      }
      
      .preset-editor-modal .preset-color-input:focus,
      .preset-editor-modal input.preset-color-input[type="color"]:focus {
        box-shadow: none !important;
        background: none !important;
        border: none !important;
        outline: none !important;
      }
      
      .preset-editor-modal .preset-color-input::-webkit-color-swatch-wrapper,
      .preset-editor-modal input.preset-color-input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0 !important;
        border: none !important;
        border-radius: 50% !important;
      }
      
      .preset-editor-modal .preset-color-input::-webkit-color-swatch,
      .preset-editor-modal input.preset-color-input[type="color"]::-webkit-color-swatch {
        border: 2px solid var(--background-modifier-border) !important;
        border-radius: 50% !important;
        padding: 0 !important;
      }
      
      .preset-editor-modal .preset-color-input::-moz-color-swatch,
      .preset-editor-modal input.preset-color-input[type="color"]::-moz-color-swatch {
        border: 2px solid var(--background-modifier-border) !important;
        border-radius: 50% !important;
      }
      
      .preset-editor-modal .preset-color-input::-moz-focus-inner,
      .preset-editor-modal input.preset-color-input[type="color"]::-moz-focus-inner {
        border: none !important;
        padding: 0 !important;
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
      
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid var(--background-modifier-border);
      }
      
      .modal-footer button {
        min-width: 80px;
      }
      
      /* Fix button styling issues */
      .collapse-toggle {
        box-shadow: none !important;
        background-color: transparent !important;
      }
      
      .collapse-toggle:hover {
        box-shadow: none !important;
        background-color: transparent !important;
      }
      
      .collapse-toggle:focus {
        box-shadow: none !important;
        background-color: transparent !important;
      }
    `;
    document.head.appendChild(style);
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
