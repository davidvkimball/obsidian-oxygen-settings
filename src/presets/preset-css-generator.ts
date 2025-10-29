/**
 * Preset CSS Generation
 * Generates CSS rules for custom color presets
 */

import { CustomColorPreset, ColorPalette } from './CustomPreset';

export class PresetCSSGenerator {
  /**
   * Generate CSS for a custom preset using Oxygen custom variables
   * This allows Style Settings to override Obsidian native variables
   */
  static generateCSS(preset: CustomColorPreset, mode: 'light' | 'dark'): string {
    const palette = mode === 'light' ? preset.light : preset.dark;
    const themeClass = mode === 'light' ? 'theme-light' : 'theme-dark';
    const className = `minimal-custom-${preset.id}`;
    
    // Use simpler selector - modifies Oxygen custom variables, not Obsidian native
    let css = `.${themeClass}.${className} {\n`;
    
    // Calculate all derived colors based on the theme's color system
    const baseH = palette.base.h;
    const baseS = palette.base.s;
    const baseL = palette.base.l;
    const accentH = palette.accent.h;
    const accentS = palette.accent.s;
    const accentL = palette.accent.l;
    
    // Determine if this is a light or dark theme based on base lightness
    const isLightMode = mode === 'light';
    const isLightBase = baseL > 50;
    
    // Calculate color values
    const bg1 = `hsl(${baseH}, ${baseS}%, ${baseL}%)`;
    const bg2 = `hsl(${baseH}, ${baseS}%, ${isLightBase ? Math.max(0, baseL - 5) : Math.min(100, baseL + 5)}%)`;
    const bg3 = `hsl(${baseH}, ${baseS}%, ${isLightBase ? Math.max(0, baseL - 10) : Math.min(100, baseL + 10)}%)`;
    
    // UI colors (borders, dividers, etc.) - darker for light mode, lighter for dark mode
    const ui1L = isLightBase ? Math.max(0, baseL - 15) : Math.min(100, baseL + 15);
    const ui2L = isLightBase ? Math.max(0, baseL - 10) : Math.min(100, baseL + 10);
    const ui3L = isLightBase ? Math.max(0, baseL - 5) : Math.min(100, baseL + 5);
    
    const ui1 = `hsl(${baseH}, ${baseS}%, ${ui1L}%)`;
    const ui2 = `hsl(${baseH}, ${baseS}%, ${ui2L}%)`;
    const ui3 = `hsl(${baseH}, ${baseS}%, ${ui3L}%)`;
    
    // Text colors - ensure proper contrast
    const tx1L = isLightBase ? 15 : 85;  // Very dark text for light bg, very light text for dark bg
    const tx2L = isLightBase ? 25 : 75;
    const tx3L = isLightBase ? 35 : 65;
    const tx4L = isLightBase ? 30 : 70;
    
    const tx1 = `hsl(${baseH}, ${Math.max(0, baseS - 10)}%, ${tx1L}%)`;
    const tx2 = `hsl(${baseH}, ${Math.max(0, baseS - 20)}%, ${tx2L}%)`;
    const tx3 = `hsl(${baseH}, ${Math.max(0, baseS - 10)}%, ${tx3L}%)`;
    const tx4 = `hsl(${baseH}, ${Math.max(0, baseS - 10)}%, ${tx4L}%)`;
    
    // Accent colors
    const ax1 = `hsl(${accentH}, ${accentS}%, ${accentL}%)`;
    const ax2 = `hsl(${accentH}, ${accentS}%, ${Math.max(0, Math.min(100, accentL + 8))}%)`;
    const ax3 = `hsl(${accentH}, ${accentS}%, ${Math.max(0, Math.min(100, accentL - 5))}%)`;
    
    // Highlight colors
    const hl1 = `hsla(${accentH}, 50%, 40%, 30%)`;
    const hl2 = `rgba(255, 177, 80, 0.3)`;
    
    // Special colors
    const sp1 = isLightMode ? 'white' : 'black';
    
    // Calculate proper contrast for accent color
    const accentIsLight = accentL > 50;
    const textOnAccent = accentIsLight ? 'black' : 'white';
    
    // === BASE HSL VALUES (Required for colorful-frame and colorful-headings) ===
    css += `  --base-h: ${baseH};\n`;
    css += `  --base-s: ${baseS}%;\n`;
    css += `  --base-l: ${baseL}%;\n`;
    css += `\n`;
    css += `  --accent-h: ${accentH};\n`;
    css += `  --accent-s: ${accentS}%;\n`;
    css += `  --accent-l: ${accentL}%;\n`;
    css += `\n`;
    
    // === OXYGEN CUSTOM VARIABLES (Core theme colors) ===
    // Backgrounds
    css += `  --bg1: ${bg1};\n`;
    css += `  --bg2: ${bg2};\n`;
    css += `  --bg-tab: ${bg2};\n`;
    css += `  --bg3: ${bg3};\n`;
    css += `\n`;
    
    // UI Elements
    css += `  --ui1: ${ui1};\n`;
    css += `  --ui2: ${ui2};\n`;
    css += `  --ui3: ${ui3};\n`;
    css += `\n`;
    
    // Text Colors
    css += `  --tx1: ${tx1};\n`;
    css += `  --tx2: ${tx2};\n`;
    css += `  --tx3: ${tx3};\n`;
    css += `  --tx4: ${tx4};\n`;
    css += `\n`;
    
    // Accent Colors
    css += `  --ax1: ${ax1};\n`;
    css += `  --ax2: ${ax2};\n`;
    css += `  --ax3: ${ax3};\n`;
    css += `\n`;
    
    // Highlights
    css += `  --hl1: ${hl1};\n`;
    css += `  --hl2: ${hl2};\n`;
    css += `\n`;
    
    // Special
    css += `  --sp1: ${sp1};\n`;
    
    // Optional color overrides (if user provided specific colors)
    if (palette.colors) {
      const overrides = [
        'bg1', 'bg2', 'bg3',
        'ui1', 'ui2', 'ui3',
        'tx1', 'tx2', 'tx3', 'tx4',
        'hl1', 'hl2',
        'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'
      ];
      
      overrides.forEach(colorKey => {
        const color = palette.colors?.[colorKey as keyof typeof palette.colors];
        if (color) {
          // Map custom overrides to appropriate Obsidian variables
          switch (colorKey) {
            case 'bg1':
            case 'bg2':
            case 'bg3':
            case 'ui1':
            case 'ui2':
            case 'ui3':
            case 'tx1':
            case 'tx2':
            case 'tx3':
            case 'tx4':
            case 'hl1':
            case 'hl2':
              // Override Oxygen custom variables directly (no !important)
              css += `  --${colorKey}: ${color};\n`;
              break;
            // For accent colors, we need to determine which ax variable this should map to
            // This is a simplified mapping - in practice, you might want more sophisticated logic
            default:
              // For syntax colors and other custom colors, we can add them as custom properties
              css += `  --color-${colorKey}: ${color};\n`;
              break;
          }
        }
      });
    }
    
    css += '}\n';
    
    return css;
  }
}

