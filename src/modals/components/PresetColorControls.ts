/**
 * Reusable UI components for preset color controls
 * HSL sliders and color override inputs
 */

import { HSLColor, ColorPalette } from '../../presets/CustomPreset';
import { hslToHex, hexToHSL, validateHex } from '../../utils/color-utils';
import { getDefaultColorForKey } from '../../utils/preset-color-defaults';

/**
 * Create HSL color controls (H, S, L sliders with live preview)
 * @param container - Parent HTMLElement to append controls to
 * @param hsl - Initial HSL color values
 * @param onChange - Callback when color changes
 */
export function createHSLControls(
  container: HTMLElement, 
  hsl: HSLColor, 
  onChange: (hsl: HSLColor) => void
): void {
  const controls = container.createEl('div', { cls: 'hsl-controls' });
  
  // Create a copy of the HSL object to avoid modifying the original
  const hslCopy = { ...hsl };
  
  // Color preview (clickable) - wrapper with relative positioning
  const previewWrapper = controls.createEl('div', { cls: 'color-preview-wrapper' });
  previewWrapper.style.position = 'relative';
  previewWrapper.style.display = 'inline-block';
  
  const preview = previewWrapper.createEl('div', { cls: 'color-preview' });
  preview.style.backgroundColor = hslToHex(hslCopy);
  preview.style.cursor = 'pointer';
  preview.title = 'Click to pick a color with hex input';
  
  // Color input positioned over the preview
  const colorInput = previewWrapper.createEl('input', { type: 'color' });
  colorInput.style.position = 'absolute';
  colorInput.style.top = '0';
  colorInput.style.left = '0';
  colorInput.style.width = '100%';
  colorInput.style.height = '100%';
  colorInput.style.opacity = '0';
  colorInput.style.cursor = 'pointer';
  colorInput.value = hslToHex(hslCopy);
  
  // Update preview function
  const updatePreview = () => {
    const hexColor = hslToHex(hslCopy);
    preview.style.backgroundColor = hexColor;
    colorInput.value = hexColor;
  };
  
  // When user picks a color with the color input, update HSL values
  colorInput.onchange = () => {
    const newHSL = hexToHSL(colorInput.value);
    hslCopy.h = newHSL.h;
    hslCopy.s = newHSL.s;
    hslCopy.l = newHSL.l;
    
    // Update all slider values and labels
    hueSlider.value = newHSL.h.toString();
    hueValue.textContent = newHSL.h.toString();
    satSlider.value = newHSL.s.toString();
    satValue.textContent = newHSL.s.toString();
    lightSlider.value = newHSL.l.toString();
    lightValue.textContent = newHSL.l.toString();
    
    updatePreview();
    onChange(hslCopy);
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

/**
 * Create a color override toggle and input
 * @param container - Parent HTMLElement
 * @param label - Display label for the color
 * @param key - Color key in the palette.colors object
 * @param colors - The colors object to modify
 * @param palette - The palette for calculating defaults
 * @param onUpdate - Callback when color is toggled or changed
 * @returns The created override HTMLElement
 */
export function createColorOverride(
  container: HTMLElement, 
  label: string, 
  key: string, 
  colors: any, 
  palette: ColorPalette,
  onUpdate: () => void
): HTMLElement {
  const override = container.createEl('div', { cls: 'color-override collapsible-item' });
  
  const header = override.createEl('div', { cls: 'override-header' });
  const toggle = header.createEl('input', { type: 'checkbox' });
  header.createEl('label', { text: label });
  
  // Create color picker with same pattern as HSL controls
  const colorInputWrapper = header.createEl('div', { cls: 'color-input-wrapper' });
  colorInputWrapper.style.position = 'relative';
  
  // Visible color preview
  const colorPreview = colorInputWrapper.createEl('div', { cls: 'color-preview-swatch' });
  colorPreview.style.width = '2rem';
  colorPreview.style.height = '2rem';
  colorPreview.style.borderRadius = '50%';
  colorPreview.style.border = '2px solid var(--background-modifier-border)';
  colorPreview.style.cursor = 'pointer';
  
  // Hidden color input positioned over the preview
  const colorInput = colorInputWrapper.createEl('input', { type: 'color' });
  colorInput.style.position = 'absolute';
  colorInput.style.top = '0';
  colorInput.style.left = '0';
  colorInput.style.width = '100%';
  colorInput.style.height = '100%';
  colorInput.style.opacity = '0';
  colorInput.style.cursor = 'pointer';
  colorInput.disabled = true;
  
  // Store the original color value when toggling off
  let originalColor: string | null = null;
  
  // Function to update the color preview
  const updateColorPreview = (color: string) => {
    colorPreview.style.backgroundColor = color;
    colorInput.value = color;
  };
  
  if (colors[key]) {
    toggle.checked = true;
    colorInput.disabled = false;
    updateColorPreview(colors[key]);
    originalColor = colors[key];
  } else {
    // Show default color preview even when disabled
    const defaultColor = getDefaultColorForKey(key, palette);
    updateColorPreview(defaultColor);
    originalColor = defaultColor;
  }
  
  // Make clicking the color input automatically check the toggle
  colorInput.onclick = () => {
    if (!toggle.checked) {
      toggle.checked = true;
      colorInput.disabled = false;
      // Use stored originalColor, or default to current color, or calculate sensible default
      const restoredColor = originalColor || colors[key] || getDefaultColorForKey(key, palette);
      colors[key] = restoredColor;
      updateColorPreview(restoredColor);
      originalColor = restoredColor;
      onUpdate();
    }
  };
  
  toggle.onchange = () => {
    if (toggle.checked) {
      colorInput.disabled = false;
      // Use stored originalColor, or default to current color, or calculate sensible default
      const restoredColor = originalColor || colors[key] || getDefaultColorForKey(key, palette);
      colors[key] = restoredColor;
      updateColorPreview(restoredColor);
      originalColor = restoredColor;
    } else {
      colorInput.disabled = true;
      // Store the current value before deleting
      originalColor = colors[key] || originalColor;
      delete colors[key];
    }
    onUpdate();
  };
  
  colorInput.onchange = () => {
    if (validateHex(colorInput.value)) {
      colors[key] = colorInput.value;
      originalColor = colorInput.value;
      updateColorPreview(colorInput.value);
      onUpdate();
    }
  };
  
  // Also handle input event for real-time updates
  colorInput.oninput = () => {
    if (validateHex(colorInput.value)) {
      colors[key] = colorInput.value;
      originalColor = colorInput.value;
      updateColorPreview(colorInput.value);
      onUpdate();
    }
  };
  
  return override;
}

