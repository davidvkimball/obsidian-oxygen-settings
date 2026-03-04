/**
 * Preset CSS Generation
 * Generates CSS rules for custom color presets
 */

import { CustomColorPreset } from './CustomPreset';

export class PresetCSSGenerator {
  /**
   * Generate CSS custom properties as an object for direct application to body element
   * This avoids creating style elements and complies with Obsidian guidelines
   */
  static generateProperties(preset: CustomColorPreset, mode: 'light' | 'dark'): Record<string, string> {
    const palette = mode === 'light' ? preset.light : preset.dark;

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
    const tx1L = isLightBase ? 15 : 85;
    const tx2L = isLightBase ? 25 : 75;
    const tx3L = isLightBase ? 35 : 65;
    const tx4L = isLightBase ? 30 : 70;

    const tx1 = `hsl(${baseH}, ${Math.max(0, baseS - 10)}%, ${tx1L}%)`;
    const tx2 = `hsl(${baseH}, ${Math.max(0, baseS - 20)}%, ${tx2L}%)`;
    const tx3 = `hsl(${baseH}, ${Math.max(0, baseS - 10)}%, ${tx3L}%)`;
    const tx4 = `hsl(${baseH}, ${Math.max(0, baseS - 10)}%, ${tx4L}%)`;

    // Highlight colors
    const hl1 = `hsla(${accentH}, 50%, 40%, 30%)`;
    const hl2 = `rgba(255, 177, 80, 0.3)`;

    // Special colors
    const sp1 = isLightMode ? 'white' : 'black';

    // Calculate proper contrast for accent color using relative luminance
    const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
      h = h / 360;
      s = s / 100;
      l = l / 100;

      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      if (s === 0) {
        return [l, l, l];
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const r = hue2rgb(p, q, h + 1 / 3);
      const g = hue2rgb(p, q, h);
      const b = hue2rgb(p, q, h - 1 / 3);

      return [r, g, b];
    };

    const [r, g, b] = hslToRgb(accentH, accentS, accentL);

    // Calculate relative luminance (WCAG formula)
    const luminance = 0.2126 * (r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4))
      + 0.7152 * (g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4))
      + 0.0722 * (b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));

    // Use white text if luminance is low (dark color), black text if high (light color)
    const textOnAccent = luminance > 0.5 ? 'black' : 'white';

    // Build properties object
    // Accent HSL is set here so custom presets work like built-in schemes.
    // The user can still override via Obsidian's native accent color picker.
    const props: Record<string, string> = {
      '--base-h': `${baseH}`,
      '--base-s': `${baseS}%`,
      '--base-l': `${baseL}%`,
      '--accent-h': `${accentH}`,
      '--accent-s': `${accentS}%`,
      '--accent-l': `${accentL}%`,
      '--bg1': bg1,
      '--bg2': bg2,
      '--bg-tab': bg2,
      '--bg3': bg3,
      '--ui1': ui1,
      '--ui2': ui2,
      '--ui3': ui3,
      '--tx1': tx1,
      '--tx2': tx2,
      '--tx3': tx3,
      '--tx4': tx4,
      '--hl1': hl1,
      '--hl2': hl2,
      '--sp1': sp1,
      '--text-on-accent': textOnAccent,
    };

    // Extended color palette
    const extendedS = accentS;
    const extendedL = isLightBase ? 55 : 65;

    props['--color-red'] = `hsl(0, var(--accent-s), ${extendedL}%)`;
    props['--color-orange'] = `hsl(25, var(--accent-s), ${extendedL}%)`;
    props['--color-yellow'] = `hsl(50, var(--accent-s), ${extendedL}%)`;
    props['--color-green'] = `hsl(130, var(--accent-s), ${extendedL}%)`;
    props['--color-cyan'] = `hsl(180, var(--accent-s), ${extendedL}%)`;
    props['--color-blue'] = `hsl(220, var(--accent-s), ${extendedL}%)`;
    props['--color-purple'] = `hsl(280, var(--accent-s), ${extendedL}%)`;
    props['--color-pink'] = `hsl(330, var(--accent-s), ${extendedL}%)`;

    // Optional frame lightness override
    if (palette.frameLightnessOffset !== undefined) {
      const offset = palette.frameLightnessOffset >= 0 ? `+ ${palette.frameLightnessOffset}` : `- ${Math.abs(palette.frameLightnessOffset)}`;
      props['--frame-background-l'] = `calc(var(--accent-l) ${offset}%)`;
    }

    // Optional color overrides
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
              props[`--${colorKey}`] = color;
              break;
            default:
              props[`--color-${colorKey}`] = color;
              break;
          }
        }
      });
    }

    return props;
  }

  /**
   * Generate CSS for a custom preset using Oxygen custom variables
   * This allows Style Settings to override Obsidian native variables
   * @deprecated Use generateProperties instead to avoid creating style elements
   */
  static generateCSS(preset: CustomColorPreset, mode: 'light' | 'dark'): string {
    const palette = mode === 'light' ? preset.light : preset.dark;
    const themeClass = mode === 'light' ? 'theme-light' : 'theme-dark';
    const className = `oxygen-custom-${preset.id}`;

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

    // Highlight colors
    const hl1 = `hsla(${accentH}, 50%, 40%, 30%)`;
    const hl2 = `rgba(255, 177, 80, 0.3)`;

    // Special colors
    const sp1 = isLightMode ? 'white' : 'black';

    // Calculate proper contrast for accent color using relative luminance
    // Convert HSL to RGB for luminance calculation
    const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
      h = h / 360;
      s = s / 100;
      l = l / 100;

      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      if (s === 0) {
        return [l, l, l];
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const r = hue2rgb(p, q, h + 1 / 3);
      const g = hue2rgb(p, q, h);
      const b = hue2rgb(p, q, h - 1 / 3);

      return [r, g, b];
    };

    const [r, g, b] = hslToRgb(accentH, accentS, accentL);

    // Calculate relative luminance (WCAG formula)
    const luminance = 0.2126 * (r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4))
      + 0.7152 * (g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4))
      + 0.0722 * (b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));

    // Use white text if luminance is low (dark color), black text if high (light color)
    // Threshold of 0.5 works well for most cases (WCAG uses 0.179 for AA contrast)
    const textOnAccent = luminance > 0.5 ? 'black' : 'white';

    // === BASE HSL VALUES (Required for colorful-frame and colorful-headings) ===
    css += `  --base-h: ${baseH};\n`;
    css += `  --base-s: ${baseS}%;\n`;
    css += `  --base-l: ${baseL}%;\n`;
    css += `\n`;

    // === ACCENT HSL VALUES (drives ax1/ax2/ax3, colorful-frame, etc.) ===
    css += `  --accent-h: ${accentH};\n`;
    css += `  --accent-s: ${accentS}%;\n`;
    css += `  --accent-l: ${accentL}%;\n`;
    css += `  --text-on-accent: ${textOnAccent};\n`;
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

    // ax1/ax2/ax3 are derived from --accent-h/s/l by the theme CSS
    // css += `  --ax1: ${ax1};\n`;
    // css += `  --ax2: ${ax2};\n`;
    // css += `  --ax3: ${ax3};\n`;
    // css += `\n`;

    // Highlights
    css += `  --hl1: ${hl1};\n`;
    css += `  --hl2: ${hl2};\n`;
    css += `\n`;

    // Special
    css += `  --sp1: ${sp1};\n`;
    css += `\n`;

    // === EXTENDED COLOR PALETTE ===
    // Generate extended palette based on accent color for colorful headings/frames
    // Uses fixed hues with the preset's saturation and adjusted lightness
    const extendedS = accentS;
    const extendedL = isLightBase ? 55 : 65; // Slightly different for light vs dark

    css += `  --color-red: hsl(0, var(--accent-s), ${extendedL}%);\n`;
    css += `  --color-orange: hsl(25, var(--accent-s), ${extendedL}%);\n`;
    css += `  --color-yellow: hsl(50, var(--accent-s), ${extendedL}%);\n`;
    css += `  --color-green: hsl(130, var(--accent-s), ${extendedL}%);\n`;
    css += `  --color-cyan: hsl(180, var(--accent-s), ${extendedL}%);\n`;
    css += `  --color-blue: hsl(220, var(--accent-s), ${extendedL}%);\n`;
    css += `  --color-purple: hsl(280, var(--accent-s), ${extendedL}%);\n`;
    css += `  --color-pink: hsl(330, var(--accent-s), ${extendedL}%);\n`;
    css += `\n`;

    // === COLORFUL FRAME OVERRIDE ===
    // Optional override for colorful-frame lightness
    // Default Oxygen behavior: dark mode -25%, light mode +30%
    if (palette.frameLightnessOffset !== undefined) {
      const offset = palette.frameLightnessOffset >= 0 ? `+ ${palette.frameLightnessOffset}` : `- ${Math.abs(palette.frameLightnessOffset)}`;
      css += `  --frame-background-l: calc(var(--accent-l) ${offset}%);\n`;
      css += `\n`;
    }

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

